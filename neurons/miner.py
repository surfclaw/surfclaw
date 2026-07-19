# The MIT License (MIT)
# Copyright © 2023 Yuma Rao
# Copyright © 2026 Surfclaw

import argparse
import os
import sys
import threading
from typing import Optional

current_dir = os.path.dirname(os.path.abspath(__file__))
project_root = os.path.dirname(current_dir)
if project_root not in sys.path:
    sys.path.insert(0, project_root)

from template.base.miner import BaseMinerNeuron  # noqa: E402
from template.protocol import AgentExecutionSynapse  # noqa: E402
from template.surfclaw_kernel import SurfclawKernelWrapper  # noqa: E402
from template.memory import MinerMemoryStore, compute_task_hash, ExecutionRecord  # noqa: E402


class SurfclawMiner(BaseMinerNeuron):
    """
    Surfclaw Miner Node for Bittensor Subnet.
    Receives AgentExecutionSynapses and processes them concurrently 
    using the Rust-native Surfclaw kernel to bypass VRAM bottlenecks.
    """

    def __init__(self, parser: Optional[argparse.ArgumentParser] = None):
        super().__init__(parser)

        self.surfclaw_kernel = SurfclawKernelWrapper(
            use_real_kernel=self.config.use_real_kernel,
            model_name=self.config.model_name,
        )
        self.surfclaw_kernel.start()
        self.logger.info(
            "[Miner] Surfclaw Kernel Wrapper initialized."
        )

        self.memory_store = MinerMemoryStore()
        self.logger.info(
            f"[Miner] Persistent Memory Store initialized. Current Stats: {self.memory_store.stats()}"
        )

    @classmethod
    def add_args(cls, parser: argparse.ArgumentParser):
        super().add_args(parser)
        parser.add_argument(
            "--use_real_kernel",
            action="store_true",
            help="Run real Rust-native Surfclaw kernel back-end.",
        )
        parser.add_argument(
            "--model_name", type=str, default="mock-llm", help="Target LLM model name."
        )

    def forward(self, synapse: AgentExecutionSynapse) -> AgentExecutionSynapse:
        """
        Processes incoming validation queries by submitting them to the Surfclaw scheduler queue.
        """
        self.logger.info(
            f"[Miner] Processing query: Agent={synapse.agent_name} | Task={synapse.task_input[:40]}..."
        )

        # 1. 캐시 히트 검사 (DeepAgents Persistent Memory 패턴)
        task_hash = compute_task_hash(synapse.task_input, synapse.agent_name)
        cached_record = self.memory_store.lookup_by_task(task_hash)
        if cached_record is not None:
            self.logger.info(
                f"[Miner] [Cache Hit] Found cached result in MinerMemoryStore (Record ID: {cached_record.record_id[:8]})"
            )
            synapse.response_output = cached_record.response_output
            synapse.success = True
            synapse.execution_time = 0.001  # 즉각 응답
            return synapse

        # 2. 캐시 미스 시 실제 실행
        completion_event = threading.Event()

        def on_execution_complete(completed_synapse: AgentExecutionSynapse):
            self.logger.info(
                f"[Miner] Task completed: {synapse.agent_name} | Time: {completed_synapse.execution_time:.3f}s"
            )
            # 실행 성공 시 캐시 저장소에 업서트
            if completed_synapse.success:
                record = ExecutionRecord(
                    task_input_hash=task_hash,
                    agent_name=completed_synapse.agent_name,
                    response_output=completed_synapse.response_output,
                    execution_time=completed_synapse.execution_time,
                    memory_usage=completed_synapse.memory_usage,
                    success=True,
                )
                self.memory_store.upsert(record)
                self.logger.info(
                    f"[Miner] [Cache Saved] Execution cache saved to MinerMemoryStore (Record ID: {record.record_id[:8]})"
                )
            completion_event.set()

        self.surfclaw_kernel.submit_task(synapse, on_execution_complete)

        timeout_occurred = not completion_event.wait(timeout=15.0)

        if timeout_occurred:
            self.logger.warning(
                f"[Miner] [Timeout] Execution delayed in scheduler queue: {synapse.agent_name}"
            )
            synapse.success = False
            synapse.response_output = "Execution timed out in miner's Surfclaw queue."

        return synapse

    def blacklist(self, synapse: AgentExecutionSynapse) -> tuple:
        """
        Filters out invalid agent queries.
        """
        if not synapse.agent_name or not synapse.task_input:
            return True, "Invalid request details"
        return False, "Request clear"

    def priority(self, synapse: AgentExecutionSynapse) -> float:
        """
        Prioritizes incoming validator requests.
        """
        return 1.0

    def stop(self):
        super().stop()
        if hasattr(self, "surfclaw_kernel"):
            self.surfclaw_kernel.stop()


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    SurfclawMiner.add_args(parser)
    miner = SurfclawMiner(parser)
    miner.run()
