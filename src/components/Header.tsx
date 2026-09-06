'use client';

import React, { useState } from 'react';
import { useApp, NavTab } from '@/context/AppContext';
import { Sparkles, Bookmark, Heart, MessageSquarePlus, User, LogIn, LogOut, Menu, X } from 'lucide-react';

export const Header: React.FC = () => {
  const {
    activeTab,
    setActiveTab,
    isLoggedIn,
    user,
    logout,
    setIsAuthModalOpen,
    setIsProfileOpen,
    setIsFeedbackOpen,
    likedProductIds,
    drawerItems,
  } = useApp();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems: { id: NavTab; label: string; icon: React.ReactNode; badge?: number }[] = [
    {
      id: 'feed',
      label: 'Feed',
      icon: <Sparkles className="w-4 h-4" />,
    },
    {
      id: 'drawers',
      label: 'Drawers',
      icon: <Bookmark className="w-4 h-4" />,
      badge: drawerItems.length > 0 ? drawerItems.length : undefined,
    },
    {
      id: 'likes',
      label: 'Likes',
      icon: <Heart className="w-4 h-4" />,
      badge: likedProductIds.size > 0 ? likedProductIds.size : undefined,
    },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-white/10 bg-[#09090B]/85 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        
        {/* Brand Logo & Title */}
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveTab('feed')}>
          <div className="flex h-10 w-10 items-center justify-center rounded-[12px] bg-gradient-to-tr from-purple-700 via-purple-600 to-indigo-600 shadow-purple">
            <Sparkles className="h-5 w-5 text-white" />
          </div>
          <div className="flex flex-col">
            <span className="text-base font-bold tracking-tight text-[#FAFAFA]">
              AI Product Buzz Feed
            </span>
            <span className="text-[11px] text-[#A1A1AA]">
              Ranked AI discovery engine
            </span>
          </div>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-1 rounded-full bg-[#18181B] p-1 border border-white/10">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-[#7C3AED] text-white shadow-purple-sm'
                    : 'text-[#A1A1AA] hover:text-[#FAFAFA] hover:bg-white/5'
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
                {item.badge !== undefined && (
                  <span
                    className={`ml-0.5 rounded-full px-1.5 py-0.2 text-[10px] font-bold ${
                      isActive ? 'bg-white/20 text-white' : 'bg-purple-900/50 text-purple-300 border border-purple-500/30'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Action Controls & User Account */}
        <div className="hidden md:flex items-center gap-3">
          {/* Feedback Action */}
          <button
            onClick={() => setIsFeedbackOpen(true)}
            className="flex items-center gap-1.5 rounded-[14px] border border-white/10 bg-[#18181B] px-3.5 py-1.5 text-xs font-medium text-[#A1A1AA] hover:border-purple-500/40 hover:text-[#FAFAFA] hover:bg-white/5 transition-all"
          >
            <MessageSquarePlus className="w-3.5 h-3.5 text-purple-400" />
            <span>Feedback</span>
          </button>

          {/* User Account / Sign In */}
          {isLoggedIn && user ? (
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsProfileOpen(true)}
                className="flex items-center gap-2.5 rounded-[14px] border border-white/10 bg-[#18181B] p-1.5 pr-3 text-xs font-medium text-[#FAFAFA] hover:border-purple-500/50 hover:bg-purple-950/20 transition-all"
              >
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-purple-600 to-indigo-600 font-bold text-white text-xs shadow-inner">
                  {user.display_name?.charAt(0).toUpperCase() || <User className="w-3.5 h-3.5" />}
                </div>
                <span className="max-w-[100px] truncate">{user.display_name || user.username}</span>
              </button>
              <button
                onClick={logout}
                title="Sign Out"
                className="flex h-8 w-8 items-center justify-center rounded-[12px] border border-white/10 bg-[#18181B] text-[#A1A1AA] hover:text-red-400 hover:border-red-500/30 hover:bg-red-950/20 transition-all"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => setIsAuthModalOpen(true)}
              className="flex items-center gap-1.5 rounded-[14px] bg-[#7C3AED] px-4 py-2 text-xs font-semibold text-white shadow-purple hover:bg-[#8B5CF6] transition-all"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Sign In</span>
            </button>
          )}
        </div>

        {/* Mobile Toggle Button */}
        <div className="flex md:hidden items-center gap-2">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="flex h-9 w-9 items-center justify-center rounded-[12px] border border-white/10 bg-[#18181B] text-[#FAFAFA]"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-white/10 bg-[#18181B] px-4 pt-2 pb-4 space-y-3">
          <div className="grid grid-cols-3 gap-2">
            {navItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    setMobileMenuOpen(false);
                  }}
                  className={`flex flex-col items-center justify-center gap-1 rounded-[14px] p-2.5 text-xs font-medium ${
                    isActive
                      ? 'bg-[#7C3AED] text-white shadow-purple-sm'
                      : 'bg-[#09090B] text-[#A1A1AA] border border-white/5'
                  }`}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>

          <div className="pt-2 border-t border-white/10 flex items-center justify-between gap-2">
            <button
              onClick={() => {
                setIsFeedbackOpen(true);
                setMobileMenuOpen(false);
              }}
              className="flex-1 flex items-center justify-center gap-1.5 rounded-[14px] border border-white/10 bg-[#09090B] px-3 py-2 text-xs font-medium text-[#A1A1AA]"
            >
              <MessageSquarePlus className="w-4 h-4 text-purple-400" />
              <span>Feedback</span>
            </button>

            {isLoggedIn && user ? (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setIsProfileOpen(true);
                    setMobileMenuOpen(false);
                  }}
                  className="flex items-center gap-2 rounded-[14px] border border-white/10 bg-[#09090B] px-3 py-2 text-xs font-medium text-[#FAFAFA]"
                >
                  <User className="w-4 h-4 text-purple-400" />
                  <span>Profile</span>
                </button>
                <button
                  onClick={() => {
                    logout();
                    setMobileMenuOpen(false);
                  }}
                  className="flex items-center gap-1.5 rounded-[14px] border border-red-500/30 bg-red-950/20 px-3 py-2 text-xs font-medium text-red-400"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => {
                  setIsAuthModalOpen(true);
                  setMobileMenuOpen(false);
                }}
                className="flex-1 flex items-center justify-center gap-1.5 rounded-[14px] bg-[#7C3AED] px-4 py-2 text-xs font-semibold text-white shadow-purple"
              >
                <LogIn className="w-4 h-4" />
                <span>Sign In</span>
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
