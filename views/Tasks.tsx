import React, { useState } from 'react';
import { CheckCircle2, Circle, TrendingUp, TrendingDown, Minus, Crown, Zap } from 'lucide-react';
import { motion } from 'motion/react';
import { GamingTask, LeaderboardEntry } from '../types';
import { playCategorizedAudio } from '../services/audioManager';
import { SoundEffectEngine } from '../services/SoundEffectEngine';

const TASKS: GamingTask[] = [
  { id: '1', title: 'Win 3 Ranked Matches', xp: 500, completed: true, type: 'daily' },
  { id: '2', title: 'Get 50 Headshots', xp: 300, completed: false, type: 'daily' },
  { id: '3', title: 'Play with a Friend', xp: 200, completed: false, type: 'daily' },
  { id: '4', title: 'Complete "The Gauntlet" Raid', xp: 2000, completed: false, type: 'weekly' },
];

const LEADERBOARD: LeaderboardEntry[] = [
  { rank: 1, user: { id: '1', username: 'NinjaCat', avatar: 'https://picsum.photos/50/50?random=1', status: 'online' }, score: 12500, trend: 'up' },
  { rank: 2, user: { id: '2', username: 'ShadowSlayer', avatar: 'https://picsum.photos/50/50?random=2', status: 'online' }, score: 11200, trend: 'same' },
  { rank: 3, user: { id: '3', username: 'PixelMage', avatar: 'https://picsum.photos/50/50?random=3', status: 'idle' }, score: 10800, trend: 'down' },
  { rank: 4, user: { id: '4', username: 'LootGoblin', avatar: 'https://picsum.photos/50/50?random=4', status: 'offline' }, score: 9500, trend: 'up' },
];

export const TasksView: React.FC = () => {
  const [tasks, setTasks] = useState(TASKS);

  const totalXP = tasks.reduce((acc, t) => acc + t.xp, 0);
  const earnedXP = tasks.reduce((acc, t) => acc + (t.completed ? t.xp : 0), 0);
  const progress = totalXP > 0 ? (earnedXP / totalXP) * 100 : 0;

  const toggleTask = (id: string) => {
    const task = tasks.find(t => t.id === id);
    const willBeCompleted = !task?.completed;
    setTasks(tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
    
    // Sound effect & event notifications
    if (willBeCompleted && task) {
        SoundEffectEngine.play('task-complete');
        playCategorizedAudio('https://assets.mixkit.co/sfx/preview/mixkit-video-game-treasure-2066.mp3', 'system', 0.6);
        window.dispatchEvent(new CustomEvent('nexus_task_completed', {
          detail: { taskTitle: task.title, xp: task.xp }
        }));
        window.dispatchEvent(new CustomEvent('nexus_xp_gained', {
          detail: { amount: task.xp, source: task.title }
        }));
    } else {
        SoundEffectEngine.play('button-click');
    }
  };

  return (
    <div className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-8 h-full overflow-y-auto">
      {/* Tasks Section */}
      <div className="space-y-6">
        {/* Progress Bar Section */}
        <div className="bg-white dark:bg-slate-800/50 p-6 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-sm">
          <div className="flex justify-between items-end mb-4">
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Current Progress</p>
              <h3 className="text-2xl font-black text-slate-800 dark:text-white flex items-center gap-2">
                {earnedXP.toLocaleString()} <span className="text-slate-400 font-medium text-lg">/ {totalXP.toLocaleString()} XP</span>
              </h3>
            </div>
            <div className="text-right">
              <span className="text-3xl font-black text-purple-500">{Math.round(progress)}%</span>
            </div>
          </div>
          
          <div className="h-4 w-full bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden relative">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ type: 'spring', stiffness: 50, damping: 15 }}
              className="h-full bg-gradient-to-r from-purple-600 to-indigo-500 relative"
            >
              <div className="absolute inset-0 bg-[linear-gradient(45deg,rgba(255,255,255,0.2)_25%,transparent_25%,transparent_50%,rgba(255,255,255,0.2)_50%,rgba(255,255,255,0.2)_75%,transparent_75%,transparent)] bg-[length:20px_20px] animate-[shimmer_2s_linear_infinite]" />
            </motion.div>
          </div>

          <div className="mt-4 flex items-center gap-2 text-sm font-medium text-slate-500 dark:text-slate-400">
            <Zap size={14} className="text-yellow-500 fill-yellow-500" />
            <span>Complete more missions to unlock Level 15!</span>
          </div>
        </div>

        <h2 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-3">
          Daily Missions <span className="text-sm font-normal bg-purple-100 dark:bg-purple-900 text-purple-600 dark:text-purple-300 px-3 py-1 rounded-full">Resets in 12h</span>
        </h2>
        
        <div className="space-y-4">
          {tasks.map((task) => (
            <div 
              key={task.id}
              onClick={() => toggleTask(task.id)}
              className={`p-4 rounded-2xl border-2 cursor-pointer transition-all duration-300 flex items-center justify-between group
                ${task.completed 
                  ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-500/50' 
                  : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-purple-500'}
              `}
            >
              <div className="flex items-center gap-4">
                <div className={`
                  w-8 h-8 rounded-full flex items-center justify-center transition-colors
                  ${task.completed ? 'bg-emerald-500 text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-400 group-hover:bg-purple-100 dark:group-hover:bg-purple-900/50'}
                `}>
                  {task.completed ? <CheckCircle2 size={18} /> : <Circle size={18} />}
                </div>
                <div>
                  <h3 className={`font-bold ${task.completed ? 'text-emerald-700 dark:text-emerald-400 line-through' : 'text-slate-800 dark:text-white'}`}>
                    {task.title}
                  </h3>
                  <p className="text-xs text-slate-500 uppercase tracking-wide font-bold mt-1">{task.type}</p>
                </div>
              </div>
              <div className="px-3 py-1 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 rounded-lg font-bold text-sm">
                +{task.xp} XP
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Leaderboard Section */}
      <div className="bg-white dark:bg-[#1a1b26] rounded-3xl p-6 shadow-xl border border-slate-100 dark:border-slate-800">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
            <Crown className="text-yellow-500" fill="currentColor" />
            Top Players
          </h2>
          <select className="bg-slate-100 dark:bg-slate-800 border-none rounded-xl px-4 py-2 text-sm font-semibold outline-none focus:ring-2 focus:ring-purple-500">
            <option>This Week</option>
            <option>All Time</option>
          </select>
        </div>

        <div className="space-y-4">
          {LEADERBOARD.map((entry) => (
            <div key={entry.rank} className="flex items-center justify-between p-3 hover:bg-slate-50 dark:hover:bg-white/5 rounded-xl transition-colors">
              <div className="flex items-center gap-4">
                <span className={`
                  w-8 h-8 flex items-center justify-center font-bold text-lg
                  ${entry.rank === 1 ? 'text-yellow-500' : entry.rank === 2 ? 'text-gray-400' : entry.rank === 3 ? 'text-amber-700' : 'text-slate-400'}
                `}>#{entry.rank}</span>
                <img src={entry.user.avatar} alt={entry.user.username} className="w-10 h-10 rounded-full border-2 border-white dark:border-slate-700 shadow-sm" />
                <span className="font-semibold text-slate-700 dark:text-slate-200">{entry.user.username}</span>
              </div>
              
              <div className="flex items-center gap-6">
                <span className="font-mono font-bold text-purple-600 dark:text-purple-400">{entry.score.toLocaleString()}</span>
                {entry.trend === 'up' && <TrendingUp size={16} className="text-green-500" />}
                {entry.trend === 'down' && <TrendingDown size={16} className="text-red-500" />}
                {entry.trend === 'same' && <Minus size={16} className="text-gray-400" />}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
