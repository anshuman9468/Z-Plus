import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Sparkles, Shield, Upload, Brain, CheckCircle, Lock } from 'lucide-react';
import { Button } from './ui/button';

interface LandingPageProps {
  onTryDemo: () => void;
  onLogin: () => void;
}

export function LandingPage({ onTryDemo, onLogin }: LandingPageProps) {
  const [showIntro, setShowIntro] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setShowIntro(false), 3000);
    return () => clearTimeout(timer);
  }, []);

  if (showIntro) {
    return (
      <motion.div
        className="fixed inset-0 bg-[#0a0a0f] flex items-center justify-center z-50"
        initial={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 1 }}
      >
        <div className="relative">
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.5 }}
            className="text-center"
          >
            <div className="relative inline-block">
              <motion.div
                className="text-[12rem] bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 bg-clip-text text-transparent"
                animate={{
                  filter: ['drop-shadow(0 0 20px rgba(0,191,255,0.3))', 'drop-shadow(0 0 40px rgba(0,191,255,0.6))', 'drop-shadow(0 0 20px rgba(0,191,255,0.3))']
                }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                Z+
              </motion.div>
              <motion.div
                className="absolute -inset-4 bg-gradient-to-r from-cyan-400/20 via-blue-500/20 to-purple-600/20 blur-xl"
                animate={{ opacity: [0.3, 0.6, 0.3] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
            </div>
            <motion.p
              className="mt-8 text-2xl text-gray-300"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1, duration: 1 }}
            >
              Verifiable AI, Zero Knowledge Required
            </motion.p>
          </motion.div>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          {[...Array(50)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-cyan-400 rounded-full"
              initial={{
                x: Math.random() * window.innerWidth,
                y: Math.random() * window.innerHeight,
              }}
              animate={{
                y: [null, Math.random() * window.innerHeight],
                opacity: [0.2, 0.8, 0.2],
              }}
              transition={{
                duration: Math.random() * 10 + 10,
                repeat: Infinity,
                ease: 'linear',
              }}
            />
          ))}
        </div>
      </div>

      {/* Navigation */}
      <nav className="relative z-10 container mx-auto px-6 py-6 flex justify-between items-center">
        <motion.div
          className="text-3xl bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent"
          whileHover={{ scale: 1.05 }}
        >
          Z+
        </motion.div>
        <Button variant="outline" onClick={onLogin} className="border-cyan-400/50 text-cyan-400 hover:bg-cyan-400/10">
          Sign In
        </Button>
      </nav>

      {/* Hero Section */}
      <section className="relative z-10 container mx-auto px-6 py-24 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h1 className="text-6xl mb-6 bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 bg-clip-text text-transparent">
            Z+ — Verifiable AI, Zero Knowledge Required.
          </h1>
          <p className="text-xl text-gray-400 mb-12 max-w-2xl mx-auto">
            Train models privately. Prove it mathematically.
          </p>
          <div className="flex gap-4 justify-center">
            <Button
              onClick={onTryDemo}
              className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white px-8 py-6 text-lg shadow-[0_0_30px_rgba(0,191,255,0.3)]"
            >
              <Sparkles className="mr-2 h-5 w-5" />
              Try Demo
            </Button>
            <Button
              variant="outline"
              className="border-cyan-400/50 text-cyan-400 hover:bg-cyan-400/10 px-8 py-6 text-lg"
            >
              Learn More
            </Button>
          </div>
        </motion.div>

        {/* Floating illustration */}
        <motion.div
          className="mt-16 relative max-w-md mx-auto"
          animate={{
            y: [0, -10, 0],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        >
          <div className="relative">
            <Shield className="w-64 h-64 mx-auto text-cyan-400/30" />
            <Brain className="w-32 h-32 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-blue-500" />
            <Lock className="w-16 h-16 absolute bottom-8 right-8 text-purple-500" />
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-400/10 via-blue-500/10 to-purple-600/10 blur-3xl" />
          </div>
        </motion.div>
      </section>

      {/* How It Works Section */}
      <section className="relative z-10 container mx-auto px-6 py-24">
        <h2 className="text-4xl text-center mb-16 text-cyan-400">How It Works</h2>
        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {[
            {
              icon: Upload,
              title: 'Upload Securely',
              description: 'Your data never leaves your device. Everything runs in your browser.',
            },
            {
              icon: Brain,
              title: 'Train Privately',
              description: 'AI models train on your data with zero-knowledge cryptography.',
            },
            {
              icon: CheckCircle,
              title: 'Verify with Proof',
              description: 'Get mathematical proof that training was done correctly.',
            },
          ].map((step, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.2, duration: 0.6 }}
              whileHover={{ scale: 1.05, y: -5 }}
              className="relative group"
            >
              <div className="bg-gradient-to-br from-cyan-900/20 to-blue-900/20 border border-cyan-400/30 rounded-lg p-8 h-full hover:border-cyan-400/60 transition-all">
                <div className="bg-gradient-to-br from-cyan-500/20 to-blue-500/20 w-16 h-16 rounded-lg flex items-center justify-center mb-6 group-hover:shadow-[0_0_20px_rgba(0,191,255,0.4)] transition-all">
                  <step.icon className="w-8 h-8 text-cyan-400" />
                </div>
                <h3 className="text-xl mb-4 text-cyan-300">{step.title}</h3>
                <p className="text-gray-400">{step.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Demo Preview Section */}
      <section className="relative z-10 container mx-auto px-6 py-24">
        <h2 className="text-4xl text-center mb-16 text-cyan-400">Quick Demo Preview</h2>
        <motion.div
          className="max-w-3xl mx-auto bg-gradient-to-br from-cyan-900/20 to-blue-900/20 border border-cyan-400/30 rounded-lg p-8"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
        >
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-cyan-500/20 flex items-center justify-center">
                <Upload className="w-6 h-6 text-cyan-400" />
              </div>
              <div className="flex-1">
                <div className="text-sm text-gray-400 mb-2">Step 1: Upload Dataset</div>
                <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-cyan-500 to-blue-600"
                    initial={{ width: 0 }}
                    animate={{ width: '100%' }}
                    transition={{ duration: 1.5, delay: 0.5 }}
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center">
                <Brain className="w-6 h-6 text-blue-400" />
              </div>
              <div className="flex-1">
                <div className="text-sm text-gray-400 mb-2">Step 2: Training Model</div>
                <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-blue-500 to-purple-600"
                    initial={{ width: 0 }}
                    animate={{ width: '100%' }}
                    transition={{ duration: 1.5, delay: 2 }}
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-purple-500/20 flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-purple-400" />
              </div>
              <div className="flex-1">
                <div className="text-sm text-gray-400 mb-2">Step 3: Generate Proof</div>
                <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-purple-500 to-pink-600"
                    initial={{ width: 0 }}
                    animate={{ width: '100%' }}
                    transition={{ duration: 1.5, delay: 3.5 }}
                  />
                </div>
              </div>
            </div>

            <motion.div
              className="mt-8 p-4 bg-gray-900/50 rounded border border-purple-500/30"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 5 }}
            >
              <div className="text-xs text-gray-500 mb-1">Proof Hash Generated:</div>
              <div className="font-mono text-sm text-purple-400">
                0x8f3a9b2c7d5e1f6a4b8c9d2e3f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3
              </div>
            </motion.div>
          </div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-cyan-400/20 py-12">
        <div className="container mx-auto px-6">
          <div className="text-center">
            <p className="text-gray-500 mb-4">
              Built by Team Ragers Hack for Math-a-thon 2025.
            </p>
            <div className="flex gap-6 justify-center text-sm text-gray-400">
              <a href="#" className="hover:text-cyan-400 transition-colors">About</a>
              <a href="#" className="hover:text-cyan-400 transition-colors">Docs</a>
              <a href="#" className="hover:text-cyan-400 transition-colors">GitHub</a>
              <a href="#" className="hover:text-cyan-400 transition-colors">LinkedIn</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}