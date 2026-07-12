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
import argparse
import threading
from typing import Optional

# 프로젝트 루트 경로 추가
current_dir = os.path.dirname(os.path.abspath(__file__))
project_root = os.path.dirname(current_dir)
if project_root not in sys.path:
    sys.path.insert(0, project_root)

from template.base.miner import BaseMinerNeuron  # noqa: E402
from template.protocol import AgentExecutionSynapse  # noqa: E402
from template.surfclaw_kernel import SurfclawKernelWrapper  # noqa: E402


class SurfclawMiner(BaseMinerNeuron):
    """
    AIOS 비텐서 서브넷 마이너 노드 실제 구현체.
    들어오는 모든 AgentExecutionSynapse를 AIOS 커널 스케줄러에 집어넣어,
    VRAM 초과나 연산 락 없이 안정적으로 동시 처리를 수행합니다.
    """

    def __init__(self, parser: Optional[argparse.ArgumentParser] = None):
        super().__init__(parser)

        # Surfclaw 커널 기동 및 연동 설정
        self.surfclaw_kernel = SurfclawKernelWrapper(
            use_real_kernel=self.config.use_real_kernel,
            model_name=self.config.model_name,
        )
        self.surfclaw_kernel.start()
        self.logger.info(
            "[Miner] Surfclaw Kernel Wrapper loaded and started inside Miner node."
        )

    @classmethod
    def add_args(cls, parser: argparse.ArgumentParser):
        super().add_args(parser)
        parser.add_argument(
            "--use_real_kernel",
            action="store_true",
            help="실제 AIOS 커널을 백엔드로 실행 (API 키와 cuda 필요)",
        )
        parser.add_argument(
            "--model_name", type=str, default="mock-llm", help="사용할 LLM 모델명"
        )

    def forward(self, synapse: AgentExecutionSynapse) -> AgentExecutionSynapse:
        """
        검증자로부터 에이전트 연산 요청이 오면 실행되는 핸들러.
        AIOS 스케줄러 큐에 등록하여 처리합니다.
        """
        self.logger.info(
            f"[Miner] Received agent query: Agent: {synapse.agent_name} | Task: {synapse.task_input[:40]}..."
        )

        # 비동기 스케줄러 작업 처리를 동기 대기로 제어하기 위한 Event 객체
        completion_event = threading.Event()

        def on_execution_complete(completed_synapse: AgentExecutionSynapse):
            # 완료 시점에 호출되는 콜백
            self.logger.info(
                f"[Miner] Surfclaw scheduler computation complete: {synapse.agent_name} | Time: {completed_synapse.execution_time:.3f}s"
            )
            completion_event.set()

        # 스케줄러 큐에 삽입
        self.surfclaw_kernel.submit_task(synapse, on_execution_complete)

        # 스케줄러 연산 대기 (비텐서 타임아웃 15초 제한)
        timeout_occurred = not completion_event.wait(timeout=15.0)

        if timeout_occurred:
            self.logger.warning(
                f"[Miner] [Timeout] Agent execution delayed in scheduler: {synapse.agent_name}"
            )
            synapse.success = False
            synapse.response_output = "Execution timed out in miner's Surfclaw queue."

        return synapse

    def blacklist(self, synapse: AgentExecutionSynapse) -> tuple:
        """
        비정상적이거나 허용되지 않은 에이전트 요청을 걸러냅니다.
        """
        # 검증을 위한 예외 조건 설정 예시
        if not synapse.agent_name or not synapse.task_input:
            return True, "Invalid request details"
        return False, "Request clear"

    def priority(self, synapse: AgentExecutionSynapse) -> float:
        """
        중요도에 따라 스케줄러 우선순위를 다르게 부여할 수 있습니다.
        (예: 검증자의 Stake 양이나 지불 수수료 등에 따라 우선 처리)
        """
        # 기본 우선순위
        return 1.0

    def stop(self):
        super().stop()
        if hasattr(self, "surfclaw_kernel"):
            self.surfclaw_kernel.stop()


if __name__ == "__main__":
    # 마이너 인스턴스 생성 및 실행
    parser = argparse.ArgumentParser()
    SurfclawMiner.add_args(parser)
    miner = SurfclawMiner(parser)
    miner.run()
