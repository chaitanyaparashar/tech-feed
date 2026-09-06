import { Product, Drawer, UserProfile, Feedback } from '@/types/database';

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'prod-1',
    title: 'Claude 3.7 Sonnet & Hybrid Reasoning Engine',
    tagline: 'Instant response capabilities paired with fine-grained control over extended thinking tokens.',
    source: 'hacker_news',
    url: 'https://news.ycombinator.com',
    buzz_score: 98.4,
    votes: 1420,
    comments: 482,
    news_mentions: 84,
    created_at: new Date(Date.now() - 3600000 * 2).toISOString(),
  },
  {
    id: 'prod-2',
    title: 'Perplexity Deep Research Engine',
    tagline: 'Autonomous AI research agent performing multi-step search synthesis and report drafting.',
    source: 'product_hunt',
    url: 'https://producthunt.com',
    buzz_score: 94.8,
    votes: 1150,
    comments: 310,
    news_mentions: 62,
    created_at: new Date(Date.now() - 3600000 * 5).toISOString(),
  },
  {
    id: 'prod-3',
    title: 'Cursor 2.0 Agentic Workspace',
    tagline: 'Multi-file code editing, background test execution, and real-time git diff auditing.',
    source: 'tech_news',
    url: 'https://techcrunch.com',
    buzz_score: 91.2,
    votes: 890,
    comments: 215,
    news_mentions: 45,
    created_at: new Date(Date.now() - 3600000 * 8).toISOString(),
  },
  {
    id: 'prod-4',
    title: 'Midjourney v7 Photorealistic Renderer',
    tagline: 'Next-gen image model with enhanced text rendering, spatial layout control, and 3D consistency.',
    source: 'product_hunt',
    url: 'https://producthunt.com',
    buzz_score: 88.6,
    votes: 980,
    comments: 184,
    news_mentions: 51,
    created_at: new Date(Date.now() - 3600000 * 12).toISOString(),
  },
  {
    id: 'prod-5',
    title: 'Whisper V3 Turbo Audio Transcriber',
    tagline: 'Ultra-low latency multilingual speech-to-text model designed for edge device streaming.',
    source: 'hacker_news',
    url: 'https://news.ycombinator.com',
    buzz_score: 85.1,
    votes: 670,
    comments: 142,
    news_mentions: 29,
    created_at: new Date(Date.now() - 3600000 * 18).toISOString(),
  },
  {
    id: 'prod-6',
    title: 'DeepSeek R1 Open Reasoning Weights',
    tagline: 'Fully open-weights reasoning model matching frontier performance on math and coding benchmarks.',
    source: 'tech_news',
    url: 'https://github.com',
    buzz_score: 83.7,
    votes: 750,
    comments: 298,
    news_mentions: 38,
    created_at: new Date(Date.now() - 3600000 * 24).toISOString(),
  },
  {
    id: 'prod-7',
    title: 'vLLM Fast Serving Engine v0.7',
    tagline: 'High-throughput LLM serving engine with chunked prefill and dynamic PagedAttention support.',
    source: 'hacker_news',
    url: 'https://news.ycombinator.com',
    buzz_score: 79.9,
    votes: 510,
    comments: 96,
    news_mentions: 18,
    created_at: new Date(Date.now() - 3600000 * 30).toISOString(),
  },
  {
    id: 'prod-8',
    title: 'ElevenLabs Voice Design Studio',
    tagline: 'Generate custom AI voice actors with specific regional accents and emotional micro-expressions.',
    source: 'product_hunt',
    url: 'https://producthunt.com',
    buzz_score: 77.3,
    votes: 620,
    comments: 112,
    news_mentions: 22,
    created_at: new Date(Date.now() - 3600000 * 36).toISOString(),
  }
];

export const AVAILABLE_INTERESTS = [
  'Anime',
  'Marvel',
  'Harry Potter',
  'Disney',
  'Pokemon',
  'Gaming',
  'Football',
  'Books',
  'Cars',
  'Action Figures',
  'Sci-Fi',
  'Nature',
  'Space',
  'Cyberpunk',
  'Music',
  'K-Pop',
  'Formula 1',
  'Minimal',
  'Cats',
  'Dogs',
  'Travel',
];

export interface AvatarPreset {
  concept: string;
  themeColor: string;
  badge: string;
  description: string;
}

export function generateAvatarConcept(interests: string[]): AvatarPreset {
  if (interests.includes('Cyberpunk')) {
    return {
      concept: 'Neon Futuristic Hacker',
      themeColor: 'from-purple-600 to-cyan-500',
      badge: 'Cyberpunk',
      description: 'Original neon-visor futuristic hacker avatar'
    };
  }
  if (interests.includes('Harry Potter')) {
    return {
      concept: 'Arcane Wizard Explorer',
      themeColor: 'from-amber-600 to-purple-800',
      badge: 'Fantasy',
      description: 'Original glasses-wearing arcane scholar'
    };
  }
  if (interests.includes('Marvel')) {
    return {
      concept: 'Comic Masked Hero',
      themeColor: 'from-red-600 to-indigo-700',
      badge: 'Comics',
      description: 'Original hero silhouette with luminous emblem'
    };
  }
  if (interests.includes('Pokemon')) {
    return {
      concept: 'Creature Companion Trainer',
      themeColor: 'from-yellow-500 to-amber-600',
      badge: 'Creature',
      description: 'Original cute creature companion trainer'
    };
  }
  if (interests.includes('Space') || interests.includes('Sci-Fi')) {
    return {
      concept: 'Cosmic Stellar Pilot',
      themeColor: 'from-blue-600 to-purple-900',
      badge: 'Space',
      description: 'Original helmeted deep space navigator'
    };
  }
  if (interests.includes('Anime')) {
    return {
      concept: 'Anime Stylized Pilot',
      themeColor: 'from-pink-500 to-purple-600',
      badge: 'Anime',
      description: 'Original cel-shaded anime protagonist concept'
    };
  }
  if (interests.includes('Nature')) {
    return {
      concept: 'Forest Realm Wanderer',
      themeColor: 'from-emerald-600 to-teal-800',
      badge: 'Nature',
      description: 'Original nature-infused mystic explorer'
    };
  }
  if (interests.includes('Gaming')) {
    return {
      concept: 'Esports Synth Legend',
      themeColor: 'from-violet-600 to-fuchsia-600',
      badge: 'Esports',
      description: 'Original backlit gaming avatar concept'
    };
  }

  return {
    concept: 'Modern Modernist Pulse',
    themeColor: 'from-purple-700 to-indigo-900',
    badge: 'Modern',
    description: 'Minimalist sleek glowing avatar'
  };
}

export const INITIAL_USER: UserProfile = {
  id: 'profile-1',
  user_id: 'user-demo-1',
  username: 'alex_ai',
  display_name: 'Alex Rivera',
  profile_picture_url: '',
  interests: ['Cyberpunk', 'Sci-Fi', 'Gaming'],
  avatar_concept: 'Neon Futuristic Hacker',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

export const INITIAL_DRAWERS: Drawer[] = [
  {
    id: 'drawer-saved',
    user_id: 'user-demo-1',
    name: 'Saved',
    is_default: true,
    created_at: new Date().toISOString(),
  },
  {
    id: 'drawer-research',
    user_id: 'user-demo-1',
    name: 'Research',
    is_default: false,
    created_at: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: 'drawer-try-later',
    user_id: 'user-demo-1',
    name: 'Try Later',
    is_default: false,
    created_at: new Date(Date.now() - 172800000).toISOString(),
  },
];
