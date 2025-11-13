from __future__ import annotations

import json
import logging
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Dict, List, Optional
from uuid import uuid4

from fastapi import FastAPI, File, Form, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel, Field

from .ml_pipeline import DatasetValidationError, MLTrainingResult, ModelType, train_model
from .proof import Proof, generate_proof, verify_proof
from .store import ProofStore, RunRecord, STORE_PATH, get_store

BACKEND_DIR = Path(__file__).resolve().parent
FRONTEND_DIST = BACKEND_DIR / "frontend_dist"
store: ProofStore = get_store()

# Configure logging
logging.basicConfig(
    level=logging.DEBUG,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
)

app = FastAPI(title="PrivAI Backend", version="0.1.0")

allowed_origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class RunJobResponse(BaseModel):
    run_id: str
    metrics: Dict[str, float]
    sample_predictions: List[Any]
    warnings: List[str]
    proof: Proof
    proof_download_url: str


class VerifyProofRequest(BaseModel):
    run_id: str
    proof_hash: str
    nonce: str
    timestamp: str
    model_summary: str
    data_hash: str
    notes: Optional[str] = None


class VerifyProofResponse(BaseModel):
    valid: bool
    recomputed_hash: str


@app.on_event("startup")
def ensure_store_file() -> None:
    if not STORE_PATH.exists():
        STORE_PATH.write_text("{}", encoding="utf-8")


@app.post("/api/run-job", response_model=RunJobResponse)
async def run_job(
    dataset: UploadFile = File(...),
    task: str = Form(...),
    model_type: ModelType = Form(...),
    target_column: str = Form(...),
    run_name: Optional[str] = Form(default=None),
) -> RunJobResponse:
    if task != "train":
        raise HTTPException(status_code=400, detail="Only 'train' task is supported.")

    dataset_bytes = await dataset.read()
    run_id = str(uuid4())
    
    logger = logging.getLogger("zplus.api")
    logger.info(
        "Processing run_job: run_id=%s, model_type=%s, target_column=%s, dataset_size=%d bytes",
        run_id,
        model_type,
        target_column,
        len(dataset_bytes),
    )

    try:
        result: MLTrainingResult = train_model(
            csv_bytes=dataset_bytes,
            target_column=target_column,
            model_type=model_type,
            run_id=run_id,
        )
        logger.info(
            "Training completed: run_id=%s, accuracy=%.4f, precision=%.4f, recall=%.4f, f1=%.4f, warnings=%d",
            run_id,
            result.metrics["accuracy"],
            result.metrics["precision"],
            result.metrics["recall"],
            result.metrics["f1"],
            len(result.warnings),
        )
    except DatasetValidationError as exc:
        logger.error("Training failed: run_id=%s, error=%s", run_id, str(exc))
        raise HTTPException(status_code=400, detail=str(exc)) from exc

    proof = generate_proof(
        run_id=run_id,
        model_summary=result.model_summary,
        data_hash=result.data_hash,
    )

    created_at = datetime.now(timezone.utc).isoformat()
    record = RunRecord(
        run_id=run_id,
        run_name=run_name,
        proof=proof,
        metrics=result.metrics,
        sample_predictions=result.sample_predictions,
        created_at=created_at,
        warnings=result.warnings,
    )

    store.add_run(record)

    return RunJobResponse(
        run_id=run_id,
        metrics=result.metrics,
        sample_predictions=result.sample_predictions,
        warnings=result.warnings,
        proof=proof,
        proof_download_url=f"/api/proof/{run_id}/download",
    )


@app.post("/api/verify-proof", response_model=VerifyProofResponse)
async def verify_proof_endpoint(payload: VerifyProofRequest) -> VerifyProofResponse:
    valid, recomputed_hash = verify_proof(payload.dict(exclude_unset=True))
    return VerifyProofResponse(valid=valid, recomputed_hash=recomputed_hash)


@app.get("/api/proof/{run_id}")
async def get_proof(run_id: str) -> Dict[str, Any]:
    record = store.get_run(run_id)
    if not record:
        available_runs = [item.run_id for item in store.list_runs()]
        raise HTTPException(
            status_code=404,
            detail={
                "message": "Proof not found.",
                "run_id": run_id,
                "available_run_ids": available_runs,
            },
        )
    return record.to_dict()


@app.get("/api/proof/{run_id}/download")
async def download_proof(run_id: str) -> FileResponse:
    record = store.get_run(run_id)
    if not record:
        available_runs = [item.run_id for item in store.list_runs()]
        raise HTTPException(
            status_code=404,
            detail={
                "message": "Proof not found.",
                "run_id": run_id,
                "available_run_ids": available_runs,
            },
        )

    tmp_path = BACKEND_DIR / f"{run_id}_proof.json"
    tmp_path.write_text(json.dumps(record.proof.dict(), indent=2), encoding="utf-8")

    response = FileResponse(
        tmp_path,
        media_type="application/json",
        filename=f"{run_id}_proof.json",
    )

    def cleanup() -> None:  # pragma: no cover - cleanup best effort
        try:
            if tmp_path.exists():
                tmp_path.unlink()
        except OSError:
            pass

    response.call_on_close(cleanup)
    return response


@app.get("/api/proofs")
async def list_proofs() -> List[Dict[str, Any]]:
    records = store.list_runs()
    return [
        {
            "run_id": record.run_id,
            "run_name": record.run_name,
            "proof_hash": record.proof.proof_hash,
            "timestamp": record.proof.timestamp,
        }
        for record in records
    ]


@app.get("/api/health")
async def health_check() -> Dict[str, str]:
    return {"status": "ok"}


@app.get("/api/debug/latest-run")
async def get_latest_run_debug() -> Dict[str, Any]:
    """Debug endpoint to inspect the latest training run."""
    records = store.list_runs()
    if not records:
        return {"message": "No runs found"}
    
    latest = records[0]
    return {
        "run_id": latest.run_id,
        "run_name": latest.run_name,
        "metrics": latest.metrics,
        "warnings": latest.warnings,
        "data_hash": latest.proof.data_hash,
        "created_at": latest.created_at,
        "sample_predictions": latest.sample_predictions[:5],  # First 5 only
    }


if FRONTEND_DIST.exists():
    app.mount("/", StaticFiles(directory=FRONTEND_DIST, html=True), name="frontend")


