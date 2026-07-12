import time
import argparse
import traceback
from typing import Optional, Any

from template.base.neuron import BaseNeuron
from template.protocol import HAS_BITTENSOR

if HAS_BITTENSOR:
    import bittensor as bt
else:
    from template.protocol import MockAxon


class BaseMinerNeuron(BaseNeuron):
    """
    비텐서 마이너 노드의 기반 클래스.
    Axon 서버를 구동해 검증자의 에이전트 요청을 수신 및 처리합니다.
    """

    def __init__(self, parser: Optional[argparse.ArgumentParser] = None):
        super().__init__(parser)

        # Axon 인스턴스 초기화 및 바인딩
        if HAS_BITTENSOR:
            self.axon = bt.axon(wallet=self.wallet, config=self.config)
        else:
            self.axon = MockAxon(wallet=self.wallet, port=self.config.axon_port)

        self.is_running = False

    @classmethod
    def add_args(cls, parser: argparse.ArgumentParser):
        super().add_args(parser)
        parser.add_argument(
            "--axon_port", type=int, default=8091, help="Axon 서버가 사용할 포트 번호"
        )
        parser.add_argument(
            "--axon_ip",
            type=str,
            default="127.0.0.1",
            help="Axon 서버가 바인딩할 IP 주소",
        )

    def run(self):
        """마이너 실행 루프"""
        self.logger.info("Starting miner axon server...")

        # Synapse 포워딩 핸들러 등록
        self.axon.attach(
            forward_fn=self.forward,
            blacklist_fn=self.blacklist,
            priority_fn=self.priority,
        )

        self.axon.start()
        self.is_running = True
        self.logger.info(
            f"Miner node active. Listening on {self.config.axon_ip}:{self.config.axon_port}"
        )

        try:
            while self.is_running:
                # 주기적인 메타그래프 업데이트
                if self.should_sync():
                    self.sync()

                time.sleep(1)
                self.step += 1

        except KeyboardInterrupt:
            self.logger.info("Miner interrupted by user, shutting down...")
        except Exception as e:
            self.logger.error(f"Error in miner main loop: {str(e)}")
            self.logger.error(traceback.format_exc())
        finally:
            self.stop()

    def stop(self):
        """마이너 종료"""
        self.is_running = False
        if hasattr(self, "axon"):
            self.axon.stop()
        self.logger.info("Miner node stopped.")

    # 하위 클래스에서 오버라이드할 추상 메서드들
    def forward(self, synapse: Any) -> Any:
        raise NotImplementedError("Miner must implement forward method.")

    def blacklist(self, synapse: Any) -> tuple:
        # 기본값: 블랙리스트 미지정 (통과)
        return False, "Not blacklisted"

    def priority(self, synapse: Any) -> float:
        # 기본값: 동일 우선순위
        return 1.0
