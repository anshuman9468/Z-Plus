from __future__ import annotations

import io
import json
import logging
from dataclasses import dataclass
from typing import Any, Dict, List, Literal, Optional, Tuple

import numpy as np
import pandas as pd
from joblib import dump
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import accuracy_score, f1_score, precision_score, recall_score
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder
from sklearn.tree import DecisionTreeClassifier


ModelType = Literal["logistic_regression", "decision_tree"]

logger = logging.getLogger("zplus.ml")


@dataclass(frozen=True)
class MLTrainingResult:
    run_id: str
    model_type: ModelType
    model: Any
    model_summary: str
    metrics: Dict[str, float]
    sample_predictions: List[Any]
    data_hash: str
    warnings: List[str]


class DatasetValidationError(ValueError):
    """Raised when the provided dataset is invalid for training."""


def _load_dataset(csv_bytes: bytes) -> pd.DataFrame:
    try:
        dataframe = pd.read_csv(io.BytesIO(csv_bytes))
    except Exception as exc:  # pragma: no cover - pandas error
        raise DatasetValidationError("Unable to parse CSV data.") from exc

    if dataframe.empty:
        raise DatasetValidationError("Dataset is empty.")

    dataframe.columns = dataframe.columns.str.strip()

    logger.debug("Loaded CSV with shape: %s x %s", *dataframe.shape)
    logger.debug("Columns: %s", dataframe.columns.tolist())

    return dataframe


def _prepare_features(
    dataframe: pd.DataFrame,
    target_column: str,
    warnings_list: List[str],
) -> Tuple[pd.DataFrame, np.ndarray, Optional[LabelEncoder], pd.DataFrame]:
    if target_column not in dataframe.columns:
        raise DatasetValidationError("Target column not found")

    cleaned = dataframe.dropna(axis=0, how="any")
    logger.debug("After dropna: shape: %s x %s", *cleaned.shape)

    if cleaned.empty:
        raise DatasetValidationError("Dataset is empty after removing rows with missing values.")

    if len(cleaned) < 10:
        warnings_list.append("Dataset too small after cleaning; metrics may be unreliable.")

    y_series = cleaned[target_column]
    X = cleaned.drop(columns=[target_column])

    target_counts = y_series.value_counts().to_dict()
    logger.debug("Target column: '%s' unique counts: %s", target_column, target_counts)

    encoded = pd.get_dummies(X, drop_first=True)

    zero_var_columns = [col for col in encoded.columns if encoded[col].nunique() <= 1]
    if zero_var_columns:
        encoded = encoded.drop(columns=zero_var_columns)
        warnings_list.append("Categorical columns encoded; some dropped due to rarity.")

    if encoded.empty:
        raise DatasetValidationError("No usable features found")

    label_encoder: Optional[LabelEncoder] = None
    if not np.issubdtype(y_series.dtype, np.number):
        label_encoder = LabelEncoder()
        y = label_encoder.fit_transform(y_series.astype(str))
    else:
        y = y_series.to_numpy()

    if len(np.unique(y)) < 2:
        raise DatasetValidationError("Target column must contain at least two distinct classes.")

    logger.debug("Feature matrix X shape: %s", encoded.shape)
    logger.info(
        "Feature preparation: X_shape=%s, n_features=%d, target_classes=%d",
        encoded.shape,
        encoded.shape[1],
        len(np.unique(y)),
    )

    return encoded, y, label_encoder, cleaned


def _canonicalize_dataset(dataframe: pd.DataFrame) -> bytes:
    sorted_columns = sorted(dataframe.columns)
    canonical = dataframe.reindex(sorted_columns, axis=1)
    buffer = io.StringIO()
    canonical.to_csv(buffer, index=False, lineterminator="\n")
    return buffer.getvalue().encode("utf-8")


def _hash_bytes(data: bytes) -> str:
    import hashlib

    return hashlib.sha256(data).hexdigest()


def _serialised_model_hash(model: Any) -> str:
    buffer = io.BytesIO()
    dump(model, buffer)
    return _hash_bytes(buffer.getvalue())


def _build_model_summary(model_type: ModelType, model: Any) -> str:
    params_json = json.dumps(model.get_params(), sort_keys=True, default=str)
    model_hash = _serialised_model_hash(model)
    return f"{model_type}|params={params_json}|weights_hash={model_hash}"


def train_model(
    csv_bytes: bytes,
    target_column: str,
    model_type: ModelType,
    run_id: str,
) -> MLTrainingResult:
    dataframe = _load_dataset(csv_bytes)

    warnings_list: List[str] = []
    X_matrix, y, label_encoder, cleaned_dataframe = _prepare_features(
        dataframe, target_column, warnings_list
    )

    try:
        X_train, X_test, y_train, y_test = train_test_split(
            X_matrix,
            y,
            test_size=0.25,
            random_state=42,
            shuffle=True,
            stratify=y,
        )
    except ValueError:
        X_train, X_test, y_train, y_test = train_test_split(
            X_matrix, y, test_size=0.25, random_state=42, shuffle=True
        )

    logger.debug(
        "Train/test split: X_train=%s, X_test=%s",
        X_train.shape,
        X_test.shape,
    )

    if model_type == "logistic_regression":
        model = LogisticRegression(max_iter=1000, random_state=42)
    elif model_type == "decision_tree":
        model = DecisionTreeClassifier(random_state=42)
    else:  # pragma: no cover - guarded by Literal typing
        raise DatasetValidationError(f"Unsupported model type: {model_type}")

    model.fit(X_train, y_train)
    logger.debug("Model type: %s, model fitted: %s", model_type, True)

    y_pred = model.predict(X_test)

    if len(np.unique(y_test)) < 2:
        warnings_list.append("Only one class present in test set; metrics may be unreliable.")

    average = "binary" if len(np.unique(y)) == 2 else "weighted"
    assert len(y_pred) == len(y_test)

    metrics = {
        "accuracy": float(accuracy_score(y_test, y_pred)),
        "precision": float(precision_score(y_test, y_pred, average=average, zero_division=0)),
        "recall": float(recall_score(y_test, y_pred, average=average, zero_division=0)),
        "f1": float(f1_score(y_test, y_pred, average=average, zero_division=0)),
    }

    sample_predictions_raw = y_pred[:10].tolist()

    if label_encoder is not None:
        sample_predictions = label_encoder.inverse_transform(sample_predictions_raw).tolist()
    else:
        sample_predictions = sample_predictions_raw

    sample_true_pred = list(zip(y_test[:5].tolist(), y_pred[:5].tolist()))
    logger.debug("Sample true vs pred on test: %s", sample_true_pred)
    logger.info(
        "Computed metrics: accuracy=%.6f, precision=%.6f, recall=%.6f, f1=%.6f",
        metrics["accuracy"],
        metrics["precision"],
        metrics["recall"],
        metrics["f1"],
    )
    logger.debug(
        "Full metrics: accuracy=%s, precision=%s, recall=%s, f1=%s",
        metrics["accuracy"],
        metrics["precision"],
        metrics["recall"],
        metrics["f1"],
    )

    canonical_bytes = _canonicalize_dataset(cleaned_dataframe)
    data_hash = _hash_bytes(canonical_bytes)
    model_summary = _build_model_summary(model_type, model)

    return MLTrainingResult(
        run_id=run_id,
        model_type=model_type,
        model=model,
        model_summary=model_summary,
        metrics=metrics,
        sample_predictions=sample_predictions,
        data_hash=data_hash,
        warnings=warnings_list,
    )


