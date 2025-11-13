## Root Cause

- The original pipeline discarded all non-numeric features, causing severe information loss on mixed datasets and leading to unstable metrics.
- Metrics were sometimes computed on training data or on datasets that became too small after cleaning, inflating accuracy.
- Minimal validation meant missing target columns or degenerate feature sets produced unclear failures, and no structured warnings reached the frontend.
- Lack of detailed logging made it impossible to verify which data slice the model used or to diagnose accuracy regressions.

## Fix Summary

- Normalised column names, enforced target validation, and expanded preprocessing to include one-hot encoding for categorical features while removing zero-variance columns.
- Added deterministic `train_test_split` with shuffle + stratification and ensured metrics use only the test partition, now covering accuracy, precision, recall, and f1.
- Introduced structured warnings (dataset size, class imbalance, dropped categorical columns) that flow back through the API and are persisted in `store.json`.
- Implemented comprehensive DEBUG logging under the `zplus.ml` logger for dataset shape, feature engineering, split sizes, sample predictions, and final metrics.
- Preserved canonical hashing while tightening CSV serialisation and added a pytest suite plus sample dataset to guard against regressions.

## Before vs After

- **Before:** Inconsistent accuracy (often >0.95 regardless of dataset), silent failures when columns were mislabelled, and no visibility into preprocessing or class balance.
- **After:** Stable, reproducible metrics derived from the test split, actionable warnings echoed to the UI, and traceable logs showing every pipeline step.

## Verification

- `pytest` — covers correct metrics, missing-target validation, unusable feature detection, and dataset-size warnings.
- Manual run of `/api/run-job` with `data/sample_binary.csv` — logs include all required DEBUG messages and response metrics stay within expected bounds.
- Proof generation untouched and continues to pass verification.

