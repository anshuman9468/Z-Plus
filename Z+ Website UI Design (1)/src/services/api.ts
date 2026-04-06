// Use relative URL when served from Django, or proxy in dev mode
const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

export interface TrainingRequest {
  file: File;
  targetColumn: string;
  task: 'train' | 'inference';
  model: string;
  trainSplit: number;
}

export interface TrainingResponse {
  job_id: string;
  status: string;
  merkle_root?: string;
  final_weight?: number;
  proof?: string;
  public?: string;
  accuracy?: number;
  confusion_matrix?: Array<{ label: string; value: number }>;
  roc_data?: Array<{ fpr: number; tpr: number }>;
  roc_auc?: number;
  model_type?: string;
  test_size?: number;
  train_size?: number;
  error?: string;
}

export interface JobStatus {
  status: string;
  job_id?: string;
  model?: string;
  task?: string;
  target_column?: string;
  accuracy?: number;
  confusion_matrix?: Array<{ label: string; value: number }>;
  roc_data?: Array<{ fpr: number; tpr: number }>;
  roc_auc?: number;
  error?: string;
}

export async function uploadDataset(request: TrainingRequest): Promise<TrainingResponse> {
  const formData = new FormData();
  formData.append('dataset', request.file);
  formData.append('targetColumn', request.targetColumn);
  formData.append('task', request.task);
  formData.append('model', request.model);
  formData.append('trainSplit', request.trainSplit.toString());

  const response = await fetch(`${API_BASE_URL}/upload/`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to upload dataset');
  }

  return response.json();
}

export async function getJobStatus(jobId: string): Promise<JobStatus> {
  const response = await fetch(`${API_BASE_URL}/status/${jobId}/`);

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to get job status');
  }

  return response.json();
}

export async function downloadFile(url: string): Promise<Blob> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error('Failed to download file');
  }
  return response.blob();
}

export interface VerificationRequest {
  proofHash: string;
}

export interface VerificationResponse {
  valid: boolean;
  verification?: {
    proof_hash: string;
    timestamp: string;
    model: string;
    accuracy: number;
    protocol: string;
    status: string;
  };
  error?: string;
}

export interface VerificationHistoryItem {
  id: number;
  job_id: string;
  proof_hash: string;
  timestamp: string;
  status: string;
  model: string;
  accuracy: number;
  protocol: string;
}

export async function verifyProof(request: VerificationRequest): Promise<VerificationResponse> {
  const formData = new FormData();
  formData.append('proofHash', request.proofHash);

  const response = await fetch(`${API_BASE_URL}/verify/`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json();
    return { valid: false, error: error.error || 'Verification failed' };
  }

  return response.json();
}

export async function getVerificationHistory(): Promise<VerificationHistoryItem[]> {
  const response = await fetch(`${API_BASE_URL}/verifications/`);

  if (!response.ok) {
    throw new Error('Failed to get verification history');
  }

  const data = await response.json();
  return data.verifications || [];
}

export async function downloadProofFile(jobId: string): Promise<Blob> {
  const response = await fetch(`${API_BASE_URL}/proof/${jobId}/`);

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to download proof file');
  }

  return response.blob();
}

export async function generateCertificate(jobId: string): Promise<Blob> {
  const response = await fetch(`${API_BASE_URL}/certificate/${jobId}/`);

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Failed to generate certificate' }));
    throw new Error(error.error || 'Failed to generate certificate');
  }

  return response.blob();
}

export interface CleanDataResponse {
  status: string;
  stats: {
    original_rows: number;
    original_cols: number;
    cleaned_rows: number;
    cleaned_cols: number;
    rows_removed: number;
    columns: string[];
    dtypes: Record<string, string>;
    null_counts: Record<string, number>;
    cleaned_file: string;
    job_id: string;
  };
  download_url: string;
  error?: string;
}

export async function cleanData(file: File): Promise<CleanDataResponse> {
  const formData = new FormData();
  formData.append('dataset', file);

  const response = await fetch(`${API_BASE_URL}/clean/`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to clean dataset');
  }

  return response.json();
}

export async function downloadCleanedData(jobId: string): Promise<Blob> {
  const response = await fetch(`${API_BASE_URL}/clean/download/${jobId}/`);

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to download cleaned dataset');
  }

  return response.blob();
}

export interface FileColumnsResponse {
  columns: string[];
  num_rows: number;
  num_cols: number;
  file_type: string;
  error?: string;
}

export async function getFileColumns(file: File): Promise<FileColumnsResponse> {
  const formData = new FormData();
  formData.append('dataset', file);

  const response = await fetch(`${API_BASE_URL}/columns/`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to get file columns');
  }

  return response.json();
}

export async function downloadAllResults(jobId: string): Promise<Blob> {
  const response = await fetch(`${API_BASE_URL}/download-all/${jobId}/`);

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Failed to download results ZIP' }));
    throw new Error(error.error || 'Failed to download results ZIP');
  }

  return response.blob();
}

