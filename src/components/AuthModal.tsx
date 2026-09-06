'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Mail, Lock, Eye, EyeOff, Sparkles, AlertCircle } from 'lucide-react';

export const AuthModal: React.FC = () => {
  const { isAuthModalOpen, setIsAuthModalOpen, login, signup } = useApp();

  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isAuthModalOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!email.includes('@')) {
      setErrorMsg('Please enter a valid email address.');
      return;
    }
    if (password.length < 6) {
      setErrorMsg('Password must be at least 6 characters.');
      return;
    }

    setLoading(true);

    try {
      if (mode === 'login') {
        await login(email, password);
        setSuccessMsg('Signed in successfully!');
      } else {
        await signup(email, password);
        setSuccessMsg('Check your email and click the confirmation link, then sign in.');
      }
    } catch {
      setErrorMsg('Authentication failed. Please check credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="w-full max-w-sm rounded-[14px] border border-white/10 bg-[#18181B] p-6 shadow-2xl space-y-5"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-tr from-purple-700 to-indigo-600 shadow-purple-sm">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <h3 className="text-sm font-bold text-[#FAFAFA]">
                {mode === 'login' ? 'Sign In' : 'Create Account'}
              </h3>
            </div>
            <button
              onClick={() => setIsAuthModalOpen(false)}
              className="flex h-7 w-7 items-center justify-center rounded-lg text-[#A1A1AA] hover:bg-white/10 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {errorMsg && (
              <div className="flex items-center gap-2 rounded-[12px] bg-red-950/50 border border-red-500/30 p-3 text-xs text-red-300">
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {successMsg && (
              <div className="rounded-[12px] bg-emerald-950/50 border border-emerald-500/30 p-3 text-xs text-emerald-300">
                {successMsg}
              </div>
            )}

            {/* Email Field */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-[#A1A1AA]">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#A1A1AA]" />
                <input
                  type="email"
                  required
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-[14px] border border-white/10 bg-[#09090B] pl-9 pr-3 py-2 text-xs text-[#FAFAFA] placeholder-[#A1A1AA] focus:border-purple-500 focus:outline-none"
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-[#A1A1AA]">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#A1A1AA]" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-[14px] border border-white/10 bg-[#09090B] pl-9 pr-10 py-2 text-xs text-[#FAFAFA] placeholder-[#A1A1AA] focus:border-purple-500 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#A1A1AA] hover:text-white"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-[14px] bg-[#7C3AED] py-2.5 text-xs font-semibold text-white shadow-purple hover:bg-[#8B5CF6] transition-all disabled:opacity-50 mt-2"
            >
              {loading
                ? 'Processing...'
                : mode === 'login'
                ? 'Sign In'
                : 'Create Account & Continue'}
            </button>
          </form>

          {/* Mode Switcher */}
          <div className="pt-3 border-t border-white/10 text-center text-xs text-[#A1A1AA]">
            {mode === 'login' ? (
              <span>
                Don&apos;t have an account?{' '}
                <button
                  onClick={() => {
                    setMode('signup');
                    setErrorMsg('');
                  }}
                  className="font-semibold text-purple-400 hover:underline"
                >
                  Sign Up
                </button>
              </span>
            ) : (
              <span>
                Already have an account?{' '}
                <button
                  onClick={() => {
                    setMode('login');
                    setErrorMsg('');
                  }}
                  className="font-semibold text-purple-400 hover:underline"
                >
                  Sign In
                </button>
              </span>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
