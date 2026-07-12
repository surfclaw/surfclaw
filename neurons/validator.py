# The MIT License (MIT)
# Copyright © 2023 Yuma Rao
# Copyright © 2026 Surfclaw

import argparse
import time
import concurrent.futures
from typing import List, Dict, Any, Optional

import bittensor as bt
from template.protocol import AgentExecutionSynapse
from template.base.validator import BaseValidatorNeuron

HAS_BITTENSOR = True


class SurfclawValidator(BaseValidatorNeuron):
    """
    Surfclaw Validator Node for Bittensor Subnet.
    Concurrently audits and rates miners by dispatching complex synthetic agent tasks.
    """

    def __init__(self, parser: Optional[argparse.ArgumentParser] = None):
        super().__init__(parser)

        # Track running average scores for each miner UID
        self.scores = {uid: 0.0 for uid in self.metagraph.uids}
        self.alpha = 0.15  # Moving average smoothing factor (Alpha)

        # Define evaluation mock tasks for miners
        self.synthetic_tasks = [
            {
                "agent_name": "academic_agent",
                "task_input": "Summarize the Bittensor Yuma Consensus mechanism in the format of an academic journal paper abstract.",
                "tools": ["google_search"],
            },
            {
                "agent_name": "coding_agent",
                "task_input": "Implement and explain a thread-safe FIFO Queue scheduler example code in Python.",
                "tools": [],
            },
            {
                "agent_name": "search_agent",
                "task_input": "Retrieve and summarize the latest 2026 release tags and core features from the official AIOS repository.",
                "tools": ["google_search", "web_browser"],
            },
            {
                "agent_name": "math_agent",
                "task_input": "Provide a mathematical proof for the summation formula of the first n positive integers.",
                "tools": ["custom_calculator"],
            },
        ]

    def forward(self):
        """
        Main execution loop triggered on every validation epoch to evaluate miners.
        """
        uids = self.metagraph.uids
        if not uids:
            self.logger.warning("No active miner nodes found on chain.")
            return

        # Perform benchmark testing (sending concurrent requests to each miner)
        miner_performance = {}

        for uid in uids:
            axon = self.metagraph.axons[uid]
            self.logger.info(
                f"[Validator] Sending concurrency stress test to miner UID {uid} (Port: {axon.port})..."
            )

            # Concurrency rate (Send 5 requests in parallel to evaluate VRAM scheduler performance)
            num_concurrency = 5
            results = self._benchmark_miner(uid, axon, num_concurrency)

            miner_performance[uid] = results
            self.logger.info(
                f"[Validator] Miner UID {uid} Result: Success Rate {results['success_rate'] * 100:.1f}% | "
                f"Avg Latency {results['avg_latency']:.3f}s | "
                f"Total Elapsed {results['total_elapsed']:.3f}s"
            )

        # Calculate metrics and update running scores
        self._update_scores(miner_performance)

        # Sync weights with Bittensor chain (Subtensor call)
        self._set_weights()

    def _benchmark_miner(
        self, uid: int, axon: Any, num_concurrency: int
    ) -> Dict[str, Any]:
        """
        Benchmark a single miner by sending concurrent queries to measure latency and success rate.
        """
        synapses = []
        for i in range(num_concurrency):
            # Rotate synthetic tasks to generate synapses
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

        # Send concurrent requests using ThreadPoolExecutor
        with concurrent.futures.ThreadPoolExecutor(
            max_workers=num_concurrency
        ) as executor:
            if HAS_BITTENSOR:
                # Query miner axons via Bittensor dendrite
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
                            latencies.append(12.0)  # Apply timeout penalty
                    except Exception:
                        latencies.append(12.0)
            else:
                # Mock Mode: Direct local emulation of miner forward logic
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

                # Clean up Mock resources
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
        Evaluate metrics and update the final miner score using Exponential Moving Average (EMA).

        Formula:
        Score = 0.4 * Success Rate + 0.4 * Latency Score + 0.2 * Concurrency Throughput Score
        """
        for uid, metrics in performance.items():
            success_score = metrics["success_rate"]

            # Latency Score (Shorter duration earns higher weight relative to 15s timeout limit)
            latency_score = max(0.0, 1.0 - (metrics["avg_latency"] / 15.0))

            # Concurrency Score (Verifies if simultaneous queries are optimized by Surfclaw VRAM Scheduler)
            # Standard Python loops complete in ~4-5s, while Surfclaw parallel execution reduces it to ~2s
            concurrency_score = max(0.0, 1.0 - (metrics["total_elapsed"] / 8.0))

            # Combine weights
            raw_score = (
                (0.4 * success_score)
                + (0.4 * latency_score)
                + (0.2 * concurrency_score)
            )

            # Apply Exponential Moving Average (EMA)
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
        Submits weights to the Bittensor subtensor network.
        """
        uids = list(self.scores.keys())
        raw_weights = list(self.scores.values())

        # Normalize weights to sum up to 1.0
        sum_weights = sum(raw_weights)
        if sum_weights > 0:
            weights = [w / sum_weights for w in raw_weights]
        else:
            weights = [1.0 / len(uids) for _ in uids]

        self.logger.info("[Validator] Submitting miner weights to chain (Subtensor).")
        for uid, weight in zip(uids, weights):
            self.logger.info(f" -> UID {uid}: Allocated Weight {weight * 100:.2f}%")

        if HAS_BITTENSOR:
            try:
                # Call Bittensor subtensor weights API
                self.subtensor.set_weights(
                    netuid=self.config.netuid,
                    wallet=self.wallet,
                    uids=uids,
                    weights=weights,
                    version_key=1,
                )
                self.logger.info("[Validator] Weights submitted successfully.")
            except Exception as e:
                self.logger.error(f"Failed to set weights on chain: {str(e)}")
        else:
            self.logger.info(
                "[Validator] [Mock Mode] Weights virtually stored in local metadata table."
            )


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    SurfclawValidator.add_args(parser)
    validator = SurfclawValidator(parser)
    validator.run()
