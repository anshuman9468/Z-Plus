import { motion } from 'motion/react';
import { X, Mail, Lock, Shield } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { useState } from 'react';

interface AuthModalProps {
  onClose: () => void;
  onAuth: () => void;
}

export function AuthModal({ onClose, onAuth }: AuthModalProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAuth();
  };

  return (
    <motion.div
      className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="bg-gradient-to-br from-gray-900 to-gray-950 border border-cyan-400/30 rounded-lg p-8 max-w-md w-full relative overflow-hidden"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Lock and shield icon */}
        <div className="flex justify-center mb-6">
          <div className="relative">
            <Shield className="w-16 h-16 text-cyan-400/30" />
            <Lock className="w-8 h-8 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-cyan-400" />
          </div>
        </div>

        <h2 className="text-2xl text-center mb-2 text-cyan-400">Welcome to Z+</h2>
        <p className="text-center text-gray-400 mb-8">Sign in to start secure AI training</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* USERNAME FIELD */}
          <div>
            <label className="text-sm text-gray-400 mb-2 block">Username</label>
            <div className="relative">
              <Mail className="w-5 h-5 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <Input
                type="text"
                placeholder="your_username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="pl-10 bg-gray-900/50 border-cyan-400/30 text-white focus:border-cyan-400"
              />
            </div>
          </div>

          {/* PASSWORD FIELD */}
          <div>
            <label className="text-sm text-gray-400 mb-2 block">Password</label>
            <div className="relative">
              <Lock className="w-5 h-5 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <Input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-10 bg-gray-900/50 border-cyan-400/30 text-white focus:border-cyan-400"
              />
            </div>
          </div>

          {/* LOGIN BUTTON */}
          <Button
            type="submit"
            className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white shadow-[0_0_20px_rgba(0,191,255,0.3)]"
          >
            Continue
          </Button>
        </form>

        {/* CREATE ACCOUNT BUTTON */}
        <Button
          variant="outline"
          className="w-full mt-4 border-cyan-400/30 text-gray-300 hover:bg-cyan-400/10"
          onClick={() => alert('Create Account Clicked')}
        >
          Create New Account
        </Button>

        <p className="text-center text-xs text-gray-500 mt-6">
          Your data never leaves your device.
        </p>
      </motion.div>
    </motion.div>
  );
}