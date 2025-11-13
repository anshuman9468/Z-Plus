import { useState, useRef } from 'react';
import { motion } from 'motion/react';
import { Sidebar } from './sidebar';
import { Upload, FileText, Brain, Play, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Slider } from './ui/slider';

type Page = 'landing' | 'dashboard' | 'progress' | 'results' | 'history';

interface DashboardProps {
  onNavigate: (page: Page) => void;
  onStartTraining: (data: any) => void;
}

export function Dashboard({ onNavigate, onStartTraining }: DashboardProps) {
  const [file, setFile] = useState<File | null>(null);
  const [targetColumn, setTargetColumn] = useState('');
  const [task, setTask] = useState<'train' | 'inference' | null>(null);
  const [model, setModel] = useState<'logistic' | 'tree' | null>(null);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [trainSplit, setTrainSplit] = useState([80]);
  const [dragActive, setDragActive] = useState(false);
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
      setFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleStartTraining = () => {
    if (!file || !targetColumn || !task || !model) return;
    
    onStartTraining({
      file,
      targetColumn,
      task,
      model,
      trainSplit: trainSplit[0],
    });
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
              className={`border-2 border-dashed rounded-lg p-12 text-center transition-all cursor-pointer ${
                dragActive
                  ? 'border-cyan-400 bg-cyan-400/10'
                  : 'border-cyan-400/30 hover:border-cyan-400/60 hover:bg-cyan-400/5'
              }`}
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="w-16 h-16 mx-auto mb-4 text-cyan-400" />
              <p className="text-gray-300 mb-2">
                {file ? file.name : 'Drag and drop your CSV file here'}
              </p>
              <p className="text-sm text-gray-500">
                or click to browse files
              </p>
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv"
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
                      <SelectItem value="target">target</SelectItem>
                      <SelectItem value="label">label</SelectItem>
                      <SelectItem value="outcome">outcome</SelectItem>
                      <SelectItem value="class">class</SelectItem>
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
                className={`p-6 rounded-lg border-2 transition-all text-left ${
                  task === 'train'
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
                className={`p-6 rounded-lg border-2 transition-all text-left ${
                  task === 'inference'
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
            <div className="grid md:grid-cols-2 gap-4">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setModel('logistic')}
                className={`p-6 rounded-lg border-2 transition-all text-left ${
                  model === 'logistic'
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
                className={`p-6 rounded-lg border-2 transition-all text-left ${
                  model === 'tree'
                    ? 'border-cyan-400 bg-cyan-400/10'
                    : 'border-cyan-400/30 hover:border-cyan-400/60'
                }`}
              >
                <h3 className="text-lg mb-2 text-cyan-300">Decision Tree</h3>
                <p className="text-sm text-gray-400">
                  Non-linear classification with tree-based decisions
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
              disabled={!file || !targetColumn || !task || !model}
              className="flex-1 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white py-6 text-lg shadow-[0_0_30px_rgba(0,191,255,0.3)] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Brain className="mr-2 h-5 w-5" />
              {task === 'train' ? 'Train Privately' : 'Run Inference Privately'}
            </Button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
