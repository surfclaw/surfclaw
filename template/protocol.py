from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field

# bittensor 라이브러리 존재 여부 확인 및 폴백(Fallback) 정의
try:
    import bittensor as bt

    HAS_BITTENSOR = True
except ImportError:
    HAS_BITTENSOR = False

if HAS_BITTENSOR:
    # 실제 비텐서 환경을 사용하는 경우
    class AgentExecutionSynapse(bt.Synapse):
        """
        AIOS 비텐서 서브넷의 기본 통신 규격.
        검증자가 태스크를 실어 보내면, 마이너가 AIOS 커널을 통해 연산 후 결과를 채워 반환합니다.
        """

        # 입력 데이터 (검증자가 채워서 전송)
        agent_name: str = Field(
            ..., description="실행할 AIOS 에이전트의 명칭 또는 경로"
        )
        task_input: str = Field(
            ..., description="에이전트가 수행할 프롬프트 및 태스크 내용"
        )
        tools: List[str] = Field(
            default_factory=list,
            description="활성화할 외부 도구 목록 (예: google_search, custom_calculator)",
        )

        # 출력 데이터 (마이너가 채워서 반환)
        response_output: Optional[str] = Field(
            None, description="에이전트 연산 최종 결과 텍스트"
        )
        execution_trace: List[Dict[str, Any]] = Field(
            default_factory=list,
            description="AIOS 스케줄러가 기록한 에이전트 내부 실행 단계 로그",
        )
        execution_time: float = Field(
            0.0, description="에이전트 태스크 수행 총 소요 시간 (초)"
        )
        memory_usage: float = Field(
            0.0, description="AIOS Context Manager가 미터링한 메모리 사용량 (Bytes)"
        )
        success: bool = Field(False, description="실행 완료 및 성공 여부")

        def deserialize(self) -> str:
            """결과 텍스트를 디코딩하여 반환합니다."""
            return self.response_output or ""
else:
    # 로컬 시뮬레이션용 Mock 비텐서 환경 정의
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
        AIOS 비텐서 서브넷의 기본 통신 규격 (Mock Fallback).
        """

        # 입력 데이터
        agent_name: str
        task_input: str
        tools: List[str] = []

        # 출력 데이터
        response_output: Optional[str] = None
        execution_trace: List[Dict[str, Any]] = []
        execution_time: float = 0.0
        memory_usage: float = 0.0
        success: bool = False

        def deserialize(self) -> str:
            return self.response_output or ""

    # Mock bittensor 모듈 클래스 정의
    class MockAxon:
        def __init__(self, wallet=None, port=None, ip=None):
            self.wallet = wallet
            self.port = port
            self.ip = ip
            self.forward_fns = {}

        def attach(self, forward_fn, blacklist_fn=None, priority_fn=None):
            # register synapse handler
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
            # Local execution emulation
            return synapse

    class MockWallet:
        def __init__(self, name="default", hotkey="default"):
            self.name = name
            self.hotkey = hotkey

    class MockSubtensor:
        def __init__(self, network="mock"):
            self.network = network

    class MockMetagraph:
        def __init__(self, netuid=99):
            self.netuid = netuid
            self.uids = list(range(10))
            self.axons = [MockAxon(port=8000 + i) for i in range(10)]
