'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Bookmark, Plus, Check } from 'lucide-react';

export const SaveToDrawerModal: React.FC = () => {
  const {
    saveModalTargetProduct,
    setSaveModalTargetProduct,
    drawers,
    createDrawer,
    saveToDrawer,
    getDrawersForProduct,
  } = useApp();

  const [newDrawerName, setNewDrawerName] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  if (!saveModalTargetProduct) return null;

  const activeDrawerIds = getDrawersForProduct(saveModalTargetProduct.id);

  const handleCreateNew = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDrawerName.trim()) return;
    createDrawer(newDrawerName.trim());
    setNewDrawerName('');
    setIsCreating(false);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="w-full max-w-md rounded-[14px] border border-white/10 bg-[#18181B] p-6 shadow-2xl"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-white/10">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-900/50 text-purple-300">
                <Bookmark className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-[#FAFAFA]">Save to Drawer</h3>
                <p className="text-xs text-[#A1A1AA] max-w-[240px] truncate">
                  {saveModalTargetProduct.title}
                </p>
              </div>
            </div>
            <button
              onClick={() => setSaveModalTargetProduct(null)}
              className="flex h-7 w-7 items-center justify-center rounded-lg text-[#A1A1AA] hover:bg-white/10 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Drawers List */}
          <div className="py-4 space-y-2">
            <p className="text-xs font-semibold text-[#A1A1AA] mb-2">Select Collection</p>
            {drawers.map((drawer) => {
              const isSavedInThis = activeDrawerIds.includes(drawer.id);
              return (
                <button
                  key={drawer.id}
                  onClick={() => saveToDrawer(saveModalTargetProduct.id, drawer.id)}
                  className={`w-full flex items-center justify-between p-3 rounded-[12px] border text-left text-xs transition-all ${
                    isSavedInThis
                      ? 'border-purple-500/50 bg-purple-950/30 text-purple-200 font-semibold'
                      : 'border-white/5 bg-[#09090B] text-[#FAFAFA] hover:border-white/20'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Bookmark className={`w-4 h-4 ${isSavedInThis ? 'fill-purple-400 text-purple-400' : 'text-[#A1A1AA]'}`} />
                    <span>{drawer.name}</span>
                    {drawer.is_default && (
                      <span className="text-[10px] bg-white/10 text-white/70 px-1.5 py-0.5 rounded">
                        Default
                      </span>
                    )}
                  </div>
                  {isSavedInThis && (
                    <div className="flex h-5 w-5 items-center justify-center rounded-full bg-purple-600 text-white">
                      <Check className="w-3 h-3" />
                    </div>
                  )}
                </button>
              );
            })}

            {/* Create New Drawer Form */}
            {isCreating ? (
              <form onSubmit={handleCreateNew} className="pt-2 flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Drawer Name (e.g. Favorites)"
                  value={newDrawerName}
                  onChange={(e) => setNewDrawerName(e.target.value)}
                  className="flex-1 rounded-[12px] border border-white/10 bg-[#09090B] px-3 py-2 text-xs text-[#FAFAFA] placeholder-[#A1A1AA] focus:border-purple-500 focus:outline-none"
                  autoFocus
                />
                <button
                  type="submit"
                  className="rounded-[12px] bg-[#7C3AED] px-3 py-2 text-xs font-semibold text-white hover:bg-[#8B5CF6]"
                >
                  Add
                </button>
                <button
                  type="button"
                  onClick={() => setIsCreating(false)}
                  className="rounded-[12px] border border-white/10 bg-white/5 px-3 py-2 text-xs font-medium text-[#A1A1AA]"
                >
                  Cancel
                </button>
              </form>
            ) : (
              <button
                onClick={() => setIsCreating(true)}
                className="w-full flex items-center justify-center gap-2 p-2.5 rounded-[12px] border border-dashed border-white/20 text-xs font-medium text-purple-400 hover:bg-purple-950/20 hover:border-purple-500/50 transition-all mt-2"
              >
                <Plus className="w-4 h-4" />
                <span>Create New Drawer</span>
              </button>
            )}
          </div>

          {/* Footer Close */}
          <div className="pt-3 border-t border-white/10 flex justify-end">
            <button
              onClick={() => setSaveModalTargetProduct(null)}
              className="rounded-[14px] bg-[#7C3AED] px-5 py-2 text-xs font-semibold text-white shadow-purple hover:bg-[#8B5CF6]"
            >
              Done
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
