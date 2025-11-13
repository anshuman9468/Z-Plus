import { useState } from 'react';
import { motion } from 'motion/react';
import { Sidebar } from './sidebar';
import { Shield, Upload, CheckCircle, XCircle, AlertCircle, FileCheck, Copy } from 'lucide-react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { Input } from './ui/input';

type Page = 'landing' | 'dashboard' | 'progress' | 'results' | 'history' | 'insights' | 'verifier';

interface ZKVerifierProps {
  onNavigate: (page: Page) => void;
}

export function ZKVerifier({ onNavigate }: ZKVerifierProps) {
  const [proofHash, setProofHash] = useState('');
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [verificationStatus, setVerificationStatus] = useState<'idle' | 'verifying' | 'valid' | 'invalid'>('idle');
  const [verificationDetails, setVerificationDetails] = useState<any>(null);

  const handleVerifyHash = () => {
    setVerificationStatus('verifying');
    
    // Simulate verification process
    setTimeout(() => {
      const isValid = proofHash.startsWith('0x') && proofHash.length === 66;
      setVerificationStatus(isValid ? 'valid' : 'invalid');
      
      if (isValid) {
        setVerificationDetails({
          proofHash: proofHash,
          protocol: 'ZK-SNARK',
          timestamp: new Date().toISOString(),
          modelType: 'Logistic Regression',
          accuracy: 94.5,
          verifiedBy: 'Z+ Zero-Knowledge Engine',
          blockHeight: 1234567,
        });
      }
    }, 2000);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setProofFile(e.target.files[0]);
      setVerificationStatus('verifying');
      
      // Simulate verification process
      setTimeout(() => {
        setVerificationStatus('valid');
        setVerificationDetails({
          fileName: e.target.files![0].name,
          protocol: 'ZK-SNARK',
          timestamp: new Date().toISOString(),
          modelType: 'Decision Tree',
          accuracy: 91.2,
          verifiedBy: 'Z+ Zero-Knowledge Engine',
          blockHeight: 1234568,
        });
      }, 2000);
    }
  };

  const recentVerifications = [
    {
      id: 1,
      proofHash: '0x8f3a9b2c7d5e...2f3',
      timestamp: '2025-11-08 14:23:15',
      status: 'verified',
      model: 'Logistic Regression',
    },
    {
      id: 2,
      proofHash: '0x7e2b8a1c6d4f...1e2',
      timestamp: '2025-11-08 12:15:42',
      status: 'verified',
      model: 'Decision Tree',
    },
    {
      id: 3,
      proofHash: '0x6d1a9b0c5e3f...0d1',
      timestamp: '2025-11-07 18:45:33',
      status: 'verified',
      model: 'Logistic Regression',
    },
  ];

  return (
    <div className="flex min-h-screen">
      <Sidebar currentPage="verifier" onNavigate={onNavigate} />
      
      <div className="flex-1 p-8 overflow-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex items-center gap-3 mb-8">
            <Shield className="w-10 h-10 text-cyan-400" />
            <div>
              <h1 className="text-4xl text-cyan-400">ZK Proof Verifier</h1>
              <p className="text-gray-400">Verify zero-knowledge proofs from training sessions</p>
            </div>
          </div>

          <div className="grid lg:grid-cols-2 gap-8 mb-8">
            {/* Verify by Hash */}
            <Card className="bg-gradient-to-br from-gray-900 to-gray-950 border-cyan-400/30 p-8">
              <div className="flex items-center gap-3 mb-6">
                <FileCheck className="w-6 h-6 text-cyan-400" />
                <h2 className="text-2xl text-cyan-300">Verify by Proof Hash</h2>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="text-sm text-gray-400 mb-2 block">
                    Enter Proof Hash
                  </label>
                  <Textarea
                    placeholder="0x..."
                    value={proofHash}
                    onChange={(e) => setProofHash(e.target.value)}
                    className="bg-gray-900/50 border-cyan-400/30 text-white focus:border-cyan-400 font-mono text-sm min-h-[120px]"
                  />
                </div>

                <Button
                  onClick={handleVerifyHash}
                  disabled={!proofHash || verificationStatus === 'verifying'}
                  className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white disabled:opacity-50"
                >
                  {verificationStatus === 'verifying' ? (
                    <>
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                        className="w-5 h-5 border-2 border-white border-t-transparent rounded-full mr-2"
                      />
                      Verifying...
                    </>
                  ) : (
                    <>
                      <Shield className="mr-2 h-4 w-4" />
                      Verify Proof
                    </>
                  )}
                </Button>
              </div>
            </Card>

            {/* Verify by File Upload */}
            <Card className="bg-gradient-to-br from-gray-900 to-gray-950 border-cyan-400/30 p-8">
              <div className="flex items-center gap-3 mb-6">
                <Upload className="w-6 h-6 text-cyan-400" />
                <h2 className="text-2xl text-cyan-300">Verify by Proof File</h2>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="text-sm text-gray-400 mb-2 block">
                    Upload Proof File (.json, .proof)
                  </label>
                  <label htmlFor="proof-file-upload" className="block relative">
                    <div className="border-2 border-dashed border-cyan-400/30 rounded-lg p-8 text-center hover:border-cyan-400/60 transition-all cursor-pointer">
                      <Upload className="w-12 h-12 mx-auto mb-3 text-cyan-400" />
                      <p className="text-gray-300 mb-2">
                        {proofFile ? proofFile.name : 'Click to upload proof file'}
                      </p>
                      <p className="text-xs text-gray-500">or drag and drop</p>
                    </div>
                    <Input
                      type="file"
                      accept=".json,.proof"
                      onChange={handleFileUpload}
                      className="hidden"
                      id="proof-file-upload"
                    />
                  </label>
                </div>

                {proofFile && (
                  <div className="p-4 bg-gray-800/50 rounded-lg border border-cyan-400/20">
                    <div className="flex items-center gap-3">
                      <FileCheck className="w-5 h-5 text-cyan-400" />
                      <div className="flex-1">
                        <p className="text-sm text-gray-300">{proofFile.name}</p>
                        <p className="text-xs text-gray-500">
                          {(proofFile.size / 1024).toFixed(2)} KB
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </Card>
          </div>

          {/* Verification Result */}
          {verificationStatus !== 'idle' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-8"
            >
              <Card className={`border-2 p-8 ${
                verificationStatus === 'valid'
                  ? 'bg-gradient-to-br from-green-900/20 to-cyan-900/20 border-green-400/30'
                  : verificationStatus === 'invalid'
                  ? 'bg-gradient-to-br from-red-900/20 to-orange-900/20 border-red-400/30'
                  : 'bg-gradient-to-br from-gray-900 to-gray-950 border-cyan-400/30'
              }`}>
                <div className="flex items-start gap-4">
                  {verificationStatus === 'verifying' && (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    >
                      <AlertCircle className="w-12 h-12 text-cyan-400" />
                    </motion.div>
                  )}
                  {verificationStatus === 'valid' && (
                    <CheckCircle className="w-12 h-12 text-green-400" />
                  )}
                  {verificationStatus === 'invalid' && (
                    <XCircle className="w-12 h-12 text-red-400" />
                  )}
                  
                  <div className="flex-1">
                    <h3 className={`text-2xl mb-2 ${
                      verificationStatus === 'valid' ? 'text-green-400' :
                      verificationStatus === 'invalid' ? 'text-red-400' :
                      'text-cyan-400'
                    }`}>
                      {verificationStatus === 'verifying' && 'Verifying Proof...'}
                      {verificationStatus === 'valid' && 'Proof Verified ✓'}
                      {verificationStatus === 'invalid' && 'Proof Invalid ✗'}
                    </h3>
                    
                    {verificationStatus === 'verifying' && (
                      <p className="text-gray-400">
                        Checking cryptographic proof against the blockchain...
                      </p>
                    )}
                    
                    {verificationStatus === 'valid' && verificationDetails && (
                      <div className="space-y-4 mt-4">
                        <p className="text-gray-300">
                          This proof has been successfully verified using the Z+ Zero-Knowledge Engine.
                        </p>
                        
                        <div className="grid md:grid-cols-2 gap-4">
                          <div className="bg-black/30 p-4 rounded-lg">
                            <p className="text-xs text-gray-500 mb-1">Protocol</p>
                            <p className="text-sm text-green-400">{verificationDetails.protocol}</p>
                          </div>
                          <div className="bg-black/30 p-4 rounded-lg">
                            <p className="text-xs text-gray-500 mb-1">Timestamp</p>
                            <p className="text-sm text-green-400">
                              {new Date(verificationDetails.timestamp).toLocaleString()}
                            </p>
                          </div>
                          <div className="bg-black/30 p-4 rounded-lg">
                            <p className="text-xs text-gray-500 mb-1">Model Type</p>
                            <p className="text-sm text-green-400">{verificationDetails.modelType}</p>
                          </div>
                          <div className="bg-black/30 p-4 rounded-lg">
                            <p className="text-xs text-gray-500 mb-1">Accuracy</p>
                            <p className="text-sm text-green-400">{verificationDetails.accuracy}%</p>
                          </div>
                        </div>

                        {verificationDetails.proofHash && (
                          <div className="bg-black/30 p-4 rounded-lg">
                            <div className="flex items-center justify-between mb-2">
                              <p className="text-xs text-gray-500">Proof Hash</p>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => navigator.clipboard.writeText(verificationDetails.proofHash)}
                                className="text-green-400 hover:text-green-300"
                              >
                                <Copy className="w-4 h-4" />
                              </Button>
                            </div>
                            <p className="text-sm text-green-400 font-mono break-all">
                              {verificationDetails.proofHash}
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                    
                    {verificationStatus === 'invalid' && (
                      <p className="text-gray-400">
                        This proof could not be verified. Please check the proof hash or file and try again.
                      </p>
                    )}
                  </div>
                </div>
              </Card>
            </motion.div>
          )}

          {/* Recent Verifications */}
          <div>
            <h2 className="text-2xl mb-6 text-cyan-300">Recent Verifications</h2>
            <Card className="bg-gradient-to-br from-gray-900 to-gray-950 border-cyan-400/30 p-8">
              <div className="space-y-4">
                {recentVerifications.map((verification, index) => (
                  <motion.div
                    key={verification.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center justify-between p-4 bg-gray-800/50 rounded-lg border border-cyan-400/20 hover:border-cyan-400/40 transition-all"
                  >
                    <div className="flex items-center gap-4">
                      <CheckCircle className="w-6 h-6 text-green-400" />
                      <div>
                        <p className="text-sm text-gray-300 font-mono">{verification.proofHash}</p>
                        <p className="text-xs text-gray-500">{verification.timestamp}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-sm text-cyan-400">{verification.model}</p>
                        <p className="text-xs text-green-400">{verification.status}</p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-cyan-400 hover:text-cyan-300 hover:bg-cyan-400/10"
                      >
                        <Shield className="w-4 h-4" />
                      </Button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </Card>
          </div>
        </motion.div>
      </div>
    </div>
  );
}