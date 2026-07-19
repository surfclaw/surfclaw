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
    Base class for Bittensor miners.
    Spawns axon server to receive and process synapse requests from validators.
    """

    def __init__(self, parser: Optional[argparse.ArgumentParser] = None):
        super().__init__(parser)

        if HAS_BITTENSOR:
            self.axon = bt.axon(wallet=self.wallet, config=self.config)
        else:
            self.axon = MockAxon(wallet=self.wallet, port=self.config.axon_port)

        self.is_running = False

    @classmethod
    def add_args(cls, parser: argparse.ArgumentParser):
        super().add_args(parser)
        parser.add_argument(
            "--axon_port", type=int, default=8091, help="Port to bind the Axon server."
        )
        parser.add_argument(
            "--axon_ip",
            type=str,
            default="127.0.0.1",
            help="IP to bind the Axon server.",
        )

    def run(self):
        self.logger.info("Starting miner axon server...")

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
        self.is_running = False
        if hasattr(self, "axon"):
            self.axon.stop()
        self.logger.info("Miner node stopped.")

    def forward(self, synapse: Any) -> Any:
        raise NotImplementedError("Miner must implement forward method.")

    def blacklist(self, synapse: Any) -> tuple:
        return False, "Not blacklisted"

    def priority(self, synapse: Any) -> float:
        return 1.0
