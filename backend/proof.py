from __future__ import annotations

import hashlib
import json
import secrets
from datetime import datetime, timezone
from typing import Any, Dict, Tuple

from pydantic import BaseModel, Field, validator


class Proof(BaseModel):
    run_id: str
    proof_hash: str
    nonce: str
    timestamp: str
    model_summary: str
    data_hash: str
    notes: str = Field(default="Simulated ZKP. Production = real zkML.")

    @validator("nonce")
    def validate_nonce(cls, value: str) -> str:
        if len(value) != 32:
            raise ValueError("Nonce must be a 16-byte hexadecimal string.")
        return value


def _encode_for_hash(values: Tuple[str, ...]) -> bytes:
    concatenated = "".join(values)
    return concatenated.encode("utf-8")


def compute_proof_hash(model_summary: str, data_hash: str, nonce: str, timestamp: str) -> str:
    payload = _encode_for_hash((model_summary, data_hash, nonce, timestamp))
    return hashlib.sha256(payload).hexdigest()


def generate_proof(
    run_id: str,
    model_summary: str,
    data_hash: str,
    *,
    nonce: str | None = None,
    timestamp: str | None = None,
) -> Proof:
    proof_nonce = nonce or secrets.token_hex(16)
    proof_timestamp = timestamp or datetime.now(timezone.utc).isoformat()
    proof_hash = compute_proof_hash(model_summary, data_hash, proof_nonce, proof_timestamp)

    return Proof(
        run_id=run_id,
        proof_hash=proof_hash,
        nonce=proof_nonce,
        timestamp=proof_timestamp,
        model_summary=model_summary,
        data_hash=data_hash,
    )


def verify_proof(proof_payload: Dict[str, Any]) -> Tuple[bool, str]:
    proof = Proof(**proof_payload)
    recomputed = compute_proof_hash(
        proof.model_summary, proof.data_hash, proof.nonce, proof.timestamp
    )
    return proof.proof_hash == recomputed, recomputed


def proof_to_json(proof: Proof) -> str:
    return json.dumps(proof.dict(), indent=2)


