import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Sidebar } from './sidebar';
import { Lock, CheckCircle, Terminal } from 'lucide-react';
import { Progress } from './ui/progress';

type Page = 'landing' | 'dashboard' | 'progress' | 'results' | 'history';

interface ProgressUIProps {
  onNavigate: (page: Page) => void;
  onComplete: (results: any) => void;
  trainingData: any;
}

export function ProgressUI({ onNavigate, onComplete, trainingData }: ProgressUIProps) {
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState('Initializing...');
  const [logs, setLogs] = useState<string[]>([
    '> Starting secure training session...',
    '> Loading dataset into secure environment...',
  ]);

  useEffect(() => {
    const trainModel = async () => {
      if (!trainingData?.file) return;

      try {
        setProgress(10);
        setCurrentStep('Preprocessing data...');
        setLogs(prev => [...prev, '> Dataset loaded: ' + trainingData.file.name]);

        setProgress(20);
        setCurrentStep('Uploading dataset...');
        setLogs(prev => [...prev, '> Uploading to secure backend...']);

        const formData = new FormData();
        formData.append('dataset', trainingData.file);
        formData.append('task', trainingData.task || 'train');
        formData.append('model_type', trainingData.model === 'logistic' ? 'logistic_regression' : 'decision_tree');
        formData.append('target_column', trainingData.targetColumn);

        setProgress(30);
        setCurrentStep('Training model...');
        setLogs(prev => [...prev, '> Training ' + (trainingData.model === 'logistic' ? 'Logistic Regression' : 'Decision Tree')]);

        const response = await fetch('http://127.0.0.1:8000/api/run-job', {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.detail || 'Training failed');
        }

        setProgress(70);
        setCurrentStep('Generating zero-knowledge proof...');
        setLogs(prev => [...prev, '> Computing metrics...']);

        const results = await response.json();

        setProgress(85);
        setCurrentStep('Validating proof...');
        setLogs(prev => [...prev, `> Accuracy: ${(results.metrics.accuracy * 100).toFixed(2)}%`]);

        setProgress(95);
        setCurrentStep('Finalizing results...');
        setLogs(prev => [...prev, '> Generating cryptographic proof...']);

        setProgress(100);
        setCurrentStep('Complete!');
        setLogs(prev => [...prev, '> Proof generated successfully']);

        setTimeout(() => {
          onComplete(results);
        }, 1000);
      } catch (error: any) {
        setLogs(prev => [...prev, '> ERROR: ' + (error.message || 'Training failed')]);
        setCurrentStep('Error occurred');
        console.error('Training error:', error);
      }
    };

    trainModel();
  }, [trainingData, onComplete]);

  return (
    <div className="flex min-h-screen">
      <Sidebar currentPage="progress" onNavigate={onNavigate} />
      
      <div className="flex-1 p-8 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-3xl"
        >
          <div className="bg-gradient-to-br from-gray-900 to-gray-950 border border-cyan-400/30 rounded-lg p-8 shadow-[0_0_50px_rgba(0,191,255,0.1)]">
            {/* Header */}
            <div className="text-center mb-8">
              <motion.div
                className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-r from-cyan-500/20 to-blue-500/20 flex items-center justify-center"
                animate={{
                  boxShadow: [
                    '0 0 20px rgba(0,191,255,0.3)',
                    '0 0 40px rgba(0,191,255,0.6)',
                    '0 0 20px rgba(0,191,255,0.3)',
                  ],
                }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <Lock className="w-10 h-10 text-cyan-400" />
              </motion.div>
              <h1 className="text-3xl mb-2 text-cyan-400">Secure Computation in Progress</h1>
              <p className="text-gray-400">Generating zero-knowledge proof...</p>
            </div>

            {/* Progress Bar */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm text-gray-400">{currentStep}</span>
                <span className="text-sm text-cyan-400">{progress}%</span>
              </div>
              <Progress value={progress} className="h-3" />
            </div>

            {/* Training Info */}
            <div className="grid grid-cols-2 gap-4 mb-8">
              <div className="bg-gray-800/50 rounded-lg p-4 border border-cyan-400/20">
                <p className="text-xs text-gray-500 mb-1">Model</p>
                <p className="text-sm text-cyan-400">
                  {trainingData?.model === 'logistic' ? 'Logistic Regression' : 'Decision Tree'}
                </p>
              </div>
              <div className="bg-gray-800/50 rounded-lg p-4 border border-cyan-400/20">
                <p className="text-xs text-gray-500 mb-1">Task</p>
                <p className="text-sm text-cyan-400">
                  {trainingData?.task === 'train' ? 'Training' : 'Inference'}
                </p>
              </div>
              <div className="bg-gray-800/50 rounded-lg p-4 border border-cyan-400/20">
                <p className="text-xs text-gray-500 mb-1">Dataset</p>
                <p className="text-sm text-cyan-400 truncate">
                  {trainingData?.file?.name || 'Unknown'}
                </p>
              </div>
              <div className="bg-gray-800/50 rounded-lg p-4 border border-cyan-400/20">
                <p className="text-xs text-gray-500 mb-1">Split</p>
                <p className="text-sm text-cyan-400">
                  {trainingData?.trainSplit || 80}% / {100 - (trainingData?.trainSplit || 80)}%
                </p>
              </div>
            </div>

            {/* Console Logs */}
            <div className="bg-black/50 rounded-lg p-4 border border-cyan-400/20">
              <div className="flex items-center gap-2 mb-3 pb-2 border-b border-cyan-400/20">
                <Terminal className="w-4 h-4 text-cyan-400" />
                <span className="text-sm text-cyan-400">Training Console</span>
              </div>
              <div className="space-y-1 max-h-64 overflow-y-auto font-mono text-xs">
                {logs.map((log, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3 }}
                    className="text-gray-400"
                  >
                    {log}
                  </motion.div>
                ))}
                {progress < 100 && (
                  <motion.div
                    animate={{ opacity: [1, 0.3, 1] }}
                    transition={{ duration: 1, repeat: Infinity }}
                    className="text-cyan-400"
                  >
                    ▋
                  </motion.div>
                )}
              </div>
            </div>

            {progress === 100 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-6 p-4 bg-gradient-to-r from-green-900/20 to-cyan-900/20 rounded-lg border border-green-400/30 flex items-center gap-3"
              >
                <CheckCircle className="w-6 h-6 text-green-400" />
                <div>
                  <p className="text-green-400">Training Complete!</p>
                  <p className="text-xs text-gray-400">Redirecting to results...</p>
                </div>
              </motion.div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
