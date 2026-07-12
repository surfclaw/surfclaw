import argparse
import logging
from typing import Optional

# protocol.py의 bittensor 임포트 여부 활용
from template.protocol import HAS_BITTENSOR

if HAS_BITTENSOR:
    import bittensor as bt
else:
    # bittensor가 없을 때 폴백 클래스 선언
    from template.protocol import MockWallet, MockSubtensor, MockMetagraph


class BaseNeuron:
    """
    비텐서 서브넷 노드의 공통 기반 클래스.
    지갑(Wallet), 메타그래프(Metagraph), 서브텐서(Subtensor) 네트워크 인터페이스를 연결하고 세팅을 관리합니다.
    """

    def __init__(self, parser: Optional[argparse.ArgumentParser] = None):
        if parser is None:
            parser = argparse.ArgumentParser()
        self.add_args(parser)
        self.config = self.setup_config(parser)

        # 로깅 설정
        logging.basicConfig(level=getattr(logging, self.config.logging_level.upper()))
        self.logger = logging.getLogger(self.__class__.__name__)

        # 비텐서 코어 컴포넌트 초기화
        if HAS_BITTENSOR:
            self.wallet = bt.wallet(config=self.config)
            self.subtensor = bt.subtensor(config=self.config)
            self.metagraph = self.subtensor.metagraph(netuid=self.config.netuid)
        else:
            self.wallet = MockWallet(
                name=self.config.wallet_name, hotkey=self.config.wallet_hotkey
            )
            self.subtensor = MockSubtensor(network=self.config.subtensor_network)
            self.metagraph = MockMetagraph(netuid=self.config.netuid)
            self.logger.info(
                "[Mock Mode] Using Mock Neuron environment instead of live Bittensor connection."
            )

        self.uid = 0  # 로컬 테스트용 고정 UID
        self.step = 0

    @classmethod
    def add_args(cls, parser: argparse.ArgumentParser):
        """커맨드라인 인수 추가"""
        parser.add_argument("--netuid", type=int, default=99, help="서브넷 UID 번호")
        parser.add_argument(
            "--wallet_name", type=str, default="default", help="비텐서 지갑 콜드키 이름"
        )
        parser.add_argument(
            "--wallet_hotkey", type=str, default="default", help="비텐서 지갑 핫키 이름"
        )
        parser.add_argument(
            "--subtensor_network",
            type=str,
            default="mock",
            help="연결할 체인 네트워크 (finney, test, local, mock)",
        )
        parser.add_argument(
            "--logging_level",
            type=str,
            default="info",
            choices=["debug", "info", "warning", "error"],
            help="로그 레벨 설정",
        )

    def setup_config(self, parser: argparse.ArgumentParser) -> argparse.Namespace:
        """설정 파싱 및 검증"""
        args, _ = parser.parse_known_args()
        return args

    def sync(self):
        """네트워크 상태(Metagraph) 동기화"""
        self.logger.debug(f"Syncing metagraph for netuid: {self.config.netuid}...")
        if HAS_BITTENSOR:
            self.metagraph.sync(subtensor=self.subtensor)
        self.logger.debug("Metagraph synced successfully.")

    def should_sync(self) -> bool:
        """체인 동기화가 필요한 시점인지 체크"""
        return self.step % 100 == 0
