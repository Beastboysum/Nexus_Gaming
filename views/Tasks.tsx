import React, { useState, useEffect } from 'react';
import { 
  CheckCircle2, Circle, TrendingUp, TrendingDown, Minus, Crown, Zap, 
  Coins, Sparkles, Shield, Trophy, Flame, Users, CalendarCheck, Radio, 
  Award, Check, ShoppingBag, Eye, HeartHandshake, Star
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { GamingTask, LeaderboardEntry } from '../types';
import { playCategorizedAudio } from '../services/audioManager';
import { SoundEffectEngine } from '../services/SoundEffectEngine';
import { getGamificationData, saveGamificationData, BadgeItem } from '../services/videoCacheDb';

export type TaskCategory = 'Daily Login' | 'Social Engagement' | 'Stream Performance';

interface CategorizedTask extends GamingTask {
  category: TaskCategory;
  coins: number;
  description: string;
}

const DEFAULT_TASKS: CategorizedTask[] = [
  // Daily Login
  { 
    id: 'login-1', 
    title: 'Daily Nexus Check-In', 
    category: 'Daily Login', 
    xp: 200, 
    coins: 40, 
    completed: true, 
    type: 'daily',
    description: 'Log into Nexus and claim your daily streak reward.' 
  },
  { 
    id: 'login-2', 
    title: 'Maintain 3-Day Login Streak', 
    category: 'Daily Login', 
    xp: 350, 
    coins: 60, 
    completed: false, 
    type: 'daily',
    description: 'Keep your gaming momentum alive for consecutive days.' 
  },
  // Social Engagement
  { 
    id: 'social-1', 
    title: 'Squad High-Five in Chat', 
    category: 'Social Engagement', 
    xp: 250, 
    coins: 50, 
    completed: false, 
    type: 'daily',
    description: 'Send a reaction or message in any server or voice channel.' 
  },
  { 
    id: 'social-2', 
    title: 'Co-Watch with Friends', 
    category: 'Social Engagement', 
    xp: 400, 
    coins: 75, 
    completed: false, 
    type: 'daily',
    description: 'Share a YouTube or Twitch stream link with your squad.' 
  },
  // Stream Performance
  { 
    id: 'stream-1', 
    title: 'Watch 5 Minutes of Pro Stream', 
    category: 'Stream Performance', 
    xp: 300, 
    coins: 60, 
    completed: false, 
    type: 'daily',
    description: 'Tune into any live YouTube gaming broadcast or Twitch stream.' 
  },
  { 
    id: 'stream-2', 
    title: 'Analyze MetaPulse Intel', 
    category: 'Stream Performance', 
    xp: 450, 
    coins: 90, 
    completed: false, 
    type: 'daily',
    description: 'Inspect live tournament scores or patch notes in the MetaPulse radar.' 
  },
];

const DEFAULT_BADGES: BadgeItem[] = [
  {
    id: 'badge-radiant',
    name: 'Radiant Vanguard',
    description: 'Supreme rank in tactical marksmanship and clutch mastery.',
    rarity: 'legendary',
    category: 'Esports',
    price: 250,
    unlocked: true,
    equipped: true,
    iconName: 'Crown',
  },
  {
    id: 'badge-clutch',
    name: 'Clutch Demon',
    description: 'Ice-cold execution during high-stakes 1v3 round deciders.',
    rarity: 'epic',
    category: 'Combat',
    price: 150,
    unlocked: false,
    equipped: false,
    iconName: 'Flame',
  },
  {
    id: 'badge-pulse',
    name: 'MetaPulse Oracle',
    description: 'Analyzes tournament match trends and predicts grand finalists.',
    rarity: 'legendary',
    category: 'Intel',
    price: 220,
    unlocked: false,
    equipped: false,
    iconName: 'Zap',
  },
  {
    id: 'badge-streamer',
    name: 'Broadcast Pioneer',
    description: 'Curates the freshest HD YouTube & Twitch streams for the squad.',
    rarity: 'epic',
    category: 'Streaming',
    price: 180,
    unlocked: false,
    equipped: false,
    iconName: 'Radio',
  },
  {
    id: 'badge-sentinel',
    name: 'Squad Sentinel',
    description: 'Trusted voice teammate, callout master, and morale anchor.',
    rarity: 'rare',
    category: 'Social',
    price: 90,
    unlocked: false,
    equipped: false,
    iconName: 'Shield',
  },
  {
    id: 'badge-royale',
    name: 'Nexus Royale',
    description: 'The definitive prestige badge for daily mission completionists.',
    rarity: 'legendary',
    category: 'Prestige',
    price: 350,
    unlocked: false,
    equipped: false,
    iconName: 'Sparkles',
  },
];

const LEADERBOARD: LeaderboardEntry[] = [
  { rank: 1, user: { id: '1', username: 'NinjaCat', avatar: 'https://picsum.photos/50/50?random=1', status: 'online' }, score: 12500, trend: 'up' },
  { rank: 2, user: { id: '2', username: 'ShadowSlayer', avatar: 'https://picsum.photos/50/50?random=2', status: 'online' }, score: 11200, trend: 'same' },
  { rank: 3, user: { id: '3', username: 'PixelMage', avatar: 'https://picsum.photos/50/50?random=3', status: 'idle' }, score: 10800, trend: 'down' },
  { rank: 4, user: { id: '4', username: 'LootGoblin', avatar: 'https://picsum.photos/50/50?random=4', status: 'offline' }, score: 9500, trend: 'up' },
];

export const TasksView: React.FC = () => {
  const [tasks, setTasks] = useState<CategorizedTask[]>(DEFAULT_TASKS);
  const [coins, setCoins] = useState<number>(320);
  const [badges, setBadges] = useState<BadgeItem[]>(DEFAULT_BADGES);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [activeTab, setActiveTab] = useState<'missions' | 'badgeStore'>('missions');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Load persisted gamification data from native IndexedDB
  useEffect(() => {
    let mounted = true;
    Promise.all([
      getGamificationData<CategorizedTask[]>('nexus_tasks_v2', DEFAULT_TASKS),
      getGamificationData<number>('nexus_coins_v2', 320),
      getGamificationData<BadgeItem[]>('nexus_badges_v2', DEFAULT_BADGES),
    ]).then(([savedTasks, savedCoins, savedBadges]) => {
      if (mounted) {
        if (savedTasks && savedTasks.length > 0) setTasks(savedTasks);
        if (typeof savedCoins === 'number') setCoins(savedCoins);
        if (savedBadges && savedBadges.length > 0) setBadges(savedBadges);
      }
    });

    return () => {
      mounted = false;
    };
  }, []);

  const totalXP = tasks.reduce((acc, t) => acc + t.xp, 0);
  const earnedXP = tasks.reduce((acc, t) => acc + (t.completed ? t.xp : 0), 0);
  const progress = totalXP > 0 ? (earnedXP / totalXP) * 100 : 0;

  const equippedBadge = badges.find(b => b.equipped) || badges[0];

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const toggleTask = (id: string) => {
    const task = tasks.find(t => t.id === id);
    if (!task) return;
    const willBeCompleted = !task.completed;

    const updatedTasks = tasks.map(t => 
      t.id === id ? { ...t, completed: willBeCompleted } : t
    );
    setTasks(updatedTasks);
    saveGamificationData('nexus_tasks_v2', updatedTasks);

    if (willBeCompleted) {
      // Award XP & Coins
      const newCoins = coins + task.coins;
      setCoins(newCoins);
      saveGamificationData('nexus_coins_v2', newCoins);

      SoundEffectEngine.play('task-complete');
      playCategorizedAudio('https://assets.mixkit.co/sfx/preview/mixkit-video-game-treasure-2066.mp3', 'system', 0.6);

      triggerToast(`+${task.coins} Nexus Coins • +${task.xp} XP Claimed!`);

      window.dispatchEvent(new CustomEvent('nexus_task_completed', {
        detail: { taskTitle: task.title, xp: task.xp, coins: task.coins, category: task.category }
      }));
      window.dispatchEvent(new CustomEvent('nexus_xp_gained', {
        detail: { amount: task.xp, source: task.title }
      }));
      window.dispatchEvent(new CustomEvent('nexus_coins_updated', {
        detail: { coins: newCoins }
      }));
    } else {
      // Uncheck task & deduct coins safely
      const newCoins = Math.max(0, coins - task.coins);
      setCoins(newCoins);
      saveGamificationData('nexus_coins_v2', newCoins);
      SoundEffectEngine.play('button-click');
    }
  };

  const handleBuyBadge = (badge: BadgeItem) => {
    if (badge.unlocked) return;
    if (coins < badge.price) {
      playCategorizedAudio('https://assets.mixkit.co/sfx/preview/mixkit-software-interface-start-2574.mp3', 'system', 0.4);
      triggerToast(`Need ${(badge.price - coins)} more Nexus Coins!`);
      return;
    }

    const newCoins = coins - badge.price;
    setCoins(newCoins);
    saveGamificationData('nexus_coins_v2', newCoins);

    const updated = badges.map(b => 
      b.id === badge.id ? { ...b, unlocked: true } : b
    );
    setBadges(updated);
    saveGamificationData('nexus_badges_v2', updated);

    SoundEffectEngine.play('task-complete');
    playCategorizedAudio('https://assets.mixkit.co/sfx/preview/mixkit-video-game-treasure-2066.mp3', 'system', 0.65);
    triggerToast(`Unlocked "${badge.name}" Badge!`);
  };

  const handleEquipBadge = (badgeId: string) => {
    const updated = badges.map(b => ({
      ...b,
      equipped: b.id === badgeId,
    }));
    setBadges(updated);
    saveGamificationData('nexus_badges_v2', updated);

    SoundEffectEngine.play('button-click');
    playCategorizedAudio('https://assets.mixkit.co/sfx/preview/mixkit-sci-fi-interface-click-901.mp3', 'system', 0.4);

    const b = badges.find(x => x.id === badgeId);
    triggerToast(`Equipped "${b?.name}" to your profile!`);

    window.dispatchEvent(new CustomEvent('nexus_badge_equipped', {
      detail: { badge: b }
    }));
  };

  // Filter tasks
  const filteredTasks = tasks.filter(t => 
    selectedCategory === 'All' ? true : t.category === selectedCategory
  );

  const getCategoryTheme = (category: TaskCategory) => {
    switch (category) {
      case 'Daily Login':
        return {
          icon: CalendarCheck,
          pill: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
          badgeText: 'Daily Login',
        };
      case 'Social Engagement':
        return {
          icon: Users,
          pill: 'bg-purple-500/15 text-purple-400 border-purple-500/30',
          badgeText: 'Social Engagement',
        };
      case 'Stream Performance':
        return {
          icon: Radio,
          pill: 'bg-cyan-500/15 text-cyan-400 border-cyan-500/30',
          badgeText: 'Stream Performance',
        };
    }
  };

  const renderBadgeIcon = (name: string, size = 18) => {
    switch (name) {
      case 'Crown': return <Crown size={size} />;
      case 'Flame': return <Flame size={size} />;
      case 'Zap': return <Zap size={size} />;
      case 'Radio': return <Radio size={size} />;
      case 'Shield': return <Shield size={size} />;
      default: return <Sparkles size={size} />;
    }
  };

  return (
    <div className="p-3 xs:p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6 lg:gap-8 h-full overflow-y-auto custom-scrollbar pb-24">
      {/* Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-6 right-6 z-50 px-4 py-2.5 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold text-xs sm:text-sm shadow-2xl border border-white/20 flex items-center gap-2 pointer-events-none"
          >
            <Sparkles size={16} className="text-yellow-300" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Center Area: Tasks & Badge Store (8 Cols) */}
      <div className="lg:col-span-8 space-y-4 sm:space-y-6">
        
        {/* Header HUD: Level & Nexus Coins Wallet */}
        <div className="bg-gradient-to-r from-purple-950/40 via-[#161426] to-indigo-950/40 p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-purple-500/20 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full bg-purple-500/20 border border-purple-500/30 text-[10px] font-black uppercase text-purple-300">
                Nexus Gamification Hub
              </span>
              <span className="text-slate-400 text-xs">• Daily Resets in 12h</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white flex items-center gap-2">
              <span>Missions & Rewards</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-0.5">
              Complete categorized tasks to earn XP and Nexus Coins for custom profile badges.
            </p>
          </div>

          {/* Nexus Coins Wallet Pill */}
          <div className="flex items-center gap-3 p-3 sm:p-4 rounded-2xl bg-black/50 border border-yellow-500/30 backdrop-blur-md shadow-lg shrink-0">
            <div className="w-10 h-10 rounded-xl bg-yellow-500/20 border border-yellow-400/40 flex items-center justify-center text-yellow-400 shadow-md">
              <Coins size={22} className="animate-spin-slow" />
            </div>
            <div>
              <p className="text-[10px] uppercase font-bold text-slate-400">Nexus Coins</p>
              <p className="text-xl sm:text-2xl font-black text-yellow-400 font-mono flex items-center gap-1">
                {coins.toLocaleString()} <span className="text-xs text-yellow-300/80">🪙</span>
              </p>
            </div>
          </div>
        </div>

        {/* Tab Switcher: Missions vs Badge Store */}
        <div className="flex items-center justify-between border-b border-white/10 pb-3 flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                SoundEffectEngine.play('button-click');
                setActiveTab('missions');
              }}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl font-black text-xs sm:text-sm transition-all cursor-pointer ${
                activeTab === 'missions'
                  ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30'
                  : 'bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white'
              }`}
            >
              <Zap size={15} />
              <span>Categorized Daily Tasks</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-white/20 ml-1">
                {tasks.filter(t => t.completed).length}/{tasks.length}
              </span>
            </button>

            <button
              onClick={() => {
                SoundEffectEngine.play('button-click');
                setActiveTab('badgeStore');
              }}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl font-black text-xs sm:text-sm transition-all cursor-pointer ${
                activeTab === 'badgeStore'
                  ? 'bg-yellow-500 text-black shadow-lg shadow-yellow-500/30'
                  : 'bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white'
              }`}
            >
              <ShoppingBag size={15} />
              <span>Profile Badge Store</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-yellow-400/20 text-yellow-300 ml-1">
                {badges.filter(b => b.unlocked).length} Unlocked
              </span>
            </button>
          </div>

          <span className="text-xs font-semibold text-slate-400">
            {activeTab === 'missions' ? 'Earn coins daily' : 'Spend coins to flex'}
          </span>
        </div>

        {/* --- VIEW 1: MISSIONS TAB --- */}
        {activeTab === 'missions' && (
          <div className="space-y-4">
            {/* Progress Bar Section */}
            <div className="bg-[#12131d] p-4 sm:p-5 rounded-2xl sm:rounded-3xl border border-white/10 shadow-sm">
              <div className="flex justify-between items-end mb-2.5 sm:mb-3">
                <div>
                  <p className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-widest">
                    Daily Mission XP Completion
                  </p>
                  <h3 className="text-lg sm:text-xl font-black text-white flex items-center gap-1.5">
                    {earnedXP.toLocaleString()} <span className="text-slate-400 font-medium text-xs sm:text-sm">/ {totalXP.toLocaleString()} XP</span>
                  </h3>
                </div>
                <div className="text-right">
                  <span className="text-2xl font-black text-purple-400">{Math.round(progress)}%</span>
                </div>
              </div>
              
              <div className="h-3 w-full bg-slate-800 rounded-full overflow-hidden relative">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ type: 'spring', stiffness: 50, damping: 15 }}
                  className="h-full bg-gradient-to-r from-purple-600 via-indigo-500 to-cyan-400 relative"
                />
              </div>
            </div>

            {/* Category Filter Pills (Daily Login, Social Engagement, Stream Performance) */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
              {['All', 'Daily Login', 'Social Engagement', 'Stream Performance'].map((cat) => {
                const isSelected = selectedCategory === cat;
                return (
                  <button
                    key={cat}
                    onClick={() => {
                      SoundEffectEngine.play('button-click');
                      setSelectedCategory(cat);
                    }}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30 scale-102 font-black'
                        : 'bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white border border-white/5'
                    }`}
                  >
                    {cat === 'Daily Login' && '📅 '}
                    {cat === 'Social Engagement' && '👥 '}
                    {cat === 'Stream Performance' && '📺 '}
                    <span>{cat}</span>
                  </button>
                );
              })}
            </div>

            {/* Categorized Task Cards Grid */}
            <div className="space-y-3">
              {filteredTasks.map((task) => {
                const theme = getCategoryTheme(task.category);
                const CategoryIcon = theme.icon;

                return (
                  <div 
                    key={task.id}
                    onClick={() => toggleTask(task.id)}
                    className={`p-3.5 sm:p-4 rounded-2xl border-2 cursor-pointer transition-all duration-300 flex items-center justify-between gap-3 group ${
                      task.completed 
                        ? 'bg-emerald-950/20 border-emerald-500/40 shadow-emerald-500/5' 
                        : 'bg-[#151522] border-white/5 hover:border-purple-500/50 hover:bg-[#181829]'
                    }`}
                  >
                    <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                      {/* Checkbox Icon */}
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-transform shrink-0 group-hover:scale-105 ${
                        task.completed 
                          ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30' 
                          : 'bg-slate-800 text-slate-500 border border-white/10 group-hover:text-purple-400'
                      }`}>
                        {task.completed ? <CheckCircle2 size={18} /> : <Circle size={18} />}
                      </div>

                      {/* Task Info & Category Indicator */}
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          {/* Categorized Pill with unique icon */}
                          <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border flex items-center gap-1 ${theme.pill}`}>
                            <CategoryIcon size={11} />
                            <span>{theme.badgeText}</span>
                          </span>

                          <span className="text-[10px] text-slate-500 font-semibold uppercase">
                            {task.type}
                          </span>
                        </div>

                        <h3 className={`font-bold text-sm sm:text-base leading-snug transition-colors ${
                          task.completed ? 'text-emerald-300 line-through' : 'text-white group-hover:text-purple-300'
                        }`}>
                          {task.title}
                        </h3>
                        <p className="text-xs text-slate-400 mt-0.5 line-clamp-1">
                          {task.description}
                        </p>
                      </div>
                    </div>

                    {/* Reward Badges (XP & Currency Coins) */}
                    <div className="flex flex-col sm:flex-row items-end sm:items-center gap-1.5 shrink-0">
                      <div className="flex items-center gap-1 px-2.5 py-1 bg-yellow-500/15 border border-yellow-500/30 text-yellow-400 rounded-xl font-bold text-xs">
                        <Coins size={12} />
                        <span>+{task.coins}</span>
                      </div>
                      <div className="flex items-center gap-1 px-2.5 py-1 bg-purple-500/15 border border-purple-500/30 text-purple-300 rounded-xl font-bold text-xs">
                        <Zap size={12} />
                        <span>+{task.xp} XP</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* --- VIEW 2: PROFILE BADGE STORE --- */}
        {activeTab === 'badgeStore' && (
          <div className="space-y-5">
            {/* Equipped Badge Showcase Card */}
            <div className="p-4 sm:p-5 rounded-2xl sm:rounded-3xl bg-gradient-to-r from-amber-950/30 via-[#181622] to-purple-950/30 border border-yellow-500/30 flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-yellow-500/20 border-2 border-yellow-400 flex items-center justify-center text-yellow-400 shadow-xl">
                  {renderBadgeIcon(equippedBadge.iconName, 26)}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black uppercase tracking-wider text-yellow-400">
                      Active Profile Badge
                    </span>
                    <span className="px-2 py-0.2 rounded-full bg-yellow-400/20 text-yellow-300 text-[10px] font-bold uppercase">
                      {equippedBadge.rarity}
                    </span>
                  </div>
                  <h4 className="text-lg font-black text-white">{equippedBadge.name}</h4>
                  <p className="text-xs text-slate-300">{equippedBadge.description}</p>
                </div>
              </div>

              <div className="px-3 py-1.5 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 font-bold text-xs flex items-center gap-1.5">
                <Check size={14} /> Currently Equipped
              </div>
            </div>

            {/* Badges Catalog Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-4">
              {badges.map((badge) => {
                const isEquipped = badge.equipped;
                const isUnlocked = badge.unlocked;
                const canAfford = coins >= badge.price;

                const rarityColor = 
                  badge.rarity === 'legendary' ? 'text-amber-400 border-amber-500/40 bg-amber-500/10' :
                  badge.rarity === 'epic' ? 'text-purple-400 border-purple-500/40 bg-purple-500/10' :
                  'text-cyan-400 border-cyan-500/40 bg-cyan-500/10';

                return (
                  <div
                    key={badge.id}
                    className={`p-4 rounded-2xl border transition-all duration-300 flex flex-col justify-between space-y-3 ${
                      isEquipped
                        ? 'bg-[#1b192e] border-yellow-500/60 shadow-lg shadow-yellow-500/10'
                        : isUnlocked
                          ? 'bg-[#141422] border-white/10 hover:border-purple-500/40'
                          : 'bg-[#10101a] border-white/5 hover:border-white/15'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <div className={`w-10 h-10 rounded-xl border flex items-center justify-center shadow-md ${rarityColor}`}>
                          {renderBadgeIcon(badge.iconName, 20)}
                        </div>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border ${rarityColor}`}>
                          {badge.rarity}
                        </span>
                      </div>

                      <h4 className="font-bold text-sm sm:text-base text-white">{badge.name}</h4>
                      <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                        {badge.description}
                      </p>
                    </div>

                    <div className="pt-2 border-t border-white/5 flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1 font-mono font-bold text-xs text-yellow-400">
                        <Coins size={13} />
                        <span>{badge.price} Coins</span>
                      </div>

                      {isEquipped ? (
                        <button
                          disabled
                          className="px-3 py-1.5 rounded-xl bg-yellow-500/20 text-yellow-300 border border-yellow-500/30 font-bold text-xs flex items-center gap-1"
                        >
                          <Check size={12} /> Equipped
                        </button>
                      ) : isUnlocked ? (
                        <button
                          onClick={() => handleEquipBadge(badge.id)}
                          className="px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs transition-colors cursor-pointer shadow-md"
                        >
                          Equip Badge
                        </button>
                      ) : (
                        <button
                          onClick={() => handleBuyBadge(badge)}
                          className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-all flex items-center gap-1 cursor-pointer ${
                            canAfford
                              ? 'bg-yellow-500 hover:bg-yellow-400 text-black shadow-md'
                              : 'bg-white/5 text-slate-500 border border-white/5 hover:bg-white/10'
                          }`}
                        >
                          <ShoppingBag size={12} />
                          <span>Unlock</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

      </div>

      {/* Right Column: Leaderboard & User Profile Badge Card (4 Cols) */}
      <div className="lg:col-span-4 space-y-4 sm:space-y-6">
        
        {/* User Profile Mini Card with Equipped Badge */}
        <div className="bg-[#141424] rounded-2xl sm:rounded-3xl p-4 sm:p-5 border border-white/10 shadow-xl space-y-3">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Player Card Preview
          </p>
          <div className="flex items-center gap-3">
            <div className="relative">
              <img 
                src="https://picsum.photos/80/80?random=101" 
                alt="Player" 
                className="w-12 h-12 rounded-2xl border-2 border-purple-500/50 object-cover shadow-md" 
              />
              <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full bg-emerald-400 border-2 border-[#141424]" />
            </div>
            <div className="min-w-0">
              <h3 className="font-bold text-sm text-white truncate">NexusMaster_X</h3>
              <div className="flex items-center gap-1.5 mt-0.5">
                <div className="px-2 py-0.5 rounded-md bg-yellow-500/20 border border-yellow-400/40 text-[10px] font-black text-yellow-300 flex items-center gap-1">
                  {renderBadgeIcon(equippedBadge.iconName, 11)}
                  <span>{equippedBadge.name}</span>
                </div>
              </div>
            </div>
          </div>
          <div className="pt-2 border-t border-white/5 flex items-center justify-between text-xs text-slate-400">
            <span>Rank #14 Division</span>
            <span className="text-purple-400 font-bold font-mono">Level 42</span>
          </div>
        </div>

        {/* Global Leaderboard Section */}
        <div className="bg-[#12131d] rounded-2xl sm:rounded-3xl p-4 sm:p-5 shadow-xl border border-white/10 space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
              <Crown className="text-yellow-500 w-5 h-5" fill="currentColor" />
              <span>Leaderboard</span>
            </h2>
            <span className="text-[11px] font-bold text-purple-400 bg-purple-500/10 px-2 py-1 rounded-lg border border-purple-500/20">
              Season 4
            </span>
          </div>

          <div className="space-y-2.5">
            {LEADERBOARD.map((entry) => (
              <div key={entry.rank} className="flex items-center justify-between p-2.5 hover:bg-white/5 rounded-xl transition-colors border border-transparent hover:border-white/5">
                <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
                  <span className={`w-6 h-6 flex items-center justify-center font-bold text-xs sm:text-sm shrink-0 ${
                    entry.rank === 1 ? 'text-yellow-500 font-black' : 
                    entry.rank === 2 ? 'text-slate-300' : 
                    entry.rank === 3 ? 'text-amber-600' : 'text-slate-500'
                  }`}>
                    #{entry.rank}
                  </span>
                  <img src={entry.user.avatar} alt={entry.user.username} className="w-8 h-8 rounded-full border border-white/10 shadow-sm shrink-0" />
                  <span className="font-semibold text-xs sm:text-sm text-slate-200 truncate">{entry.user.username}</span>
                </div>
                
                <div className="flex items-center gap-2 sm:gap-3 shrink-0">
                  <span className="font-mono font-bold text-xs text-purple-400">{entry.score.toLocaleString()} XP</span>
                  {entry.trend === 'up' && <TrendingUp size={13} className="text-emerald-400" />}
                  {entry.trend === 'down' && <TrendingDown size={13} className="text-rose-400" />}
                  {entry.trend === 'same' && <Minus size={13} className="text-slate-500" />}
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
};
