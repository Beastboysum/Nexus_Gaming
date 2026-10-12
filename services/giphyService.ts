const GIPHY_API_KEY = (import.meta as any).env.VITE_GIPHY_API_KEY || 'dc6zaTOxFJmzC'; // Public beta key as fallback

export interface GiphyGif {
  id: string;
  url: string;
  title: string;
}

// Reliable fallback gaming GIFs in case of API rate limits or network issues
const FALLBACK_GIFS: GiphyGif[] = [
  { id: 'fb1', title: 'Victory Dance', url: 'https://media.giphy.com/media/artj92V8o75VPL7AeQ/giphy.gif' },
  { id: 'fb2', title: 'GG Well Played', url: 'https://media.giphy.com/media/l41JGlWa1xOjJSsV2/giphy.gif' },
  { id: 'fb3', title: 'Clutch Game', url: 'https://media.giphy.com/media/26FPqAH61GhnK5K2k/giphy.gif' },
  { id: 'fb4', title: 'Gamer Rage', url: 'https://media.giphy.com/media/11tTNkNy1SdXGg/giphy.gif' },
  { id: 'fb5', title: 'Level Up', url: 'https://media.giphy.com/media/3o7TKSjRrfIPjeiVyM/giphy.gif' },
  { id: 'fb6', title: 'Hype Esports', url: 'https://media.giphy.com/media/xT9IgzoKnwFNmISR8I/giphy.gif' },
];

export const searchGifs = async (query: string): Promise<GiphyGif[]> => {
  try {
    const endpoint = query 
      ? `https://api.giphy.com/v1/gifs/search?api_key=${GIPHY_API_KEY}&q=${encodeURIComponent(query)}&limit=20&rating=g`
      : `https://api.giphy.com/v1/gifs/trending?api_key=${GIPHY_API_KEY}&limit=20&rating=g`;
    
    const response = await fetch(endpoint);
    if (!response.ok) {
      return FALLBACK_GIFS;
    }
    const data = await response.json();
    
    if (!data.data || !Array.isArray(data.data) || data.data.length === 0) {
      return FALLBACK_GIFS;
    }
    
    return data.data.map((gif: any) => ({
      id: gif.id || Math.random().toString(),
      url: gif.images?.fixed_height?.url || gif.images?.original?.url || gif.url || '',
      title: gif.title || 'Gaming GIF',
    })).filter((g: GiphyGif) => !!g.url);
  } catch (error) {
    console.warn('Error fetching GIFs, using fallback library:', error);
    return FALLBACK_GIFS;
  }
};
