"""
Surfclaw Persistent Memory Module
==================================
Core patterns extracted from deepagents (langchain-ai/deepagents):
  - _messages_delta_reducer: ID-based deduplication + tombstone reset
  - pluggable state backends: Cross-session check-pointing
Implemented in pure Python & Pydantic without heavy LangChain dependencies.

Why this design:
  - If a miner executes the same task_input, it returns immediately from cache -> zero latency.
  - Allows validators to trace anomalies (cheating/plagiarism) based on execution history.
  - Keeps state across process restarts, ensuring subnet score continuity.

License context:
  - DeepAgents: MIT License (langchain-ai/deepagents)
  - This file borrows concepts only and is implemented from scratch (contains no LangChain code).
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
# 1. Execution Record Schema (Corresponds to AnyMessage in deepagents)
# ---------------------------------------------------------------------------

class ExecutionRecord(BaseModel):
    """Single miner execution result record.

    Redefines AnyMessage from deepagents for the Surfclaw domain.
    Requires record_id for ID-based deduplication. Re-writing with the same
    ID overwrites the record with the latest result (upsert, not tombstone).
    """

    record_id: str = Field(
        default_factory=lambda: str(uuid.uuid4()),
        description="Unique execution record ID. Upserts if rewritten with same ID.",
    )
    task_input_hash: str = Field(
        ...,
        description="SHA256(task_input) — cache key for identical tasks.",
    )
    agent_name: str = Field(..., description="Name of the executed agent.")
    response_output: Optional[str] = Field(None, description="Miner output result.")
    execution_time: float = Field(0.0, description="Execution time in seconds.")
    memory_usage: float = Field(0.0, description="Peak memory usage in bytes.")
    success: bool = Field(False, description="Whether execution was successful.")
    timestamp: float = Field(default_factory=time.time, description="Unix timestamp.")
    tombstone: bool = Field(
        False,
        description="If True, marks record as deleted. Matches deepagents RemoveMessage pattern.",
    )

    def to_dict(self) -> Dict[str, Any]:
        return self.model_dump()

    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> "ExecutionRecord":
        return cls(**data)


# ---------------------------------------------------------------------------
# 2. Delta Reducer — Pure implementation of deepagents _messages_delta_reducer
#    Original: libs/deepagents/deepagents/_messages_reducer.py
#    Core: ID dedup + tombstone deletion + batch reduce
# ---------------------------------------------------------------------------

def _execution_delta_reducer(
    state: List[ExecutionRecord] | None,
    writes: List[ExecutionRecord],
) -> List[ExecutionRecord]:
    """ID-based upsert/tombstone batch reducer.

    Extracted from deepagents `_messages_delta_reducer`:
      - Same record_id -> overwrites with latest (upsert)
      - tombstone=True -> deletes the record
      - state=None -> resets to initial empty list

    Why not use add_messages style:
      We prioritize ID integrity and deduplication over strict sequencing.
      A dict-based upsert is more suitable than LangGraph's list dedup.
    """
    if state is None:
        state = []

    # Convert state to dict for O(1) lookup
    state_by_id: Dict[str, ExecutionRecord] = {r.record_id: r for r in state}

    for record in writes:
        if record.tombstone:
            # tombstone=True -> delete the record
            state_by_id.pop(record.record_id, None)
        else:
            # upsert -> overwrite with latest record
            state_by_id[record.record_id] = record

    # Keep sorted by timestamp
    return sorted(state_by_id.values(), key=lambda r: r.timestamp)


# ---------------------------------------------------------------------------
# 3. Persistent Memory Store — Matches deepagents pluggable backends pattern
#    Original Concept: libs/deepagents/deepagents/backends/
#    Implementation: Local JSON-based store (zero external DB dependency)
# ---------------------------------------------------------------------------

class MinerMemoryStore:
    """Persistent storage for miner execution history.

    Simplifies deepagents' pluggable store backends by utilizing
    a local JSON file. No external Redis/DB dependencies required.

    Cross-session behavior:
      - Loads previous execution records on process restart.
      - Resolves cache hits via task_input_hash.

    Why JSON (instead of SQLite/Redis):
      - Zero dependencies — works out-of-the-box in any environment.
      - Fast enough for typical miner history sizes (< 10k records).
      - Easily swappable with a Redis backend in the future (SRP).
    """

    def __init__(self, store_path: Optional[str] = None) -> None:
        """
        Args:
            store_path: Path to target JSON file. If None, uses SURFCLAW_MEMORY_PATH
                        or defaults to the scratch directory.
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
        """Upserts an execution record into the store."""
        self._state = _execution_delta_reducer(self._state, [record])
        self._flush()

    def remove(self, record_id: str) -> None:
        """Removes a record using the tombstone pattern."""
        tombstone = ExecutionRecord(
            record_id=record_id,
            task_input_hash="__tombstone__",
            agent_name="__tombstone__",
            tombstone=True,
        )
        self._state = _execution_delta_reducer(self._state, [tombstone])
        self._flush()

    def lookup_by_task(self, task_input_hash: str) -> Optional[ExecutionRecord]:
        """Returns the most recent successful execution for a given task hash.

        Allows immediate response on cache hit without re-running the miner.
        Invalidates cache records older than 24 hours to prevent stale data.
        """
        MAX_CACHE_AGE_SECONDS = 86_400  # 24h cache TTL

        now = time.time()
        candidates = [
            r for r in reversed(self._state)  # Recent first
            if r.task_input_hash == task_input_hash
            and r.success
            and not r.tombstone
            and (now - r.timestamp) < MAX_CACHE_AGE_SECONDS
        ]
        return candidates[0] if candidates else None

    def get_recent(self, n: int = 20) -> List[ExecutionRecord]:
        """Returns the last n execution records (for validator audit/checks)."""
        return list(reversed(self._state))[:n]

    def clear_all(self) -> None:
        """Clears all records in the store (Matches deepagents REMOVE_ALL_MESSAGES)."""
        self._state = []
        self._flush()

    def stats(self) -> Dict[str, Any]:
        """Returns store telemetry statistics with safety guardrails."""
        total = len(self._state)
        successes = sum(1 for r in self._state if r.success)
        # NaN defense: safety fallback to 0.0 if total is 0
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
        """Loads state from the JSON file. Returns empty list if missing/corrupt."""
        if not self._path.exists():
            return []
        try:
            raw = json.loads(self._path.read_text(encoding="utf-8"))
            return [ExecutionRecord.from_dict(item) for item in raw]
        except (json.JSONDecodeError, KeyError, TypeError) as exc:
            # Crash-Early: reset corrupted file and log warning
            import logging
            logging.getLogger(__name__).warning(
                "MinerMemoryStore: Corrupted cache detected (%s). Resetting: %s",
                self._path, exc,
            )
            return []

    def _flush(self) -> None:
        """Atomically saves state to the JSON file using a temp file."""
        tmp_path = self._path.with_suffix(".tmp")
        try:
            data = [r.to_dict() for r in self._state]
            tmp_path.write_text(json.dumps(data, ensure_ascii=False, indent=2), encoding="utf-8")
            tmp_path.replace(self._path)  # Atomic rename swap
        except OSError as exc:
            import logging
            logging.getLogger(__name__).error(
                "MinerMemoryStore: Flush failed: %s", exc
            )


# ---------------------------------------------------------------------------
# 4. Task Hash Utility
# ---------------------------------------------------------------------------

def compute_task_hash(task_input: str, agent_name: str) -> str:
    """Returns SHA256 of combined agent_name and task_input.

    Why include agent_name:
      Different agents might produce different outputs for the same task.
      Including the agent name prevents cross-agent cache collisions.
    """
    import hashlib
    payload = f"{agent_name}::{task_input}"
    return hashlib.sha256(payload.encode("utf-8")).hexdigest()


# ---------------------------------------------------------------------------
# 5. Module Self Test
# ---------------------------------------------------------------------------

if __name__ == "__main__":
    import tempfile
    import logging
    logging.basicConfig(level=logging.INFO)

    print("=== MinerMemoryStore Self Test (Validating deepagents pattern) ===\n")

    with tempfile.TemporaryDirectory() as tmpdir:
        store = MinerMemoryStore(store_path=f"{tmpdir}/test_memory.json")

        # 1. Basic upsert
        h1 = compute_task_hash("analyze_this", "surfclaw-agent")
        r1 = ExecutionRecord(
            task_input_hash=h1,
            agent_name="surfclaw-agent",
            response_output="analysis result A",
            execution_time=1.23,
            success=True,
        )
        store.upsert(r1)
        print(f"[1] Upsert complete: {r1.record_id[:8]}...")

        # 2. Cache hit for same task hash
        hit = store.lookup_by_task(h1)
        assert hit is not None, "Cache lookup failed!"
        assert hit.response_output == "analysis result A"
        print(f"[2] Cache hit verified ✅: {hit.response_output}")

        # 3. ID dedup — upserting with same record_id overwrites
        r1_updated = r1.model_copy(update={"response_output": "analysis result A (updated)", "execution_time": 0.5})
        store.upsert(r1_updated)
        assert len(store._state) == 1, "Dedup failed! Duplicate record created."
        print(f"[3] ID dedup verified ✅: Record count={len(store._state)}")

        # 4. Tombstone removal
        store.remove(r1.record_id)
        assert store.lookup_by_task(h1) is None, "Tombstone removal failed!"
        print(f"[4] Tombstone removal verified ✅")

        # 5. Telemetry stats (NaN safety audit)
        stats = store.stats()
        assert stats["success_rate"] == 0.0  # Should be empty
        print(f"[5] Stats NaN-safety verified ✅: {stats}")

        # 6. clear_all
        store.upsert(r1)
        store.clear_all()
        assert len(store._state) == 0
        print(f"[6] clear_all verified ✅")

    print("\n✅ All tests passed! deepagents patterns successfully integrated into Surfclaw.")
