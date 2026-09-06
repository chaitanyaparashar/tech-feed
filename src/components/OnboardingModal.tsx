'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { AVAILABLE_INTERESTS } from '@/data/mockData';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Check, ArrowRight, UserCheck, ShieldCheck } from 'lucide-react';

export const OnboardingModal: React.FC = () => {
  const { isOnboardingOpen, completeOnboarding, getAvatarPreset, user } = useApp();

  const [step, setStep] = useState<1 | 2>(1); // Step 1: Choose Interests, Step 2: Avatar Preview & Finish
  const [selectedInterests, setSelectedInterests] = useState<string[]>(
    user?.interests && user.interests.length > 0 ? user.interests : ['Cyberpunk', 'Sci-Fi']
  );
  const [displayName, setDisplayName] = useState(user?.display_name || '');

  if (!isOnboardingOpen) return null;

  const toggleInterest = (interest: string) => {
    if (selectedInterests.includes(interest)) {
      setSelectedInterests(selectedInterests.filter((i) => i !== interest));
    } else {
      setSelectedInterests([...selectedInterests, interest]);
    }
  };

  const avatarPreset = getAvatarPreset(selectedInterests);

  const handleFinish = () => {
    completeOnboarding(selectedInterests, displayName);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="w-full max-w-lg rounded-[14px] border border-purple-500/30 bg-[#18181B] p-6 shadow-purple shadow-2xl space-y-6"
        >
          {/* Header Step Indicator */}
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#7C3AED] text-white">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-base font-bold text-[#FAFAFA]">Welcome to AI Product Buzz Feed</h3>
                <p className="text-xs text-[#A1A1AA]">
                  {step === 1 ? 'Step 1 of 2: Choose Your Interests' : 'Step 2 of 2: Avatar Concept & Profile'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <div className={`h-2 w-6 rounded-full ${step === 1 ? 'bg-[#7C3AED]' : 'bg-white/20'}`} />
              <div className={`h-2 w-6 rounded-full ${step === 2 ? 'bg-[#7C3AED]' : 'bg-white/20'}`} />
            </div>
          </div>

          {step === 1 ? (
            /* Step 1: Choose Interests */
            <div className="space-y-4">
              <p className="text-xs text-[#A1A1AA]">
                Select your favorite topics to personalize your AI discovery feed and generate your custom non-copyrighted avatar.
              </p>

              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 max-h-60 overflow-y-auto pr-1">
                {AVAILABLE_INTERESTS.map((interest) => {
                  const isSelected = selectedInterests.includes(interest);
                  return (
                    <button
                      key={interest}
                      onClick={() => toggleInterest(interest)}
                      className={`flex items-center justify-between p-2 rounded-[12px] text-xs font-semibold border transition-all ${
                        isSelected
                          ? 'border-purple-500 bg-purple-950/40 text-purple-200 shadow-purple-sm'
                          : 'border-white/5 bg-[#09090B] text-[#A1A1AA] hover:border-white/20'
                      }`}
                    >
                      <span className="truncate">{interest}</span>
                      {isSelected && <Check className="w-3 h-3 text-purple-400 shrink-0" />}
                    </button>
                  );
                })}
              </div>

              <div className="pt-4 border-t border-white/10 flex justify-end">
                <button
                  disabled={selectedInterests.length === 0}
                  onClick={() => setStep(2)}
                  className="flex items-center gap-1.5 rounded-[14px] bg-[#7C3AED] px-5 py-2 text-xs font-semibold text-white shadow-purple hover:bg-[#8B5CF6] disabled:opacity-50 transition-all"
                >
                  <span>Generate Avatar Concept</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ) : (
            /* Step 2: Avatar Preview & Finish */
            <div className="space-y-5">
              <div className="flex flex-col items-center justify-center p-6 rounded-[14px] bg-[#09090B] border border-purple-500/30 text-center space-y-3">
                {/* Generated Avatar Concept Sphere */}
                <div
                  className={`flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br ${avatarPreset.themeColor} text-white shadow-purple font-bold text-2xl border-2 border-purple-400/50`}
                >
                  <Sparkles className="w-10 h-10 text-white animate-pulse" />
                </div>

                <div>
                  <span className="inline-block rounded-full bg-purple-950/80 border border-purple-500/40 px-3 py-0.5 text-[11px] font-bold text-purple-300 mb-1">
                    {avatarPreset.badge} Concept
                  </span>
                  <h4 className="text-base font-bold text-[#FAFAFA]">{avatarPreset.concept}</h4>
                  <p className="text-xs text-[#A1A1AA] mt-0.5">{avatarPreset.description}</p>
                </div>

                <div className="flex items-center gap-1 text-[11px] text-emerald-400 bg-emerald-950/30 border border-emerald-500/20 px-2.5 py-1 rounded-full">
                  <ShieldCheck className="w-3 h-3" />
                  <span>100% Original & Copyright-Safe Avatar</span>
                </div>
              </div>

              {/* Display Name Input */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-[#A1A1AA]">Display Name</label>
                <input
                  type="text"
                  placeholder="e.g. Alex Rivera"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="w-full rounded-[14px] border border-white/10 bg-[#09090B] px-3.5 py-2 text-xs text-[#FAFAFA] placeholder-[#A1A1AA] focus:border-purple-500 focus:outline-none"
                />
              </div>

              <div className="pt-2 border-t border-white/10 flex items-center justify-between">
                <button
                  onClick={() => setStep(1)}
                  className="rounded-[14px] border border-white/10 bg-white/5 px-4 py-2 text-xs font-medium text-[#A1A1AA]"
                >
                  Back to Interests
                </button>
                <button
                  onClick={handleFinish}
                  className="flex items-center gap-1.5 rounded-[14px] bg-[#7C3AED] px-5 py-2 text-xs font-semibold text-white shadow-purple hover:bg-[#8B5CF6]"
                >
                  <UserCheck className="w-3.5 h-3.5" />
                  <span>Finish & Launch Dashboard</span>
                </button>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
