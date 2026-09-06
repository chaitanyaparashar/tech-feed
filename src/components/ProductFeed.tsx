'use client';

import React from 'react';
import { useApp } from '@/context/AppContext';
import { ProductCard } from './ProductCard';
import { ProductSource } from '@/types/database';
import { Search, Flame, ThumbsUp, Clock, Filter, Sparkles } from 'lucide-react';

export const ProductFeed: React.FC = () => {
  const {
    products,
    selectedSource,
    setSelectedSource,
    searchQuery,
    setSearchQuery,
    sortBy,
    setSortBy,
  } = useApp();

  // Filter products by source & query
  const filteredProducts = products.filter((item) => {
    const matchesSource = selectedSource === 'all' || item.source === selectedSource;
    const matchesQuery =
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.tagline.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSource && matchesQuery;
  });

  // Sort products
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (sortBy === 'buzz_score') {
      return b.buzz_score - a.buzz_score;
    }
    if (sortBy === 'votes') {
      return b.votes - a.votes;
    }
    if (sortBy === 'recent') {
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    }
    return 0;
  });

  const sources: { id: 'all' | ProductSource; label: string }[] = [
    { id: 'all', label: 'All Sources' },
    { id: 'hacker_news', label: 'Hacker News' },
    { id: 'product_hunt', label: 'Product Hunt' },
    { id: 'tech_news', label: 'Tech News' },
  ];

  return (
    <div className="space-y-6">
      {/* Top Banner / Feed Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between rounded-[14px] border border-white/10 bg-[#18181B] p-6 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 h-40 w-40 rounded-full bg-purple-600/10 blur-3xl pointer-events-none" />
        <div className="z-10 space-y-1">
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-[#FAFAFA]">AI Product Feed</h1>
            <span className="inline-flex items-center gap-1 rounded-full bg-purple-950/60 border border-purple-500/30 px-2.5 py-0.5 text-[11px] font-semibold text-purple-300">
              <Sparkles className="w-3 h-3 text-purple-400" />
              Live Buzz Ranking
            </span>
          </div>
          <p className="text-xs text-[#A1A1AA]">
            Curated AI tool launches ranked by community votes, comments, and media coverage.
          </p>
        </div>

        {/* Search Bar */}
        <div className="relative z-10 w-full md:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#A1A1AA]" />
          <input
            type="text"
            placeholder="Search AI launches..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-[14px] border border-white/10 bg-[#09090B] pl-9 pr-4 py-2 text-xs text-[#FAFAFA] placeholder-[#A1A1AA] focus:border-purple-500 focus:outline-none transition-all"
          />
        </div>
      </div>

      {/* Filter Tabs & Sort Controls */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-white/10 pb-4">
        {/* Source Filter Pills */}
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-xs text-[#A1A1AA] mr-1 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" /> Source:
          </span>
          {sources.map((src) => {
            const isSelected = selectedSource === src.id;
            return (
              <button
                key={src.id}
                onClick={() => setSelectedSource(src.id)}
                className={`rounded-[14px] px-3.5 py-1.5 text-xs font-semibold transition-all ${
                  isSelected
                    ? 'bg-[#7C3AED] text-white shadow-purple-sm'
                    : 'bg-[#18181B] text-[#A1A1AA] border border-white/10 hover:border-purple-500/30 hover:text-white'
                }`}
              >
                {src.label}
              </button>
            );
          })}
        </div>

        {/* Sort Selector */}
        <div className="flex items-center gap-2 self-end sm:self-auto">
          <span className="text-xs text-[#A1A1AA]">Sort by:</span>
          <div className="flex items-center rounded-[14px] bg-[#18181B] border border-white/10 p-1">
            <button
              onClick={() => setSortBy('buzz_score')}
              className={`flex items-center gap-1 rounded-[10px] px-2.5 py-1 text-xs font-medium ${
                sortBy === 'buzz_score' ? 'bg-[#7C3AED] text-white' : 'text-[#A1A1AA] hover:text-white'
              }`}
            >
              <Flame className="w-3 h-3 text-amber-400" />
              <span>Buzz</span>
            </button>
            <button
              onClick={() => setSortBy('votes')}
              className={`flex items-center gap-1 rounded-[10px] px-2.5 py-1 text-xs font-medium ${
                sortBy === 'votes' ? 'bg-[#7C3AED] text-white' : 'text-[#A1A1AA] hover:text-white'
              }`}
            >
              <ThumbsUp className="w-3 h-3 text-purple-300" />
              <span>Votes</span>
            </button>
            <button
              onClick={() => setSortBy('recent')}
              className={`flex items-center gap-1 rounded-[10px] px-2.5 py-1 text-xs font-medium ${
                sortBy === 'recent' ? 'bg-[#7C3AED] text-white' : 'text-[#A1A1AA] hover:text-white'
              }`}
            >
              <Clock className="w-3 h-3 text-cyan-300" />
              <span>Recent</span>
            </button>
          </div>
        </div>
      </div>

      {/* Products Grid */}
      {sortedProducts.length > 0 ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {sortedProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        /* Empty State */
        <div className="flex flex-col items-center justify-center rounded-[14px] border border-dashed border-white/10 bg-[#18181B] py-16 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-purple-950/40 text-purple-400 mb-3">
            <Search className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-[#FAFAFA]">No AI products match your filter</h3>
          <p className="text-xs text-[#A1A1AA] mt-1 max-w-sm">
            Try adjusting your source filter or clearing search keywords to discover more tools.
          </p>
          <button
            onClick={() => {
              setSelectedSource('all');
              setSearchQuery('');
            }}
            className="mt-4 rounded-[14px] bg-[#7C3AED] px-4 py-1.5 text-xs font-semibold text-white shadow-purple hover:bg-[#8B5CF6]"
          >
            Reset Filters
          </button>
        </div>
      )}
    </div>
  );
};
