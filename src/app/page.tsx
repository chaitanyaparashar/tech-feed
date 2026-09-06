'use client';

import React from 'react';
import { useApp } from '@/context/AppContext';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { ProductFeed } from '@/components/ProductFeed';
import { DrawersView } from '@/components/DrawersView';
import { LikeHistoryView } from '@/components/LikeHistoryView';
import { SaveToDrawerModal } from '@/components/SaveToDrawerModal';
import { FeedbackModal } from '@/components/FeedbackModal';
import { AuthModal } from '@/components/AuthModal';
import { OnboardingModal } from '@/components/OnboardingModal';
import { ProfileModal } from '@/components/ProfileModal';
import { Toast } from '@/components/Toast';

export default function Home() {
  const { activeTab } = useApp();

  return (
    <div className="flex min-h-screen flex-col bg-[#09090B]">
      {/* Top Header */}
      <Header />

      {/* Main Container */}
      <main className="flex-1 mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {activeTab === 'feed' && <ProductFeed />}
        {activeTab === 'drawers' && <DrawersView />}
        {activeTab === 'likes' && <LikeHistoryView />}
      </main>

      {/* Dashboard Footer */}
      <Footer />

      {/* Modals & Overlay Windows */}
      <SaveToDrawerModal />
      <FeedbackModal />
      <AuthModal />
      <OnboardingModal />
      <ProfileModal />

      {/* Global Toast System */}
      <Toast />
    </div>
  );
}
