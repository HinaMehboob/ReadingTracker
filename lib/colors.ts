export interface NotionColor {
  bg: string;
  text: string;
  border: string;
  chart: string;
}

// Expanded palette to drastically reduce randomized collision chances
export const NOTION_COLORS: Record<string, NotionColor> = {
  blue: { bg: 'bg-[#1e3a8a]', text: 'text-blue-300', border: 'border-blue-900', chart: '#3b82f6' },
  green: { bg: 'bg-[#064e3b]', text: 'text-emerald-300', border: 'border-emerald-900', chart: '#10b981' },
  orange: { bg: 'bg-[#7c2d12]', text: 'text-orange-300', border: 'border-orange-900', chart: '#f97316' },
  red: { bg: 'bg-[#7f1d1d]', text: 'text-red-300', border: 'border-red-900', chart: '#ef4444' },
  pink: { bg: 'bg-[#831843]', text: 'text-pink-300', border: 'border-pink-900', chart: '#ec4899' },
  purple: { bg: 'bg-[#4c1d95]', text: 'text-purple-300', border: 'border-purple-900', chart: '#8b5cf6' },
  brown: { bg: 'bg-[#713f12]', text: 'text-amber-300', border: 'border-amber-900', chart: '#f59e0b' },
  gray: { bg: 'bg-[#3f3f46]', text: 'text-zinc-300', border: 'border-zinc-700', chart: '#71717a' },
  teal: { bg: 'bg-[#134e4a]', text: 'text-teal-300', border: 'border-teal-900', chart: '#14b8a6' },
  cyan: { bg: 'bg-[#164e63]', text: 'text-cyan-300', border: 'border-cyan-900', chart: '#06b6d4' },
  indigo: { bg: 'bg-[#312e81]', text: 'text-indigo-300', border: 'border-indigo-900', chart: '#6366f1' },
  rose: { bg: 'bg-[#881337]', text: 'text-rose-300', border: 'border-rose-900', chart: '#f43f5e' },
  lime: { bg: 'bg-[#365314]', text: 'text-lime-300', border: 'border-lime-900', chart: '#84cc16' }
};

// Ensure all keys are lowercase when doing lookups
export const DEFAULT_GENRE_COLORS: Record<string, string> = {
  'business culture': 'green',
  'thriller': 'orange',
  'mental health': 'blue',
  'entrepreneurship': 'gray',
  'economics': 'gray',
  'management': 'blue',
  'sci-fi': 'purple',
  'literary fiction': 'brown',
  'mythology': 'red',
  'mystery': 'pink',
  'sociology': 'orange',
  'philosophy': 'pink',
  'science': 'blue',
  'finance': 'gray',
  'marketing': 'orange',
  'mindfulness': 'red',
  'personal development': 'green',
  'leadership': 'red',
  'history': 'brown',
  'nonfiction': 'gray',
  'non-fiction': 'gray',
  'spirituality': 'green',
  'fantasy': 'orange',
  'business & money': 'blue',
  'self-help': 'purple',
  'fiction': 'brown',
  'romance': 'red',
  'psychological': 'pink',
  'biographies': 'gray',
  'novel': 'indigo',
  'action': 'rose',
  'adventure': 'teal',
  'guide': 'lime'
};

// Better hashing algorithm using djb2 to prevent mathematical collisions on unknown string categories
function stringHash(str: string): number {
  let hash = 5381;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) + hash) + str.charCodeAt(i); // hash * 33 + c
  }
  return hash >>> 0; 
}

export function getGenreColor(genreName: string): NotionColor {
  const norm = genreName.toLowerCase().trim();
  
  if (DEFAULT_GENRE_COLORS[norm]) {
    return NOTION_COLORS[DEFAULT_GENRE_COLORS[norm]];
  }
  
  const colorKeys = Object.keys(NOTION_COLORS);
  const hashIndex = stringHash(norm) % colorKeys.length;
  
  return NOTION_COLORS[colorKeys[hashIndex]];
}
