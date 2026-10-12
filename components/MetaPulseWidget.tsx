import React, { useState } from 'react';
import { 
  Zap, 
  Search, 
  Globe, 
  ExternalLink, 
  Trophy, 
  ShieldAlert, 
  Radio, 
  Check, 
  Copy, 
  Sparkles, 
  ChevronRight, 
  Flame, 
  Swords, 
  Target, 
  RefreshCw,
  ArrowUpRight
} from 'lucide-react';
import { playCategorizedAudio } from '../services/audioManager';

export interface MetaPulseSource {
  title: string;
  uri: string;
  domain: string;
}

export interface MetaPulseResponse {
  answer: string;
  sources: MetaPulseSource[];
  searchQueries: string[];
  timestamp: string;
  model: string;
}

const PRESET_QUERIES = [
  {
    label: 'VCT Live Results & Standings',
    query: 'Latest VCT Valorant Champions Tour match results, tournament standings and upcoming schedule',
    game: 'Valorant',
    category: 'esports',
    icon: Trophy,
    color: 'text-amber-400 bg-amber-500/10 border-amber-500/30',
  },
  {
    label: 'Valorant Agent Meta & Tier List',
    query: 'Current Valorant patch agent tier list, pick rates, and meta rankings for competitive play',
    game: 'Valorant',
    category: 'meta',
    icon: Zap,
    color: 'text-purple-400 bg-purple-500/10 border-purple-500/30',
  },
  {
    label: 'LoL Latest Patch & Champions',
    query: 'League of Legends latest patch notes changes, buffs, nerfs, and champion tier list',
    game: 'League of Legends',
    category: 'patch',
    icon: Swords,
    color: 'text-blue-400 bg-blue-500/10 border-blue-500/30',
  },
  {
    label: 'CS2 Major & Tournament Standings',
    query: 'CS2 Major latest match results, tournament bracket standings and top performing teams',
    game: 'Counter-Strike 2',
    category: 'esports',
    icon: Target,
    color: 'text-orange-400 bg-orange-500/10 border-orange-500/30',
  },
  {
    label: 'Apex Legends Ranked Weapon Meta',
    query: 'Apex Legends current season ranked weapon tier list and legend meta guide',
    game: 'Apex Legends',
    category: 'meta',
    icon: Flame,
    color: 'text-red-400 bg-red-500/10 border-red-500/30',
  },
];

interface MetaPulseWidgetProps {
  onOpenFullHub?: () => void;
  className?: string;
}

export const MetaPulseWidget: React.FC<MetaPulseWidgetProps> = ({ onOpenFullHub, className = '' }) => {
  const [activeCategory, setActiveCategory] = useState<'all' | 'esports' | 'meta' | 'patch'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<MetaPulseResponse | null>(null);
  const [copied, setCopied] = useState(false);
  const [activePreset, setActivePreset] = useState<string | null>(null);

  const executePulse = async (queryText: string, gameName = 'Gaming') => {
    if (!queryText.trim()) return;

    setLoading(true);
    setCopied(false);

    playCategorizedAudio('https://assets.mixkit.co/sfx/preview/mixkit-software-interface-start-2574.mp3', 'system', 0.35);

    try {
      const res = await fetch('/api/meta-pulse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: queryText,
          game: gameName,
          mode: activeCategory,
        }),
      });

      const data = await res.json();
      setResult(data);

      playCategorizedAudio('https://assets.mixkit.co/sfx/preview/mixkit-positive-interface-beep-2586.mp3', 'system', 0.35);
    } catch (err) {
      console.error('MetaPulse query failed:', err);
    } finally {
      setLoading(false);
    }
  };

  const handlePresetClick = (preset: typeof PRESET_QUERIES[0]) => {
    setActivePreset(preset.label);
    setSearchQuery(preset.query);
    executePulse(preset.query, preset.game);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    executePulse(searchQuery, 'Competitive Gaming');
  };

  const handleCopy = () => {
    if (!result?.answer) return;
    navigator.clipboard.writeText(result.answer).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  };

  const filteredPresets = activeCategory === 'all' 
    ? PRESET_QUERIES 
    : PRESET_QUERIES.filter(p => p.category === activeCategory);

  return (
    <div className={`relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-[#13121a] via-[#161522] to-[#0f0e16] border border-cyan-500/25 p-6 md:p-8 shadow-2xl shadow-cyan-950/20 ${className}`}>
      
      {/* Decorative Glow Elements */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-cyan-500/10 rounded-full blur-[100px] pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-purple-600/10 rounded-full blur-[100px] pointer-events-none"></div>

      {/* Header Bar */}
      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 p-0.5 flex items-center justify-center shadow-lg shadow-cyan-500/30">
            <div className="w-full h-full bg-[#12111a] rounded-[14px] flex items-center justify-center">
              <Radio size={22} className="text-cyan-400 animate-pulse" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl md:text-2xl font-black text-white tracking-tight">Nexus MetaPulse</h2>
              <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/20 border border-cyan-500/40 text-[10px] font-black uppercase tracking-wider text-cyan-300 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping"></span>
                Google Search Grounded
              </span>
            </div>
            <p className="text-xs text-slate-400 font-medium">Real-Time Esports Scores, Patch Intel & Competitive Meta Radar</p>
          </div>
        </div>

        {/* Category Filter Pills & Command Hub Link */}
        <div className="flex items-center gap-2 flex-wrap">
          {(['all', 'esports', 'meta', 'patch'] as const).map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold capitalize transition-all ${
                activeCategory === cat
                  ? 'bg-cyan-500 text-black shadow-lg shadow-cyan-500/20 scale-105'
                  : 'bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white border border-white/5'
              }`}
            >
              {cat === 'all' ? 'All Intel' : cat === 'meta' ? 'Meta Radar' : cat === 'patch' ? 'Patch Notes' : 'Live Esports'}
            </button>
          ))}

          {onOpenFullHub && (
            <button
              onClick={onOpenFullHub}
              className="px-3 py-1.5 rounded-xl bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/40 text-purple-300 hover:text-white text-xs font-bold flex items-center gap-1 transition-all ml-1"
            >
              <span>Full Radar</span>
              <ChevronRight size={14} />
            </button>
          )}
        </div>
      </div>

      {/* Preset Quick-Pulse Chips */}
      <div className="relative z-10 flex gap-2.5 overflow-x-auto pb-3 mb-5 no-scrollbar">
        {filteredPresets.map((preset) => {
          const PresetIcon = preset.icon;
          const isSelected = activePreset === preset.label;
          return (
            <button
              key={preset.label}
              onClick={() => handlePresetClick(preset)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-2xl border text-xs font-bold whitespace-nowrap transition-all active:scale-95 shrink-0 ${
                isSelected 
                  ? 'bg-cyan-500/20 border-cyan-400 text-cyan-200 shadow-md shadow-cyan-500/20' 
                  : `${preset.color} hover:scale-[1.02]`
              }`}
            >
              <PresetIcon size={14} />
              <span>{preset.label}</span>
            </button>
          );
        })}
      </div>

      {/* Interactive Search Bar Form */}
      <form onSubmit={handleSubmit} className="relative z-10 mb-6">
        <div className="relative flex items-center">
          <div className="absolute left-4 pointer-events-none text-slate-400">
            <Search size={18} />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Ask any live meta question (e.g., 'Who won VCT yesterday?', 'Best Duelist on Haven', 'LoL patch 14 buffs')..."
            className="w-full h-14 pl-12 pr-32 rounded-2xl bg-black/40 border border-white/10 hover:border-cyan-500/50 focus:border-cyan-400 focus:bg-black/60 outline-none text-sm text-white placeholder-slate-500 font-medium transition-all shadow-inner"
          />
          <button
            type="submit"
            disabled={loading || !searchQuery.trim()}
            className="absolute right-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black font-black text-xs flex items-center gap-1.5 transition-all shadow-lg shadow-cyan-500/30 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <RefreshCw size={14} className="animate-spin" />
                <span>Scanning...</span>
              </>
            ) : (
              <>
                <Zap size={14} fill="currentColor" />
                <span>Pulse Radar</span>
              </>
            )}
          </button>
        </div>
      </form>

      {/* Live Loading Holographic State */}
      {loading && (
        <div className="relative z-10 p-8 rounded-2xl bg-black/30 border border-cyan-500/20 text-center space-y-4 animate-pulse">
          <div className="w-16 h-16 rounded-full bg-cyan-500/20 border-2 border-cyan-400/50 mx-auto flex items-center justify-center relative">
            <Radio size={28} className="text-cyan-400 animate-spin-slow" />
            <div className="absolute inset-0 rounded-full border border-cyan-400 animate-ping"></div>
          </div>
          <div className="space-y-1">
            <h4 className="text-base font-bold text-white">Synthesizing Real-Time Google Search Intel...</h4>
            <p className="text-xs text-slate-400">Querying live tournament databases, patch logs & competitive forums with gemini-3.5-flash</p>
          </div>
          <div className="w-48 h-1.5 bg-white/10 rounded-full mx-auto overflow-hidden">
            <div className="w-full h-full bg-gradient-to-r from-cyan-400 to-blue-500 animate-[shimmer_1.5s_infinite]"></div>
          </div>
        </div>
      )}

      {/* Intel Results Display Card */}
      {!loading && result && (
        <div className="relative z-10 rounded-2xl bg-black/40 border border-white/10 p-5 md:p-6 space-y-5 animate-fadeIn">
          
          {/* Card Top Meta Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-white/5">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
              <span className="text-xs font-bold text-emerald-400">Live Intel Synchronized</span>
              <span className="text-slate-500 text-xs">•</span>
              <span className="text-xs text-slate-400">{result.timestamp}</span>
              <span className="text-slate-500 text-xs">•</span>
              <span className="text-[11px] font-mono text-cyan-300/80">{result.model}</span>
            </div>

            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-xs font-semibold text-slate-300 hover:text-white transition-all border border-white/5"
            >
              {copied ? (
                <>
                  <Check size={13} className="text-emerald-400" />
                  <span className="text-emerald-400">Copied</span>
                </>
              ) : (
                <>
                  <Copy size={13} />
                  <span>Copy Briefing</span>
                </>
              )}
            </button>
          </div>

          {/* Formatted Intelligence Report */}
          <div className="prose prose-invert max-w-none text-slate-200 text-sm leading-relaxed space-y-2 whitespace-pre-wrap font-sans">
            {result.answer}
          </div>

          {/* Google Search Grounding Sources */}
          {result.sources && result.sources.length > 0 && (
            <div className="pt-3 border-t border-white/5 space-y-2.5">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-400">
                <Globe size={14} className="text-cyan-400" />
                <span>Verified Google Search Sources ({result.sources.length}):</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {result.sources.map((src, idx) => (
                  <a
                    key={idx}
                    href={src.uri}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-cyan-500/10 border border-white/10 hover:border-cyan-500/40 text-xs font-medium text-slate-300 hover:text-cyan-300 transition-all group"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400/60 group-hover:bg-cyan-400"></span>
                    <span className="truncate max-w-[180px]">{src.title}</span>
                    <ArrowUpRight size={12} className="text-slate-500 group-hover:text-cyan-400 transition-colors" />
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Search Queries Triggered */}
          {result.searchQueries && result.searchQueries.length > 0 && (
            <div className="flex items-center gap-2 pt-1 text-[11px] text-slate-500">
              <span className="font-semibold">Search Grounding Queries:</span>
              <div className="flex flex-wrap gap-1.5">
                {result.searchQueries.map((q, idx) => (
                  <span key={idx} className="px-2 py-0.5 rounded bg-black/40 border border-white/5 font-mono text-slate-400">
                    "{q}"
                  </span>
                ))}
              </div>
            </div>
          )}

        </div>
      )}

      {/* Default Prompt Teaser if No Search Yet */}
      {!loading && !result && (
        <div className="relative z-10 p-5 rounded-2xl bg-black/25 border border-white/5 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 shrink-0">
              <Sparkles size={18} />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">Live Intelligence Radar Ready</h4>
              <p className="text-xs text-slate-400">Select any preset topic above or enter your question to get live Google Search verified gaming intel.</p>
            </div>
          </div>
          <button
            onClick={() => handlePresetClick(PRESET_QUERIES[0])}
            className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white font-bold text-xs flex items-center gap-1.5 transition-all border border-white/10 whitespace-nowrap"
          >
            <span>Scan VCT Live Standings</span>
            <ChevronRight size={14} />
          </button>
        </div>
      )}

    </div>
  );
};
