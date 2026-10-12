import React from 'react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Cell
} from 'recharts';
import { StatPoint } from '../types';

const data: StatPoint[] = [
  { date: 'Mon', kills: 12, deaths: 8, assists: 15, winRate: 45 },
  { date: 'Tue', kills: 18, deaths: 5, assists: 20, winRate: 60 },
  { date: 'Wed', kills: 15, deaths: 10, assists: 12, winRate: 55 },
  { date: 'Thu', kills: 25, deaths: 4, assists: 25, winRate: 85 },
  { date: 'Fri', kills: 20, deaths: 9, assists: 18, winRate: 65 },
  { date: 'Sat', kills: 32, deaths: 6, assists: 30, winRate: 90 },
  { date: 'Sun', kills: 28, deaths: 8, assists: 22, winRate: 75 },
];

export const OgiveChart: React.FC = () => {
  return (
    <div className="h-64 w-full bg-white dark:bg-[#1a1b26] p-4 rounded-3xl shadow-lg border border-slate-100 dark:border-slate-800 transition-colors duration-300">
      <h3 className="text-lg font-bold mb-4 text-slate-800 dark:text-white flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-purple-500"></span>
        Performance Trend (Ogive)
      </h3>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data}>
          <defs>
            <linearGradient id="colorKills" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
            </linearGradient>
            <linearGradient id="colorWin" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.2} />
          <XAxis dataKey="date" stroke="#94a3b8" tick={{fill: '#94a3b8'}} />
          <YAxis stroke="#94a3b8" tick={{fill: '#94a3b8'}} />
          <Tooltip 
            contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', borderRadius: '12px', color: '#fff' }}
            itemStyle={{ color: '#fff' }}
          />
          <Area 
            type="monotone" 
            dataKey="kills" 
            stroke="#8b5cf6" 
            strokeWidth={3}
            fillOpacity={1} 
            fill="url(#colorKills)" 
            animationDuration={1500}
            animationEasing="ease-out"
          />
          <Area 
            type="monotone" 
            dataKey="winRate" 
            stroke="#10b981" 
            strokeWidth={3}
            fillOpacity={1} 
            fill="url(#colorWin)" 
            animationDuration={1500}
            animationEasing="ease-out"
            animationBegin={300}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export const ActivityBarChart: React.FC = () => {
    return (
      <div className="h-64 w-full bg-white dark:bg-[#1a1b26] p-4 rounded-3xl shadow-lg border border-slate-100 dark:border-slate-800 transition-colors duration-300">
        <h3 className="text-lg font-bold mb-4 text-slate-800 dark:text-white flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-orange-400"></span>
            Daily Activity
        </h3>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.2} vertical={false} />
            <XAxis dataKey="date" stroke="#94a3b8" tick={{fill: '#94a3b8'}} axisLine={false} tickLine={false} />
            <Tooltip 
                cursor={{fill: 'transparent'}}
                contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', borderRadius: '12px', color: '#fff' }}
            />
            <Bar dataKey="assists" fill="#fb923c" radius={[10, 10, 10, 10]} barSize={12} animationDuration={1000}>
                {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={index % 2 === 0 ? '#fb923c' : '#fdba74'} />
                ))}
            </Bar>
            <Bar dataKey="deaths" fill="#ef4444" radius={[10, 10, 10, 10]} barSize={12} animationDuration={1000} animationBegin={200} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    );
  };
