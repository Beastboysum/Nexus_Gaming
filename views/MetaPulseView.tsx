import React, { useState } from 'react';
import { 
  Radio, 
  Search, 
  Globe, 
  ExternalLink, 
  Trophy, 
  Zap, 
  Flame, 
  Swords, 
  Target, 
  Sparkles, 
  Copy, 
  Check, 
  RefreshCw, 
  ArrowUpRight, 
  ShieldCheck, 
  Activity, 
  Server, 
  CheckCircle2, 
  AlertTriangle,
  ChevronRight,
  TrendingUp,
  Cpu
} from 'lucide-react';
import { playCategorizedAudio } from '../services/audioManager';
import { MetaPulseResponse } from '../components/MetaPulseWidget';

const POPULAR_GAMES = [
  { id: 'valorant', name: 'Valorant', icon: Zap, color: 'text-red-400 border-red-500/30 bg-red-500/10' },
  { id: 'cs2', name: 'Counter-Strike 2', icon: Target, color: 'text-amber-400 border-amber-500/30 bg-amber-500/10' },
  { id: 'lol', name: 'League of Legends', icon: Swords, color: 'text-blue-400 border-blue-500/30 bg-blue-500/10' },
  { id: 'apex', name: 'Apex Legends', icon: Flame, color: 'text-orange-400 border-orange-500/30 bg-orange-500/10' },
  { id: 'dota2', name: 'Dota 2', icon: Trophy, color: 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10' },
];

const QUICK_CHIPS = [
  { label: 'VCT Champions Results & Schedule', query: 'Valorant VCT Champions Tour latest match scores, standings, and upcoming schedule', game: 'Valorant' },
  { label: 'Current Patch Agent Tier List', query: 'Valorant current patch agent tier list, pick rates, and meta rankings', game: 'Valorant' },
  { label: 'LoL Worlds / MSI Standings', query: 'League of Legends esports tournament standings, latest match results and bracket', game: 'League of Legends' },
  { label: 'CS2 Major Live Standings', query: 'CS2 Major latest tournament standings, scores, and team stats', game: 'Counter-Strike 2' },
  { label: 'Apex Legends Ranked Weapon Meta', query: 'Apex Legends current season ranked weapon tier list and best loadouts', game: 'Apex Legends' },
  { label: 'Server Status & Outage Check', query: 'Are Riot Games, Valorant, or Steam servers down right now? Current outage reports', game: 'General' },
];

export const MetaPulseView: React.FC = () => {
  const [selectedGame, setSelectedGame] = useState('Valorant');
  const [queryInput, setQueryInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [pulseData, setPulseData] = useState<MetaPulseResponse | null>(null);
  const [copied, setCopied] = useState(false);

  const runPulse = async (searchQuery: string, gameName = selectedGame) => {
    if (!searchQuery.trim()) return;

    setLoading(true);
    setCopied(false);

    playCategorizedAudio('https://assets.mixkit.co/sfx/preview/mixkit-software-interface-start-2574.mp3', 'system', 0.35);

    try {
      const res = await fetch('/api/meta-pulse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: searchQuery,
          game: gameName,
        }),
      });

      const data = await res.json();
      setPulseData(data);

      playCategorizedAudio('https://assets.mixkit.co/sfx/preview/mixkit-positive-interface-beep-2586.mp3', 'system', 0.35);
    } catch (err) {
      console.error('Pulse failed:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleChipClick = (chip: typeof QUICK_CHIPS[0]) => {
    setSelectedGame(chip.game);
    setQueryInput(chip.query);
    runPulse(chip.query, chip.game);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!queryInput.trim()) return;
    runPulse(queryInput, selectedGame);
  };

  const handleCopy = () => {
    if (!pulseData?.answer) return;
    navigator.clipboard.writeText(pulseData.answer).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  };

  return (
    <div className="p-6 md:p-8 space-y-8 max-w-[1600px] mx-auto animate-fadeIn pb-24">
      
      {/* Hero Command Banner */}
      <div className="relative rounded-[2.5rem] p-8 md:p-10 overflow-hidden bg-gradient-to-r from-cyan-950/40 via-purple-950/40 to-blue-950/40 border border-cyan-500/30 shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/15 rounded-full blur-[100px] pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-600/15 rounded-full blur-[100px] pointer-events-none"></div>

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-400/40 flex items-center justify-center text-cyan-400 shadow-md">
                <Radio size={20} className="animate-pulse" />
              </div>
              <span className="px-3 py-1 rounded-full bg-cyan-500/15 border border-cyan-500/30 text-xs font-black tracking-wider uppercase text-cyan-300">
                AI Search Grounding Active
              </span>
              <span className="text-xs font-bold text-slate-400">• gemini-3.5-flash with Google Search</span>
            </div>
            
            <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight leading-tight">
              MetaPulse <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400">Live Intel Radar</span>
            </h1>
            
            <p className="text-slate-300 text-base md:text-lg max-w-2xl font-medium">
              Real-time competitive gaming intelligence, live esports tournament scores, standings, character tier lists, and patch meta verified directly via Google Search.
            </p>
          </div>

          {/* Quick Metrics Badges */}
          <div className="flex flex-row lg:flex-col gap-3 shrink-0">
            <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-black/40 border border-white/10 backdrop-blur-md">
              <Globe size={20} className="text-cyan-400" />
              <div>
                <p className="text-[10px] uppercase font-bold text-slate-400">Grounding Source</p>
                <p className="text-xs font-black text-white">Google Search Data</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-black/40 border border-white/10 backdrop-blur-md">
              <Activity size={20} className="text-emerald-400" />
              <div>
                <p className="text-[10px] uppercase font-bold text-slate-400">Radar Latency</p>
                <p className="text-xs font-black text-emerald-400">Live Stream Ready</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Select Game Focus */}
      <div className="space-y-3">
        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
          <Target size={14} className="text-cyan-400" />
          <span>Select Game Focus:</span>
        </label>
        
        <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar">
          {POPULAR_GAMES.map((game) => {
            const GameIcon = game.icon;
            const isSelected = selectedGame === game.name;
            return (
              <button
                key={game.id}
                onClick={() => setSelectedGame(game.name)}
                className={`flex items-center gap-2.5 px-4 py-3 rounded-2xl border font-bold text-xs whitespace-nowrap transition-all active:scale-95 shrink-0 ${
                  isSelected
                    ? 'bg-cyan-500 text-black border-cyan-400 shadow-lg shadow-cyan-500/25 scale-105 font-black'
                    : 'bg-[#14131d] hover:bg-[#1a1926] border-white/10 text-slate-300 hover:text-white'
                }`}
              >
                <GameIcon size={16} />
                <span>{game.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Search Input Bar */}
      <form onSubmit={handleSubmit} className="relative">
        <div className="relative flex items-center">
          <div className="absolute left-5 pointer-events-none text-slate-400">
            <Search size={22} />
          </div>
          <input
            type="text"
            value={queryInput}
            onChange={(e) => setQueryInput(e.target.value)}
            placeholder={`Ask any live intel question for ${selectedGame} (e.g. 'Who won the match yesterday?', 'Current tier list', 'Patch notes summary')...`}
            className="w-full h-16 pl-14 pr-36 rounded-2xl bg-[#14131d] border-2 border-white/10 hover:border-cyan-500/50 focus:border-cyan-400 focus:bg-black/60 outline-none text-base text-white placeholder-slate-500 font-medium transition-all shadow-xl"
          />
          <button
            type="submit"
            disabled={loading || !queryInput.trim()}
            className="absolute right-3 px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 via-blue-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-black font-black text-sm flex items-center gap-2 transition-all shadow-lg shadow-cyan-500/30 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <RefreshCw size={16} className="animate-spin" />
                <span>Scanning...</span>
              </>
            ) : (
              <>
                <Zap size={16} fill="currentColor" />
                <span>Pulse Radar</span>
              </>
            )}
          </button>
        </div>
      </form>

      {/* Quick Intel Chips */}
      <div className="space-y-2">
        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Trending Live Pulses:</p>
        <div className="flex flex-wrap gap-2.5">
          {QUICK_CHIPS.map((chip, idx) => (
            <button
              key={idx}
              onClick={() => handleChipClick(chip)}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/5 hover:bg-cyan-500/10 border border-white/10 hover:border-cyan-500/30 text-xs font-semibold text-slate-300 hover:text-cyan-300 transition-all active:scale-95"
            >
              <Sparkles size={13} className="text-cyan-400" />
              <span>{chip.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Loading Scanning State */}
      {loading && (
        <div className="p-12 rounded-3xl bg-[#13121c] border border-cyan-500/30 text-center space-y-5 animate-pulse shadow-2xl">
          <div className="w-20 h-20 rounded-full bg-cyan-500/20 border-2 border-cyan-400/60 mx-auto flex items-center justify-center relative shadow-lg shadow-cyan-500/30">
            <Radio size={36} className="text-cyan-400 animate-spin-slow" />
            <div className="absolute inset-0 rounded-full border border-cyan-400 animate-ping"></div>
          </div>
          <div className="space-y-1.5">
            <h3 className="text-xl font-black text-white">Synthesizing Real-Time Google Search Intel...</h3>
            <p className="text-sm text-slate-400">Grounding query with live tournament databases, patch logs & competitive wikis via gemini-3.5-flash</p>
          </div>
          <div className="w-64 h-2 bg-white/10 rounded-full mx-auto overflow-hidden">
            <div className="w-full h-full bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 animate-[shimmer_1.5s_infinite]"></div>
          </div>
        </div>
      )}

      {/* Results Report Card */}
      {!loading && pulseData && (
        <div className="rounded-3xl bg-[#13121c] border border-white/10 p-6 md:p-8 space-y-6 shadow-2xl">
          
          {/* Header Action Bar */}
          <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-white/5">
            <div className="flex items-center gap-2.5">
              <span className="w-3 h-3 rounded-full bg-emerald-400 animate-pulse"></span>
              <span className="text-sm font-bold text-emerald-400">Live Intel Synchronized</span>
              <span className="text-slate-600">•</span>
              <span className="text-xs text-slate-400">{pulseData.timestamp}</span>
              <span className="text-slate-600">•</span>
              <span className="text-xs font-mono text-cyan-300">{pulseData.model}</span>
            </div>

            <button
              onClick={handleCopy}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-bold text-slate-300 hover:text-white transition-all border border-white/5 active:scale-95"
            >
              {copied ? (
                <>
                  <Check size={14} className="text-emerald-400" />
                  <span className="text-emerald-400">Copied to Clipboard</span>
                </>
              ) : (
                <>
                  <Copy size={14} />
                  <span>Copy Intel Briefing</span>
                </>
              )}
            </button>
          </div>

          {/* Formatted Markdown Content */}
          <div className="text-slate-200 text-sm md:text-base leading-relaxed space-y-3 whitespace-pre-wrap font-sans">
            {pulseData.answer}
          </div>

          {/* Verified Google Search Grounding Sources */}
          {pulseData.sources && pulseData.sources.length > 0 && (
            <div className="pt-4 border-t border-white/5 space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-400">
                <Globe size={15} className="text-cyan-400" />
                <span>Verified Google Search Grounding Sources ({pulseData.sources.length}):</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {pulseData.sources.map((src, idx) => (
                  <a
                    key={idx}
                    href={src.uri}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between p-3.5 rounded-2xl bg-white/5 hover:bg-cyan-500/10 border border-white/10 hover:border-cyan-500/40 text-xs font-medium text-slate-300 hover:text-cyan-300 transition-all group"
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      <span className="w-2 h-2 rounded-full bg-cyan-400/70 group-hover:bg-cyan-400 shrink-0"></span>
                      <div className="truncate">
                        <p className="font-bold text-white group-hover:text-cyan-300 truncate">{src.title}</p>
                        <p className="text-[11px] text-slate-500 truncate">{src.domain}</p>
                      </div>
                    </div>
                    <ArrowUpRight size={14} className="text-slate-500 group-hover:text-cyan-400 shrink-0 ml-2 transition-colors" />
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Google Search Queries Executed */}
          {pulseData.searchQueries && pulseData.searchQueries.length > 0 && (
            <div className="flex items-center gap-2 pt-2 text-xs text-slate-500">
              <span className="font-semibold">Search Grounding Queries:</span>
              <div className="flex flex-wrap gap-2">
                {pulseData.searchQueries.map((q, idx) => (
                  <span key={idx} className="px-2.5 py-1 rounded-lg bg-black/40 border border-white/5 font-mono text-slate-400">
                    "{q}"
                  </span>
                ))}
              </div>
            </div>
          )}

        </div>
      )}

      {/* Feature Showcase Grid if No Query Run Yet */}
      {!loading && !pulseData && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
          <div className="p-6 rounded-3xl bg-[#14131d] border border-white/5 space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Trophy size={24} />
            </div>
            <h3 className="text-lg font-black text-white">Live Tournament Tracker</h3>
            <p className="text-xs text-slate-400 leading-relaxed font-medium">
              Real-time match scores, tournament brackets, and standings from VCT, LoL Worlds, and CS2 Majors grounded with live web results.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-[#14131d] border border-white/5 space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400">
              <Zap size={24} />
            </div>
            <h3 className="text-lg font-black text-white">Patch Meta Radar</h3>
            <p className="text-xs text-slate-400 leading-relaxed font-medium">
              Up-to-the-minute agent, champion, and weapon tier lists synthesized from high-elo tournament play and current patch logs.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-[#14131d] border border-white/5 space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Server size={24} />
            </div>
            <h3 className="text-lg font-black text-white">Real-Time Server Status</h3>
            <p className="text-xs text-slate-400 leading-relaxed font-medium">
              Instant verification of game server outages across Riot Games, Steam, Battle.net, and Discord with live source links.
            </p>
          </div>
        </div>
      )}

    </div>
  );
};
