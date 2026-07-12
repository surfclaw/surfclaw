# The MIT License (MIT)
# Copyright © 2023 Yuma Rao
# Copyright © 2026 Surfclaw

# Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated
# documentation files (the “Software”), to deal in the Software without restriction, including without limitation
# the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software,
# and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

# The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

# THE SOFTWARE IS PROVIDED “AS IS”, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO
# THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL
# THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
# OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER
# DEALINGS IN THE SOFTWARE.

import sys
import os
import time
import argparse
import concurrent.futures
from typing import Dict, Any, Optional

# 프로젝트 루트 경로 추가
current_dir = os.path.dirname(os.path.abspath(__file__))
project_root = os.path.dirname(current_dir)
if project_root not in sys.path:
    sys.path.insert(0, project_root)

from template.base.validator import BaseValidatorNeuron  # noqa: E402
from template.protocol import AgentExecutionSynapse, HAS_BITTENSOR  # noqa: E402


class SurfclawValidator(BaseValidatorNeuron):
    """
    Surfclaw 비텐서 서브넷 검증자 노드 실제 구현체.
    마이너들의 동시성 처리 성능(Surfclaw 스케줄러의 효율)을 검증하기 위해
    다수의 에이전트 실행 요청을 병렬로 발송하고 응답 지연 및 신뢰성을 평가합니다.
    """

    def __init__(self, parser: Optional[argparse.ArgumentParser] = None):
        super().__init__(parser)

        # 각 마이너별 점수판 관리 (Running Average Scores)
        self.scores = {uid: 0.0 for uid in self.metagraph.uids}
        self.alpha = 0.15  # 가중치 갱신 감도 (Moving Average Alpha)

        # 평가용 모의 태스크 풀 정의
        self.synthetic_tasks = [
            {
                "agent_name": "academic_agent",
                "task_input": "비텐서의 유마 합의 알고리즘(Yuma Consensus)에 대해 학술지 논문 초록 형식으로 요약해 줘.",
                "tools": ["google_search"],
            },
            {
                "agent_name": "coding_agent",
                "task_input": "Python에서 thread-safe한 FIFO Queue 스케줄러 예시 코드를 구현하고 설명해 줘.",
                "tools": [],
            },
            {
                "agent_name": "search_agent",
                "task_input": "2026년 AIOS 프로젝트의 최신 깃허브 커밋 릴리즈 정보와 핵심 업데이트 요소를 요약해 줘.",
                "tools": ["google_search", "web_browser"],
            },
            {
                "agent_name": "math_agent",
                "task_input": "자연수 n에 대해 시그마 i=1부터 n까지의 합 공식을 증명해 봐.",
                "tools": ["custom_calculator"],
            },
        ]

    def forward(self):
        """
        검증 주기가 도래할 때마다 실행되는 마이너 평가 메인 로직.
        """
        self.logger.info("[Validator] Starting miner performance evaluation round.")

        # 메타그래프에서 활성화된 마이너 UIDs 획득
        uids = self.metagraph.uids
        if not uids:
            self.logger.warning("체인 상에 활성화된 마이너 노드가 없습니다.")
            return

        # 벤치마크 테스트 진행 (각 마이너별로 동시 요청 전송)
        miner_performance = {}

        for uid in uids:
            axon = self.metagraph.axons[uid]
            self.logger.info(
                f"[Validator] Sending concurrency stress test to miner UID {uid} (Port: {axon.port})..."
            )

            # 동시 요청 수 (VRAM 스케줄러 성능을 평가하기 위해 5개 요청 병렬 전송)
            num_concurrency = 5
            results = self._benchmark_miner(uid, axon, num_concurrency)

            miner_performance[uid] = results
            self.logger.info(
                f"[Validator] Miner UID {uid} Result: Success Rate {results['success_rate'] * 100:.1f}% | "
                f"Avg Latency {results['avg_latency']:.3f}s | "
                f"Total Elapsed {results['total_elapsed']:.3f}s"
            )

        # 평가 지표 계산 및 점수판 업데이트
        self._update_scores(miner_performance)

        # 비텐서 체인 가중치 반영 (Mock 또는 실제 subtensor 호출)
        self._set_weights()

    def _benchmark_miner(
        self, uid: int, axon: Any, num_concurrency: int
    ) -> Dict[str, Any]:
        """마이너 한 곳에 동시 쿼리를 보내 처리 지연 및 성공 여부를 정량 측정합니다."""
        synapses = []
        for i in range(num_concurrency):
            # 태스크 풀에서 교대로 선택하여 요청 패킷 생성
            task = self.synthetic_tasks[i % len(self.synthetic_tasks)]
            synapses.append(
                AgentExecutionSynapse(
                    agent_name=task["agent_name"],
                    task_input=task["task_input"],
                    tools=task["tools"],
                )
            )

        start_time = time.time()
        success_count = 0
        latencies = []

        # ThreadPoolExecutor를 사용해 병렬로 Dendrite Query를 쏩니다.
        with concurrent.futures.ThreadPoolExecutor(
            max_workers=num_concurrency
        ) as executor:
            if HAS_BITTENSOR:
                # 실제 비텐서 dendrite 호출
                futures = {
                    executor.submit(
                        self.dendrite.query, axon, synapse, timeout=12.0
                    ): synapse
                    for synapse in synapses
                }

                for future in concurrent.futures.as_completed(futures):
                    query_start = time.time()
                    try:
                        synapse_resp = future.result()
                        query_latency = time.time() - query_start

                        if synapse_resp.success:
                            success_count += 1
                            latencies.append(
                                synapse_resp.execution_time or query_latency
                            )
                        else:
                            latencies.append(12.0)  # 타임아웃/실패 패널티
                    except Exception:
                        latencies.append(12.0)
            else:
                # Mock 모드: 마이너 인스턴스를 직접 에뮬레이션 호출
                # 로컬 테스트 편의를 위해 neurons/miner.py의 포워드 처리를 직접 매핑 모사
                from neurons.miner import SurfclawMiner

                mock_miner = SurfclawMiner()

                futures = {
                    executor.submit(mock_miner.forward, synapse): synapse
                    for synapse in synapses
                }

                for future in concurrent.futures.as_completed(futures):
                    try:
                        synapse_resp = future.result()
                        if synapse_resp.success:
                            success_count += 1
                            latencies.append(synapse_resp.execution_time)
                        else:
                            latencies.append(15.0)
                    except Exception:
                        latencies.append(15.0)

                # Mock 리소스 정리
                mock_miner.stop()

        total_elapsed = time.time() - start_time
        avg_latency = sum(latencies) / len(latencies) if latencies else 15.0
        success_rate = success_count / num_concurrency if num_concurrency > 0 else 0.0

        return {
            "success_rate": success_rate,
            "avg_latency": avg_latency,
            "total_elapsed": total_elapsed,
        }

    def _update_scores(self, performance: Dict[int, Dict[str, Any]]):
        """
        메트릭을 기반으로 마이너 점수를 계산하고 이동평균(EMA)으로 최종 점수를 갱신합니다.

        평가식:
        Score = 0.4 * 성공률(Success Rate) + 0.4 * 속도 점수(Latency Score) + 0.2 * 동시성 지연 관리도(Throughput Score)
        """
        for uid, metrics in performance.items():
            success_score = metrics["success_rate"]

            # 지연 시간 점수 (최대 타임아웃 15초 대비 빠를수록 높은 가중치)
            latency_score = max(0.0, 1.0 - (metrics["avg_latency"] / 15.0))

            # 동시성 처리 점수 (동시 다발성 쿼리 대비 전체 완료 시간이 효율적으로 단축되었는지 평가)
            # 5개 요청이 완전히 순차(Simple Python)로 동작했다면 total_elapsed가 4~5초에 육박하겠지만,
            # AIOS 스케줄러로 최적화되었다면 2초 내외로 단축됨을 모사
            concurrency_score = max(0.0, 1.0 - (metrics["total_elapsed"] / 8.0))

            # 가중치 결합
            raw_score = (
                (0.4 * success_score)
                + (0.4 * latency_score)
                + (0.2 * concurrency_score)
            )

            # 지수이동평균(EMA) 적용
            if uid not in self.scores:
                self.scores[uid] = raw_score
            else:
                self.scores[uid] = (self.alpha * raw_score) + (
                    (1 - self.alpha) * self.scores[uid]
                )

            self.logger.info(
                f"[Validator] Miner UID {uid} updated score: {self.scores[uid]:.4f}"
            )

    def _set_weights(self):
        """
        비텐서 네트워크에 가중치를 설정합니다.
        """
        uids = list(self.scores.keys())
        raw_weights = list(self.scores.values())

        # 합이 1이 되도록 정규화
        sum_weights = sum(raw_weights)
        if sum_weights > 0:
            weights = [w / sum_weights for w in raw_weights]
        else:
            weights = [1.0 / len(uids) for _ in uids]

        self.logger.info("[Validator] Submitting miner weights to chain (Subtensor).")
        for uid, weight in zip(uids, weights):
            self.logger.info(f" -> UID {uid}: 가중치 할당량 {weight * 100:.2f}%")

        if HAS_BITTENSOR:
            try:
                # 실제 체인 가중치 세팅 API 호출
                self.subtensor.set_weights(
                    netuid=self.config.netuid,
                    wallet=self.wallet,
                    uids=uids,
                    weights=weights,
                    version_key=1,
                )
                self.logger.info("[Validator] Weights submitted successfully.")
            except Exception as e:
                self.logger.error(f"체인 가중치 세팅 실패: {str(e)}")
        else:
            self.logger.info(
                "[Validator] [Mock Mode] Weights virtually stored in local metadata table."
            )


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    SurfclawValidator.add_args(parser)
    validator = SurfclawValidator(parser)
    validator.run()
