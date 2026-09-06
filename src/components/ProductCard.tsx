'use client';

import React from 'react';
import { Product } from '@/types/database';
import { useApp } from '@/context/AppContext';
import { motion } from 'framer-motion';
import { Flame, Heart, Bookmark, ExternalLink, MessageSquare, ThumbsUp, Newspaper } from 'lucide-react';

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const {
    likedProductIds,
    toggleLike,
    setSaveModalTargetProduct,
    isProductSavedInAnyDrawer,
    getDrawersForProduct,
    drawers,
  } = useApp();

  const isLiked = likedProductIds.has(product.id);
  const isSaved = isProductSavedInAnyDrawer(product.id);
  const savedDrawerIds = getDrawersForProduct(product.id);
  const savedDrawerNames = drawers
    .filter((d) => savedDrawerIds.includes(d.id))
    .map((d) => d.name);

  // Source badges
  const getSourceBadge = (source: Product['source']) => {
    switch (source) {
      case 'hacker_news':
        return {
          label: 'Hacker News',
          className: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
        };
      case 'product_hunt':
        return {
          label: 'Product Hunt',
          className: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
        };
      case 'tech_news':
      default:
        return {
          label: 'Tech News',
          className: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
        };
    }
  };

  const badge = getSourceBadge(product.source);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -3 }}
      transition={{ duration: 0.2 }}
      className="group relative flex flex-col justify-between rounded-[14px] border border-white/10 bg-[#18181B] p-5 shadow-lg hover:border-purple-500/40 hover:shadow-purple-sm transition-all"
    >
      <div>
        {/* Top Header: Source Badge + Buzz Score */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <span
            className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-semibold tracking-wide ${badge.className}`}
          >
            {badge.label}
          </span>

          <div className="flex items-center gap-1.5 rounded-full bg-purple-950/40 border border-purple-500/30 px-3 py-1 text-xs font-bold text-purple-300 shadow-inner">
            <Flame className="w-3.5 h-3.5 text-amber-400 fill-amber-400 animate-pulse" />
            <span>{product.buzz_score.toFixed(1)} Buzz</span>
          </div>
        </div>

        {/* Title & External Link */}
        <div className="flex items-start justify-between gap-2 mb-2">
          <h3 className="text-base font-bold text-[#FAFAFA] group-hover:text-purple-300 transition-colors line-clamp-1">
            {product.title}
          </h3>
          <a
            href={product.url}
            target="_blank"
            rel="noopener noreferrer"
            title="Visit launch link"
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-[#A1A1AA] hover:text-[#FAFAFA] hover:border-purple-500/40 transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>

        {/* Tagline */}
        <p className="text-xs leading-relaxed text-[#A1A1AA] mb-4 line-clamp-2">
          {product.tagline}
        </p>

        {/* Metrics Grid */}
        <div className="flex items-center gap-4 py-2 px-3 rounded-[10px] bg-[#09090B] border border-white/5 text-xs text-[#A1A1AA] mb-4">
          <div className="flex items-center gap-1.5" title="Votes">
            <ThumbsUp className="w-3.5 h-3.5 text-purple-400" />
            <span className="font-semibold text-[#FAFAFA]">{product.votes}</span>
          </div>
          <div className="flex items-center gap-1.5" title="Comments">
            <MessageSquare className="w-3.5 h-3.5 text-indigo-400" />
            <span className="font-semibold text-[#FAFAFA]">{product.comments}</span>
          </div>
          <div className="flex items-center gap-1.5" title="News Mentions">
            <Newspaper className="w-3.5 h-3.5 text-cyan-400" />
            <span className="font-semibold text-[#FAFAFA]">{product.news_mentions}</span>
          </div>
        </div>
      </div>

      {/* Card Actions Bottom Bar */}
      <div className="flex items-center justify-between pt-3 border-t border-white/5">
        {/* Like Button */}
        <motion.button
          whileTap={{ scale: 0.85 }}
          onClick={() => toggleLike(product.id)}
          className={`flex items-center gap-2 rounded-[14px] px-3 py-1.5 text-xs font-semibold transition-all ${
            isLiked
              ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40 shadow-sm'
              : 'bg-white/5 text-[#A1A1AA] border border-white/10 hover:text-rose-400 hover:border-rose-500/30 hover:bg-white/10'
          }`}
        >
          <motion.div
            animate={isLiked ? { scale: [1, 1.3, 1] } : { scale: 1 }}
            transition={{ duration: 0.25 }}
          >
            <Heart className={`w-4 h-4 ${isLiked ? 'fill-rose-500 text-rose-500' : ''}`} />
          </motion.div>
          <span>{isLiked ? 'Liked' : 'Like'}</span>
        </motion.button>

        {/* Save to Drawer Button */}
        <button
          onClick={() => setSaveModalTargetProduct(product)}
          className={`flex items-center gap-1.5 rounded-[14px] px-3 py-1.5 text-xs font-semibold transition-all ${
            isSaved
              ? 'bg-purple-900/40 text-purple-300 border border-purple-500/40'
              : 'bg-[#7C3AED] text-white shadow-purple-sm hover:bg-[#8B5CF6]'
          }`}
        >
          <Bookmark className={`w-3.5 h-3.5 ${isSaved ? 'fill-purple-400 text-purple-400' : ''}`} />
          <span>
            {isSaved
              ? `Saved (${savedDrawerNames.length})`
              : 'Save to Drawer'}
          </span>
        </button>
      </div>
    </motion.div>
  );
};
