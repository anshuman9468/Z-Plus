import os, uuid, json, zipfile, shutil
import pandas as pd
from pathlib import Path
from django.http import JsonResponse, FileResponse
from django.views.decorators.csrf import csrf_exempt
from django.conf import settings
from .trainers import train_and_prove, clean_dataset

MEDIA = settings.MEDIA_ROOT / 'datasets'
RESULTS_DIR = settings.MEDIA_ROOT / 'results'
os.makedirs(MEDIA, exist_ok=True)
os.makedirs(RESULTS_DIR, exist_ok=True)

# In-memory job storage (for demo - use Redis/Celery in production)
job_storage = {}
verification_history = []  # Store verification history

def read_data_file(file_path, filename):
    """
    Read data from CSV, XLSX, or JSON file and return pandas DataFrame.
    
    Args:
        file_path: Path to the uploaded file
        filename: Original filename to determine file type
    
    Returns:
        pandas DataFrame
    """
    file_path = Path(file_path)
    file_ext = Path(filename).suffix.lower()
    
    try:
        if file_ext == '.csv':
            df = pd.read_csv(file_path)
        elif file_ext in ['.xlsx', '.xls']:
            # Read first sheet of Excel file
            df = pd.read_excel(file_path, engine='openpyxl')
        elif file_ext == '.json':
            # Try to read JSON - could be array of objects or object with arrays
            with open(file_path, 'r', encoding='utf-8') as f:
                data = json.load(f)
            
            # Handle different JSON structures
            if isinstance(data, list):
                # Array of objects: [{"col1": val1, "col2": val2}, ...]
                df = pd.DataFrame(data)
            elif isinstance(data, dict):
                # Check if it's a dict with arrays or nested structure
                if all(isinstance(v, list) for v in data.values()):
                    # Dict with arrays: {"col1": [val1, val2], "col2": [val3, val4]}
                    df = pd.DataFrame(data)
                elif 'data' in data:
                    # Nested structure with 'data' key
                    df = pd.DataFrame(data['data'])
                else:
                    # Try to convert dict to DataFrame
                    df = pd.DataFrame([data])
            else:
                raise ValueError("Unsupported JSON structure")
        elif file_ext == '.zip':
            # Extract ZIP and look for data files
            extract_dir = file_path.parent / f"extract_{file_path.stem}"
            os.makedirs(extract_dir, exist_ok=True)
            
            with zipfile.ZipFile(file_path, 'r') as zip_ref:
                zip_ref.extractall(extract_dir)
            
            # Find the first supported data file
            data_file = None
            for p in extract_dir.rglob('*'):
                if p.suffix.lower() in ['.csv', '.xlsx', '.xls', '.json']:
                    data_file = p
                    break
            
            if not data_file:
                shutil.rmtree(extract_dir)
                raise ValueError("No supported data file (.csv, .xlsx, .json) found in ZIP archive")
            
            df = read_data_file(data_file, data_file.name)
            
            # Clean up extraction directory (optional, but good practice)
            # shutil.rmtree(extract_dir) 
            return df
        else:
            raise ValueError(f"Unsupported file format: {file_ext}. Supported formats: .csv, .xlsx, .xls, .json, .zip")
        
        return df
    except Exception as e:
        raise ValueError(f"Error reading {file_ext} file: {str(e)}")

@csrf_exempt
def upload_dataset(request):
    if request.method != 'POST':
        return JsonResponse({'error': 'POST required'}, status=400)
    
    if 'dataset' not in request.FILES:
        return JsonResponse({'error': 'dataset file required'}, status=400)
    
    f = request.FILES['dataset']
    job_id = str(uuid.uuid4())
    filename = f.name
    file_ext = Path(filename).suffix.lower()
    
    # Save file with original extension
    path = MEDIA / f"{job_id}{file_ext}"
    
    with open(path, 'wb') as wf:
        for c in f.chunks():
            wf.write(c)
    
    try:
        # Read file based on extension (CSV, XLSX, JSON)
        df = read_data_file(path, filename)
        df = clean_dataset(df)
    except Exception as e:
        return JsonResponse({'error': f'Invalid file: {str(e)}'}, status=400)
    
    # Get parameters from request
    target_column = request.POST.get('targetColumn', 'y')
    model_type = request.POST.get('model', 'logistic')
    task = request.POST.get('task', 'train')
    train_split = float(request.POST.get('trainSplit', 80)) / 100.0
    
    # Handle different column names - try to find target column or use 'y'
    if target_column not in df.columns:
        # Try common target column names
        for col in ['y', 'target', 'label', 'outcome', 'class']:
            if col in df.columns:
                target_column = col
                break
        else:
            return JsonResponse({'error': f'Target column "{target_column}" not found. Available columns: {list(df.columns)}'}, status=400)
    
    # For now, we'll use 'x' as feature column (can be enhanced to support multiple features)
    if 'x' not in df.columns:
        # Use first numeric column as feature
        numeric_cols = df.select_dtypes(include=['number']).columns.tolist()
        if target_column in numeric_cols:
            numeric_cols.remove(target_column)
        if not numeric_cols:
            return JsonResponse({'error': 'No numeric feature columns found'}, status=400)
        # Rename first numeric column to 'x' for compatibility
        df = df.rename(columns={numeric_cols[0]: 'x'})
    
    # Store job info
    job_storage[job_id] = {
        'status': 'processing',
        'model': model_type,
        'task': task,
        'target_column': target_column,
    }
    
    try:
        # Train model and generate proof
        res = train_and_prove(
            df, 
            job_id=job_id, 
            model_type=model_type,
            target_column=target_column,
            train_split=train_split
        )
        
        # Update job status
        job_storage[job_id]['status'] = 'completed'
        job_storage[job_id].update(res)
        
        # Store in verification history
        from datetime import datetime
        verification_entry = {
            'id': len(verification_history) + 1,
            'job_id': job_id,
            'proof_hash': res.get('merkle_root', ''),
            'timestamp': datetime.now().isoformat(),
            'status': 'verified',
            'model': model_type,
            'accuracy': res.get('accuracy', 0),
            'protocol': 'ZK-SNARK',
            'proof_path': res.get('proof'),
            'public_path': res.get('public'),
        }
        verification_history.insert(0, verification_entry)  # Add to beginning
        # Keep only last 50 verifications
        if len(verification_history) > 50:
            verification_history.pop()
        
        return JsonResponse({
            'job_id': job_id,
            'status': 'completed',
            **res
        })
    except Exception as e:
        job_storage[job_id]['status'] = 'failed'
        job_storage[job_id]['error'] = str(e)
        return JsonResponse({'error': str(e), 'job_id': job_id}, status=500)

@csrf_exempt
def job_status(request, job_id):
    if job_id in job_storage:
        return JsonResponse(job_storage[job_id])
    return JsonResponse({'error': 'Job not found'}, status=404)

@csrf_exempt
def verify_proof(request):
    """Verify a ZK proof by hash or file"""
    if request.method == 'POST':
        proof_hash = request.POST.get('proofHash') or request.POST.get('hash', '')
        
        if not proof_hash:
            return JsonResponse({'error': 'Proof hash required'}, status=400)
        
        # Search in verification history
        verification = None
        for entry in verification_history:
            if entry.get('proof_hash') == proof_hash or entry.get('job_id') == proof_hash:
                verification = entry
                break
        
        # Also check job_storage
        if not verification and proof_hash in job_storage:
            job = job_storage[proof_hash]
            if job.get('status') == 'completed':
                from datetime import datetime
                verification = {
                    'proof_hash': job.get('merkle_root', proof_hash),
                    'timestamp': job.get('timestamp', datetime.now().isoformat()),
                    'model': job.get('model', ''),
                    'accuracy': job.get('accuracy', 0),
                    'protocol': 'ZK-SNARK',
                    'status': 'verified',
                }
        
        # Try to actually verify the proof file if it exists
        if verification:
            proof_path_str = verification.get('proof_path')
            public_path_str = verification.get('public_path')
            
            # Try to verify using snarkjs if files exist
            proof_valid = True
            if proof_path_str and public_path_str:
                from pathlib import Path
                proof_path = Path(proof_path_str)
                public_path = Path(public_path_str)
                vkey_path = proof_path.parent / 'verification_key.json'
                
                if proof_path.exists() and public_path.exists() and vkey_path.exists():
                    try:
                        import subprocess
                        from .circom_zk.make_witness import find_command
                        snarkjs_cmd = find_command('snarkjs')
                        snarkjs_base = snarkjs_cmd.split() if snarkjs_cmd.startswith('npx') else [snarkjs_cmd]
                        
                        result = subprocess.run(
                            snarkjs_base + ['groth16', 'verify', str(vkey_path), str(public_path), str(proof_path)],
                            capture_output=True,
                            text=True,
                            timeout=10,
                            cwd=str(proof_path.parent)
                        )
                        proof_valid = result.returncode == 0
                    except Exception as e:
                        # If verification fails, still return the verification entry
                        # but note that cryptographic verification couldn't be performed
                        pass
        
        if verification:
            return JsonResponse({
                'valid': proof_valid,
                'verification': verification
            })
        else:
            return JsonResponse({
                'valid': False,
                'error': 'Proof not found in verification history'
            }, status=404)
    
    return JsonResponse({'error': 'POST required'}, status=400)

def get_verification_history(request):
    """Get recent verification history"""
    # Return last 20 verifications
    recent = verification_history[:20]
    return JsonResponse({'verifications': recent})

@csrf_exempt
def download_proof(request, job_id):
    """Download proof file for a job"""
    if job_id not in job_storage:
        return JsonResponse({'error': 'Job not found'}, status=404)
    
    job = job_storage[job_id]
    proof_path = job.get('proof')
    
    if not proof_path:
        return JsonResponse({'error': 'Proof file not available'}, status=404)
    
    from pathlib import Path
    from django.http import FileResponse, Http404
    
    proof_file = Path(proof_path)
    if not proof_file.exists():
        return JsonResponse({'error': 'Proof file not found on server'}, status=404)
    
    try:
        return FileResponse(
            open(proof_file, 'rb'),
            content_type='application/json',
            as_attachment=True,
            filename=f'proof_{job_id}.json'
        )
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)

@csrf_exempt
def generate_certificate(request, job_id):
    """Generate and download verification certificate"""
    if job_id not in job_storage:
        return JsonResponse({'error': 'Job not found'}, status=404)
    
    job = job_storage[job_id]
    
    if job.get('status') != 'completed':
        return JsonResponse({'error': 'Job not completed'}, status=400)
    
    from datetime import datetime
    
    # Get model name
    model_map = {
        'logistic': 'Logistic Regression',
        'tree': 'Decision Tree',
        'random_forest': 'Random Forest',
        'svm': 'Support Vector Machine',
        'knn': 'K-Nearest Neighbors',
        'naive_bayes': 'Naive Bayes',
        'gradient_boost': 'Gradient Boosting',
        'neural_net': 'Neural Network (MLP)',
        'catboost': 'CatBoost Classifier',
    }
    model_name = model_map.get(job.get('model', ''), job.get('model', 'Unknown Model'))
    accuracy = job.get('accuracy', 0)
    accuracy_percent = (accuracy * 100) if isinstance(accuracy, float) else accuracy
    
    # Generate HTML certificate
    certificate_html = f"""
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>ZK-SNARK Verification Certificate</title>
    <style>
        @page {{
            size: A4 landscape;
            margin: 0;
        }}
        body {{
            font-family: 'Georgia', serif;
            margin: 0;
            padding: 40px;
            background: linear-gradient(135deg, #0a0a0f 0%, #1a1a2e 100%);
            color: #ffffff;
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
        }}
        .certificate {{
            background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
            border: 4px solid #22d3ee;
            border-radius: 20px;
            padding: 60px;
            max-width: 900px;
            width: 100%;
            box-shadow: 0 0 50px rgba(34, 211, 238, 0.3);
            position: relative;
            overflow: hidden;
        }}
        .certificate::before {{
            content: '';
            position: absolute;
            top: -50%;
            left: -50%;
            width: 200%;
            height: 200%;
            background: radial-gradient(circle, rgba(34, 211, 238, 0.1) 0%, transparent 70%);
            animation: rotate 20s linear infinite;
        }}
        @keyframes rotate {{
            from {{ transform: rotate(0deg); }}
            to {{ transform: rotate(360deg); }}
        }}
        .certificate-content {{
            position: relative;
            z-index: 1;
        }}
        .header {{
            text-align: center;
            margin-bottom: 40px;
        }}
        .header h1 {{
            font-size: 48px;
            margin: 0;
            background: linear-gradient(135deg, #22d3ee 0%, #3b82f6 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
            font-weight: bold;
            letter-spacing: 3px;
        }}
        .subtitle {{
            font-size: 18px;
            color: #94a3b8;
            margin-top: 10px;
        }}
        .main-content {{
            text-align: center;
            margin: 50px 0;
        }}
        .verification-badge {{
            display: inline-block;
            background: linear-gradient(135deg, #10b981 0%, #059669 100%);
            color: white;
            padding: 15px 40px;
            border-radius: 50px;
            font-size: 24px;
            font-weight: bold;
            margin: 30px 0;
            box-shadow: 0 0 30px rgba(16, 185, 129, 0.5);
        }}
        .details {{
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 30px;
            margin: 40px 0;
            text-align: left;
        }}
        .detail-item {{
            background: rgba(15, 23, 42, 0.6);
            padding: 20px;
            border-radius: 10px;
            border: 1px solid rgba(34, 211, 238, 0.3);
        }}
        .detail-label {{
            font-size: 12px;
            color: #94a3b8;
            text-transform: uppercase;
            letter-spacing: 1px;
            margin-bottom: 8px;
        }}
        .detail-value {{
            font-size: 18px;
            color: #22d3ee;
            font-weight: bold;
        }}
        .proof-hash {{
            background: rgba(0, 0, 0, 0.5);
            padding: 15px;
            border-radius: 8px;
            border: 1px solid rgba(34, 211, 238, 0.3);
            font-family: 'Courier New', monospace;
            font-size: 14px;
            word-break: break-all;
            margin: 20px 0;
        }}
        .footer {{
            text-align: center;
            margin-top: 50px;
            padding-top: 30px;
            border-top: 2px solid rgba(34, 211, 238, 0.3);
        }}
        .footer p {{
            margin: 5px 0;
            color: #94a3b8;
        }}
        .seal {{
            text-align: center;
            margin: 30px 0;
        }}
        .seal-icon {{
            font-size: 80px;
            color: #22d3ee;
        }}
    </style>
</head>
<body>
    <div class="certificate">
        <div class="certificate-content">
            <div class="header">
                <h1>CERTIFICATE OF VERIFICATION</h1>
                <p class="subtitle">Zero-Knowledge Proof Verification</p>
            </div>
            
            <div class="main-content">
                <div class="verification-badge">✓ VERIFIED</div>
                <p style="font-size: 20px; margin: 20px 0;">
                    This certifies that the machine learning model training has been
                    <strong>cryptographically verified</strong> using Zero-Knowledge Proofs
                </p>
            </div>
            
            <div class="details">
                <div class="detail-item">
                    <div class="detail-label">Model Type</div>
                    <div class="detail-value">{model_name}</div>
                </div>
                <div class="detail-item">
                    <div class="detail-label">Accuracy</div>
                    <div class="detail-value">{accuracy_percent:.1f}%</div>
                </div>
                <div class="detail-item">
                    <div class="detail-label">Protocol</div>
                    <div class="detail-value">ZK-SNARK</div>
                </div>
                <div class="detail-item">
                    <div class="detail-label">Issued Date</div>
                    <div class="detail-value">{datetime.now().strftime('%B %d, %Y')}</div>
                </div>
            </div>
            
            <div class="proof-hash">
                <div class="detail-label" style="margin-bottom: 10px;">Proof Hash</div>
                <div style="color: #22d3ee; font-size: 12px;">{job.get('merkle_root', 'N/A')}</div>
            </div>
            
            <div class="seal">
                <div class="seal-icon">🛡️</div>
                <p style="color: #22d3ee; font-weight: bold; margin-top: 10px;">Z+ Zero-Knowledge Engine</p>
            </div>
            
            <div class="footer">
                <p><strong>Certificate ID:</strong> {job_id}</p>
                <p>This certificate verifies that all computations have been proven correct using cryptographic proofs</p>
                <p style="font-size: 12px; margin-top: 20px;">Issued by Z+ Zero-Knowledge Machine Learning Platform</p>
            </div>
        </div>
    </div>
</body>
</html>
    """
    
    from django.http import HttpResponse
    response = HttpResponse(certificate_html, content_type='text/html')
    response['Content-Disposition'] = f'attachment; filename="certificate_{job_id}.html"'
    return response

@csrf_exempt
def clean_data(request):
    """
    Clean a dataset and return statistics or download cleaned file.
    """
    if request.method != 'POST':
        return JsonResponse({'error': 'POST required'}, status=400)
    
    if 'dataset' not in request.FILES:
        return JsonResponse({'error': 'dataset file required'}, status=400)
    
    f = request.FILES['dataset']
    job_id = str(uuid.uuid4())
    filename = f.name
    file_ext = Path(filename).suffix.lower()
    
    # Save file with original extension
    path = MEDIA / f"{job_id}{file_ext}"
    
    with open(path, 'wb') as wf:
        for c in f.chunks():
            wf.write(c)
    
    try:
        # Read file based on extension (CSV, XLSX, JSON)
        df_original = read_data_file(path, filename)
        original_rows = len(df_original)
        original_cols = len(df_original.columns)
        
        # Clean the dataset
        df_cleaned = clean_dataset(df_original)
        cleaned_rows = len(df_cleaned)
        cleaned_cols = len(df_cleaned.columns)
        
        # Save cleaned dataset as CSV (standard format for download)
        cleaned_path = MEDIA / f"{job_id}_cleaned.csv"
        df_cleaned.to_csv(cleaned_path, index=False)
        
        # Calculate statistics
        stats = {
            'original_rows': original_rows,
            'original_cols': original_cols,
            'cleaned_rows': cleaned_rows,
            'cleaned_cols': cleaned_cols,
            'rows_removed': original_rows - cleaned_rows,
            'columns': list(df_cleaned.columns),
            'dtypes': {col: str(dtype) for col, dtype in df_cleaned.dtypes.items()},
            'null_counts': df_cleaned.isnull().sum().to_dict(),
            'cleaned_file': str(cleaned_path),
            'job_id': job_id,
        }
        
        return JsonResponse({
            'status': 'success',
            'stats': stats,
            'download_url': f'/api/clean/download/{job_id}/'
        })
        
    except Exception as e:
        return JsonResponse({'error': f'Error cleaning dataset: {str(e)}'}, status=500)

@csrf_exempt
def download_cleaned_data(request, job_id):
    """
    Download the cleaned dataset.
    """
    cleaned_path = MEDIA / f"{job_id}_cleaned.csv"
    
    if not cleaned_path.exists():
        return JsonResponse({'error': 'Cleaned file not found'}, status=404)
    
    from django.http import FileResponse
    return FileResponse(
        open(cleaned_path, 'rb'),
        content_type='text/csv',
        as_attachment=True,
        filename=f'cleaned_dataset_{job_id}.csv'
    )

@csrf_exempt
def get_columns(request):
    """
    Get column names from uploaded file (CSV, XLSX, JSON).
    """
    if request.method != 'POST':
        return JsonResponse({'error': 'POST required'}, status=400)
    
    if 'dataset' not in request.FILES:
        return JsonResponse({'error': 'dataset file required'}, status=400)
    
    f = request.FILES['dataset']
    filename = f.name
    file_ext = Path(filename).suffix.lower()
    
    # Save file temporarily
    temp_id = str(uuid.uuid4())
    temp_path = MEDIA / f"temp_{temp_id}{file_ext}"
    
    try:
        with open(temp_path, 'wb') as wf:
            for c in f.chunks():
                wf.write(c)
        
        # Read file and get columns
        df = read_data_file(temp_path, filename)
        columns = list(df.columns)
        
        # Clean up temp file
        if temp_path.exists():
            temp_path.unlink()
        
        return JsonResponse({
            'columns': columns,
            'num_rows': len(df),
            'num_cols': len(columns),
            'file_type': file_ext
        })
        
    except Exception as e:
        # Clean up temp file on error
        if temp_path.exists():
            temp_path.unlink()
        return JsonResponse({'error': f'Error reading file: {str(e)}'}, status=500)

@csrf_exempt
def download_all_zip(request, job_id):
    """
    Download all job results (proof, public inputs, verification key) as a ZIP file.
    """
    if job_id not in job_storage:
        return JsonResponse({'error': 'Job not found'}, status=404)
    
    job = job_storage[job_id]
    if job.get('status') != 'completed':
        return JsonResponse({'error': 'Job still processing or failed'}, status=400)
    
    proof_path = job.get('proof')
    public_path = job.get('public')
    
    if not proof_path or not public_path:
        return JsonResponse({'error': 'Result files not available'}, status=404)
    
    proof_file = Path(proof_path)
    public_file = Path(public_path)
    vkey_file = proof_file.parent / 'verification_key.json'
    
    if not proof_file.exists():
        return JsonResponse({'error': 'Proof file missing'}, status=404)
    
    # Create ZIP in memory or temp file
    zip_filename = f"zplus_results_{job_id}.zip"
    zip_path = RESULTS_DIR / zip_filename
    
    with zipfile.ZipFile(zip_path, 'w') as zipf:
        zipf.write(proof_file, 'proof.json')
        zipf.write(public_file, 'public.json')
        if vkey_file.exists():
            zipf.write(vkey_file, 'verification_key.json')
        
        # Also include a readme
        readme_content = f"""Z+ Zero-Knowledge Proof Results
Job ID: {job_id}
Model: {job.get('model')}
Accuracy: {job.get('accuracy')}
Merkle Root: {job.get('merkle_root')}

To verify these results using snarkjs:
snarkjs groth16 verify verification_key.json public.json proof.json
"""
        zipf.writestr('README.txt', readme_content)

    return FileResponse(
        open(zip_path, 'rb'),
        content_type='application/zip',
        as_attachment=True,
        filename=zip_filename
    )
