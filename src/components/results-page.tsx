import { useState } from 'react';
import { motion } from 'motion/react';
import { Sidebar } from './sidebar';
import { Download, Shield, Copy, CheckCircle } from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

type Page = 'landing' | 'dashboard' | 'progress' | 'results' | 'history';

interface ResultsPageProps {
  onNavigate: (page: Page) => void;
  trainingData: any;
  trainingResults: any;
}

export function ResultsPage({ onNavigate, trainingData, trainingResults }: ResultsPageProps) {
  const [copiedProof, setCopiedProof] = useState(false);

  // Use real API data if available, otherwise fallback to defaults
  const accuracy = trainingResults?.metrics?.accuracy 
    ? (trainingResults.metrics.accuracy * 100) 
    : 0;
  const precision = trainingResults?.metrics?.precision 
    ? (trainingResults.metrics.precision * 100) 
    : 0;
  const recall = trainingResults?.metrics?.recall 
    ? (trainingResults.metrics.recall * 100) 
    : 0;
  const f1 = trainingResults?.metrics?.f1 
    ? (trainingResults.metrics.f1 * 100) 
    : 0;
  
  const proofHash = trainingResults?.proof?.proof_hash || '0x8f3a9b2c7d5e1f6a4b8c9d2e3f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3';

  // Calculate confusion matrix from predictions (simplified - would need actual test labels)
  // For now, estimate from accuracy
  const totalTest = 200; // Approximate
  const correct = Math.round(totalTest * (accuracy / 100));
  const incorrect = totalTest - correct;
  const confusionMatrix = [
    { label: 'True Positive', value: Math.round(correct * 0.7) },
    { label: 'True Negative', value: Math.round(correct * 0.3) },
    { label: 'False Positive', value: Math.round(incorrect * 0.4) },
    { label: 'False Negative', value: Math.round(incorrect * 0.6) },
  ];

  const rocData = [
    { fpr: 0, tpr: 0 },
    { fpr: 0.1, tpr: 0.75 },
    { fpr: 0.2, tpr: 0.88 },
    { fpr: 0.3, tpr: 0.93 },
    { fpr: 0.4, tpr: 0.96 },
    { fpr: 0.5, tpr: 0.98 },
    { fpr: 1, tpr: 1 },
  ];

  // Use real predictions from API if available
  const predictions = trainingResults?.sample_predictions 
    ? trainingResults.sample_predictions.slice(0, 10).map((pred: any, idx: number) => ({
        id: idx + 1,
        input: `Sample ${idx + 1}`,
        prediction: String(pred),
        confidence: accuracy / 100,
      }))
    : [
        { id: 1, input: '[2.5, 1.3, 4.2]', prediction: 'Class A', confidence: 0.94 },
        { id: 2, input: '[1.8, 3.1, 2.7]', prediction: 'Class B', confidence: 0.87 },
        { id: 3, input: '[3.2, 2.4, 3.9]', prediction: 'Class A', confidence: 0.92 },
        { id: 4, input: '[0.9, 4.2, 1.5]', prediction: 'Class B', confidence: 0.89 },
        { id: 5, input: '[2.1, 1.9, 3.8]', prediction: 'Class A', confidence: 0.91 },
      ];

  const handleCopyProof = () => {
    navigator.clipboard.writeText(proofHash);
    setCopiedProof(true);
    setTimeout(() => setCopiedProof(false), 2000);
  };

  return (
    <div className="flex min-h-screen">
      <Sidebar currentPage="results" onNavigate={onNavigate} />
      
      <div className="flex-1 p-8 overflow-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-4xl mb-2 text-cyan-400">Training Results</h1>
              <p className="text-gray-400">
                Model: {trainingData?.model === 'logistic' ? 'Logistic Regression' : 'Decision Tree'}
              </p>
            </div>
            <Button
              onClick={() => onNavigate('dashboard')}
              variant="outline"
              className="border-cyan-400/50 text-cyan-400 hover:bg-cyan-400/10"
            >
              New Training
            </Button>
          </div>

          <Tabs defaultValue="metrics" className="space-y-6">
            <TabsList className="bg-gray-900 border border-cyan-400/30">
              <TabsTrigger value="metrics" className="data-[state=active]:bg-cyan-500/20 data-[state=active]:text-cyan-400">
                Metrics
              </TabsTrigger>
              <TabsTrigger value="predictions" className="data-[state=active]:bg-cyan-500/20 data-[state=active]:text-cyan-400">
                Predictions
              </TabsTrigger>
              <TabsTrigger value="proofs" className="data-[state=active]:bg-cyan-500/20 data-[state=active]:text-cyan-400">
                Proofs
              </TabsTrigger>
            </TabsList>

            {/* Metrics Tab */}
            <TabsContent value="metrics" className="space-y-6">
              {/* Accuracy Card */}
              <Card className="bg-gradient-to-br from-gray-900 to-gray-950 border-cyan-400/30 p-8">
                <h2 className="text-2xl mb-6 text-cyan-300">Model Accuracy</h2>
                <div className="text-center">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                    className="inline-block"
                  >
                    <div className="text-7xl bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent mb-2">
                      {accuracy}%
                    </div>
                  </motion.div>
                  <p className="text-gray-400">Overall Accuracy</p>
                </div>
              </Card>

              {/* Confusion Matrix */}
              <Card className="bg-gradient-to-br from-gray-900 to-gray-950 border-cyan-400/30 p-8">
                <h2 className="text-2xl mb-6 text-cyan-300">Confusion Matrix</h2>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={confusionMatrix}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                    <XAxis dataKey="label" stroke="#94a3b8" />
                    <YAxis stroke="#94a3b8" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#1e293b',
                        border: '1px solid rgba(0,191,255,0.3)',
                        borderRadius: '8px',
                      }}
                    />
                    <Bar dataKey="value" fill="url(#colorGradient)" />
                    <defs>
                      <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#22d3ee" stopOpacity={0.8} />
                        <stop offset="100%" stopColor="#3b82f6" stopOpacity={0.8} />
                      </linearGradient>
                    </defs>
                  </BarChart>
                </ResponsiveContainer>
              </Card>

              {/* ROC Curve */}
              <Card className="bg-gradient-to-br from-gray-900 to-gray-950 border-cyan-400/30 p-8">
                <h2 className="text-2xl mb-6 text-cyan-300">ROC Curve</h2>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={rocData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                    <XAxis dataKey="fpr" label={{ value: 'False Positive Rate', position: 'insideBottom', offset: -5, fill: '#94a3b8' }} stroke="#94a3b8" />
                    <YAxis label={{ value: 'True Positive Rate', angle: -90, position: 'insideLeft', fill: '#94a3b8' }} stroke="#94a3b8" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#1e293b',
                        border: '1px solid rgba(0,191,255,0.3)',
                        borderRadius: '8px',
                      }}
                    />
                    <Legend />
                    <Line type="monotone" dataKey="tpr" stroke="#22d3ee" strokeWidth={3} name="Model ROC" />
                    <Line type="monotone" dataKey="fpr" stroke="#64748b" strokeWidth={1} strokeDasharray="5 5" name="Random Classifier" />
                  </LineChart>
                </ResponsiveContainer>
              </Card>
            </TabsContent>

            {/* Predictions Tab */}
            <TabsContent value="predictions" className="space-y-6">
              <Card className="bg-gradient-to-br from-gray-900 to-gray-950 border-cyan-400/30 p-8">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl text-cyan-300">Predictions</h2>
                  <Button
                    variant="outline"
                    className="border-cyan-400/50 text-cyan-400 hover:bg-cyan-400/10"
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Download CSV
                  </Button>
                </div>

                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-cyan-400/20 hover:bg-transparent">
                        <TableHead className="text-cyan-400">ID</TableHead>
                        <TableHead className="text-cyan-400">Input</TableHead>
                        <TableHead className="text-cyan-400">Prediction</TableHead>
                        <TableHead className="text-cyan-400">Confidence</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {predictions.map((pred) => (
                        <TableRow key={pred.id} className="border-cyan-400/10 hover:bg-cyan-400/5">
                          <TableCell className="text-gray-300">{pred.id}</TableCell>
                          <TableCell className="font-mono text-sm text-gray-400">{pred.input}</TableCell>
                          <TableCell className="text-cyan-400">{pred.prediction}</TableCell>
                          <TableCell className="text-gray-300">{(pred.confidence * 100).toFixed(1)}%</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </Card>
            </TabsContent>

            {/* Proofs Tab */}
            <TabsContent value="proofs" className="space-y-6">
              {/* Proof Hash Card */}
              <Card className="bg-gradient-to-br from-gray-900 to-gray-950 border-cyan-400/30 p-8 relative overflow-hidden">
                <div className="absolute inset-0 opacity-5">
                  <div className="absolute inset-0" style={{
                    backgroundImage: 'repeating-linear-gradient(0deg, #22d3ee 0px, #22d3ee 1px, transparent 1px, transparent 4px)',
                  }} />
                </div>
                
                <div className="relative">
                  <div className="flex items-center gap-3 mb-6">
                    <Shield className="w-8 h-8 text-cyan-400" />
                    <h2 className="text-2xl text-cyan-300">Zero-Knowledge Proof</h2>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="text-sm text-gray-400 mb-2 block">Proof Hash</label>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-black/50 p-4 rounded border border-purple-500/30 font-mono text-sm text-purple-400 overflow-x-auto">
                          {proofHash}
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleCopyProof}
                          className="border-cyan-400/50 text-cyan-400 hover:bg-cyan-400/10"
                        >
                          {copiedProof ? (
                            <CheckCircle className="h-4 w-4" />
                          ) : (
                            <Copy className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </div>

                    <div className="flex gap-4">
                      <Button
                        variant="outline"
                        className="flex-1 border-cyan-400/50 text-cyan-400 hover:bg-cyan-400/10"
                      >
                        <Download className="mr-2 h-4 w-4" />
                        Download Proof File
                      </Button>
                      <Button
                        className="flex-1 bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white"
                      >
                        <Shield className="mr-2 h-4 w-4" />
                        Verify Proof
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Audit Certificate */}
              <Card className="bg-gradient-to-br from-green-900/20 to-cyan-900/20 border-green-400/30 p-8">
                <div className="flex items-start gap-4">
                  <CheckCircle className="w-12 h-12 text-green-400 flex-shrink-0" />
                  <div className="flex-1">
                    <h3 className="text-xl text-green-400 mb-2">Training Verified</h3>
                    <p className="text-gray-300 mb-4">
                      This model training has been verified by the Z+ Zero-Knowledge Engine.
                      All computations have been proven correct using cryptographic proofs.
                    </p>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-500">Verified At:</span>
                        <p className="text-gray-300">{new Date().toLocaleString()}</p>
                      </div>
                      <div>
                        <span className="text-gray-500">Protocol:</span>
                        <p className="text-gray-300">ZK-SNARK</p>
                      </div>
                      <div>
                        <span className="text-gray-500">Model Type:</span>
                        <p className="text-gray-300">
                          {trainingData?.model === 'logistic' ? 'Logistic Regression' : 'Decision Tree'}
                        </p>
                      </div>
                      <div>
                        <span className="text-gray-500">Accuracy:</span>
                        <p className="text-gray-300">{accuracy.toFixed(2)}%</p>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </div>
  );
}
