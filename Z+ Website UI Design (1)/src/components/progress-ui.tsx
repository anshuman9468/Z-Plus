import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Sidebar } from './sidebar';
import { Lock, CheckCircle, Terminal } from 'lucide-react';
import { Progress } from './ui/progress';
import { getJobStatus } from '../services/api';
import { toast } from 'sonner';

type Page = 'landing' | 'dashboard' | 'progress' | 'results' | 'history' | 'insights' | 'verifier';

interface ProgressUIProps {
  onNavigate: (page: Page) => void;
  onComplete: () => void;
  trainingData: any;
}

export function ProgressUI({ onNavigate, onComplete, trainingData }: ProgressUIProps) {
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState('Initializing...');
  const [logs, setLogs] = useState<string[]>([
    '> Starting secure training session...',
    '> Loading dataset into secure environment...',
  ]);
  const [jobStatus, setJobStatus] = useState<any>(null);

  useEffect(() => {
    const jobId = trainingData?.jobId || trainingData?.trainingResponse?.job_id;
    
    if (!jobId) {
      // If no job ID, use mock progress
      const steps = [
        { progress: 10, step: 'Preprocessing data...', log: '> Dataset loaded: ' + trainingData?.file?.name },
        { progress: 20, step: 'Initializing cryptographic protocols...', log: '> ZK-SNARK circuits initialized' },
        { progress: 30, step: 'Setting up secure computation...', log: '> Secure multi-party computation ready' },
        { progress: 45, step: 'Training model...', log: '> Training ' + (trainingData?.model === 'logistic' ? 'Logistic Regression' : 'Decision Tree') },
        { progress: 60, step: 'Computing gradients...', log: '> Epoch 1/10 - Loss: 0.456' },
        { progress: 70, step: 'Generating zero-knowledge proof...', log: '> Epoch 5/10 - Loss: 0.234' },
        { progress: 85, step: 'Validating proof...', log: '> Epoch 10/10 - Loss: 0.123' },
        { progress: 95, step: 'Finalizing results...', log: '> Generating cryptographic proof...' },
        { progress: 100, step: 'Complete!', log: '> Proof generated successfully' },
      ];

      let currentStepIndex = 0;
      const interval = setInterval(() => {
        if (currentStepIndex < steps.length) {
          const step = steps[currentStepIndex];
          setProgress(step.progress);
          setCurrentStep(step.step);
          setLogs(prev => [...prev, step.log]);
          currentStepIndex++;
        } else {
          clearInterval(interval);
          setTimeout(() => {
            onComplete();
          }, 1000);
        }
      }, 1500);

      return () => clearInterval(interval);
    }

    // Check if training is already completed (synchronous response)
    if (trainingData?.trainingResponse?.status === 'completed') {
      setJobStatus(trainingData.trainingResponse);
      setProgress(100);
      setCurrentStep('Complete!');
      setLogs(prev => [...prev, '> Training completed successfully', '> Proof generated', '> Ready to view results']);
      setTimeout(() => {
        onComplete();
      }, 2000);
      return;
    }

    // Poll for job status
    const pollStatus = async () => {
      try {
        const status = await getJobStatus(jobId);
        setJobStatus(status);
        
        if (status.status === 'completed') {
          setProgress(100);
          setCurrentStep('Complete!');
          setLogs(prev => [...prev, '> Training completed successfully', '> Proof generated', '> Ready to view results']);
          setTimeout(() => {
            onComplete();
          }, 2000);
        } else if (status.status === 'failed') {
          setProgress(0);
          setCurrentStep('Failed');
          setLogs(prev => [...prev, `> Error: ${status.error || 'Unknown error'}`]);
          toast.error('Training failed: ' + (status.error || 'Unknown error'));
        } else {
          // Update progress based on status
          const progressSteps = [
            { status: 'processing', progress: 50, step: 'Training model...', log: '> Model training in progress...' },
          ];
          
          const currentProgress = progress < 90 ? progress + 5 : 90;
          setProgress(currentProgress);
          setCurrentStep(status.status === 'processing' ? 'Processing...' : 'Initializing...');
        }
      } catch (error: any) {
        console.error('Error polling status:', error);
        setLogs(prev => [...prev, `> Error checking status: ${error.message}`]);
      }
    };

    // Initial status check
    pollStatus();

    // Poll every 2 seconds
    const interval = setInterval(pollStatus, 2000);

    // Simulate progress updates
    const progressInterval = setInterval(() => {
      if (progress < 90) {
        setProgress(prev => Math.min(prev + 2, 90));
        const steps = [
          { progress: 20, step: 'Preprocessing data...', log: '> Dataset loaded: ' + trainingData?.file?.name },
          { progress: 40, step: 'Initializing cryptographic protocols...', log: '> ZK-SNARK circuits initialized' },
          { progress: 60, step: 'Training model...', log: '> Training ' + (trainingData?.model || 'model') },
          { progress: 80, step: 'Generating zero-knowledge proof...', log: '> Generating cryptographic proof...' },
        ];
        
        const currentStep = steps.find(s => progress >= s.progress - 10 && progress < s.progress + 10);
        if (currentStep && !logs.includes(currentStep.log)) {
          setCurrentStep(currentStep.step);
          setLogs(prev => [...prev, currentStep.log]);
        }
      }
    }, 1500);

    return () => {
      clearInterval(interval);
      clearInterval(progressInterval);
    };
  }, [onComplete, trainingData, progress, logs]);

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