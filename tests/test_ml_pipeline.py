from __future__ import annotations

import io
from pathlib import Path
import sys

ROOT_DIR = Path(__file__).resolve().parent.parent
if str(ROOT_DIR) not in sys.path:
    sys.path.insert(0, str(ROOT_DIR))

import pandas as pd
import pytest

from backend.ml_pipeline import DatasetValidationError, train_model


DATA_DIR = ROOT_DIR / "data"


def test_sample_binary_metrics():
    csv_path = DATA_DIR / "sample_binary.csv"
    csv_bytes = csv_path.read_bytes()

    result = train_model(
        csv_bytes=csv_bytes,
        target_column="target",
        model_type="logistic_regression",
        run_id="test-run",
    )

    metrics = result.metrics
    for key in ("accuracy", "precision", "recall", "f1"):
        assert key in metrics
        assert 0.0 <= metrics[key] <= 1.0

    assert isinstance(result.warnings, list)


def test_missing_target_column():
    df = pd.DataFrame({"feature": [1, 2, 3], "other": [4, 5, 6]})
    csv_bytes = df.to_csv(index=False).encode("utf-8")

    with pytest.raises(ValueError):
        train_model(
            csv_bytes=csv_bytes,
            target_column="target",
            model_type="decision_tree",
            run_id="missing-target",
        )


def test_no_usable_features():
    df = pd.DataFrame(
        {
            "constant": ["A"] * 20,
            "target": [0, 1] * 10,
        }
    )
    csv_bytes = df.to_csv(index=False).encode("utf-8")

    with pytest.raises(DatasetValidationError, match="No usable features found"):
        train_model(
            csv_bytes=csv_bytes,
            target_column="target",
            model_type="logistic_regression",
            run_id="no-features",
        )


def test_small_dataset_warning():
    df = pd.DataFrame(
        {
            "feature": list(range(8)),
            "target": [0, 1] * 4,
        }
    )
    csv_bytes = df.to_csv(index=False).encode("utf-8")

    result = train_model(
        csv_bytes=csv_bytes,
        target_column="target",
        model_type="decision_tree",
        run_id="small-dataset",
    )

    assert any(
        "Dataset too small after cleaning" in warning for warning in result.warnings
    ), "Expected warning about dataset size."

