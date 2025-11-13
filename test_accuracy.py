#!/usr/bin/env python3
"""Quick test script to verify different CSVs produce different accuracies."""

import requests
import sys
from pathlib import Path

BASE_URL = "http://127.0.0.1:8000"

def test_csv(csv_path: Path, target_column: str, model_type: str = "logistic_regression"):
    """Test a CSV file and return the metrics."""
    print(f"\n{'='*60}")
    print(f"Testing: {csv_path.name}")
    print(f"Target column: {target_column}, Model: {model_type}")
    print(f"{'='*60}")
    
    if not csv_path.exists():
        print(f"ERROR: File not found: {csv_path}")
        return None
    
    with open(csv_path, "rb") as f:
        files = {"dataset": (csv_path.name, f, "text/csv")}
        data = {
            "task": "train",
            "model_type": model_type,
            "target_column": target_column,
        }
        
        try:
            response = requests.post(f"{BASE_URL}/api/run-job", files=files, data=data, timeout=30)
            response.raise_for_status()
            result = response.json()
            
            metrics = result["metrics"]
            print(f"✓ Success!")
            print(f"  Accuracy:  {metrics['accuracy']:.6f}")
            print(f"  Precision: {metrics['precision']:.6f}")
            print(f"  Recall:    {metrics['recall']:.6f}")
            print(f"  F1:        {metrics['f1']:.6f}")
            print(f"  Warnings:  {len(result.get('warnings', []))}")
            if result.get('warnings'):
                for w in result['warnings']:
                    print(f"    - {w}")
            print(f"  Run ID:    {result['run_id']}")
            print(f"  Data Hash: {result['proof']['data_hash'][:16]}...")
            
            return metrics
        except requests.exceptions.RequestException as e:
            print(f"ERROR: {e}")
            if hasattr(e.response, 'text'):
                print(f"Response: {e.response.text}")
            return None

if __name__ == "__main__":
    data_dir = Path("data")
    sample_csv = data_dir / "sample_binary.csv"
    
    print("Testing Z+ Backend Accuracy Computation")
    print("=" * 60)
    
    # Test 1: Sample binary dataset
    if sample_csv.exists():
        metrics1 = test_csv(sample_csv, "target", "logistic_regression")
    else:
        print(f"\nWARNING: {sample_csv} not found. Skipping test 1.")
        metrics1 = None
    
    # Test 2: Create a simple different dataset
    import pandas as pd
    import numpy as np
    
    np.random.seed(123)  # Different seed = different data
    test_csv2 = data_dir / "test_different.csv"
    df2 = pd.DataFrame({
        "feature1": np.random.randn(100),
        "feature2": np.random.randn(100),
        "feature3": np.random.randn(100),
        "target": (np.random.rand(100) > 0.3).astype(int),  # Different distribution
    })
    df2.to_csv(test_csv2, index=False)
    
    metrics2 = test_csv(test_csv2, "target", "logistic_regression")
    
    # Test 3: Decision tree on same data (should give different results)
    if sample_csv.exists():
        metrics3 = test_csv(sample_csv, "target", "decision_tree")
    else:
        metrics3 = None
    
    # Summary
    print(f"\n{'='*60}")
    print("SUMMARY")
    print(f"{'='*60}")
    
    if metrics1 and metrics2:
        acc_diff = abs(metrics1['accuracy'] - metrics2['accuracy'])
        print(f"Accuracy difference between datasets: {acc_diff:.6f}")
        if acc_diff < 0.001:
            print("⚠️  WARNING: Accuracies are too similar! This might indicate a bug.")
        else:
            print("✓ Different datasets produce different accuracies (expected)")
    
    if metrics1 and metrics3:
        acc_diff = abs(metrics1['accuracy'] - metrics3['accuracy'])
        print(f"Accuracy difference (LR vs DT on same data): {acc_diff:.6f}")
        if acc_diff < 0.001:
            print("⚠️  WARNING: Same accuracy for different models!")
        else:
            print("✓ Different models produce different accuracies (expected)")
    
    print(f"\nCheck server logs for detailed DEBUG information!")
    print(f"Debug endpoint: {BASE_URL}/api/debug/latest-run")

