import time
import argparse
import traceback
from typing import Optional

from template.base.neuron import BaseNeuron
from template.protocol import HAS_BITTENSOR

if HAS_BITTENSOR:
    import bittensor as bt
else:
    from template.protocol import MockDendrite


class BaseValidatorNeuron(BaseNeuron):
    """
    비텐서 검증자 노드의 기반 클래스.
    Dendrite 클라이언트를 사용해 마이너에게 테스트 쿼리를 전송하고 스코어링을 통해 가중치를 매깁니다.
    """

    def __init__(self, parser: Optional[argparse.ArgumentParser] = None):
        super().__init__(parser)

        # Dendrite 인스턴스 초기화
        if HAS_BITTENSOR:
            self.dendrite = bt.dendrite(wallet=self.wallet)
        else:
            self.dendrite = MockDendrite(wallet=self.wallet)

        self.is_running = False

    @classmethod
    def add_args(cls, parser: argparse.ArgumentParser):
        super().add_args(parser)
        parser.add_argument(
            "--validator_loop_interval",
            type=int,
            default=300,
            help="검증 루프의 한 주기 속도 (초)",
        )

    def run(self):
        """검증자 실행 루프"""
        self.logger.info("Starting validator node...")
        self.is_running = True

        try:
            while self.is_running:
                # 주기적인 메타그래프 동기화
                if self.should_sync():
                    self.sync()

                # 검증 작업 실행 및 가중치 제출
                self.logger.info(f"Validator running step: {self.step}")
                self.forward()

                # 지정된 인터벌만큼 대기
                time.sleep(self.config.validator_loop_interval)
                self.step += 1

        except KeyboardInterrupt:
            self.logger.info("Validator interrupted by user, shutting down...")
        except Exception as e:
            self.logger.error(f"Error in validator main loop: {str(e)}")
            self.logger.error(traceback.format_exc())
        finally:
            self.stop()

    def stop(self):
        """검증자 종료"""
        self.is_running = False
        self.logger.info("Validator node stopped.")

    # 하위 클래스에서 실제 평가 로직을 작성
    def forward(self):
        raise NotImplementedError("Validator must implement forward method.")
