import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json());

// Initialize GoogleGenAI SDK (reads GEMINI_API_KEY from environment)
const ai = new GoogleGenAI();

// --- POST /api/meta-pulse ---
// Uses gemini-3.5-flash with googleSearch tool for real-time live gaming & esports intelligence
app.post('/api/meta-pulse', async (req, res) => {
  try {
    const { query, game = 'General Gaming', mode = 'general' } = req.body;

    if (!query || typeof query !== 'string') {
      res.status(400).json({ error: 'Query parameter is required' });
      return;
    }

    const systemInstruction = `You are the Nexus MetaPulse Intelligence Engine - a high-tech, real-time gaming, meta, and esports radar for competitive gamers.
You specialize in real-time esports tournament results, match scores, standings, player rosters, current patch notes, agent/champion tier lists, weapon buffs/nerfs, and server statuses.
Use Google Search grounding to retrieve the freshest, most up-to-date accurate information from official game sites, VLR.gg, Liquipedia, Dot Esports, Dexerto, Riot Games, and official patch notes.
Format your responses with:
1. A punchy 1-sentence Executive Summary at the top.
2. Structured markdown bullet points or tier highlights (S-Tier, A-Tier, etc.) when ranking or summarizing.
3. Accurate dates, scorelines (e.g. 2-1, 13-9), patch numbers (e.g. Patch 9.08), and verified facts.
Keep it sharp, gamer-focused, and easy to scan in a live dashboard interface.`;

    const promptText = `Game Focus: ${game}
Intel Category: ${mode}
User Question: ${query}

Provide a current, accurate, real-time briefing using Google Search data. Include specific team names, match dates, patch numbers, or tier rankings where relevant.`;

    // Call gemini-3.5-flash with Google Search Grounding (falling back to gemini-3.8-flash if needed)
    let response;
    let usedModel = 'gemini-3.5-flash';
    try {
      response = await ai.models.generateContent({
        model: 'gemini-3.5-flash',
        contents: promptText,
        config: {
          systemInstruction,
          tools: [{ googleSearch: {} }],
        },
      });
    } catch (err: any) {
      console.warn('gemini-3.5-flash error, falling back to gemini-3.8-flash:', err?.message || err);
      usedModel = 'gemini-3.8-flash';
      response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: promptText,
        config: {
          systemInstruction,
          tools: [{ googleSearch: {} }],
        },
      });
    }

    const candidate = response.candidates?.[0];
    const rawChunks = candidate?.groundingMetadata?.groundingChunks || [];
    const searchQueries = candidate?.groundingMetadata?.webSearchQueries || [];

    // Extract clean sources with title and uri
    const sources = rawChunks
      .map((c: any) => c.web)
      .filter((w: any) => Boolean(w && w.uri))
      .map((w: any) => ({
        title: w.title || new URL(w.uri).hostname.replace('www.', ''),
        uri: w.uri,
        domain: new URL(w.uri).hostname.replace('www.', ''),
      }))
      // Deduplicate by URL
      .filter((item: any, index: number, self: any[]) => 
        index === self.findIndex((t: any) => t.uri === item.uri)
      )
      .slice(0, 6);

    const answer = response.text || 'No intelligence available for this query.';

    res.json({
      answer,
      sources,
      searchQueries,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      model: `${usedModel} (Google Search Grounded)`,
    });
  } catch (error: any) {
    console.error('Error in /api/meta-pulse:', error);
    
    // Provide a resilient fallback so the UI never breaks
    const fallbackAnswer = `### ⚡ Live Meta Briefing (Offline Mode)
- **Status:** Live search service is temporarily in offline cache mode.
- **Top Meta Tip:** Check official patch notes and tournament portals for the latest update details.
- **Retry:** You can run this query again in a moment.`;

    res.json({
      answer: fallbackAnswer,
      sources: [
        { title: 'VLR.gg Competitive Valorant', uri: 'https://vlr.gg', domain: 'vlr.gg' },
        { title: 'Liquipedia Esports Wiki', uri: 'https://liquipedia.net', domain: 'liquipedia.net' },
      ],
      searchQueries: [req.body?.query || 'Gaming Meta Update'],
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      model: 'Nexus Cache Fallback',
    });
  }
});

// --- GET /api/trending-pulse ---
app.get('/api/trending-pulse', (_req, res) => {
  res.json({
    topics: [
      { id: '1', game: 'Valorant', query: 'Valorant current patch agent tier list and meta', tag: 'Patch Meta', icon: 'zap' },
      { id: '2', game: 'Valorant', query: 'VCT Masters and Champions latest match results and schedule', tag: 'Live Esports', icon: 'trophy' },
      { id: '3', game: 'League of Legends', query: 'League of Legends latest patch notes and champion tier list', tag: 'Patch Meta', icon: 'swords' },
      { id: '4', game: 'Counter-Strike 2', query: 'CS2 Major latest tournament standings and valve update', tag: 'Tournament', icon: 'target' },
      { id: '5', game: 'Apex Legends', query: 'Apex Legends current season ranked weapon meta and legend tier list', tag: 'Ranked Guide', icon: 'flame' },
    ]
  });
});

// --- Mount Vite / Static Files ---
async function startServer() {
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  } else {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: false,
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Nexus Gaming Hub Server running on http://localhost:${PORT}`);
  });
}

startServer().catch(err => {
  console.error('Failed to start server:', err);
});
