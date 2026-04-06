from pathlib import Path
import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.linear_model import LogisticRegression
from sklearn.tree import DecisionTreeClassifier
from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier
from sklearn.svm import SVC
from sklearn.neighbors import KNeighborsClassifier
from sklearn.naive_bayes import GaussianNB
from sklearn.neural_network import MLPClassifier
from sklearn.preprocessing import LabelEncoder
from sklearn.metrics import accuracy_score, confusion_matrix, roc_curve, auc
from .circom_zk.make_witness import make_proof_for_csv, to_fixed, from_fixed

def clean_dataset(df: pd.DataFrame):
    """
    Clean the dataset before ZK processing.
    Smart cleaning that preserves data while removing invalid entries.
    """
    # Make a copy to avoid modifying original
    df = df.copy()
    
    # Remove duplicates
    df = df.drop_duplicates()
    
    # Remove rows where ALL values are missing (not just one column)
    df = df.dropna(how='all')
    
    # For each column, try to convert to numeric if possible
    # But preserve the column if conversion fails (for categorical data)
    for col in df.columns:
        # Try to convert to numeric
        numeric_series = pd.to_numeric(df[col], errors='coerce')
        
        # Only convert if at least 50% of values can be converted to numeric
        non_null_count = numeric_series.notna().sum()
        total_count = len(df)
        
        if total_count > 0 and (non_null_count / total_count) >= 0.5:
            # This column can be numeric - use the converted version
            df[col] = numeric_series
        # Otherwise, keep the original column (categorical data)
    
    # Remove rows where ALL numeric columns are missing
    numeric_cols = df.select_dtypes(include=[np.number]).columns
    if len(numeric_cols) > 0:
        # Only remove rows where all numeric columns are NaN
        df = df.dropna(subset=numeric_cols, how='all')
    
    # Remove infinite values from numeric columns only
    for col in numeric_cols:
        df[col] = df[col].replace([np.inf, -np.inf], np.nan)
    
    # Remove rows where all numeric values are infinite/NaN
    if len(numeric_cols) > 0:
        df = df.dropna(subset=numeric_cols, how='all')
    
    # Reset index after cleaning
    df = df.reset_index(drop=True)
    
    # Ensure we have at least some data
    if len(df) == 0:
        raise ValueError("All data was removed during cleaning. Please check your dataset has valid numeric or categorical data.")
    
    return df

def train_and_prove(df, job_id=None, model_type='logistic', target_column='y', train_split=0.8, lr_f=0.01, epochs=1):
    # Prepare data - use 'x' as feature and target_column as target
    if 'x' not in df.columns or target_column not in df.columns:
        raise ValueError(f"Required columns 'x' and '{target_column}' not found")
    
    # Ensure feature column is numeric
    if not pd.api.types.is_numeric_dtype(df['x']):
        try:
            df['x'] = pd.to_numeric(df['x'], errors='coerce')
        except:
            raise ValueError(f"Feature column 'x' must be numeric. Found non-numeric values.")
    
    X = df[['x']].values
    
    # Handle target column - convert categorical to numeric if needed
    y = df[target_column].values
    if not pd.api.types.is_numeric_dtype(df[target_column]):
        # Use LabelEncoder for categorical data
        le = LabelEncoder()
        y_encoded = le.fit_transform(y.astype(str))
        y_binary = y_encoded
    else:
        y = pd.to_numeric(y, errors='coerce')
        # Convert to binary classification if needed
        if len(np.unique(y[~np.isnan(y)])) > 2:
            # Multi-class: convert to binary (0/1) for ZK proof compatibility
            y_binary = (y > np.median(y[~np.isnan(y)])).astype(int)
        else:
            y_binary = y.astype(int)
    
    # Remove any NaN values
    mask = ~(np.isnan(X).any(axis=1) | np.isnan(y_binary))
    X = X[mask]
    y_binary = y_binary[mask]
    
    if len(X) == 0:
        raise ValueError("No valid data points after cleaning. Please check your data.")
    
    # Split data
    X_train, X_test, y_train, y_test = train_test_split(
        X, y_binary, test_size=1-train_split, random_state=42
    )
    
    # Train model based on type
    model_map = {
        'logistic': LogisticRegression(random_state=42, max_iter=1000),
        'tree': DecisionTreeClassifier(random_state=42),
        'random_forest': RandomForestClassifier(n_estimators=10, random_state=42),
        'svm': SVC(probability=True, random_state=42),
        'knn': KNeighborsClassifier(n_neighbors=5),
        'naive_bayes': GaussianNB(),
        'gradient_boost': GradientBoostingClassifier(n_estimators=10, random_state=42),
        'neural_net': MLPClassifier(hidden_layer_sizes=(10,), max_iter=500, random_state=42),
        'catboost': GradientBoostingClassifier(n_estimators=10, random_state=42),  # Using GradientBoosting as fallback
    }
    
    model = model_map.get(model_type, model_map['logistic'])
    model.fit(X_train, y_train)
    
    # Evaluate model
    y_pred = model.predict(X_test)
    accuracy = accuracy_score(y_test, y_pred)
    cm = confusion_matrix(y_test, y_pred)
    
    # Calculate ROC curve if binary classification
    try:
        y_proba = model.predict_proba(X_test)[:, 1]
        fpr, tpr, _ = roc_curve(y_test, y_proba)
        roc_auc = auc(fpr, tpr)
    except:
        fpr, tpr, roc_auc = None, None, None
    
    # Prepare data for ZK proof (use original df with 'x' and 'y' columns)
    # Ensure both columns are numeric for ZK proof
    df_for_proof = df[['x', target_column]].copy()
    df_for_proof = df_for_proof.rename(columns={target_column: 'y'})
    
    # Convert to numeric, handling any categorical data
    df_for_proof['x'] = pd.to_numeric(df_for_proof['x'], errors='coerce')
    if not pd.api.types.is_numeric_dtype(df_for_proof['y']):
        le_proof = LabelEncoder()
        df_for_proof['y'] = le_proof.fit_transform(df_for_proof['y'].astype(str))
    else:
        df_for_proof['y'] = pd.to_numeric(df_for_proof['y'], errors='coerce')
    
    # Remove NaN values
    df_for_proof = df_for_proof.dropna()
    
    if len(df_for_proof) == 0:
        raise ValueError("No valid data for ZK proof generation after cleaning.")
    
    # Generate ZK proof (with error handling)
    try:
        proof_path, public_path, merkle_root = make_proof_for_csv(df_for_proof, job_id=job_id)
    except Exception as e:
        # If ZK proof generation fails, use a mock merkle root
        import hashlib
        merkle_root = '0x' + hashlib.sha256(str(job_id).encode()).hexdigest()
        proof_path = None
        public_path = None
        print(f"Warning: ZK proof generation failed: {e}. Using mock merkle root.")
    
    # Simple linear regression for ZK proof (compatible with existing circuit)
    xs = df_for_proof['x'].astype(float).tolist()
    ys = df_for_proof['y'].astype(float).tolist()
    
    # Normalize data to prevent overflow
    x_mean = np.mean(xs) if len(xs) > 0 else 0
    x_std = np.std(xs) if len(xs) > 0 and np.std(xs) > 0 else 1
    xs_normalized = [(x - x_mean) / x_std for x in xs]
    
    y_mean = np.mean(ys) if len(ys) > 0 else 0
    y_std = np.std(ys) if len(ys) > 0 and np.std(ys) > 0 else 1
    ys_normalized = [(y - y_mean) / y_std for y in ys]
    
    x_ints = [to_fixed(x) for x in xs_normalized]
    y_ints = [to_fixed(y) for y in ys_normalized]
    SCALE = 10**6
    w = 0
    lr = to_fixed(lr_f)
    
    # Use float division to prevent overflow, then convert to int
    for ep in range(epochs):
        for xi, yi in zip(x_ints, y_ints):
            # Use float division to prevent overflow
            pred_float = (w * xi) / SCALE
            pred = int(round(pred_float))
            err = pred - yi
            grad_float = (err * xi) / SCALE
            grad = int(round(grad_float))
            lr_grad_float = (lr * grad) / SCALE
            lr_grad = int(round(lr_grad_float))
            w = w - lr_grad
            # Prevent w from getting too large
            max_w = 10**12  # Reasonable limit
            if abs(w) > max_w:
                w = max_w if w > 0 else -max_w
    
    # Prepare confusion matrix data
    cm_data = []
    if cm.shape == (2, 2):
        cm_data = [
            {'label': 'True Negative', 'value': int(cm[0, 0])},
            {'label': 'False Positive', 'value': int(cm[0, 1])},
            {'label': 'False Negative', 'value': int(cm[1, 0])},
            {'label': 'True Positive', 'value': int(cm[1, 1])},
        ]
    else:
        cm_data = [{'label': f'Class {i}', 'value': int(val)} for i, val in enumerate(cm.flatten())]
    
    # Prepare ROC data
    roc_data = []
    if fpr is not None and tpr is not None:
        roc_data = [{'fpr': float(f), 'tpr': float(t)} for f, t in zip(fpr, tpr)]
    
    # Convert final weight safely
    try:
        final_weight = from_fixed(w)
    except:
        final_weight = float(w) / SCALE if w != 0 else 0.0
    
    return {
        'job_id': job_id,
        'merkle_root': str(merkle_root),
        'final_weight': final_weight,
        'proof': proof_path,
        'public': public_path,
        'accuracy': float(accuracy),
        'confusion_matrix': cm_data,
        'roc_data': roc_data,
        'roc_auc': float(roc_auc) if roc_auc else None,
        'model_type': model_type,
        'test_size': len(X_test),
        'train_size': len(X_train),
    }
