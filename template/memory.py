"""
Surfclaw Persistent Memory Module
==================================
DeepAgents(langchain-ai/deepagents)의 실제 소스코드에서 추출한 핵심 패턴:
  - _messages_delta_reducer: ID 기반 중복 제거 + tombstone 리셋
  - pluggable state backends: 크로스세션 체크포인트
를 LangChain/LangGraph 의존성 없이 순수 Python+Pydantic으로 구현.

Why this design:
  - 마이너가 동일한 task_input을 이미 실행한 경우 캐시에서 즉시 반환 → 레이턴시 0화
  - Validator가 마이너 이력 기반으로 이상 패턴(표절/치팅) 탐지 가능
  - 세션 재시작 후에도 이전 결과가 보존되어 서브넷 점수 연속성 유지

License context:
  - DeepAgents: MIT License (langchain-ai/deepagents)
  - 본 파일은 개념만 차용하고 코드는 100% 독자 구현 (LangChain 코드 미포함)
"""

from __future__ import annotations

import json
import os
import time
import uuid
from pathlib import Path
from typing import Any, Dict, List, Optional, TypedDict

from pydantic import BaseModel, Field


# ---------------------------------------------------------------------------
# 1. 실행 레코드 스키마 (DeepAgents _messages_reducer 의 AnyMessage 대응)
# ---------------------------------------------------------------------------

class ExecutionRecord(BaseModel):
    """단일 마이너 실행 결과 레코드.

    DeepAgents의 AnyMessage를 Surfclaw 도메인에 맞게 재정의.
    ID 기반 dedup을 위해 record_id가 반드시 필요하며, 재실행 시에도 동일 ID를
    사용하면 최신 결과로 덮어씀 (tombstone이 아닌 upsert 방식).
    """

    record_id: str = Field(
        default_factory=lambda: str(uuid.uuid4()),
        description="고유 실행 레코드 ID. 동일 ID로 재기록 시 upsert 처리.",
    )
    task_input_hash: str = Field(
        ...,
        description="SHA256(task_input) — 동일 태스크 캐시 히트 키.",
    )
    agent_name: str = Field(..., description="실행된 에이전트 이름.")
    response_output: Optional[str] = Field(None, description="마이너 응답 결과.")
    execution_time: float = Field(0.0, description="실행 시간(초).")
    memory_usage: float = Field(0.0, description="피크 메모리 사용량(Bytes).")
    success: bool = Field(False, description="성공 여부.")
    timestamp: float = Field(default_factory=time.time, description="Unix 타임스탬프.")
    tombstone: bool = Field(
        False,
        description="True이면 해당 레코드를 삭제 처리. DeepAgents RemoveMessage 패턴 대응.",
    )

    def to_dict(self) -> Dict[str, Any]:
        return self.model_dump()

    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> "ExecutionRecord":
        return cls(**data)


# ---------------------------------------------------------------------------
# 2. Delta Reducer — DeepAgents _messages_delta_reducer 패턴 순수 구현
#    원본: libs/deepagents/deepagents/_messages_reducer.py
#    핵심: ID dedup + tombstone 삭제 + batch reduce
# ---------------------------------------------------------------------------

def _execution_delta_reducer(
    state: List[ExecutionRecord] | None,
    writes: List[ExecutionRecord],
) -> List[ExecutionRecord]:
    """ID 기반 upsert/tombstone 배치 리듀서.

    DeepAgents의 `_messages_delta_reducer`에서 개념 추출:
      - 동일 record_id → 최신으로 덮어씀 (upsert)
      - tombstone=True → 해당 레코드 삭제
      - state=None → 초기 상태(빈 리스트)로 리셋

    Why not use add_messages style:
      우리는 순서 보장보다 ID 무결성과 중복 방지가 중요하므로
      dict 기반 upsert가 LangGraph의 dedup 방식보다 적합.
    """
    if state is None:
        state = []

    # 기존 상태를 ID 기반 dict로 변환 (O(n) lookup → O(1))
    state_by_id: Dict[str, ExecutionRecord] = {r.record_id: r for r in state}

    for record in writes:
        if record.tombstone:
            # tombstone=True → 해당 레코드 삭제 (DeepAgents RemoveMessage 대응)
            state_by_id.pop(record.record_id, None)
        else:
            # upsert: 동일 ID면 최신 결과로 덮어씀
            state_by_id[record.record_id] = record

    # 타임스탬프 기준 정렬 유지
    return sorted(state_by_id.values(), key=lambda r: r.timestamp)


# ---------------------------------------------------------------------------
# 3. Persistent Memory Store — DeepAgents pluggable backends 패턴 대응
#    원본 개념: libs/deepagents/deepagents/backends/
#    구현: 로컬 JSON 파일 기반 (외부 DB 의존성 제로)
# ---------------------------------------------------------------------------

class MinerMemoryStore:
    """마이너 실행 이력 영속 저장소.

    DeepAgents의 pluggable store backends 개념을 단순화하여
    로컬 JSON 파일 기반으로 구현. 외부 Redis/DB 의존성 없음.

    크로스세션 동작:
      - 프로세스 재시작 후에도 이전 실행 이력 로드
      - task_input_hash 기반으로 동일 태스크 캐시 히트

    Why JSON (not SQLite/Redis):
      - 의존성 제로 — 어떤 환경에서도 즉시 동작
      - 마이너 실행 이력은 수천 건 이하이므로 JSON이 충분히 빠름
      - 추후 Redis 백엔드로 교체 시 이 클래스만 수정하면 됨 (SRP)
    """

    def __init__(self, store_path: Optional[str] = None) -> None:
        """
        Args:
            store_path: JSON 저장 파일 경로. None이면 환경변수
                        SURFCLAW_MEMORY_PATH 또는 기본 경로 사용.
        """
        if store_path is None:
            store_path = os.environ.get(
                "SURFCLAW_MEMORY_PATH",
                str(Path(__file__).parent.parent / "scratch" / "miner_memory.json"),
            )
        self._path = Path(store_path)
        self._path.parent.mkdir(parents=True, exist_ok=True)
        self._state: List[ExecutionRecord] = self._load()

    # ------------------------------------------------------------------
    # Public API
    # ------------------------------------------------------------------

    def upsert(self, record: ExecutionRecord) -> None:
        """실행 레코드를 저장소에 upsert (기존 ID이면 덮어씀)."""
        self._state = _execution_delta_reducer(self._state, [record])
        self._flush()

    def remove(self, record_id: str) -> None:
        """특정 레코드를 tombstone 방식으로 삭제."""
        tombstone = ExecutionRecord(
            record_id=record_id,
            task_input_hash="__tombstone__",
            agent_name="__tombstone__",
            tombstone=True,
        )
        self._state = _execution_delta_reducer(self._state, [tombstone])
        self._flush()

    def lookup_by_task(self, task_input_hash: str) -> Optional[ExecutionRecord]:
        """동일 task_input_hash의 최근 성공 실행 결과를 반환.

        캐시 히트 시 마이너가 재실행 없이 즉시 응답 가능.
        단, 24시간 이상 오래된 캐시는 무효 처리 (스테일 데이터 방지).
        """
        MAX_CACHE_AGE_SECONDS = 86_400  # 24h — 스테일 캐시 TTL

        now = time.time()
        candidates = [
            r for r in reversed(self._state)  # 최신 우선
            if r.task_input_hash == task_input_hash
            and r.success
            and not r.tombstone
            and (now - r.timestamp) < MAX_CACHE_AGE_SECONDS
        ]
        return candidates[0] if candidates else None

    def get_recent(self, n: int = 20) -> List[ExecutionRecord]:
        """최근 n개 실행 이력 반환 (Validator 이상 탐지용)."""
        return list(reversed(self._state))[:n]

    def clear_all(self) -> None:
        """전체 상태 초기화 (DeepAgents REMOVE_ALL_MESSAGES 대응)."""
        self._state = []
        self._flush()

    def stats(self) -> Dict[str, Any]:
        """저장소 통계 (NaN/Infinity 안전 처리 포함)."""
        total = len(self._state)
        successes = sum(1 for r in self._state if r.success)
        # NaN 방지: total이 0이면 success_rate는 0.0으로 안전 리셋
        success_rate = (successes / total) if total > 0 else 0.0
        avg_time = (
            sum(r.execution_time for r in self._state) / total
            if total > 0 else 0.0
        )
        return {
            "total_records": total,
            "success_count": successes,
            "success_rate": round(success_rate, 4),
            "avg_execution_time_sec": round(avg_time, 4),
            "store_path": str(self._path),
        }

    # ------------------------------------------------------------------
    # Internal
    # ------------------------------------------------------------------

    def _load(self) -> List[ExecutionRecord]:
        """JSON 파일에서 상태 로드. 파일 없거나 손상 시 빈 리스트 반환."""
        if not self._path.exists():
            return []
        try:
            raw = json.loads(self._path.read_text(encoding="utf-8"))
            return [ExecutionRecord.from_dict(item) for item in raw]
        except (json.JSONDecodeError, KeyError, TypeError) as exc:
            # Crash-Early: 손상된 캐시는 경고 후 빈 상태로 리셋
            import logging
            logging.getLogger(__name__).warning(
                "MinerMemoryStore: 손상된 캐시 파일 감지 (%s). 빈 상태로 초기화: %s",
                self._path, exc,
            )
            return []

    def _flush(self) -> None:
        """현재 상태를 JSON 파일에 원자적으로 저장.

        임시 파일에 먼저 쓴 후 rename으로 교체 → 파일 손상 방지 (멱등성 보장).
        """
        tmp_path = self._path.with_suffix(".tmp")
        try:
            data = [r.to_dict() for r in self._state]
            tmp_path.write_text(json.dumps(data, ensure_ascii=False, indent=2), encoding="utf-8")
            tmp_path.replace(self._path)  # 원자적 교체
        except OSError as exc:
            import logging
            logging.getLogger(__name__).error(
                "MinerMemoryStore: 캐시 플러시 실패: %s", exc
            )


# ---------------------------------------------------------------------------
# 4. 태스크 해시 유틸 (캐시 키 생성)
# ---------------------------------------------------------------------------

def compute_task_hash(task_input: str, agent_name: str) -> str:
    """task_input + agent_name 조합의 SHA256 해시를 반환.

    Why include agent_name:
      동일한 task_input이라도 다른 에이전트면 다른 실행 결과이므로
      agent_name을 함께 해싱하여 캐시 충돌 방지.
    """
    import hashlib
    payload = f"{agent_name}::{task_input}"
    return hashlib.sha256(payload.encode("utf-8")).hexdigest()


# ---------------------------------------------------------------------------
# 5. 모듈 셀프 테스트 (python -m template.memory 로 실행 가능)
# ---------------------------------------------------------------------------

if __name__ == "__main__":
    import tempfile
    import logging
    logging.basicConfig(level=logging.INFO)

    print("=== MinerMemoryStore 셀프 테스트 (DeepAgents 패턴 검증) ===\n")

    with tempfile.TemporaryDirectory() as tmpdir:
        store = MinerMemoryStore(store_path=f"{tmpdir}/test_memory.json")

        # 1. 기본 upsert
        h1 = compute_task_hash("분석해줘", "surfclaw-agent")
        r1 = ExecutionRecord(
            task_input_hash=h1,
            agent_name="surfclaw-agent",
            response_output="분석 결과 A",
            execution_time=1.23,
            success=True,
        )
        store.upsert(r1)
        print(f"[1] upsert 완료: {r1.record_id[:8]}...")

        # 2. 동일 hash 캐시 히트
        hit = store.lookup_by_task(h1)
        assert hit is not None, "캐시 히트 실패!"
        assert hit.response_output == "분석 결과 A"
        print(f"[2] 캐시 히트 ✅: {hit.response_output}")

        # 3. ID dedup — 동일 record_id로 덮어쓰기
        r1_updated = r1.model_copy(update={"response_output": "분석 결과 A (갱신)", "execution_time": 0.5})
        store.upsert(r1_updated)
        assert len(store._state) == 1, "dedup 실패: 중복 레코드 생성됨!"
        print(f"[3] ID dedup ✅: 레코드 수={len(store._state)}")

        # 4. tombstone 삭제
        store.remove(r1.record_id)
        assert store.lookup_by_task(h1) is None, "tombstone 삭제 실패!"
        print(f"[4] tombstone 삭제 ✅")

        # 5. 통계 (NaN 안전 확인)
        stats = store.stats()
        assert stats["success_rate"] == 0.0  # 빈 상태
        print(f"[5] 통계 NaN 안전 ✅: {stats}")

        # 6. clear_all
        store.upsert(r1)
        store.clear_all()
        assert len(store._state) == 0
        print(f"[6] clear_all ✅")

    print("\n✅ 모든 셀프 테스트 통과! DeepAgents 패턴 Surfclaw 이식 완료.")
