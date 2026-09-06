'use client';

import React from 'react';
import { useApp } from '@/context/AppContext';
import { ProductCard } from './ProductCard';
import { Heart, Sparkles } from 'lucide-react';

export const LikeHistoryView: React.FC = () => {
  const { likeHistory, products, setActiveTab } = useApp();

  // Map like history items to products ordered newest first
  const likedProducts = likeHistory
    .map((like) => {
      const product = products.find((p) => p.id === like.product_id);
      return product ? { product, likedAt: like.created_at } : null;
    })
    .filter((item): item is { product: typeof products[0]; likedAt: string } => item !== null);

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="flex flex-col gap-2 rounded-[14px] border border-white/10 bg-[#18181B] p-6 shadow-xl relative overflow-hidden">
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-rose-950/60 border border-rose-500/30 text-rose-400">
            <Heart className="w-5 h-5 fill-rose-500" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-[#FAFAFA]">Like History</h1>
            <p className="text-xs text-[#A1A1AA]">
              Chronological log of AI tools and product launches you have upvoted and liked.
            </p>
          </div>
        </div>
      </div>

      {/* Grid of Liked Products */}
      {likedProducts.length > 0 ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {likedProducts.map(({ product, likedAt }) => (
            <div key={product.id} className="space-y-1">
              <div className="text-[10px] font-semibold text-rose-400/80 px-1 flex items-center gap-1">
                <Heart className="w-3 h-3 fill-rose-500" />
                <span>Liked {new Date(likedAt).toLocaleDateString()}</span>
              </div>
              <ProductCard product={product} />
            </div>
          ))}
        </div>
      ) : (
        /* Empty State */
        <div className="flex flex-col items-center justify-center rounded-[14px] border border-dashed border-white/10 bg-[#18181B] py-16 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-rose-950/40 text-rose-400 mb-3">
            <Heart className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-[#FAFAFA]">No liked products yet</h3>
          <p className="text-xs text-[#A1A1AA] mt-1 max-w-xs">
            As you explore products on the feed, click the heart icon on any card to save it to your Like History.
          </p>
          <button
            onClick={() => setActiveTab('feed')}
            className="mt-4 flex items-center gap-1.5 rounded-[14px] bg-[#7C3AED] px-4 py-2 text-xs font-semibold text-white shadow-purple hover:bg-[#8B5CF6]"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Discover Products</span>
          </button>
        </div>
      )}
    </div>
  );
};
