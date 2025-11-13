from __future__ import annotations

import json
from dataclasses import asdict, dataclass
from pathlib import Path
from threading import Lock
from typing import Any, Dict, List, Optional

from .proof import Proof

BACKEND_DIR = Path(__file__).resolve().parent
STORE_PATH = BACKEND_DIR / "store.json"


@dataclass
class RunRecord:
    run_id: str
    run_name: Optional[str]
    proof: Proof
    metrics: Dict[str, float]
    sample_predictions: List[Any]
    created_at: str
    warnings: List[str]

    def to_dict(self) -> Dict[str, Any]:
        serialised = asdict(self)
        serialised["proof"] = self.proof.dict()
        return serialised

    @classmethod
    def from_dict(cls, payload: Dict[str, Any]) -> "RunRecord":
        payload_copy = payload.copy()
        payload_copy["proof"] = Proof(**payload_copy["proof"])
        payload_copy.setdefault("warnings", [])
        return cls(**payload_copy)


class ProofStore:
    def __init__(self, store_path: Path = STORE_PATH) -> None:
        self._store_path = store_path
        self._lock = Lock()
        self._store: Dict[str, RunRecord] = {}
        self._load()

    def _load(self) -> None:
        if not self._store_path.exists():
            self._store_path.write_text("{}", encoding="utf-8")
            return

        with self._store_path.open("r", encoding="utf-8") as handle:
            content = handle.read().strip()
            if not content:
                self._store_path.write_text("{}", encoding="utf-8")
                return

            raw_store = json.loads(content)
            self._store = {
                run_id: RunRecord.from_dict(record) for run_id, record in raw_store.items()
            }

    def _persist(self) -> None:
        with self._store_path.open("w", encoding="utf-8") as handle:
            json.dump({rid: record.to_dict() for rid, record in self._store.items()}, handle, indent=2)

    def add_run(self, record: RunRecord) -> None:
        with self._lock:
            self._store[record.run_id] = record
            self._persist()

    def get_run(self, run_id: str) -> Optional[RunRecord]:
        return self._store.get(run_id)

    def list_runs(self) -> List[RunRecord]:
        return sorted(self._store.values(), key=lambda item: item.created_at, reverse=True)


def get_store() -> ProofStore:
    return ProofStore()


