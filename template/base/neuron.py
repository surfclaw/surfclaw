import argparse
import logging
from typing import Optional

from template.protocol import HAS_BITTENSOR

if HAS_BITTENSOR:
    import bittensor as bt
else:
    from template.protocol import MockWallet, MockSubtensor, MockMetagraph


class BaseNeuron:
    """
    Base class for Bittensor subnet neurons.
    Handles configuration, logging setup, and integrates wallet, subtensor, and metagraph.
    """

    def __init__(self, parser: Optional[argparse.ArgumentParser] = None):
        if parser is None:
            parser = argparse.ArgumentParser()
        self.add_args(parser)
        self.config = self.setup_config(parser)

        logging.basicConfig(level=getattr(logging, self.config.logging_level.upper()))
        self.logger = logging.getLogger(self.__class__.__name__)

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

        self.uid = 0
        self.step = 0

    @classmethod
    def add_args(cls, parser: argparse.ArgumentParser):
        parser.add_argument("--netuid", type=int, default=99, help="Subnet netuid.")
        parser.add_argument(
            "--wallet_name", type=str, default="default", help="Bittensor wallet coldkey name."
        )
        parser.add_argument(
            "--wallet_hotkey", type=str, default="default", help="Bittensor wallet hotkey name."
        )
        parser.add_argument(
            "--subtensor_network",
            type=str,
            default="mock",
            help="Chain network to connect (finney, test, local, mock).",
        )
        parser.add_argument(
            "--logging_level",
            type=str,
            default="info",
            choices=["debug", "info", "warning", "error"],
            help="Logging level configuration.",
        )

    def setup_config(self, parser: argparse.ArgumentParser):
        if HAS_BITTENSOR:
            return bt.config(parser)
        else:
            args, _ = parser.parse_known_args()
            return args

    def sync(self):
        self.logger.debug(f"Syncing metagraph for netuid: {self.config.netuid}...")
        if HAS_BITTENSOR:
            self.metagraph.sync(subtensor=self.subtensor)
        self.logger.debug("Metagraph synced successfully.")

    def should_sync(self) -> bool:
        return self.step % 100 == 0
