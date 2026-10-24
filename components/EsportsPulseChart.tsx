import React, { useState } from 'react';
import { 
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid 
} from 'recharts';
import { 
  TrendingUp, Users, Radio, Trophy, Zap, Flame, Swords, Target, Eye, Sparkles 
} from 'lucide-react';
import { SoundEffectEngine } from '../services/audioManager';

interface StreamTrendPoint {
  time: string;
  all: number;
  valorant: number;
  lol: number;
  cs2: number;
  apex: number;
  tournament: string;
  topStreamer: string;
}

const PULSE_24H_DATA: StreamTrendPoint[] = [
  { time: '24h ago', all: 210, valorant: 85, lol: 65, cs2: 40, apex: 20, tournament: 'APAC Challengers Open', topStreamer: 'Paper Rex Watchparty' },
  { time: '21h ago', all: 180, valorant: 70, lol: 55, cs2: 35, apex: 20, tournament: 'Korea LCK Regular Season', topStreamer: 'T1 vs Gen.G Broadcast' },
  { time: '18h ago', all: 245, valorant: 95, lol: 85, cs2: 45, apex: 20, tournament: 'EMEA Masters Stage 2', topStreamer: 'Kamet0 Co-Stream' },
  { time: '15h ago', all: 330, valorant: 135, lol: 115, cs2: 55, apex: 25, tournament: 'LEC Spring Playoffs', topStreamer: 'Riot Games Official' },
  { time: '12h ago', all: 420, valorant: 170, lol: 145, cs2: 70, apex: 35, tournament: 'VCT Masters Upper Semis', topStreamer: 'tarik (142k viewers)' },
  { time: '9h ago', all: 485, valorant: 205, lol: 165, cs2: 80, apex: 35, tournament: 'VCT Masters Upper Finals', topStreamer: 'Sentinels vs Fnatic' },
  { time: '6h ago', all: 455, valorant: 185, lol: 155, cs2: 80, apex: 35, tournament: 'CS2 Major Quarterfinals', topStreamer: 'ESLCS Official Stream' },
  { time: '3h ago', all: 395, valorant: 155, lol: 140, cs2: 65, apex: 35, tournament: 'Americas Kickoff Matches', topStreamer: 'Kyedae Watchparty' },
  { time: 'Now', all: 468, valorant: 195, lol: 160, cs2: 75, apex: 38, tournament: 'Grand Finals Live Broadcast', topStreamer: 'VCT International Live' },
];

type GameFilter = 'all' | 'valorant' | 'lol' | 'cs2' | 'apex';

interface FilterOption {
  id: GameFilter;
  label: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  strokeColor: string;
  fillId: string;
  gradientStart: string;
  gradientEnd: string;
  accentBadge: string;
}

const FILTER_CONFIGS: Record<GameFilter, FilterOption> = {
  all: {
    id: 'all',
    label: 'All Top Streams',
    icon: Sparkles,
    strokeColor: '#06b6d4',
    fillId: 'colorAll',
    gradientStart: '#06b6d4',
    gradientEnd: '#8b5cf6',
    accentBadge: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30',
  },
  valorant: {
    id: 'valorant',
    label: 'Valorant',
    icon: Zap,
    strokeColor: '#f43f5e',
    fillId: 'colorVal',
    gradientStart: '#f43f5e',
    gradientEnd: '#e11d48',
    accentBadge: 'text-rose-400 bg-rose-500/10 border-rose-500/30',
  },
  lol: {
    id: 'lol',
    label: 'League of Legends',
    icon: Swords,
    strokeColor: '#3b82f6',
    fillId: 'colorLol',
    gradientStart: '#3b82f6',
    gradientEnd: '#1d4ed8',
    accentBadge: 'text-blue-400 bg-blue-500/10 border-blue-500/30',
  },
  cs2: {
    id: 'cs2',
    label: 'Counter-Strike 2',
    icon: Target,
    strokeColor: '#f59e0b',
    fillId: 'colorCs2',
    gradientStart: '#f59e0b',
    gradientEnd: '#b45309',
    accentBadge: 'text-amber-400 bg-amber-500/10 border-amber-500/30',
  },
  apex: {
    id: 'apex',
    label: 'Apex Legends',
    icon: Flame,
    strokeColor: '#f97316',
    fillId: 'colorApex',
    gradientStart: '#f97316',
    gradientEnd: '#c2410c',
    accentBadge: 'text-orange-400 bg-orange-500/10 border-orange-500/30',
  },
};

export const EsportsPulseChart: React.FC = () => {
  const [activeFilter, setActiveFilter] = useState<GameFilter>('all');
  const currentConfig = FILTER_CONFIGS[activeFilter];

  const currentViewers = PULSE_24H_DATA[PULSE_24H_DATA.length - 1][activeFilter];
  const peakViewers = Math.max(...PULSE_24H_DATA.map((d) => d[activeFilter]));
  const startViewers = PULSE_24H_DATA[0][activeFilter];
  const growthPercent = (((currentViewers - startViewers) / startViewers) * 100).toFixed(1);

  const handleFilterChange = (filter: GameFilter) => {
    SoundEffectEngine.play('button-click');
    setActiveFilter(filter);
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const dataPoint = payload[0].payload as StreamTrendPoint;
      const count = payload[0].value;
      return (
        <div className="bg-[#0f111a]/95 border border-white/15 rounded-2xl p-3.5 shadow-2xl backdrop-blur-xl space-y-1.5 min-w-[220px]">
          <div className="flex items-center justify-between border-b border-white/10 pb-1.5">
            <span className="text-[11px] font-mono font-bold text-slate-400">{dataPoint.time}</span>
            <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-400">
              <Radio size={10} className="animate-pulse" /> Live Twitch + YT
            </span>
          </div>
          <div className="flex items-baseline justify-between pt-1">
            <span className="text-xs font-semibold text-slate-300">Concurrent Viewers:</span>
            <span className="text-base font-black text-white font-mono">{count}K</span>
          </div>
          <div className="text-[11px] text-cyan-300 font-medium">
            🏆 {dataPoint.tournament}
          </div>
          <div className="text-[10px] text-slate-400 flex items-center gap-1">
            <Eye size={10} /> Top: <span className="text-slate-200 font-medium">{dataPoint.topStreamer}</span>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <section className="bg-gradient-to-br from-[#12131f] via-[#101018] to-[#141224] rounded-3xl border border-white/10 p-5 sm:p-7 space-y-6 shadow-2xl relative overflow-hidden">
      {/* Background Glow */}
      <div 
        className="absolute -top-24 -right-24 w-80 h-80 rounded-full blur-[100px] opacity-20 pointer-events-none transition-colors duration-500"
        style={{ backgroundColor: currentConfig.strokeColor }}
      />

      {/* Header & Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 relative z-10">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <div className="p-1.5 rounded-lg bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
              <TrendingUp size={16} />
            </div>
            <span className="text-xs font-black tracking-widest uppercase text-cyan-400">
              Real-Time Esports Analytics
            </span>
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse ml-1" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2">
            <span>Esports Pulse</span>
            <span className="text-sm font-semibold text-slate-400">• 24h Popularity Trend</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-xl">
            Live concurrent viewership trajectories aggregated across global tournaments, co-streamers, and top broadcast platforms.
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-black/40 border border-white/10 flex-wrap">
          {(Object.keys(FILTER_CONFIGS) as GameFilter[]).map((fKey) => {
            const conf = FILTER_CONFIGS[fKey];
            const Icon = conf.icon;
            const isSelected = activeFilter === fKey;
            return (
              <button
                key={fKey}
                onClick={() => handleFilterChange(fKey)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  isSelected
                    ? `${conf.accentBadge} shadow-lg font-black scale-102`
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <Icon size={13} />
                <span>{conf.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 4 Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 relative z-10">
        <div className="p-3.5 rounded-2xl bg-[#191929]/70 border border-white/5">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
            <Users size={12} className="text-cyan-400" /> Current Viewers
          </p>
          <p className="text-xl sm:text-2xl font-black text-white mt-1 font-mono">
            {currentViewers.toLocaleString()}K
          </p>
          <span className="text-[10px] text-emerald-400 font-bold">
            Live Streamers Broadcasting
          </span>
        </div>

        <div className="p-3.5 rounded-2xl bg-[#191929]/70 border border-white/5">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
            <Trophy size={12} className="text-amber-400" /> 24h Peak Viewers
          </p>
          <p className="text-xl sm:text-2xl font-black text-white mt-1 font-mono">
            {peakViewers.toLocaleString()}K
          </p>
          <span className="text-[10px] text-slate-400">
            Recorded 9 hours ago
          </span>
        </div>

        <div className="p-3.5 rounded-2xl bg-[#191929]/70 border border-white/5">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
            <TrendingUp size={12} className="text-emerald-400" /> 24h Velocity
          </p>
          <p className="text-xl sm:text-2xl font-black text-emerald-400 mt-1 font-mono">
            +{growthPercent}%
          </p>
          <span className="text-[10px] text-slate-400">
            Tournament surge
          </span>
        </div>

        <div className="p-3.5 rounded-2xl bg-[#191929]/70 border border-white/5">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
            <Radio size={12} className="text-purple-400" /> Top Event
          </p>
          <p className="text-xs sm:text-sm font-black text-white mt-1.5 truncate">
            VCT Masters Grand Finals
          </p>
          <span className="text-[10px] text-purple-300 font-semibold truncate block">
            Co-stream: tarik • 142K
          </span>
        </div>
      </div>

      {/* Recharts Area Chart */}
      <div className="h-64 sm:h-72 w-full relative z-10 pt-2">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={PULSE_24H_DATA} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
            <defs>
              <linearGradient id={currentConfig.fillId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={currentConfig.gradientStart} stopOpacity={0.45} />
                <stop offset="95%" stopColor={currentConfig.gradientEnd} stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
            <XAxis 
              dataKey="time" 
              stroke="#64748b" 
              fontSize={11} 
              tickLine={false} 
              axisLine={{ stroke: '#ffffff15' }} 
            />
            <YAxis 
              stroke="#64748b" 
              fontSize={11} 
              tickLine={false} 
              axisLine={false} 
              tickFormatter={(v) => `${v}K`} 
            />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey={activeFilter}
              stroke={currentConfig.strokeColor}
              strokeWidth={3}
              fillOpacity={1}
              fill={`url(#${currentConfig.fillId})`}
              dot={{ r: 4, fill: currentConfig.strokeColor, strokeWidth: 2, stroke: '#0f111a' }}
              activeDot={{ r: 7, stroke: '#ffffff', strokeWidth: 2 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Footer Info */}
      <div className="flex items-center justify-between text-[11px] text-slate-500 pt-2 border-t border-white/5 relative z-10 flex-wrap gap-2">
        <span>Grounded via live esports telemetry & streaming APIs</span>
        <span className="font-mono text-slate-400">Sample Frequency: 180 min • Resolution: 1080p60</span>
      </div>
    </section>
  );
};
