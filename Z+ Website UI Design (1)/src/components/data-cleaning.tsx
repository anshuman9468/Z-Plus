import { useState, useRef } from 'react';
import { motion } from 'motion/react';
import { Sidebar } from './sidebar';
import { Upload, Download, FileText, CheckCircle, AlertCircle, Sparkles, Database } from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { cleanData, downloadCleanedData, CleanDataResponse } from '../services/api';
import { toast } from 'sonner';

type Page = 'landing' | 'dashboard' | 'progress' | 'results' | 'history' | 'insights' | 'verifier' | 'cleaning';

interface DataCleaningProps {
  onNavigate: (page: Page) => void;
}

export function DataCleaning({ onNavigate }: DataCleaningProps) {
  const [file, setFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [isCleaning, setIsCleaning] = useState(false);
  const [cleaningResult, setCleaningResult] = useState<CleanDataResponse | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const selectedFile = e.dataTransfer.files[0];
      const fileExt = selectedFile.name.toLowerCase().split('.').pop();
      if (['csv', 'xlsx', 'xls', 'json'].includes(fileExt)) {
        setFile(selectedFile);
        setCleaningResult(null);
      } else {
        toast.error('Please upload a CSV, XLSX, or JSON file');
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      const fileExt = selectedFile.name.toLowerCase().split('.').pop();
      if (['csv', 'xlsx', 'xls', 'json'].includes(fileExt)) {
        setFile(selectedFile);
        setCleaningResult(null);
      } else {
        toast.error('Please upload a CSV, XLSX, or JSON file');
      }
    }
  };

  const handleCleanData = async () => {
    if (!file) {
      toast.error('Please select a file first');
      return;
    }

    setIsCleaning(true);
    setCleaningResult(null);

    try {
      const result = await cleanData(file);
      setCleaningResult(result);
      toast.success('Dataset cleaned successfully!');
    } catch (error: any) {
      toast.error(error.message || 'Failed to clean dataset');
    } finally {
      setIsCleaning(false);
    }
  };

  const handleDownload = async () => {
    if (!cleaningResult) return;

    setIsDownloading(true);
    try {
      const blob = await downloadCleanedData(cleaningResult.stats.job_id);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `cleaned_dataset_${cleaningResult.stats.job_id}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success('Cleaned dataset downloaded!');
    } catch (error: any) {
      toast.error(error.message || 'Failed to download cleaned dataset');
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="flex min-h-screen">
      <Sidebar currentPage="cleaning" onNavigate={onNavigate} />
      
      <div className="flex-1 p-8 overflow-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-6xl mx-auto"
        >
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent mb-2">
              Data Cleaning
            </h1>
            <p className="text-gray-400">
              Clean your dataset by removing duplicates, missing values, and invalid data. Supports CSV, XLSX, and JSON files.
            </p>
          </div>

          {/* Upload Section */}
          <Card className="bg-gradient-to-br from-gray-900 to-gray-950 border-cyan-400/30 p-8 mb-6">
            <div className="flex items-center gap-3 mb-6">
              <Sparkles className="w-6 h-6 text-cyan-400" />
              <h2 className="text-2xl font-semibold text-white">Upload Dataset</h2>
            </div>

            <div
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-lg p-12 text-center transition-all ${
                dragActive
                  ? 'border-cyan-400 bg-cyan-400/10'
                  : 'border-gray-700 hover:border-cyan-400/50'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv,.xlsx,.xls,.json"
                onChange={handleFileChange}
                className="hidden"
              />
              
              {file ? (
                <div className="space-y-4">
                  <FileText className="w-16 h-16 text-cyan-400 mx-auto" />
                  <div>
                    <p className="text-lg font-semibold text-white">{file.name}</p>
                    <p className="text-sm text-gray-400 mt-1">
                      {(file.size / 1024).toFixed(2)} KB
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setFile(null);
                      setCleaningResult(null);
                      if (fileInputRef.current) fileInputRef.current.value = '';
                    }}
                    className="border-gray-600 text-gray-300 hover:bg-gray-800"
                  >
                    Remove File
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <Upload className="w-16 h-16 text-gray-500 mx-auto" />
                  <div>
                    <p className="text-lg font-semibold text-white mb-2">
                      Drag and drop your file here
                    </p>
                    <p className="text-sm text-gray-400 mb-2">Supports: CSV, XLSX, JSON</p>
                    <p className="text-sm text-gray-400 mb-4">or</p>
                    <Button
                      onClick={() => fileInputRef.current?.click()}
                      className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700"
                    >
                      <Upload className="mr-2 h-4 w-4" />
                      Browse Files
                    </Button>
                  </div>
                </div>
              )}
            </div>

            {file && (
              <div className="mt-6 flex justify-center">
                <Button
                  onClick={handleCleanData}
                  disabled={isCleaning}
                  className="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white px-8 py-6 text-lg"
                  size="lg"
                >
                  {isCleaning ? (
                    <>
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                        className="w-5 h-5 border-2 border-white border-t-transparent rounded-full mr-2"
                      />
                      Cleaning Dataset...
                    </>
                  ) : (
                    <>
                      <Sparkles className="mr-2 h-5 w-5" />
                      Clean Dataset
                    </>
                  )}
                </Button>
              </div>
            )}
          </Card>

          {/* Results Section */}
          {cleaningResult && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
            >
              <Card className="bg-gradient-to-br from-gray-900 to-gray-950 border-green-400/30 p-8">
                <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-6 h-6 text-green-400" />
                    <h2 className="text-2xl font-semibold text-white">Cleaning Complete</h2>
                  </div>
                  <div className="flex gap-3">
                    <Button
                      onClick={handleDownload}
                      disabled={isDownloading}
                      className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
                    >
                      {isDownloading ? (
                        <>
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                            className="w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"
                          />
                          Downloading...
                        </>
                      ) : (
                        <>
                          <Download className="mr-2 h-4 w-4" />
                          Download Cleaned Dataset
                        </>
                      )}
                    </Button>
                    <Button
                      onClick={() => onNavigate('dashboard')}
                      variant="outline"
                      className="border-cyan-400/50 text-cyan-400 hover:bg-cyan-400/10"
                    >
                      <Upload className="mr-2 h-4 w-4" />
                      Go to Upload & Train
                    </Button>
                  </div>
                </div>

                {/* Statistics */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                  <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
                    <div className="text-sm text-gray-400 mb-1">Original Rows</div>
                    <div className="text-2xl font-bold text-white">
                      {cleaningResult.stats.original_rows.toLocaleString()}
                    </div>
                  </div>
                  <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
                    <div className="text-sm text-gray-400 mb-1">Cleaned Rows</div>
                    <div className="text-2xl font-bold text-green-400">
                      {cleaningResult.stats.cleaned_rows.toLocaleString()}
                    </div>
                  </div>
                  <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
                    <div className="text-sm text-gray-400 mb-1">Rows Removed</div>
                    <div className="text-2xl font-bold text-red-400">
                      {cleaningResult.stats.rows_removed.toLocaleString()}
                    </div>
                  </div>
                  <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
                    <div className="text-sm text-gray-400 mb-1">Columns</div>
                    <div className="text-2xl font-bold text-cyan-400">
                      {cleaningResult.stats.cleaned_cols}
                    </div>
                  </div>
                </div>

                {/* Column Information */}
                <div className="mt-6">
                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <Database className="w-5 h-5 text-cyan-400" />
                    Column Information
                  </h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead>
                        <tr className="border-b border-gray-700">
                          <th className="pb-3 text-gray-400 font-semibold">Column</th>
                          <th className="pb-3 text-gray-400 font-semibold">Data Type</th>
                          <th className="pb-3 text-gray-400 font-semibold">Null Count</th>
                        </tr>
                      </thead>
                      <tbody>
                        {cleaningResult.stats.columns.map((col) => (
                          <tr key={col} className="border-b border-gray-800">
                            <td className="py-3 text-white font-medium">{col}</td>
                            <td className="py-3 text-gray-400">
                              {cleaningResult.stats.dtypes[col] || 'unknown'}
                            </td>
                            <td className="py-3 text-gray-400">
                              {cleaningResult.stats.null_counts[col] || 0}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Cleaning Summary */}
                <div className="mt-6 space-y-4">
                  <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="w-5 h-5 text-blue-400 mt-0.5" />
                      <div className="text-sm text-gray-300">
                        <p className="font-semibold text-blue-400 mb-1">Cleaning Operations Performed:</p>
                        <ul className="list-disc list-inside space-y-1 text-gray-400">
                          <li>Removed duplicate rows</li>
                          <li>Removed rows where all values are missing</li>
                          <li>Converted numeric columns to proper format (preserves categorical data)</li>
                          <li>Removed infinite values from numeric columns</li>
                          <li>Reset index after cleaning</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-lg">
                    <div className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-green-400 mt-0.5" />
                      <div className="text-sm text-gray-300">
                        <p className="font-semibold text-green-400 mb-2">Next Steps to Train Your Model:</p>
                        <div className="space-y-2 text-gray-400">
                          <div className="flex items-start gap-2">
                            <span className="font-bold text-green-400">1.</span>
                            <span>Click the <strong className="text-white">"Download Cleaned Dataset"</strong> button above to save the cleaned CSV file to your computer</span>
                          </div>
                          <div className="flex items-start gap-2">
                            <span className="font-bold text-green-400">2.</span>
                            <span>Click <strong className="text-white">"Go to Upload & Train"</strong> button above, or go to <strong className="text-white">Dashboard → Upload</strong> section</span>
                          </div>
                          <div className="flex items-start gap-2">
                            <span className="font-bold text-green-400">3.</span>
                            <span>Upload the <strong className="text-white">cleaned CSV file</strong> you just downloaded</span>
                          </div>
                          <div className="flex items-start gap-2">
                            <span className="font-bold text-green-400">4.</span>
                            <span>Select your model and start training - the cleaned data will result in <strong className="text-green-400">more accurate model training!</strong></span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Prominent Download Section */}
                  <div className="mt-6 p-6 bg-gradient-to-r from-green-500/20 to-emerald-500/20 border-2 border-green-400/50 rounded-lg">
                    <div className="flex items-center justify-between flex-wrap gap-4">
                      <div>
                        <h3 className="text-lg font-bold text-white mb-1 flex items-center gap-2">
                          <Download className="w-5 h-5 text-green-400" />
                          Ready to Download
                        </h3>
                        <p className="text-sm text-gray-300">
                          Download your cleaned dataset as a CSV file. You can then upload it to train your model.
                        </p>
                      </div>
                      <Button
                        onClick={handleDownload}
                        disabled={isDownloading}
                        size="lg"
                        className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white px-8 py-6 text-lg font-semibold shadow-lg shadow-green-500/50"
                      >
                        {isDownloading ? (
                          <>
                            <motion.div
                              animate={{ rotate: 360 }}
                              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                              className="w-5 h-5 border-2 border-white border-t-transparent rounded-full mr-2"
                            />
                            Downloading...
                          </>
                        ) : (
                          <>
                            <Download className="mr-2 h-5 w-5" />
                            Download Cleaned Dataset (CSV)
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  );
}

