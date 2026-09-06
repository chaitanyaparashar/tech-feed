'use client';

import React from 'react';
import { useApp } from '@/context/AppContext';
import { Sparkles, Github, ExternalLink } from 'lucide-react';

export const Footer: React.FC = () => {
  const { setIsFeedbackOpen } = useApp();

  return (
    <footer className="w-full border-t border-white/10 bg-[#09090B] py-8 text-xs text-[#A1A1AA]">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 sm:flex-row sm:px-6 lg:px-8">
        
        {/* App Name & Tagline */}
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-purple-400" />
          <span className="font-semibold text-[#FAFAFA]">AI Product Buzz Feed</span>
          <span className="text-white/20">·</span>
          <span>Track AI launches by buzz</span>
        </div>

        {/* Links */}
        <div className="flex items-center gap-6">
          <button
            onClick={() => setIsFeedbackOpen(true)}
            className="hover:text-purple-400 transition-colors"
          >
            Feedback
          </button>
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 hover:text-purple-400 transition-colors"
          >
            <Github className="h-3.5 w-3.5" />
            <span>GitHub</span>
            <ExternalLink className="h-2.5 w-2.5 opacity-60" />
          </a>
          <span className="text-white/20">|</span>
          <span>&copy; {new Date().getFullYear()} AI Product Buzz Feed</span>
        </div>
      </div>
    </footer>
  );
};
