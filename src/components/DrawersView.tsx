'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { ProductCard } from './ProductCard';
import { Bookmark, Plus, Trash2, FolderHeart, Sparkles } from 'lucide-react';

export const DrawersView: React.FC = () => {
  const {
    drawers,
    drawerItems,
    products,
    activeDrawerId,
    setActiveDrawerId,
    createDrawer,
    removeFromDrawer,
    setActiveTab,
  } = useApp();

  const [newDrawerName, setNewDrawerName] = useState('');
  const [showCreateInput, setShowCreateInput] = useState(false);

  const activeDrawer = drawers.find((d) => d.id === activeDrawerId) || drawers[0];

  // Get product items inside the current active drawer
  const savedItemsInActiveDrawer = drawerItems.filter(
    (item) => item.drawer_id === activeDrawer?.id
  );

  const savedProducts = savedItemsInActiveDrawer
    .map((item) => products.find((p) => p.id === item.product_id))
    .filter((p): p is typeof products[0] => p !== undefined);

  const handleCreateDrawer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDrawerName.trim()) return;
    createDrawer(newDrawerName.trim());
    setNewDrawerName('');
    setShowCreateInput(false);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col gap-2 rounded-[14px] border border-white/10 bg-[#18181B] p-6 shadow-xl relative overflow-hidden">
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-900/50 text-purple-300">
            <Bookmark className="w-5 h-5 text-purple-400" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-[#FAFAFA]">Drawers</h1>
            <p className="text-xs text-[#A1A1AA]">
              Organize and save your favorite AI tools into personal collection Drawers.
            </p>
          </div>
        </div>
      </div>

      {/* Main Grid: Sidebar Drawer Selector + Saved Items Display */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        
        {/* Left Column: Drawers List */}
        <div className="md:col-span-1 space-y-3">
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-bold text-[#A1A1AA] uppercase tracking-wider">
              Your Collections
            </span>
            <button
              onClick={() => setShowCreateInput(!showCreateInput)}
              className="text-xs text-purple-400 hover:text-purple-300 font-semibold flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>New</span>
            </button>
          </div>

          {/* Create Drawer Input */}
          {showCreateInput && (
            <form onSubmit={handleCreateDrawer} className="space-y-2 p-2 rounded-[12px] bg-[#09090B] border border-white/10">
              <input
                type="text"
                placeholder="Drawer title..."
                value={newDrawerName}
                onChange={(e) => setNewDrawerName(e.target.value)}
                className="w-full rounded-lg border border-white/10 bg-[#18181B] px-2.5 py-1.5 text-xs text-[#FAFAFA] placeholder-[#A1A1AA] focus:border-purple-500 focus:outline-none"
                autoFocus
              />
              <div className="flex items-center justify-end gap-1.5">
                <button
                  type="button"
                  onClick={() => setShowCreateInput(false)}
                  className="px-2 py-1 text-[11px] text-[#A1A1AA] hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-[#7C3AED] px-2.5 py-1 text-[11px] font-semibold text-white hover:bg-[#8B5CF6]"
                >
                  Save
                </button>
              </div>
            </form>
          )}

          {/* Drawers list items */}
          <div className="space-y-1.5">
            {drawers.map((drawer) => {
              const isActive = drawer.id === activeDrawer?.id;
              const count = drawerItems.filter((i) => i.drawer_id === drawer.id).length;

              return (
                <button
                  key={drawer.id}
                  onClick={() => setActiveDrawerId(drawer.id)}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-[12px] text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-[#7C3AED] text-white shadow-purple-sm'
                      : 'bg-[#18181B] text-[#A1A1AA] border border-white/5 hover:border-purple-500/30 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-2 truncate">
                    <Bookmark className={`w-4 h-4 ${isActive ? 'fill-white' : 'text-purple-400'}`} />
                    <span className="truncate">{drawer.name}</span>
                  </div>
                  <span
                    className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                      isActive ? 'bg-white/20 text-white' : 'bg-white/5 text-[#A1A1AA]'
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Column: Drawer Items Grid */}
        <div className="md:col-span-3 space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-white/10">
            <h2 className="text-sm font-bold text-[#FAFAFA] flex items-center gap-2">
              <span>Drawer:</span>
              <span className="text-purple-400">{activeDrawer?.name}</span>
              <span className="text-xs font-normal text-[#A1A1AA]">({savedProducts.length} items)</span>
            </h2>
          </div>

          {savedProducts.length > 0 ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {savedProducts.map((product) => (
                <div key={product.id} className="relative group">
                  <ProductCard product={product} />
                  <button
                    onClick={() => removeFromDrawer(product.id, activeDrawer.id)}
                    title="Remove from this Drawer"
                    className="absolute top-3 right-3 z-10 hidden group-hover:flex h-7 w-7 items-center justify-center rounded-lg bg-red-950/80 text-red-300 border border-red-500/40 hover:bg-red-900 transition-all"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center rounded-[14px] border border-dashed border-white/10 bg-[#18181B] py-16 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-purple-950/40 text-purple-400 mb-3">
                <FolderHeart className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-bold text-[#FAFAFA]">This Drawer is empty</h3>
              <p className="text-xs text-[#A1A1AA] mt-1 max-w-xs">
                Browse the product feed and click &quot;Save to Drawer&quot; to add AI tools to this collection.
              </p>
              <button
                onClick={() => setActiveTab('feed')}
                className="mt-4 flex items-center gap-1.5 rounded-[14px] bg-[#7C3AED] px-4 py-2 text-xs font-semibold text-white shadow-purple hover:bg-[#8B5CF6]"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Explore Feed</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
