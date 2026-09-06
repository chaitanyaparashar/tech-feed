'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { motion, AnimatePresence } from 'framer-motion';
import { X, User, Sparkles, Check, RefreshCw } from 'lucide-react';

export const ProfileModal: React.FC = () => {
  const { isProfileOpen, setIsProfileOpen, user, updateProfile, setIsOnboardingOpen } = useApp();

  const [displayName, setDisplayName] = useState(user?.display_name || '');
  const [username, setUsername] = useState(user?.username || '');

  if (!isProfileOpen || !user) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile({
      display_name: displayName.trim(),
      username: username.trim(),
    });
    setIsProfileOpen(false);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="w-full max-w-md rounded-[14px] border border-white/10 bg-[#18181B] p-6 shadow-2xl space-y-5"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-900/50 text-purple-300">
                <User className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold text-[#FAFAFA]">Manage Profile</h3>
            </div>
            <button
              onClick={() => setIsProfileOpen(false)}
              className="flex h-7 w-7 items-center justify-center rounded-lg text-[#A1A1AA] hover:bg-white/10 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Current Avatar Concept Banner */}
          <div className="flex items-center justify-between p-3.5 rounded-[14px] bg-[#09090B] border border-purple-500/20">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-purple-700 to-indigo-600 font-bold text-white shadow-purple-sm">
                {user.display_name?.charAt(0).toUpperCase() || 'A'}
              </div>
              <div>
                <p className="text-xs font-bold text-[#FAFAFA]">
                  {user.avatar_concept || 'Standard Avatar'}
                </p>
                <p className="text-[11px] text-purple-400">
                  {user.interests.length} Interests Selected
                </p>
              </div>
            </div>
            <button
              onClick={() => {
                setIsProfileOpen(false);
                setIsOnboardingOpen(true);
              }}
              className="flex items-center gap-1 text-[11px] font-semibold text-purple-300 hover:text-white bg-purple-950/60 border border-purple-500/30 px-2.5 py-1 rounded-lg"
            >
              <RefreshCw className="w-3 h-3" />
              <span>Regenerate</span>
            </button>
          </div>

          {/* Form Fields */}
          <form onSubmit={handleSave} className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-[#A1A1AA]">Display Name</label>
              <input
                type="text"
                required
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="w-full rounded-[14px] border border-white/10 bg-[#09090B] px-3 py-2 text-xs text-[#FAFAFA] focus:border-purple-500 focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-[#A1A1AA]">Username</label>
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full rounded-[14px] border border-white/10 bg-[#09090B] px-3 py-2 text-xs text-[#FAFAFA] focus:border-purple-500 focus:outline-none"
              />
            </div>

            {/* Selected Interests tags */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[#A1A1AA]">Selected Interests</label>
              <div className="flex flex-wrap gap-1.5">
                {user.interests.map((interest) => (
                  <span
                    key={interest}
                    className="inline-flex items-center gap-1 rounded-full bg-purple-950/40 border border-purple-500/30 px-2.5 py-0.5 text-[11px] text-purple-300 font-medium"
                  >
                    <Sparkles className="w-3 h-3 text-purple-400" />
                    {interest}
                  </span>
                ))}
              </div>
            </div>

            {/* Footer buttons */}
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-white/10">
              <button
                type="button"
                onClick={() => setIsProfileOpen(false)}
                className="rounded-[14px] border border-white/10 bg-white/5 px-4 py-2 text-xs font-medium text-[#A1A1AA]"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex items-center gap-1.5 rounded-[14px] bg-[#7C3AED] px-5 py-2 text-xs font-semibold text-white shadow-purple hover:bg-[#8B5CF6]"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Save Profile</span>
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
