from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field

# bittensor check & fallback setup
try:
    import bittensor as bt

    HAS_BITTENSOR = True
except ImportError:
    HAS_BITTENSOR = False

if HAS_BITTENSOR:
    class AgentExecutionSynapse(bt.Synapse):
        """
        AgentExecutionSynapse defines the communication protocol for the Surfclaw Bittensor subnet.
        Validators submit task inputs, and miners populate output fields after processing with Surfclaw kernel.
        """

        # Input variables (provided by Validator)
        agent_name: str = Field(
            ..., description="Target AIOS agent name or module path."
        )
        task_input: str = Field(
            ..., description="Prompt task/input data to execute."
        )
        tools: List[str] = Field(
            default_factory=list,
            description="Active external tools (e.g., google_search, custom_calculator).",
        )

        # Output variables (returned by Miner)
        response_output: Optional[str] = Field(
            None, description="Final output text from agent execution."
        )
        execution_trace: List[Dict[str, Any]] = Field(
            default_factory=list,
            description="Intermediate execution traces logged by the scheduler.",
        )
        execution_time: float = Field(
            0.0, description="Total execution time in seconds."
        )
        memory_usage: float = Field(
            0.0, description="Measured peak memory usage in Bytes."
        )
        success: bool = Field(False, description="Flag indicating execution success status.")

        def deserialize(self) -> str:
            return self.response_output or ""
else:
    # Mock fallback definitions
    class DendriteCallResult(BaseModel):
        status_code: int = 200
        status_message: str = "Success"

    class Synapse(BaseModel):
        """Mock Synapse Base Class"""

        dendrite: Optional[DendriteCallResult] = Field(
            default_factory=DendriteCallResult
        )

        class Config:
            arbitrary_types_allowed = True

    class AgentExecutionSynapse(Synapse):
        """
        AgentExecutionSynapse defines the communication protocol (Mock Fallback).
        """

        agent_name: str
        task_input: str
        tools: List[str] = []

        response_output: Optional[str] = None
        execution_trace: List[Dict[str, Any]] = []
        execution_time: float = 0.0
        memory_usage: float = 0.0
        success: bool = False

        def deserialize(self) -> str:
            return self.response_output or ""

    class MockAxon:
        def __init__(self, wallet=None, port=None, ip=None):
            self.wallet = wallet
            self.port = port
            self.ip = ip
            self.forward_fns = {}

        def attach(self, forward_fn, blacklist_fn=None, priority_fn=None):
            self.forward_fns[forward_fn.__code__.co_varnames[1]] = forward_fn
            return self

        def start(self):
            print(f"[Mock Axon] Axon Server started on port {self.port}.")
            return self

        def stop(self):
            print("[Mock Axon] Stopping Axon Server.")
            return self

    class MockDendrite:
        def __init__(self, wallet=None):
            self.wallet = wallet

        def query(
            self, axons: Any, synapse: AgentExecutionSynapse, timeout: float = 12.0
        ) -> Any:
            return synapse

    class MockWallet:
        def __init__(self, name="default", hotkey="default"):
            self.wallet_name = name
            self.hotkey = hotkey

    class MockSubtensor:
        def __init__(self, network="mock"):
            self.network = network

    class MockMetagraph:
        def __init__(self, netuid=99):
            self.netuid = netuid
            self.uids = list(range(10))
            self.axons = [MockAxon(port=8000 + i) for i in range(10)]
