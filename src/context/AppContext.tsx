'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import {
  Product,
  ProductSource,
  Drawer,
  DrawerItem,
  UserProfile,
  Feedback,
  ProductLike,
} from '@/types/database';
import {
  INITIAL_PRODUCTS,
  INITIAL_DRAWERS,
  generateAvatarConcept,
  AvatarPreset,
} from '@/data/mockData';

export type NavTab = 'feed' | 'drawers' | 'likes' | 'feedback';

interface AppContextType {
  activeTab: NavTab;
  setActiveTab: (tab: NavTab) => void;
  isLoggedIn: boolean;
  user: UserProfile | null;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string) => Promise<void>;
  logout: () => void;
  updateProfile: (data: Partial<UserProfile>) => void;
  isOnboardingOpen: boolean;
  setIsOnboardingOpen: (open: boolean) => void;
  completeOnboarding: (interests: string[], customDisplayName?: string) => void;
  getAvatarPreset: (interests: string[]) => AvatarPreset;
  isProfileOpen: boolean;
  setIsProfileOpen: (open: boolean) => void;
  isAuthModalOpen: boolean;
  setIsAuthModalOpen: (open: boolean) => void;
  isFeedbackOpen: boolean;
  setIsFeedbackOpen: (open: boolean) => void;
  products: Product[];
  selectedSource: 'all' | ProductSource;
  setSelectedSource: (source: 'all' | ProductSource) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  sortBy: 'buzz_score' | 'votes' | 'recent';
  setSortBy: (sort: 'buzz_score' | 'votes' | 'recent') => void;
  likedProductIds: Set<string>;
  likeHistory: ProductLike[];
  toggleLike: (productId: string) => void;
  drawers: Drawer[];
  drawerItems: DrawerItem[];
  activeDrawerId: string;
  setActiveDrawerId: (id: string) => void;
  createDrawer: (name: string) => void;
  saveToDrawer: (productId: string, drawerId: string) => void;
  removeFromDrawer: (productId: string, drawerId: string) => void;
  saveModalTargetProduct: Product | null;
  setSaveModalTargetProduct: (product: Product | null) => void;
  isProductSavedInAnyDrawer: (productId: string) => boolean;
  getDrawersForProduct: (productId: string) => string[];
  feedbackList: Feedback[];
  submitFeedback: (message: string, rating?: number, category?: Feedback['category']) => void;
  toast: string | null;
  showToast: (msg: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

function profileFromEmail(userId: string, email: string): Omit<UserProfile, 'id'> {
  const username = email.split('@')[0] || 'user';
  return {
    user_id: userId,
    username,
    display_name: username.charAt(0).toUpperCase() + username.slice(1),
    profile_picture_url: '',
    interests: [],
    avatar_concept: 'Modern Pulse',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
}

function normalizeProduct(row: Product & { first_seen_at?: string; source_id?: string }): Product {
  const sourceMap: Record<string, ProductSource> = {
    hackernews: 'hacker_news',
    producthunt: 'product_hunt',
    technews: 'tech_news',
    hacker_news: 'hacker_news',
    product_hunt: 'product_hunt',
    tech_news: 'tech_news',
  };

  return {
    id: row.id,
    title: row.title,
    tagline: row.tagline ?? '',
    source: sourceMap[row.source] ?? 'tech_news',
    url: row.url,
    buzz_score: Number(row.buzz_score ?? 0),
    votes: Number(row.votes ?? 0),
    comments: Number(row.comments ?? 0),
    news_mentions: Number(row.news_mentions ?? 0),
    created_at: row.created_at ?? row.first_seen_at ?? new Date().toISOString(),
  };
}

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeTab, setActiveTab] = useState<NavTab>('feed');
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isOnboardingOpen, setIsOnboardingOpen] = useState<boolean>(false);
  const [isProfileOpen, setIsProfileOpen] = useState<boolean>(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [selectedSource, setSelectedSource] = useState<'all' | ProductSource>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<'buzz_score' | 'votes' | 'recent'>('buzz_score');
  const [likedProductIds, setLikedProductIds] = useState<Set<string>>(new Set());
  const [likeHistory, setLikeHistory] = useState<ProductLike[]>([]);
  const [drawers, setDrawers] = useState<Drawer[]>([]);
  const [drawerItems, setDrawerItems] = useState<DrawerItem[]>([]);
  const [activeDrawerId, setActiveDrawerId] = useState<string>('');
  const [saveModalTargetProduct, setSaveModalTargetProduct] = useState<Product | null>(null);
  const [isFeedbackOpen, setIsFeedbackOpen] = useState<boolean>(false);
  const [feedbackList, setFeedbackList] = useState<Feedback[]>([]);
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    window.setTimeout(() => setToast(null), 3500);
  };

  const loadProducts = async () => {
    if (!supabase) return;
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('buzz_score', { ascending: false });

    if (error) {
      showToast('Using demo products because products could not be loaded.');
      return;
    }

    if (data && data.length > 0) {
      setProducts((data as Array<Product & { first_seen_at?: string; source_id?: string }>).map(normalizeProduct));
    }
  };

  const loadUserData = async (userId: string, email: string) => {
    if (!supabase) return;

    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    if (profile) {
      setUser(profile as UserProfile);
    } else {
      const newProfile = profileFromEmail(userId, email);
      const { data: createdProfile } = await supabase
        .from('profiles')
        .insert(newProfile)
        .select()
        .single();
      if (createdProfile) {
        setUser(createdProfile as UserProfile);
        setIsOnboardingOpen(true);
      }
    }

    const [{ data: likes }, { data: savedDrawers }, { data: savedItems }, { data: feedback }] =
      await Promise.all([
        supabase
          .from('product_likes')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false }),
        supabase
          .from('drawers')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: true }),
        supabase
          .from('drawer_items')
          .select('*, drawers!inner(user_id)')
          .eq('drawers.user_id', userId)
          .order('saved_at', { ascending: false }),
        supabase
          .from('feedback')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false }),
      ]);

    const nextLikes = (likes ?? []) as ProductLike[];
    let nextDrawers = (savedDrawers ?? []) as Drawer[];
    const nextDrawerItems = (savedItems ?? []).map(({ drawers: _drawers, ...item }) => item) as DrawerItem[];

    if (nextDrawers.length === 0) {
      const defaultDrawer: Drawer = {
        id: crypto.randomUUID(),
        user_id: userId,
        name: 'Saved',
        is_default: true,
        created_at: new Date().toISOString(),
      };

      const { data: createdDrawer } = await supabase
        .from('drawers')
        .insert(defaultDrawer)
        .select()
        .single();

      nextDrawers = createdDrawer ? [createdDrawer as Drawer] : [defaultDrawer];
    }

    setLikeHistory(nextLikes);
    setLikedProductIds(new Set(nextLikes.map((like) => like.product_id)));
    setDrawers(nextDrawers);
    setDrawerItems(nextDrawerItems);
    setFeedbackList((feedback ?? []) as Feedback[]);

    if (nextDrawers.length > 0) {
      setActiveDrawerId(nextDrawers[0].id);
    }
  };

  useEffect(() => {
    void loadProducts();
    if (!supabase) {
      setDrawers(INITIAL_DRAWERS);
      setActiveDrawerId(INITIAL_DRAWERS[0]?.id ?? '');
      return;
    }

    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) return;
      setIsLoggedIn(true);
      void loadUserData(data.user.id, data.user.email ?? 'user@example.com');
    });
  }, []);

  const login = async (email: string, password: string) => {
    if (!supabase) {
      throw new Error('Supabase is not configured.');
    }

    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    if (!data.user) throw new Error('No user returned after login.');

    setIsLoggedIn(true);
    await loadUserData(data.user.id, email);
    setIsAuthModalOpen(false);
    showToast(`Welcome back, ${email.split('@')[0]}!`);
  };

  const signup = async (email: string, password: string) => {
    if (!supabase) {
      throw new Error('Supabase is not configured.');
    }

    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) throw error;

    if (data.user && data.session) {
      setIsLoggedIn(true);
      await loadUserData(data.user.id, email);
      setIsAuthModalOpen(false);
      setIsOnboardingOpen(true);
    }
  };

  const logout = () => {
    if (supabase) {
      void supabase.auth.signOut();
    }
    setIsLoggedIn(false);
    setUser(null);
    setLikedProductIds(new Set());
    setLikeHistory([]);
    setDrawers([]);
    setDrawerItems([]);
    setActiveDrawerId('');
    showToast('Signed out successfully.');
  };

  const updateProfile = (data: Partial<UserProfile>) => {
    if (!user) return;
    const updatedProfile = { ...user, ...data, updated_at: new Date().toISOString() };
    setUser(updatedProfile);
    if (supabase) {
      void supabase.from('profiles').update(data).eq('user_id', user.user_id);
    }
    showToast('Profile updated!');
  };

  const getAvatarPreset = (interests: string[]): AvatarPreset => {
    return generateAvatarConcept(interests);
  };

  const completeOnboarding = (selectedInterests: string[], customDisplayName?: string) => {
    if (!user) return;
    const preset = generateAvatarConcept(selectedInterests);
    updateProfile({
      interests: selectedInterests,
      avatar_concept: preset.concept,
      display_name: customDisplayName || user.display_name,
    });
    setIsOnboardingOpen(false);
    showToast(`Profile personalized with avatar: ${preset.concept}`);
  };

  const toggleLike = (productId: string) => {
    if (!isLoggedIn || !user) {
      setIsAuthModalOpen(true);
      showToast('Please sign in to like products');
      return;
    }

    const isLiked = likedProductIds.has(productId);
    const nextLiked = new Set(likedProductIds);

    if (isLiked) {
      nextLiked.delete(productId);
      setLikedProductIds(nextLiked);
      setLikeHistory((prev) => prev.filter((item) => item.product_id !== productId));
      if (supabase) {
        void supabase
          .from('product_likes')
          .delete()
          .eq('user_id', user.user_id)
          .eq('product_id', productId);
      }
      showToast('Unliked product');
      return;
    }

    const newLike: ProductLike = {
      id: crypto.randomUUID(),
      user_id: user.user_id,
      product_id: productId,
      created_at: new Date().toISOString(),
    };
    nextLiked.add(productId);
    setLikedProductIds(nextLiked);
    setLikeHistory((prev) => [newLike, ...prev]);
    if (supabase) {
      void supabase.from('product_likes').insert({
        user_id: user.user_id,
        product_id: productId,
      });
    }
    showToast('Added to Like History!');
  };

  const createDrawer = (name: string) => {
    if (!name.trim() || !user) return;
    const newDrawer: Drawer = {
      id: crypto.randomUUID(),
      user_id: user.user_id,
      name: name.trim(),
      is_default: false,
      created_at: new Date().toISOString(),
    };
    setDrawers((prev) => [...prev, newDrawer]);
    setActiveDrawerId(newDrawer.id);
    if (supabase) {
      void supabase.from('drawers').insert({
        id: newDrawer.id,
        user_id: user.user_id,
        name: newDrawer.name,
        is_default: false,
      });
    }
    showToast(`Created Drawer "${name.trim()}"`);
  };

  const saveToDrawer = (productId: string, drawerId: string) => {
    if (!isLoggedIn || !user) {
      setIsAuthModalOpen(true);
      showToast('Please sign in to save items');
      return;
    }

    const existing = drawerItems.find(
      (item) => item.product_id === productId && item.drawer_id === drawerId,
    );

    if (existing) {
      setDrawerItems((prev) => prev.filter((item) => item.id !== existing.id));
      if (supabase) {
        void supabase.from('drawer_items').delete().eq('id', existing.id);
      }
      showToast('Removed from Drawer');
      return;
    }

    const newItem: DrawerItem = {
      id: crypto.randomUUID(),
      drawer_id: drawerId,
      product_id: productId,
      saved_at: new Date().toISOString(),
    };
    setDrawerItems((prev) => [...prev, newItem]);
    if (supabase) {
      void supabase.from('drawer_items').insert({
        id: newItem.id,
        drawer_id: drawerId,
        product_id: productId,
      });
    }
    const targetDrawer = drawers.find((d) => d.id === drawerId);
    showToast(`Saved to Drawer "${targetDrawer?.name || 'Saved'}"`);
  };

  const removeFromDrawer = (productId: string, drawerId: string) => {
    const existing = drawerItems.find(
      (item) => item.product_id === productId && item.drawer_id === drawerId,
    );
    setDrawerItems((prev) =>
      prev.filter((item) => !(item.product_id === productId && item.drawer_id === drawerId)),
    );
    if (existing && supabase) {
      void supabase.from('drawer_items').delete().eq('id', existing.id);
    }
    showToast('Removed item from Drawer');
  };

  const isProductSavedInAnyDrawer = (productId: string) => {
    return drawerItems.some((item) => item.product_id === productId);
  };

  const getDrawersForProduct = (productId: string) => {
    return drawerItems
      .filter((item) => item.product_id === productId)
      .map((item) => item.drawer_id);
  };

  const submitFeedback = (message: string, rating?: number, category?: Feedback['category']) => {
    const newFeedback: Feedback = {
      id: crypto.randomUUID(),
      user_id: user?.user_id,
      message,
      rating,
      category,
      created_at: new Date().toISOString(),
    };
    setFeedbackList((prev) => [newFeedback, ...prev]);
    if (supabase) {
      void supabase.from('feedback').insert({
        user_id: user?.user_id,
        message,
        rating,
        category,
      });
    }
    setIsFeedbackOpen(false);
    showToast('Thank you! Feedback submitted.');
  };

  return (
    <AppContext.Provider
      value={{
        activeTab,
        setActiveTab,
        isLoggedIn,
        user,
        login,
        signup,
        logout,
        updateProfile,
        isOnboardingOpen,
        setIsOnboardingOpen,
        completeOnboarding,
        getAvatarPreset,
        isProfileOpen,
        setIsProfileOpen,
        isAuthModalOpen,
        setIsAuthModalOpen,
        isFeedbackOpen,
        setIsFeedbackOpen,
        products,
        selectedSource,
        setSelectedSource,
        searchQuery,
        setSearchQuery,
        sortBy,
        setSortBy,
        likedProductIds,
        likeHistory,
        toggleLike,
        drawers,
        drawerItems,
        activeDrawerId,
        setActiveDrawerId,
        createDrawer,
        saveToDrawer,
        removeFromDrawer,
        saveModalTargetProduct,
        setSaveModalTargetProduct,
        isProductSavedInAnyDrawer,
        getDrawersForProduct,
        feedbackList,
        submitFeedback,
        toast,
        showToast,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
