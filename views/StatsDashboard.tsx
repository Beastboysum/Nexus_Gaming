import React from 'react';
import { OgiveChart, ActivityBarChart } from '../components/StatsChart';
import { Trophy, Target, Zap, Clock, ArrowUp, ArrowDown, Gamepad2 } from 'lucide-react';

export const StatsDashboard: React.FC = () => {
  return (
    <div className="p-6 space-y-8 max-w-[1600px] mx-auto animate-fadeIn">
      
      {/* Welcome Banner */}
      <div className="relative rounded-3xl p-8 overflow-hidden group">
         <div className="absolute inset-0 bg-gradient-to-r from-purple-900/40 to-blue-900/40 backdrop-blur-lg border border-white/10 rounded-3xl"></div>
         <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/20 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2"></div>
         
         <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-6">
             <div>
                 <h1 className="text-4xl font-black text-white mb-2 drop-shadow-lg">
                    Ready to Dominate, <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">Bogdan?</span>
                 </h1>
                 <p className="text-slate-300 text-lg">Your aim accuracy is up <span className="text-emerald-400 font-bold">+12%</span> this week. Keep pushing!</p>
             </div>
             <button className="px-6 py-3 bg-white text-black font-bold rounded-xl shadow-[0_0_20px_rgba(255,255,255,0.3)] hover:scale-105 transition-transform flex items-center gap-2">
                 <Zap size={20} className="fill-black" /> Play Competitive
             </button>
         </div>
      </div>

      {/* Header Stats with Tilt Effect */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'K/D Ratio', value: '2.45', change: '+12%', icon: Target, color: 'text-emerald-400', gradient: 'from-emerald-500/20 to-emerald-900/5', border: 'hover:border-emerald-500/50' },
          { label: 'Win Rate', value: '68.5%', change: '+5%', icon: Trophy, color: 'text-amber-400', gradient: 'from-amber-500/20 to-amber-900/5', border: 'hover:border-amber-500/50' },
          { label: 'Headshots', value: '1,240', change: '+23%', icon: Zap, color: 'text-purple-400', gradient: 'from-purple-500/20 to-purple-900/5', border: 'hover:border-purple-500/50' },
          { label: 'Play Time', value: '420h', change: 'Top 1%', icon: Clock, color: 'text-blue-400', gradient: 'from-blue-500/20 to-blue-900/5', border: 'hover:border-blue-500/50' },
        ].map((stat, i) => (
          <div 
            key={i} 
            className={`
                relative bg-[#121216]/60 backdrop-blur-md p-6 rounded-3xl border border-white/5 
                transition-all duration-500 group hover:-translate-y-2 hover:shadow-[0_10px_40px_-10px_rgba(0,0,0,0.5)]
                ${stat.border}
            `}
          >
            {/* Inner Glow */}
            <div className={`absolute inset-0 bg-gradient-to-br ${stat.gradient} opacity-0 group-hover:opacity-100 transition-opacity rounded-3xl duration-500`}></div>
            
            <div className="relative z-10 flex justify-between items-start">
                <div>
                    <p className="text-slate-400 text-sm font-semibold mb-2">{stat.label}</p>
                    <h3 className="text-4xl font-black text-white tracking-tight">{stat.value}</h3>
                    <div className="flex items-center gap-1 mt-3">
                        <div className={`flex items-center text-xs font-bold px-2 py-0.5 rounded-full bg-white/5 ${stat.color}`}>
                            <ArrowUp size={12} strokeWidth={3} /> {stat.change}
                        </div>
                        <span className="text-xs text-slate-500 font-medium">vs last week</span>
                    </div>
                </div>
                <div className={`w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center border border-white/5 group-hover:scale-110 transition-transform duration-500 ${stat.color}`}>
                    <stat.icon size={24} />
                </div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="p-1 rounded-[26px] bg-gradient-to-b from-white/10 to-transparent">
            <OgiveChart />
        </div>
        <div className="p-1 rounded-[26px] bg-gradient-to-b from-white/10 to-transparent">
            <ActivityBarChart />
        </div>
      </div>

      {/* Recent Matches Table */}
      <div className="bg-[#121216]/60 backdrop-blur-md p-6 rounded-3xl border border-white/5 shadow-xl">
        <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <Gamepad2 size={24} className="text-purple-500" />
                Recent Matches
            </h3>
            <button className="text-sm font-bold text-slate-400 hover:text-white transition-colors">View All</button>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="text-left text-xs font-bold text-slate-500 uppercase tracking-wider">
              <tr>
                <th className="pb-4 pl-4">Agent</th>
                <th className="pb-4">Map</th>
                <th className="pb-4">Result</th>
                <th className="pb-4">K/D/A</th>
                <th className="pb-4 text-right pr-4">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {[
                { agent: 'Jett', map: 'Ascent', result: 'Victory', score: '13 - 9', kda: '24/12/5', date: '2h ago', color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
                { agent: 'Reyna', map: 'Haven', result: 'Defeat', score: '11 - 13', kda: '18/19/2', date: '5h ago', color: 'text-red-400', bg: 'bg-red-500/10' },
                { agent: 'Omen', map: 'Lotus', result: 'Victory', score: '13 - 5', kda: '15/8/12', date: '1d ago', color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
                { agent: 'Raze', map: 'Split', result: 'Victory', score: '13 - 11', kda: '32/15/4', date: '2d ago', color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
              ].map((match, i) => (
                <tr key={i} className="group hover:bg-white/5 transition-colors cursor-pointer">
                  <td className="py-4 pl-4">
                      <div className="flex items-center gap-3">
                        <img src={`https://picsum.photos/40/40?random=${i+200}`} className="w-10 h-10 rounded-xl object-cover" alt="Agent" />
                        <span className="font-bold text-white">{match.agent}</span>
                      </div>
                  </td>
                  <td className="py-4 font-medium text-slate-300">{match.map}</td>
                  <td className="py-4">
                      <div className="flex flex-col">
                          <span className={`font-black ${match.color} uppercase text-sm tracking-wider`}>{match.result}</span>
                          <span className="text-xs text-slate-500 font-mono">{match.score}</span>
                      </div>
                  </td>
                  <td className="py-4 font-mono text-slate-200 group-hover:text-purple-400 transition-colors">{match.kda}</td>
                  <td className="py-4 text-right pr-4 text-slate-500 font-medium text-sm">{match.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      
      <style>{`
        @keyframes fadeIn {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
            animation: fadeIn 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}</style>
    </div>
  );
};