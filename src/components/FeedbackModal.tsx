'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { FeedbackCategory } from '@/types/database';
import { motion, AnimatePresence } from 'framer-motion';
import { X, MessageSquarePlus, Star, Send } from 'lucide-react';

export const FeedbackModal: React.FC = () => {
  const { isFeedbackOpen, setIsFeedbackOpen, submitFeedback, user } = useApp();

  const [message, setMessage] = useState('');
  const [rating, setRating] = useState<number | undefined>(undefined);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [category, setCategory] = useState<FeedbackCategory>('general feedback');

  if (!isFeedbackOpen) return null;

  const categories: { id: FeedbackCategory; label: string }[] = [
    { id: 'general feedback', label: 'General Feedback' },
    { id: 'feature request', label: 'Feature Request' },
    { id: 'bug', label: 'Bug Report' },
    { id: 'product suggestion', label: 'Product Suggestion' },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;
    submitFeedback(message.trim(), rating, category);
    setMessage('');
    setRating(undefined);
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
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-900/50 text-purple-300">
                <MessageSquarePlus className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-[#FAFAFA]">Give Feedback</h3>
                <p className="text-xs text-[#A1A1AA]">
                  {user ? `Posting as @${user.username}` : 'Anonymous Feedback'}
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsFeedbackOpen(false)}
              className="flex h-7 w-7 items-center justify-center rounded-lg text-[#A1A1AA] hover:bg-white/10 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Category Selector */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[#A1A1AA]">Category</label>
              <div className="grid grid-cols-2 gap-2">
                {categories.map((cat) => {
                  const isSelected = category === cat.id;
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setCategory(cat.id)}
                      className={`rounded-[12px] p-2 text-left text-xs font-medium border transition-all ${
                        isSelected
                          ? 'border-purple-500 bg-purple-950/40 text-purple-200 shadow-purple-sm'
                          : 'border-white/5 bg-[#09090B] text-[#A1A1AA] hover:border-white/20'
                      }`}
                    >
                      {cat.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Rating Stars */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[#A1A1AA]">
                Rating <span className="font-normal text-white/40">(Optional)</span>
              </label>
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => {
                  const activeStar = (hoverRating || rating || 0) >= star;
                  return (
                    <button
                      key={star}
                      type="button"
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      onClick={() => setRating(rating === star ? undefined : star)}
                      className="p-1 text-amber-400 focus:outline-none transition-transform hover:scale-110"
                    >
                      <Star
                        className={`w-6 h-6 ${
                          activeStar ? 'fill-amber-400 text-amber-400' : 'text-white/20'
                        }`}
                      />
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Message Input */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[#A1A1AA]">Your Message</label>
              <textarea
                rows={4}
                required
                placeholder="Share your thoughts, suggestions, or bugs..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full rounded-[14px] border border-white/10 bg-[#09090B] p-3 text-xs text-[#FAFAFA] placeholder-[#A1A1AA] focus:border-purple-500 focus:outline-none transition-all resize-none"
              />
            </div>

            {/* Form Footer */}
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsFeedbackOpen(false)}
                className="rounded-[14px] border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold text-[#A1A1AA] hover:bg-white/10 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!message.trim()}
                className="flex items-center gap-1.5 rounded-[14px] bg-[#7C3AED] px-5 py-2 text-xs font-semibold text-white shadow-purple hover:bg-[#8B5CF6] disabled:opacity-50 transition-all"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Submit Feedback</span>
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
