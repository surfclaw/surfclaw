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
    Base class for Bittensor validators.
    Uses Dendrite to query miners and submit weights based on task evaluations.
    """

    def __init__(self, parser: Optional[argparse.ArgumentParser] = None):
        super().__init__(parser)

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
            help="Interval between validation rounds in seconds.",
        )

    def run(self):
        self.logger.info("Starting validator node...")
        self.is_running = True

        try:
            while self.is_running:
                if self.should_sync():
                    self.sync()

                self.logger.info(f"Validator running step: {self.step}")
                self.forward()

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
        self.is_running = False
        self.logger.info("Validator node stopped.")

    def forward(self):
        raise NotImplementedError("Validator must implement forward method.")
