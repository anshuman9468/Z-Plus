import { useState, useRef } from 'react';
import { motion } from 'motion/react';
import { Sidebar } from './sidebar';
import { Upload, FileText, Brain, Play, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Slider } from './ui/slider';
import { uploadDataset, getFileColumns } from '../services/api';
import { toast } from 'sonner';

type Page = 'landing' | 'dashboard' | 'progress' | 'results' | 'history' | 'insights' | 'verifier';

interface DashboardProps {
  onNavigate: (page: Page) => void;
  onStartTraining: (data: any) => void;
}

export function Dashboard({ onNavigate, onStartTraining }: DashboardProps) {
  const [file, setFile] = useState<File | null>(null);
  const [targetColumn, setTargetColumn] = useState('');
  const [availableColumns, setAvailableColumns] = useState<string[]>([]);
  const [task, setTask] = useState<'train' | 'inference' | null>(null);
  const [model, setModel] = useState<string | null>(null);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [trainSplit, setTrainSplit] = useState([80]);
  const [dragActive, setDragActive] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
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

  const loadFileColumns = async (selectedFile: File) => {
    try {
      const fileExt = selectedFile.name.toLowerCase().split('.').pop();

      if (fileExt === 'csv') {
        // For CSV, try to read headers client-side first (faster)
        try {
          const text = await selectedFile.text();
          const lines = text.split('\n');
          if (lines.length > 0) {
            const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
            if (headers.length > 0 && headers[0]) {
              setAvailableColumns(headers);
              // Auto-select common target column names
              const commonTargets = ['y', 'target', 'label', 'outcome', 'class'];
              for (const col of commonTargets) {
                if (headers.includes(col)) {
                  setTargetColumn(col);
                  return;
                }
              }
              return;
            }
          }
        } catch (error) {
          console.error('Error reading CSV client-side:', error);
        }
      }

      // For XLSX, JSON, or CSV if client-side reading failed, use backend
      const response = await getFileColumns(selectedFile);
      if (response.columns && response.columns.length > 0) {
        setAvailableColumns(response.columns);
        // Auto-select common target column names
        const commonTargets = ['y', 'target', 'label', 'outcome', 'class'];
        for (const col of commonTargets) {
          if (response.columns.includes(col)) {
            setTargetColumn(col);
            break;
          }
        }
        toast.success(`Loaded ${response.columns.length} columns from file`);
      } else {
        toast.error('No columns found in file');
      }
    } catch (error: any) {
      console.error('Error loading file columns:', error);
      toast.error(error.message || 'Failed to load file columns');
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const selectedFile = e.dataTransfer.files[0];
      const fileExt = selectedFile.name.toLowerCase().split('.').pop();

      // Validate file type
      if (!['csv', 'xlsx', 'xls', 'json', 'zip'].includes(fileExt || '')) {
        toast.error('Please upload a CSV, XLSX, JSON, or ZIP file');
        return;
      }

      setFile(selectedFile);
      setTargetColumn(''); // Reset target column
      await loadFileColumns(selectedFile);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      const fileExt = selectedFile.name.toLowerCase().split('.').pop();

      // Validate file type
      if (!['csv', 'xlsx', 'xls', 'json', 'zip'].includes(fileExt || '')) {
        toast.error('Please upload a CSV, XLSX, JSON, or ZIP file');
        return;
      }

      setFile(selectedFile);
      setTargetColumn(''); // Reset target column
      await loadFileColumns(selectedFile);
    }
  };

  const handleStartTraining = async () => {
    if (!file || !targetColumn || !task || !model) return;

    setIsUploading(true);
    try {
      const response = await uploadDataset({
        file,
        targetColumn,
        task,
        model,
        trainSplit: trainSplit[0],
      });

      toast.success('Training started successfully!');
      onStartTraining({
        file,
        targetColumn,
        task,
        model,
        trainSplit: trainSplit[0],
        jobId: response.job_id,
        trainingResponse: response,
      });
    } catch (error: any) {
      toast.error(error.message || 'Failed to start training');
      console.error('Training error:', error);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="flex min-h-screen">
      <Sidebar currentPage="dashboard" onNavigate={onNavigate} />

      <div className="flex-1 p-8 overflow-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-4xl mb-2 text-cyan-400">Start a New Secure Session</h1>
          <p className="text-gray-400 mb-8">Upload your data and configure your training parameters</p>

          {/* Upload Widget */}
          <Card className="bg-gradient-to-br from-gray-900 to-gray-950 border-cyan-400/30 p-8 mb-8">
            <h2 className="text-2xl mb-6 text-cyan-300">Upload Dataset</h2>

            <div
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-lg p-12 text-center transition-all cursor-pointer ${dragActive
                ? 'border-cyan-400 bg-cyan-400/10'
                : 'border-cyan-400/30 hover:border-cyan-400/60 hover:bg-cyan-400/5'
                }`}
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="w-16 h-16 mx-auto mb-4 text-cyan-400" />
              <p className="text-gray-300 mb-2">
                {file ? file.name : 'Drag and drop your file here (CSV, XLSX, JSON, ZIP)'}
              </p>
              <p className="text-sm text-gray-500">
                or click to browse files
              </p>
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv,.xlsx,.xls,.json,.zip"
                className="hidden"
                onChange={handleFileChange}
              />
            </div>

            {file && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="mt-6 p-4 bg-gray-800/50 rounded-lg border border-cyan-400/20"
              >
                <div className="flex items-center gap-3 mb-4">
                  <FileText className="w-5 h-5 text-cyan-400" />
                  <div className="flex-1">
                    <p className="text-sm text-gray-300">{file.name}</p>
                    <p className="text-xs text-gray-500">
                      {(file.size / 1024).toFixed(2)} KB
                    </p>
                  </div>
                </div>

                <div>
                  <label className="text-sm text-gray-400 mb-2 block">
                    Select Target Column
                  </label>
                  <Select value={targetColumn} onValueChange={setTargetColumn}>
                    <SelectTrigger className="bg-gray-900 border-cyan-400/30 text-white">
                      <SelectValue placeholder="Choose target column" />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-900 border-cyan-400/30">
                      {availableColumns.length > 0 ? (
                        availableColumns.map((col) => (
                          <SelectItem key={col} value={col}>
                            {col}
                          </SelectItem>
                        ))
                      ) : (
                        <>
                          <SelectItem value="y">y</SelectItem>
                          <SelectItem value="target">target</SelectItem>
                          <SelectItem value="label">label</SelectItem>
                          <SelectItem value="outcome">outcome</SelectItem>
                          <SelectItem value="class">class</SelectItem>
                        </>
                      )}
                    </SelectContent>
                  </Select>
                </div>
              </motion.div>
            )}
          </Card>

          {/* Task Selection */}
          <Card className="bg-gradient-to-br from-gray-900 to-gray-950 border-cyan-400/30 p-8 mb-8">
            <h2 className="text-2xl mb-6 text-cyan-300">Select Task</h2>
            <div className="grid md:grid-cols-2 gap-4">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setTask('train')}
                className={`p-6 rounded-lg border-2 transition-all text-left ${task === 'train'
                  ? 'border-cyan-400 bg-cyan-400/10'
                  : 'border-cyan-400/30 hover:border-cyan-400/60'
                  }`}
              >
                <Brain className="w-8 h-8 text-cyan-400 mb-3" />
                <h3 className="text-lg mb-2 text-cyan-300">Train Model</h3>
                <p className="text-sm text-gray-400">
                  Train a new model with ZK proofs
                </p>
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setTask('inference')}
                className={`p-6 rounded-lg border-2 transition-all text-left ${task === 'inference'
                  ? 'border-cyan-400 bg-cyan-400/10'
                  : 'border-cyan-400/30 hover:border-cyan-400/60'
                  }`}
              >
                <Play className="w-8 h-8 text-blue-400 mb-3" />
                <h3 className="text-lg mb-2 text-cyan-300">Run Inference</h3>
                <p className="text-sm text-gray-400">
                  Run predictions on new data
                </p>
              </motion.button>
            </div>
          </Card>

          {/* Model Selection */}
          <Card className="bg-gradient-to-br from-gray-900 to-gray-950 border-cyan-400/30 p-8 mb-8">
            <h2 className="text-2xl mb-6 text-cyan-300">Select Model</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setModel('logistic')}
                className={`p-6 rounded-lg border-2 transition-all text-left ${model === 'logistic'
                  ? 'border-cyan-400 bg-cyan-400/10'
                  : 'border-cyan-400/30 hover:border-cyan-400/60'
                  }`}
              >
                <h3 className="text-lg mb-2 text-cyan-300">Logistic Regression</h3>
                <p className="text-sm text-gray-400">
                  Binary classification with linear decision boundary
                </p>
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setModel('tree')}
                className={`p-6 rounded-lg border-2 transition-all text-left ${model === 'tree'
                  ? 'border-cyan-400 bg-cyan-400/10'
                  : 'border-cyan-400/30 hover:border-cyan-400/60'
                  }`}
              >
                <h3 className="text-lg mb-2 text-cyan-300">Decision Tree</h3>
                <p className="text-sm text-gray-400">
                  Non-linear classification with tree-based decisions
                </p>
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setModel('random_forest')}
                className={`p-6 rounded-lg border-2 transition-all text-left ${model === 'random_forest'
                  ? 'border-cyan-400 bg-cyan-400/10'
                  : 'border-cyan-400/30 hover:border-cyan-400/60'
                  }`}
              >
                <h3 className="text-lg mb-2 text-cyan-300">Random Forest</h3>
                <p className="text-sm text-gray-400">
                  Ensemble of decision trees for robust predictions
                </p>
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setModel('svm')}
                className={`p-6 rounded-lg border-2 transition-all text-left ${model === 'svm'
                  ? 'border-cyan-400 bg-cyan-400/10'
                  : 'border-cyan-400/30 hover:border-cyan-400/60'
                  }`}
              >
                <h3 className="text-lg mb-2 text-cyan-300">Support Vector Machine</h3>
                <p className="text-sm text-gray-400">
                  Maximum margin classifier with kernel trick
                </p>
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setModel('knn')}
                className={`p-6 rounded-lg border-2 transition-all text-left ${model === 'knn'
                  ? 'border-cyan-400 bg-cyan-400/10'
                  : 'border-cyan-400/30 hover:border-cyan-400/60'
                  }`}
              >
                <h3 className="text-lg mb-2 text-cyan-300">K-Nearest Neighbors</h3>
                <p className="text-sm text-gray-400">
                  Instance-based learning with distance metrics
                </p>
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setModel('naive_bayes')}
                className={`p-6 rounded-lg border-2 transition-all text-left ${model === 'naive_bayes'
                  ? 'border-cyan-400 bg-cyan-400/10'
                  : 'border-cyan-400/30 hover:border-cyan-400/60'
                  }`}
              >
                <h3 className="text-lg mb-2 text-cyan-300">Naive Bayes</h3>
                <p className="text-sm text-gray-400">
                  Probabilistic classifier based on Bayes theorem
                </p>
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setModel('gradient_boost')}
                className={`p-6 rounded-lg border-2 transition-all text-left ${model === 'gradient_boost'
                  ? 'border-cyan-400 bg-cyan-400/10'
                  : 'border-cyan-400/30 hover:border-cyan-400/60'
                  }`}
              >
                <h3 className="text-lg mb-2 text-cyan-300">Gradient Boosting</h3>
                <p className="text-sm text-gray-400">
                  XGBoost/LightGBM for high-performance predictions
                </p>
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setModel('neural_net')}
                className={`p-6 rounded-lg border-2 transition-all text-left ${model === 'neural_net'
                  ? 'border-cyan-400 bg-cyan-400/10'
                  : 'border-cyan-400/30 hover:border-cyan-400/60'
                  }`}
              >
                <h3 className="text-lg mb-2 text-cyan-300">Neural Network (MLP)</h3>
                <p className="text-sm text-gray-400">
                  Multi-layer perceptron for complex patterns
                </p>
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setModel('catboost')}
                className={`p-6 rounded-lg border-2 transition-all text-left ${model === 'catboost'
                  ? 'border-cyan-400 bg-cyan-400/10'
                  : 'border-cyan-400/30 hover:border-cyan-400/60'
                  }`}
              >
                <h3 className="text-lg mb-2 text-cyan-300">CatBoost Classifier</h3>
                <p className="text-sm text-gray-400">
                  Gradient-boosted decision trees optimized for categorical features with minimal preprocessing
                </p>
              </motion.button>
            </div>
          </Card>

          {/* Advanced Options */}
          <Card className="bg-gradient-to-br from-gray-900 to-gray-950 border-cyan-400/30 p-8 mb-8">
            <button
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="w-full flex items-center justify-between text-cyan-300 hover:text-cyan-400 transition-colors"
            >
              <h2 className="text-2xl">Advanced Options</h2>
              {showAdvanced ? (
                <ChevronUp className="w-6 h-6" />
              ) : (
                <ChevronDown className="w-6 h-6" />
              )}
            </button>

            {showAdvanced && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-6"
              >
                <div>
                  <label className="text-sm text-gray-400 mb-4 block">
                    Train/Test Split: {trainSplit[0]}% / {100 - trainSplit[0]}%
                  </label>
                  <Slider
                    value={trainSplit}
                    onValueChange={setTrainSplit}
                    min={50}
                    max={90}
                    step={5}
                    className="mb-2"
                  />
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>50%</span>
                    <span>90%</span>
                  </div>
                </div>
              </motion.div>
            )}
          </Card>

          {/* Run Buttons */}
          <div className="flex gap-4">
            <Button
              onClick={handleStartTraining}
              disabled={!file || !targetColumn || !task || !model || isUploading}
              className="flex-1 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white py-6 text-lg shadow-[0_0_30px_rgba(0,191,255,0.3)] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isUploading ? (
                <>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    className="w-5 h-5 border-2 border-white border-t-transparent rounded-full mr-2"
                  />
                  Uploading...
                </>
              ) : (
                <>
                  <Brain className="mr-2 h-5 w-5" />
                  {task === 'train' ? 'Train Privately' : 'Run Inference Privately'}
                </>
              )}
            </Button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}