import React, { useState, useEffect, useRef } from 'react';
import { User as UserIcon, Search, Check, X, MessageSquare, MoreVertical, UserPlus, Ghost, Shield, Ban, Unlock, ShieldAlert, Sparkles, Zap } from 'lucide-react';
import { User } from '../types';
import { playCategorizedAudio } from '../services/audioManager';

export const INITIAL_REQUESTS = [
  { id: '101', username: 'NoobMaster69', avatar: 'https://picsum.photos/100/100?random=44', status: 'online', mutual: 3 },
  { id: '102', username: 'Jinx_Main', avatar: 'https://picsum.photos/100/100?random=45', status: 'offline', mutual: 12 },
  { id: '103', username: 'ViperLineup', avatar: 'https://picsum.photos/100/100?random=46', status: 'idle', mutual: 0 },
];

export const INITIAL_FRIENDS: (User & { activity?: string })[] = [
  { id: '2', username: 'Nelly', avatar: 'https://picsum.photos/100/100?random=10', status: 'online', activity: 'Playing Valorant' },
  { id: '3', username: 'Mallow', avatar: 'https://picsum.photos/100/100?random=11', status: 'online', activity: 'Playing Minecraft' },
  { id: '4', username: 'Graggle', avatar: 'https://picsum.photos/100/100?random=12', status: 'online', activity: 'In Lobby' },
  { id: '13', username: 'Brimstone_Main', avatar: 'https://picsum.photos/100/100?random=13', status: 'online', activity: 'Competitive' },
  { id: '14', username: 'JettLagged', avatar: 'https://picsum.photos/100/100?random=14', status: 'idle', activity: 'Away' },
  { id: '6', username: 'Pixel_Panda', avatar: 'https://picsum.photos/100/100?random=15', status: 'dnd', activity: 'Do Not Disturb' },
  { id: '7', username: 'Sova_Main', avatar: 'https://picsum.photos/100/100?random=16', status: 'offline' },
  { id: '8', username: 'Sage_Res_Me', avatar: 'https://picsum.photos/100/100?random=17', status: 'offline' },
];

type Tab = 'online' | 'all' | 'pending' | 'blocked' | 'add';

interface FriendsViewProps {
    onOpenDM?: (user: User) => void;
}

export const FriendsView: React.FC<FriendsViewProps> = ({ onOpenDM }) => {
  const [activeTab, setActiveTab] = useState<Tab>('online');
  const [friends, setFriends] = useState(INITIAL_FRIENDS);
  const [requests, setRequests] = useState(INITIAL_REQUESTS);
  const [blockedUsers, setBlockedUsers] = useState<User[]>([
      { id: '999', username: 'ToxicPlayer', avatar: 'https://picsum.photos/100/100?random=99', status: 'offline' }
  ]);
  
  const [addFriendInput, setAddFriendInput] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Menu & Modal State
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [userToBlock, setUserToBlock] = useState<User | null>(null);
  const actionTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const successTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Real-time status updates simulation
  useEffect(() => {
    return () => {
      if (actionTimeoutRef.current) clearTimeout(actionTimeoutRef.current);
      if (successTimeoutRef.current) clearTimeout(successTimeoutRef.current);
    };
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
        setFriends(currentFriends => {
            if (!currentFriends || currentFriends.length === 0) return currentFriends;
            const updatedFriends = [...currentFriends];
            const randomIndex = Math.floor(Math.random() * updatedFriends.length);
            const friend = updatedFriends[randomIndex];
            if (!friend) return currentFriends;
            const r = Math.random();
            
            let newStatus = friend.status;
            let newActivity = friend.activity;

            if (friend.status === 'offline') {
                if (r > 0.7) {
                    newStatus = 'online';
                    newActivity = 'Just started Nexus';
                }
            } else {
                if (r > 0.9) {
                    newStatus = 'offline';
                    newActivity = undefined;
                } else if (r > 0.8) {
                    newStatus = 'idle';
                    newActivity = 'Away';
                } else if (r > 0.75) {
                    newStatus = 'dnd';
                    newActivity = 'In Queue';
                } else {
                    newStatus = 'online';
                    const activities = [
                        'Playing Valorant', 'Playing Minecraft', 'Playing Apex Legends', 
                        'Listening to Spotify', 'Visual Studio Code', 'In Lobby',
                        'Competitive', 'Ranked Match', 'Watching Video'
                    ];
                    newActivity = activities[Math.floor(Math.random() * activities.length)];
                }
            }

            if (updatedFriends[randomIndex]) {
                updatedFriends[randomIndex] = { ...updatedFriends[randomIndex], status: newStatus, activity: newActivity };
            }
            return updatedFriends;
        });
    }, 2000); 
    return () => clearInterval(interval);
  }, []);

  const handleAction = (id: string, action: 'accept' | 'decline') => {
    playCategorizedAudio(
      action === 'accept'
        ? 'https://assets.mixkit.co/sfx/preview/mixkit-positive-interface-beep-2586.mp3'
        : 'https://assets.mixkit.co/sfx/preview/mixkit-simple-game-countdown-921.mp3',
      'system',
      0.5
    );

    // Visual removal logic would go here
    if (actionTimeoutRef.current) clearTimeout(actionTimeoutRef.current);
    actionTimeoutRef.current = setTimeout(() => {
        if (action === 'accept') {
            const req = requests.find(r => r.id === id);
            if (req) setFriends(prev => [...prev, { ...req, status: 'online', activity: 'Online' }]);
        }
        setRequests(requests.filter(r => r.id !== id));
        actionTimeoutRef.current = null;
    }, 300);
  };

  const sendFriendRequest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!addFriendInput) return;
    setShowSuccess(true);
    playCategorizedAudio('https://assets.mixkit.co/sfx/preview/mixkit-software-interface-start-2574.mp3', 'system', 0.5);
    setAddFriendInput('');
    if (successTimeoutRef.current) clearTimeout(successTimeoutRef.current);
    successTimeoutRef.current = setTimeout(() => {
      setShowSuccess(false);
      successTimeoutRef.current = null;
    }, 3000);
  };

  const handleBlockRequest = (user: User) => {
      setOpenMenuId(null);
      setUserToBlock(user);
  };

  const confirmBlock = () => {
      if (userToBlock) {
          setFriends(prev => prev.filter(f => f.id !== userToBlock.id));
          setBlockedUsers(prev => [...prev, { ...userToBlock, status: 'offline' }]);
          playCategorizedAudio('https://assets.mixkit.co/sfx/preview/mixkit-simple-game-countdown-921.mp3', 'system', 0.5);
          setUserToBlock(null);
      }
  };

  const handleUnblock = (id: string) => {
      const user = blockedUsers.find(u => u.id === id);
      if (user) {
          setBlockedUsers(prev => prev.filter(u => u.id !== id));
          setFriends(prev => [...prev, { ...user, status: 'online', activity: 'Online' }]);
          playCategorizedAudio('https://assets.mixkit.co/sfx/preview/mixkit-positive-interface-beep-2586.mp3', 'system', 0.5);
      }
  };

  const filteredFriends = friends.filter(friend => {
      const matchesSearch = friend.username.toLowerCase().includes(searchQuery.toLowerCase());
      if (activeTab === 'online') return matchesSearch && friend.status !== 'offline';
      return matchesSearch;
  });

  return (
    <div className="flex flex-col h-full bg-[#09090b] relative overflow-hidden">
      
      {/* --- BACKGROUND AMBIENCE --- */}
      <div className="absolute inset-0 z-0 pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-900/10 rounded-full blur-[100px]"></div>
          <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-900/10 rounded-full blur-[100px]"></div>
      </div>

      {openMenuId && <div className="fixed inset-0 z-40" onClick={() => setOpenMenuId(null)}></div>}

      {/* --- BLOCK MODAL --- */}
      {userToBlock && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fadeIn">
              <div className="bg-[#18181b] border border-white/10 rounded-[2rem] p-8 max-w-sm w-full shadow-2xl transform scale-100 animate-zoomIn relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-500 to-orange-500"></div>
                  <div className="flex items-center gap-4 mb-6 text-red-500">
                      <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center">
                        <ShieldAlert size={24} />
                      </div>
                      <h3 className="text-xl font-bold text-white">Block User?</h3>
                  </div>
                  <p className="text-slate-400 text-sm mb-8 leading-relaxed">
                      Are you sure you want to block <strong className="text-white">{userToBlock.username}</strong>? 
                      They will be removed from your friends list and won't be able to message you.
                  </p>
                  <div className="flex gap-4">
                      <button onClick={() => setUserToBlock(null)} className="flex-1 py-3 rounded-xl font-bold text-slate-400 hover:text-white hover:bg-white/5 transition-colors">Cancel</button>
                      <button onClick={confirmBlock} className="flex-1 py-3 bg-red-600 hover:bg-red-500 text-white rounded-xl font-bold transition-all shadow-lg shadow-red-600/20 flex items-center justify-center gap-2">
                          <Ban size={18} /> Block
                      </button>
                  </div>
              </div>
          </div>
      )}

      {/* --- HEADER --- */}
      <div className="p-3 xs:p-4 sm:p-6 md:p-8 pb-0 z-10 flex flex-col gap-3 sm:gap-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 sm:gap-6">
            <div>
                <h1 className="text-xl xs:text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2 sm:gap-3">
                    <UserIcon className="text-purple-500 w-6 h-6 sm:w-8 sm:h-8" />
                    Social Hub
                </h1>
                <p className="text-slate-400 mt-0.5 sm:mt-1 font-medium text-xs sm:text-sm">Manage your squad and incoming requests.</p>
            </div>

            {/* Styled Search */}
            <div className="relative group w-full md:w-96">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-blue-500 rounded-xl sm:rounded-2xl blur opacity-20 group-hover:opacity-40 transition-opacity"></div>
                <div className="relative bg-[#18181b] rounded-xl sm:rounded-2xl flex items-center px-3 sm:px-4 border border-white/10 group-hover:border-white/20 transition-colors h-10 sm:h-12">
                    <Search className="text-slate-500 group-hover:text-white transition-colors shrink-0" size={17} />
                    <input 
                        type="text" 
                        placeholder="Find friends..." 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="bg-transparent border-none focus:ring-0 text-white placeholder-slate-500 w-full h-full px-2 sm:px-3 outline-none font-medium text-xs sm:text-sm" 
                    />
                    {searchQuery && <button onClick={() => setSearchQuery('')}><X size={15} className="text-slate-500 hover:text-white" /></button>}
                </div>
            </div>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-1.5 xs:gap-2 overflow-x-auto no-scrollbar pb-2">
            {[
                { id: 'online', label: 'Online' },
                { id: 'all', label: 'All Friends' },
                { id: 'pending', label: 'Pending', count: requests.length },
                { id: 'blocked', label: 'Blocked' }
            ].map((tab) => {
                const isActive = activeTab === tab.id;
                return (
                    <button
                        key={tab.id}
                        onClick={() => { setActiveTab(tab.id as Tab); setSearchQuery(''); }}
                        className={`px-3 xs:px-4 sm:px-5 py-1.5 xs:py-2 sm:py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all relative overflow-hidden group shrink-0
                            ${isActive ? 'text-white' : 'text-slate-400 hover:text-white hover:bg-white/5'}
                        `}
                    >
                        {isActive && <div className="absolute inset-0 bg-[#2b2d31] border border-white/10 rounded-xl -z-10"></div>}
                        <div className="flex items-center gap-1.5 xs:gap-2">
                            {tab.label}
                            {tab.count !== undefined && tab.count > 0 && (
                                <span className="bg-red-500 text-white text-[9.5px] xs:text-[10px] px-1.5 py-0.5 rounded-md shadow-sm">{tab.count}</span>
                            )}
                        </div>
                    </button>
                )
            })}
            <div className="w-px h-5 sm:h-6 bg-white/10 mx-1 xs:mx-2 shrink-0"></div>
            <button
                onClick={() => { setActiveTab('add'); setSearchQuery(''); }}
                className={`px-3 xs:px-4 sm:px-5 py-1.5 xs:py-2 sm:py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all relative overflow-hidden group flex items-center gap-1.5 xs:gap-2 shrink-0
                    ${activeTab === 'add' ? 'text-white' : 'text-green-400 hover:text-green-300 hover:bg-green-500/10'}
                `}
            >
                {activeTab === 'add' && <div className="absolute inset-0 bg-[#2b2d31] border border-green-500/30 rounded-xl -z-10"></div>}
                <UserPlus size={14} className="sm:w-4 sm:h-4" /> Add Friend
            </button>
        </div>
      </div>

      {/* --- CONTENT AREA --- */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-3 xs:p-4 sm:p-6 md:p-8 pt-2 xs:pt-4 z-10">
        
        {/* PENDING TAB */}
        {activeTab === 'pending' && (
            <div className="max-w-4xl mx-auto space-y-3 xs:space-y-4 animate-fadeIn">
                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest pl-2">Incoming Requests — {requests.length}</h3>
                {requests.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-24 text-center opacity-50">
                        <Ghost size={64} className="text-slate-600 mb-4" />
                        <p className="text-slate-400 font-medium">It's quiet... too quiet.</p>
                    </div>
                ) : (
                    requests.map((req) => (
                        <div key={req.id} id={`request-${req.id}`} className="bg-[#121216]/60 backdrop-blur-md border border-white/5 rounded-2xl xs:rounded-3xl p-3 xs:p-4 flex items-center justify-between hover:bg-white/5 transition-all group">
                             <div className="flex items-center gap-2.5 xs:gap-4 min-w-0">
                                <img src={req.avatar} className="w-11 h-11 xs:w-14 xs:h-14 rounded-xl xs:rounded-2xl object-cover shrink-0" alt={req.username} />
                                <div className="min-w-0">
                                    <h4 className="font-bold text-white text-sm xs:text-base sm:text-lg truncate">{req.username}</h4>
                                    <p className="text-[11px] xs:text-xs text-slate-400 font-medium truncate">{req.mutual} mutual friends</p>
                                </div>
                             </div>
                             <div className="flex gap-2 xs:gap-3 shrink-0">
                                 <button onClick={() => handleAction(req.id, 'accept')} className="w-8 h-8 xs:w-10 xs:h-10 rounded-xl bg-green-500/20 text-green-500 hover:bg-green-500 hover:text-white flex items-center justify-center transition-all"><Check size={18} /></button>
                                 <button onClick={() => handleAction(req.id, 'decline')} className="w-8 h-8 xs:w-10 xs:h-10 rounded-xl bg-red-500/20 text-red-500 hover:bg-red-500 hover:text-white flex items-center justify-center transition-all"><X size={18} /></button>
                             </div>
                        </div>
                    ))
                )}
            </div>
        )}

        {/* FRIENDS LIST (ONLINE/ALL) */}
        {(activeTab === 'online' || activeTab === 'all') && (
            <div className="grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3 gap-3 xs:gap-4 animate-fadeIn">
                {filteredFriends.length > 0 ? (
                    filteredFriends.map(friend => (
                        <div 
                            key={friend.id} 
                            onClick={() => onOpenDM && onOpenDM(friend)}
                            className="relative bg-[#121216]/80 backdrop-blur-md border border-white/5 rounded-2xl xs:rounded-3xl p-2.5 xs:p-3 sm:p-4 flex items-center gap-2.5 xs:gap-3 sm:gap-4 hover:border-purple-500/30 hover:bg-[#18181b] transition-all group hover:-translate-y-1 hover:shadow-lg hover:shadow-purple-900/10 cursor-pointer"
                        >
                             {/* Avatar */}
                             <div className="relative shrink-0">
                                <img src={friend.avatar} alt={friend.username} className="w-11 h-11 xs:w-12 xs:h-12 sm:w-14 sm:h-14 rounded-xl xs:rounded-2xl object-cover ring-2 ring-transparent group-hover:ring-purple-500 transition-all" />
                                <div className={`absolute -bottom-1 -right-1 w-3.5 h-3.5 sm:w-4 sm:h-4 border-2 border-[#121216] rounded-full 
                                    ${friend.status === 'online' ? 'bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]' : friend.status === 'idle' ? 'bg-amber-500' : friend.status === 'dnd' ? 'bg-red-500' : 'bg-slate-600'}`} 
                                />
                             </div>
                             
                             {/* Info */}
                             <div className="flex-1 min-w-0">
                                 <h4 className="font-bold text-white text-xs xs:text-sm sm:text-base truncate group-hover:text-purple-400 transition-colors">{friend.username}</h4>
                                 <p className="text-[11px] xs:text-xs text-slate-400 truncate mt-0.5 font-medium flex items-center gap-1.5">
                                     {friend.activity ? (
                                         <><Zap size={10} className="text-yellow-500 shrink-0" /> <span className="truncate">{friend.activity}</span></>
                                     ) : (
                                         friend.status === 'online' ? 'Online' : 'Offline'
                                     )}
                                 </p>
                             </div>

                             {/* Actions (Touch friendly: visible on mobile, reveal on desktop hover) */}
                             <div className="flex items-center gap-1 xs:gap-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-all shrink-0">
                                 <button 
                                     onClick={(e) => { e.stopPropagation(); onOpenDM && onOpenDM(friend); }}
                                     className="w-8 h-8 xs:w-9 xs:h-9 sm:w-10 sm:h-10 rounded-xl bg-white/5 hover:bg-white/10 hover:text-white text-slate-400 flex items-center justify-center transition-colors"
                                     title="Message"
                                 >
                                     <MessageSquare size={16} />
                                 </button>
                                 <div className="relative">
                                     <button 
                                         onClick={(e) => { e.stopPropagation(); setOpenMenuId(openMenuId === friend.id ? null : friend.id); }}
                                         className={`w-8 h-8 xs:w-9 xs:h-9 sm:w-10 sm:h-10 rounded-xl hover:bg-white/10 hover:text-white flex items-center justify-center transition-colors ${openMenuId === friend.id ? 'bg-white/10 text-white' : 'bg-white/5 text-slate-400'}`}
                                     >
                                         <MoreVertical size={16} />
                                     </button>

                                     {/* Context Menu */}
                                     {openMenuId === friend.id && (
                                         <div className="absolute right-0 top-12 w-48 bg-[#18181b] border border-white/10 rounded-2xl shadow-2xl z-50 overflow-hidden animate-fadeIn origin-top-right">
                                             <div className="p-1">
                                                <button onClick={() => setOpenMenuId(null)} className="w-full text-left px-3 py-2.5 text-slate-300 hover:bg-white/5 hover:text-white rounded-xl text-sm font-bold flex items-center gap-2 transition-colors">
                                                    <UserIcon size={16} /> View Profile
                                                </button>
                                                <div className="h-px bg-white/5 my-1 mx-2"></div>
                                                <button 
                                                    onClick={(e) => { e.stopPropagation(); handleBlockRequest(friend); }} 
                                                    className="w-full text-left px-3 py-2.5 text-red-500 hover:bg-red-500/10 rounded-xl text-sm font-bold flex items-center gap-2 transition-colors"
                                                >
                                                    <Ban size={16} /> Block User
                                                </button>
                                             </div>
                                         </div>
                                     )}
                                 </div>
                             </div>
                        </div>
                    ))
                ) : (
                    <div className="col-span-full flex flex-col items-center justify-center py-20 text-center opacity-50">
                        <Search size={48} className="text-slate-600 mb-4" />
                        <p className="text-slate-400 font-medium">No friends found. Try searching for someone else!</p>
                    </div>
                )}
            </div>
        )}

        {/* ADD FRIEND TAB */}
        {activeTab === 'add' && (
            <div className="max-w-2xl mx-auto animate-fadeIn mt-8">
                <div className="text-center mb-10">
                    <h2 className="text-4xl font-black text-white mb-2">ADD FRIEND</h2>
                    <p className="text-slate-400">You can add friends with their Nexus Tag. It's cAsE sEnSiTiVe!</p>
                </div>

                <div className={`relative p-1 rounded-3xl transition-all duration-500 ${showSuccess ? 'bg-green-500' : 'bg-gradient-to-r from-purple-500 to-blue-600'}`}>
                    <form onSubmit={sendFriendRequest} className="bg-[#18181b] rounded-[22px] p-2 flex items-center relative overflow-hidden">
                        <input 
                            type="text"
                            value={addFriendInput}
                            onChange={(e) => setAddFriendInput(e.target.value)}
                            placeholder="Enter a Username#0000" 
                            className="flex-1 bg-transparent text-white text-lg font-bold px-6 py-4 outline-none placeholder-slate-600"
                        />
                        <button 
                            type="submit"
                            disabled={!addFriendInput}
                            className={`px-8 py-4 rounded-xl font-bold text-sm transition-all flex items-center gap-2
                                ${showSuccess 
                                    ? 'bg-green-500 text-white shadow-[0_0_20px_rgba(34,197,94,0.4)]' 
                                    : 'bg-white text-black hover:bg-slate-200 disabled:opacity-50 disabled:cursor-not-allowed'}
                            `}
                        >
                             {showSuccess ? <><Check size={18} /> Sent!</> : 'Send Request'}
                        </button>
                    </form>
                </div>
                
                <div className="mt-16 grid grid-cols-2 gap-4 opacity-50">
                     <div className="bg-[#121216] border border-white/5 rounded-3xl p-6 flex flex-col items-center text-center">
                         <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mb-4">
                            <Sparkles className="text-purple-500" />
                         </div>
                         <h4 className="font-bold text-white mb-1">Invite via Link</h4>
                         <p className="text-xs text-slate-400">nexus.gg/invite/u/bogdan</p>
                     </div>
                     <div className="bg-[#121216] border border-white/5 rounded-3xl p-6 flex flex-col items-center text-center">
                         <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mb-4">
                            <Search className="text-blue-500" />
                         </div>
                         <h4 className="font-bold text-white mb-1">Scan Contacts</h4>
                         <p className="text-xs text-slate-400">Find friends from your phone</p>
                     </div>
                </div>
            </div>
        )}

        {/* BLOCKED TAB */}
        {activeTab === 'blocked' && (
            <div className="max-w-4xl mx-auto animate-fadeIn">
                 <div className="bg-[#18181b]/50 border border-red-500/20 rounded-2xl p-4 mb-6 flex items-center gap-3 text-red-400">
                    <ShieldAlert />
                    <span className="font-bold text-sm">Blocked users cannot message you or see your status.</span>
                 </div>
                 
                 {blockedUsers.length > 0 ? (
                     <div className="space-y-3">
                        {blockedUsers.map(user => (
                            <div key={user.id} className="bg-[#121216]/60 backdrop-blur-md border border-white/5 rounded-3xl p-4 flex items-center justify-between">
                                <div className="flex items-center gap-4 opacity-60">
                                    <img src={user.avatar} className="w-12 h-12 rounded-full object-cover grayscale" alt={user.username} />
                                    <h4 className="font-bold text-white">{user.username}</h4>
                                </div>
                                <button 
                                    onClick={() => handleUnblock(user.id)}
                                    className="px-6 py-2.5 bg-white/5 hover:bg-white/10 rounded-xl font-bold text-xs text-slate-300 transition-colors flex items-center gap-2"
                                >
                                    <Unlock size={14} /> Unblock
                                </button>
                            </div>
                        ))}
                     </div>
                 ) : (
                    <div className="flex flex-col items-center justify-center py-20 text-center opacity-50">
                        <Shield size={64} className="text-slate-600 mb-4" />
                        <p className="text-slate-400 font-medium">No blocked users. Peace and love!</p>
                    </div>
                 )}
            </div>
        )}

      </div>
    </div>
  );
};