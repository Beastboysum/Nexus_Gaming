import React, { useState, useEffect, useRef } from 'react';
import { Hash, Volume2, Settings, Plus, Gift, Sticker, Smile, Send, Search, MoreVertical, Crown, Shield, Hash as HashIcon, Paperclip, Bell, Users, ArrowLeft, Video, Phone, ArrowUp, ArrowDown, Mic, Image as ImageIcon, FileText, X, Zap, CheckCircle2, FileVideo, Check, Trophy, MessageSquare } from 'lucide-react';
import { User, ViewState } from '../types';
import { searchGifs, GiphyGif } from '../services/giphyService';
import { playCategorizedAudio } from '../services/audioManager';
import { SoundEffectEngine } from '../services/SoundEffectEngine';

// --- Types & Mock Data ---

type ChatMode = 'DM' | 'GROUP';

interface Message {
  id: string;
  userId: string;
  content: string;
  timestamp: string;
  type: 'text' | 'image';
  reactions?: { emoji: string; count: number }[];
}

interface GroupChat {
    id: string;
    name: string;
    members: string[]; // User IDs
    iconColor: string;
    unread: number;
    lastMessage: string;
    time: string;
}

const USERS: Record<string, User & { role: 'Admin' | 'Mod' | 'Member', color?: string, bio?: string, banner?: string, level?: number }> = {
  '1': { id: '1', username: 'Bogdan Nikitin', avatar: 'https://picsum.photos/100/100?random=88', status: 'online', role: 'Admin', color: 'text-purple-400', bio: 'Building Nexus. Grinding Ranked 24/7.', banner: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=1000&auto=format&fit=crop', level: 100 },
  '2': { id: '2', username: 'Nelly', avatar: 'https://picsum.photos/100/100?random=10', status: 'online', role: 'Mod', color: 'text-pink-400', bio: 'Instalock Jett. If I dash in and die, it\'s lag.', banner: 'https://images.unsplash.com/photo-1542751110-97427bbecf20?q=80&w=1000&auto=format&fit=crop', level: 42 },
  '3': { id: '3', username: 'Mallow', avatar: 'https://picsum.photos/100/100?random=11', status: 'idle', role: 'Member', color: 'text-blue-400', bio: 'Just vibing in the lobby. Probably eating.', banner: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=1000&auto=format&fit=crop', level: 99 },
  '4': { id: '4', username: 'Graggle', avatar: 'https://picsum.photos/100/100?random=12', status: 'dnd', role: 'Member', bio: 'Building a 1:1 scale replica of Earth.', banner: 'https://images.unsplash.com/photo-1607677914754-58a36d240214?q=80&w=1000&auto=format&fit=crop', level: 15 },
  '5': { id: '5', username: 'Jinx_Main', avatar: 'https://picsum.photos/100/100?random=45', status: 'offline', role: 'Member', bio: 'ADC main. Support diff.', banner: 'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?q=80&w=1000&auto=format&fit=crop', level: 300 },
};

export const getChatUser = (id?: string | null): User & { role: 'Admin' | 'Mod' | 'Member', color?: string, bio?: string, banner?: string, level?: number } => {
  if (!id) {
    return { id: 'unknown', username: 'Nexus Gamer', avatar: 'https://picsum.photos/100/100?random=99', status: 'online', role: 'Member', color: 'text-slate-300' };
  }
  if (USERS[id]) {
    return USERS[id];
  }
  return {
    id,
    username: id === '1' ? 'Bogdan Nikitin' : `Gamer_${id}`,
    avatar: `https://picsum.photos/100/100?random=${id}`,
    status: 'online',
    role: 'Member',
    color: 'text-purple-400',
    bio: 'Nexus community member.',
    level: 10
  };
};

const DM_THREADS = [
  { id: '2', userId: '2', lastMessage: 'Hop on valo?', time: '2m', unread: 1 },
  { id: '3', userId: '3', lastMessage: 'Sent an attachment', time: '1h', unread: 0 },
];

const INITIAL_GROUPS: GroupChat[] = [
    { id: 'g1', name: 'Ranked Squad', members: ['1', '2', '4'], iconColor: 'bg-orange-500', unread: 0, lastMessage: 'Graggle: I keep deranking', time: '1d' }
];

const DIRECT_MESSAGES: Message[] = [
    { id: '1', userId: '2', content: 'Yo, did you see the new patch notes?', timestamp: '10:05 AM', type: 'text' },
    { id: '2', userId: '1', content: 'Yeah, Jett got nerfed again 😭', timestamp: '10:06 AM', type: 'text' },
    { id: '3', userId: '2', content: 'Finally lol. Im jumping on in 5.', timestamp: '10:06 AM', type: 'text' },
];

const GROUP_MESSAGES: Message[] = [
    { id: '1', userId: '2', content: 'We rushing B?', timestamp: '9:00 PM', type: 'text' },
    { id: '2', userId: '4', content: 'Nah, fake A then rotate.', timestamp: '9:01 PM', type: 'text' },
];

// Mock GIFs Data removed - using real Giphy API
interface ChatViewProps {
    initialFriend?: User | null;
    onClearFriend?: () => void;
    onNavigate?: (view: ViewState) => void;
    onCall?: (user: User) => void;
    hideSidebar?: boolean;
}

export const ChatView: React.FC<ChatViewProps> = ({ initialFriend, onClearFriend, onNavigate, onCall, hideSidebar = false }) => {
  // State: dedicated to Direct Messages and Groups
  const [activeMode, setActiveMode] = useState<ChatMode>('DM');
  const [selectedDmUserId, setSelectedDmUserId] = useState<string | null>(initialFriend?.id || '2');
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
  const [viewingUserProfileId, setViewingUserProfileId] = useState<string | null>(null);
  
  // Mobile View State: null means showing list, value means showing chat
  const [isMobileChatOpen, setIsMobileChatOpen] = useState(!!initialFriend);

  const [dmMsgs, setDmMsgs] = useState(DIRECT_MESSAGES);
  const [groupMsgs, setGroupMsgs] = useState(GROUP_MESSAGES);
  
  const [groups, setGroups] = useState<GroupChat[]>(INITIAL_GROUPS);
  
  // UI State
  const [inputValue, setInputValue] = useState('');
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  const [showScrollButton, setShowScrollButton] = useState(false);
  
  // GIF Picker State
  const [showGifPicker, setShowGifPicker] = useState(false);
  const [gifSearch, setGifSearch] = useState('');
  const [gifs, setGifs] = useState<GiphyGif[]>([]);
  const [isLoadingGifs, setIsLoadingGifs] = useState(false);

  // Reaction State
  const [reactingToMessageId, setReactingToMessageId] = useState<string | null>(null);
  const COMMON_EMOJIS = ['🔥', '❤️', '😂', '😮', '😢', '👍', '🎮', '💯'];
  
  // Modal State
  const [showCreateGroup, setShowCreateGroup] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  const [newGroupMembers, setNewGroupMembers] = useState<string[]>([]);
  
  // Group Settings Modal State
  const [showGroupSettings, setShowGroupSettings] = useState(false);
  const [editingGroup, setEditingGroup] = useState<{name: string, color: string} | null>(null);
  const [showRightSidebar, setShowRightSidebar] = useState(false);

  // Scrolling Logic
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isAtBottomRef = useRef(true);
  const prevMessagesLengthRef = useRef(0);
  const typingTimeoutsRef = useRef<Record<string, any>>({});
  const simulationTimeoutsRef = useRef<NodeJS.Timeout[]>([]);

  const getActiveMessages = () => {
      if (activeMode === 'GROUP') return groupMsgs;
      return dmMsgs;
  };

  const scrollToBottom = (smooth = true) => {
    if (chatContainerRef.current) {
        chatContainerRef.current.scrollTo({
            top: chatContainerRef.current.scrollHeight,
            behavior: smooth ? 'smooth' : 'auto'
        });
        if (!smooth) {
            setShowScrollButton(false);
            isAtBottomRef.current = true;
        }
    }
  };

  const handleScroll = () => {
    if (chatContainerRef.current) {
        const { scrollTop, scrollHeight, clientHeight } = chatContainerRef.current;
        const distanceToBottom = scrollHeight - scrollTop - clientHeight;
        // Using 100px threshold to determine if user is "at bottom"
        const isBottom = Math.abs(distanceToBottom) < 100;
        
        isAtBottomRef.current = isBottom;
        setShowScrollButton(!isBottom);
    }
  };

  // Sync props with state
  useEffect(() => {
    if (initialFriend) {
        setActiveMode('DM');
        setSelectedDmUserId(initialFriend.id);
        setSelectedGroupId(null);
        setIsMobileChatOpen(true);
    }
  }, [initialFriend]);

  // Effect: Fetch Trending GIFs when picker opens
  useEffect(() => {
      if (showGifPicker && !gifSearch) {
          fetchGifs('');
      }
  }, [showGifPicker]);

  // Effect: Fetch GIFs when search changes
  useEffect(() => {
      const timer = setTimeout(() => {
          if (showGifPicker) {
              fetchGifs(gifSearch);
          }
      }, 500);
      return () => clearTimeout(timer);
  }, [gifSearch, showGifPicker]);

  const fetchGifs = async (query: string) => {
      setIsLoadingGifs(true);
      const results = await searchGifs(query);
      setGifs(results);
      setIsLoadingGifs(false);
  };

  // Effect: Scroll to bottom instantly when switching views
  useEffect(() => {
      scrollToBottom(false);
      isAtBottomRef.current = true;
      setShowScrollButton(false);
      // Reset length tracker on view switch so we don't skip logic
      prevMessagesLengthRef.current = getActiveMessages().length;
      
      // Clear typing users on switch
      setTypingUsers([]);
      Object.values(typingTimeoutsRef.current).forEach((t: any) => clearTimeout(t));
      typingTimeoutsRef.current = {};
  }, [activeMode, selectedDmUserId, selectedGroupId]);

  // Effect: Auto-scroll on new messages if at bottom or if message is from me
  useEffect(() => {
      const messages = getActiveMessages();
      
      // Only trigger if message count increased
      if (messages.length > prevMessagesLengthRef.current) {
          const lastMsg = messages[messages.length - 1];
          const isMyMessage = lastMsg?.userId === '1';

          if (isAtBottomRef.current || isMyMessage) {
              scrollToBottom(true);
          }
      }
      
      prevMessagesLengthRef.current = messages.length;
  }, [dmMsgs, groupMsgs]); 
  
  // Cleanup timeouts on unmount
  useEffect(() => {
      return () => {
          Object.values(typingTimeoutsRef.current).forEach((t: any) => clearTimeout(t));
          typingTimeoutsRef.current = {};
          simulationTimeoutsRef.current.forEach((t) => clearTimeout(t));
          simulationTimeoutsRef.current = [];
      };
  }, []);

  const handleOpenChat = (mode: ChatMode, id: string) => {
      setActiveMode(mode);
      if (mode === 'DM') { setSelectedDmUserId(id); setSelectedGroupId(null); }
      else if (mode === 'GROUP') { setSelectedGroupId(id); setSelectedDmUserId(null); }
      
      setIsMobileChatOpen(true);
  };
  
  const handleOpenProfile = (e: React.MouseEvent, userId: string) => {
    e.stopPropagation();
    setViewingUserProfileId(userId);
  };
  
  const handleProfileMessage = () => {
    if (viewingUserProfileId) {
        handleOpenChat('DM', viewingUserProfileId);
        setViewingUserProfileId(null);
    }
  };
  
  const handleProfileCall = () => {
    if (onCall && viewingUserProfileId) {
        const user = USERS[viewingUserProfileId];
        if (user) {
            setViewingUserProfileId(null);
            onCall(user);
        }
    }
  };

  const handleBackToList = () => {
      setIsMobileChatOpen(false);
      if (onClearFriend) onClearFriend();
  };

  const handleCreateGroup = () => {
      if (!newGroupName.trim() || newGroupMembers.length === 0) return;
      const newGroup: GroupChat = { id: `g${Date.now()}`, name: newGroupName, members: ['1', ...newGroupMembers], iconColor: `bg-${['purple','blue','green','pink','orange'][Math.floor(Math.random()*5)]}-500`, unread: 0, lastMessage: 'Group created', time: 'Now' };
      setGroups(prev => [newGroup, ...prev]);
      setShowCreateGroup(false); setNewGroupName(''); setNewGroupMembers([]);
      handleOpenChat('GROUP', newGroup.id);
      setGroupMsgs([{ id: 'sys', userId: '1', content: `Created group "${newGroup.name}"`, timestamp: 'Now', type: 'text' }]);
  };
  const toggleGroupMember = (userId: string) => setNewGroupMembers(prev => prev.includes(userId) ? prev.filter(id => id !== userId) : [...prev, userId]);
  const handleOpenGroupSettings = () => { const group = groups.find(g => g.id === selectedGroupId); if (group) { setEditingGroup({ name: group.name, color: group.iconColor }); setShowGroupSettings(true); } };
  const handleUpdateGroup = () => { if (!selectedGroupId || !editingGroup || !editingGroup.name.trim()) return; setGroups(prev => prev.map(g => { if (g.id === selectedGroupId) return { ...g, name: editingGroup.name, iconColor: editingGroup.color }; return g; })); setShowGroupSettings(false); };
  
  const simulateResponse = (mode: ChatMode, contextId: string | null) => {
      let possibleResponders: string[] = [];
      if (mode === 'DM' && contextId) {
          possibleResponders = [contextId];
      } else if (mode === 'GROUP' && contextId) {
          const group = groups.find(g => g.id === contextId);
          if (group) possibleResponders = group.members.filter(id => id !== '1');
      }

      if (possibleResponders.length === 0) return;

      // Randomize responders
      const numResponders = (mode === 'GROUP' && possibleResponders.length > 1 && Math.random() > 0.7) ? 2 : 1;
      const chosenResponders = possibleResponders.sort(() => 0.5 - Math.random()).slice(0, numResponders);

      chosenResponders.forEach((responderId, idx) => {
          const responderName = USERS[responderId]?.username;
          if (!responderName) return;

          // Delays
          const startTypingDelay = 1000 + (idx * 1500) + Math.random() * 1000;
          const typingDuration = 2000 + Math.random() * 1500;

          const startTimer = setTimeout(() => {
              // Start typing
              setTypingUsers(prev => {
                  if (prev.includes(responderName)) return prev;
                  return [...prev, responderName];
              });

              // Stop typing & Send message
              const endTimer = setTimeout(() => {
                  setTypingUsers(prev => prev.filter(u => u !== responderName));

                  const responses = [
                      "bet", "lmao", "wait really?", "jumping on now", "invite me", 
                      "one sec", "ggs", "sheesh", "that's wild", "no way", 
                      "clutch", "send clips", "voice?", "lagging so bad rn", 
                      "did you see that?", "bruh", "EZ", "diff"
                  ];
                  const content = responses[Math.floor(Math.random() * responses.length)];
                  
                  const incomingMsg: Message = { 
                      id: Date.now().toString() + Math.random().toString(), 
                      userId: responderId, 
                      content: content, 
                      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), 
                      type: 'text' 
                  };

                  if (mode === 'DM') setDmMsgs(prev => [...prev, incomingMsg]);
                  else if (mode === 'GROUP') setGroupMsgs(prev => [...prev, incomingMsg]);
                  
                  SoundEffectEngine.play('notification-popup');
                  playCategorizedAudio('https://assets.mixkit.co/sfx/preview/mixkit-message-pop-alert-2354.mp3', 'notifications', 0.8);

              }, typingDuration);
              simulationTimeoutsRef.current.push(endTimer);
          }, startTypingDelay);
          simulationTimeoutsRef.current.push(startTimer);
      });
  };

  const handleTypingSimulation = () => {
    let candidates: string[] = [];
    if (activeMode === 'CHANNEL') {
        candidates = Object.values(USERS).filter(u => u.id !== '1').map(u => u.username);
    } else if (activeMode === 'DM' && selectedDmUserId) {
        candidates = [getChatUser(selectedDmUserId).username];
    } else if (activeMode === 'GROUP' && selectedGroupId) {
        const group = groups.find(g => g.id === selectedGroupId);
        if (group) {
            candidates = group.members.filter(id => id !== '1').map(id => getChatUser(id).username);
        }
    }

    if (candidates.length === 0) return;

    if (Math.random() < 0.4) {
        const typer = candidates[Math.floor(Math.random() * candidates.length)];
        
        if (!typingUsers.includes(typer)) {
            setTypingUsers(prev => [...prev, typer]);
            
            const timeout = setTimeout(() => {
                setTypingUsers(prev => prev.filter(u => u !== typer));
                delete typingTimeoutsRef.current[typer];
            }, 3000 + Math.random() * 3000);
            
            if (typingTimeoutsRef.current[typer]) clearTimeout(typingTimeoutsRef.current[typer]);
            typingTimeoutsRef.current[typer] = timeout;
        }
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
    if (e.target.value.trim().length > 0) {
        handleTypingSimulation();
    }
  };

  const handleSendMessage = (e: React.FormEvent) => { 
      e.preventDefault(); 
      if (!inputValue.trim()) return; 
      
      const newMessage: Message = { 
          id: Date.now().toString(), 
          userId: '1', 
          content: inputValue, 
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), 
          type: 'text' 
      }; 
      
      if (activeMode === 'DM') { 
          setDmMsgs(prev => [...prev, newMessage]); 
          simulateResponse('DM', selectedDmUserId); 
      } else if (activeMode === 'GROUP') { 
          setGroupMsgs(prev => [...prev, newMessage]); 
          simulateResponse('GROUP', selectedGroupId); 
      } 
      
      setInputValue(''); 
      SoundEffectEngine.play('button-click');
      playCategorizedAudio('https://assets.mixkit.co/sfx/preview/mixkit-software-interface-start-2574.mp3', 'system', 0.5); 
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => { 
      if (e.target.files && e.target.files[0]) { 
          const url = URL.createObjectURL(e.target.files[0]); 
          const newMessage: Message = { id: Date.now().toString(), userId: '1', content: url, timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), type: 'image' }; 
          
          if (activeMode === 'DM') { 
              setDmMsgs(prev => [...prev, newMessage]); 
              simulateResponse('DM', selectedDmUserId); 
          } else if (activeMode === 'GROUP') { 
              setGroupMsgs(prev => [...prev, newMessage]); 
              simulateResponse('GROUP', selectedGroupId); 
          } 
          
          playCategorizedAudio('https://assets.mixkit.co/sfx/preview/mixkit-software-interface-start-2574.mp3', 'system', 0.5); 
          if (fileInputRef.current) fileInputRef.current.value = ''; 
      } 
  };

  const handleGifSelect = (url: string) => { 
      const newMessage: Message = { 
          id: Date.now().toString(), 
          userId: '1', 
          content: url, 
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), 
          type: 'image' 
      }; 
      
      if (activeMode === 'DM') { 
          setDmMsgs(prev => [...prev, newMessage]); 
          simulateResponse('DM', selectedDmUserId); 
      } else if (activeMode === 'GROUP') { 
          setGroupMsgs(prev => [...prev, newMessage]); 
          simulateResponse('GROUP', selectedGroupId); 
      } 
      
      playCategorizedAudio('https://assets.mixkit.co/sfx/preview/mixkit-software-interface-start-2574.mp3', 'system', 0.5); 
      setShowGifPicker(false); 
      setGifSearch('');
  };

  const handleToggleReaction = (messageId: string, emoji: string) => {
      const updateMsgs = (prev: Message[]) => prev.map(msg => {
          if (msg.id !== messageId) return msg;
          
          const reactions = [...(msg.reactions || [])];
          const existingIdx = reactions.findIndex(r => r.emoji === emoji);
          
          if (existingIdx > -1) {
              // Toggle logic: if it exists, decrement or remove
              const newCount = reactions[existingIdx].count - 1;
              if (newCount <= 0) {
                  reactions.splice(existingIdx, 1);
              } else {
                  reactions[existingIdx] = { ...reactions[existingIdx], count: newCount };
              }
          } else {
              reactions.push({ emoji, count: 1 });
          }
          
          return { ...msg, reactions };
      });

      if (activeMode === 'DM') setDmMsgs(updateMsgs);
      else if (activeMode === 'GROUP') setGroupMsgs(updateMsgs);
      
      setReactingToMessageId(null);
      playCategorizedAudio('https://assets.mixkit.co/sfx/preview/mixkit-sci-fi-click-900.mp3', 'system', 0.5);
  };
  
  // Filter typing users based on active context
  const getRelevantTypingUsers = () => {
      let allowedNames: string[] = [];
      
      if (activeMode === 'DM' && selectedDmUserId) {
          const user = USERS[selectedDmUserId];
          if (user) allowedNames = [user.username];
      } else if (activeMode === 'GROUP' && selectedGroupId) {
          const group = groups.find(g => g.id === selectedGroupId);
          if (group) {
              allowedNames = group.members.map(id => USERS[id]?.username).filter(Boolean);
          }
      }
      
      return typingUsers.filter(name => allowedNames.includes(name));
  };
  
  const relevantTypingUsers = getRelevantTypingUsers();

  const getTypingText = () => { 
    const count = relevantTypingUsers.length; 
    if (count === 0) return ''; 
    if (count === 1) return `${relevantTypingUsers[0]} is typing...`; 
    if (count === 2) return `${relevantTypingUsers[0]} and ${relevantTypingUsers[1]} are typing...`;
    if (count === 3) return `${relevantTypingUsers[0]}, ${relevantTypingUsers[1]}, and ${relevantTypingUsers[2]} are typing...`;
    return `${relevantTypingUsers[0]}, ${relevantTypingUsers[1]}, and ${count - 2} others are typing...`; 
  };
  
  // Render Component
  return (
    <div className="flex h-full w-full bg-[#09090b] text-white relative">
      
      {/* Click-away listeners */}
      {showGifPicker && <div className="fixed inset-0 z-30" onClick={() => setShowGifPicker(false)}></div>}
      {reactingToMessageId && <div className="fixed inset-0 z-30" onClick={() => setReactingToMessageId(null)}></div>}
      {showRightSidebar && <div className="fixed inset-0 z-30 bg-black/50 md:hidden" onClick={() => setShowRightSidebar(false)}></div>}

      {/* --- PROFILE OVERLAY MODAL --- */}
      {viewingUserProfileId && USERS[viewingUserProfileId] && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fadeIn" onClick={() => setViewingUserProfileId(null)}>
              <div 
                  className="relative w-full max-w-sm bg-[#18181b] rounded-[2rem] shadow-2xl overflow-hidden border border-white/10 animate-zoomIn"
                  onClick={(e) => e.stopPropagation()}
              >
                  {/* Banner */}
                  <div className="h-32 w-full relative">
                      <img src={USERS[viewingUserProfileId].banner || 'https://picsum.photos/600/200'} className="w-full h-full object-cover" alt="Banner" />
                      <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[#18181b]/90"></div>
                      <button 
                          onClick={() => setViewingUserProfileId(null)}
                          className="absolute top-4 right-4 p-2 bg-black/50 hover:bg-black/70 rounded-full text-white transition-colors backdrop-blur-md"
                      >
                          <X size={20} />
                      </button>
                  </div>

                  {/* Content */}
                  <div className="px-6 pb-8 relative">
                      {/* Avatar */}
                      <div className="absolute -top-12 left-6">
                          <div className="relative">
                              <img 
                                  src={USERS[viewingUserProfileId].avatar} 
                                  className="w-24 h-24 rounded-3xl border-4 border-[#18181b] object-cover shadow-xl bg-[#202023]" 
                                  alt="Avatar" 
                              />
                              <div className={`absolute -bottom-1 -right-1 w-6 h-6 rounded-full border-4 border-[#18181b] 
                                  ${USERS[viewingUserProfileId].status === 'online' ? 'bg-green-500' : USERS[viewingUserProfileId].status === 'idle' ? 'bg-yellow-500' : 'bg-red-500'}`} 
                              />
                          </div>
                      </div>

                      {/* Header Info */}
                      <div className="pt-14 flex justify-between items-start mb-6">
                          <div>
                              <h2 className="text-2xl font-black text-white leading-none mb-1">{USERS[viewingUserProfileId].username}</h2>
                              <div className="flex items-center gap-2 text-sm font-medium">
                                  <span className={`
                                      ${USERS[viewingUserProfileId].status === 'online' ? 'text-green-400' : 
                                        USERS[viewingUserProfileId].status === 'idle' ? 'text-yellow-400' : 'text-slate-500'}
                                  `}>
                                      {USERS[viewingUserProfileId].status === 'online' ? 'Online' : 
                                       USERS[viewingUserProfileId].status === 'idle' ? 'Idle' : 'Offline'}
                                  </span>
                                  <span className="text-slate-600">•</span>
                                  <span className="text-purple-400">{USERS[viewingUserProfileId].role}</span>
                              </div>
                          </div>
                          {USERS[viewingUserProfileId].level && (
                              <div className="flex flex-col items-end">
                                  <div className="flex items-center gap-1 text-yellow-500 font-bold text-sm bg-yellow-500/10 px-2 py-0.5 rounded-lg border border-yellow-500/20">
                                      <Trophy size={12} /> Lvl {USERS[viewingUserProfileId].level}
                                  </div>
                              </div>
                          )}
                      </div>

                      {/* About Me */}
                      <div className="bg-[#202023] rounded-2xl p-4 mb-6 border border-white/5 relative group">
                          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">About Me</h3>
                          <p className="text-slate-300 text-sm leading-relaxed font-medium">"{USERS[viewingUserProfileId].bio || 'Just chilling in the Nexus.'}"</p>
                      </div>

                      {/* Actions Grid */}
                      <div className="grid grid-cols-2 gap-3 mb-2">
                          <button 
                              onClick={handleProfileMessage}
                              className="col-span-1 py-3 bg-purple-600 hover:bg-purple-500 text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-purple-600/20 active:scale-95"
                          >
                              <MessageSquare size={18} /> Text
                          </button>
                          <button 
                              onClick={handleProfileCall}
                              className="col-span-1 py-3 bg-[#202023] hover:bg-[#2b2b30] text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-all border border-white/5 active:scale-95"
                          >
                              <Phone size={18} /> Call
                          </button>
                      </div>
                  </div>
              </div>
          </div>
      )}

      {/* --- CREATE GROUP MODAL --- */}
      {showCreateGroup && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
              <div className="w-full max-w-sm bg-[#121216] rounded-3xl border border-white/10 shadow-2xl overflow-hidden">
                  <div className="p-4 border-b border-white/5 flex justify-between items-center bg-[#18181b]">
                      <h3 className="text-lg font-bold text-white">Create Group</h3>
                      <button onClick={() => setShowCreateGroup(false)} className="text-slate-400 hover:text-white"><X size={20} /></button>
                  </div>
                  <div className="p-4 space-y-4">
                      <input 
                          value={newGroupName}
                          onChange={(e) => setNewGroupName(e.target.value)}
                          placeholder="Group Name"
                          className="w-full bg-[#09090b] border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-purple-500"
                      />
                      <div className="max-h-48 overflow-y-auto custom-scrollbar space-y-1">
                          {Object.values(USERS).filter(u => u.id !== '1').map(u => (
                              <div key={u.id} onClick={() => toggleGroupMember(u.id)} className={`flex items-center gap-3 p-2 rounded-xl cursor-pointer border ${newGroupMembers.includes(u.id) ? 'bg-purple-500/10 border-purple-500' : 'border-transparent hover:bg-white/5'}`}>
                                  <img src={u.avatar} className="w-8 h-8 rounded-full" />
                                  <span className="text-sm font-medium flex-1">{u.username}</span>
                                  {newGroupMembers.includes(u.id) && <CheckCircle2 size={16} className="text-purple-500" />}
                              </div>
                          ))}
                      </div>
                      <button onClick={handleCreateGroup} disabled={!newGroupName || newGroupMembers.length === 0} className="w-full py-3 bg-purple-600 rounded-xl font-bold">Create</button>
                  </div>
              </div>
          </div>
      )}

      {/* --- GROUP SETTINGS MODAL --- */}
      {showGroupSettings && editingGroup && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
              <div className="w-full max-w-sm bg-[#121216] rounded-3xl border border-white/10 shadow-2xl">
                  <div className="p-4 border-b border-white/5 flex justify-between items-center bg-[#18181b]">
                      <h3 className="text-lg font-bold">Group Settings</h3>
                      <button onClick={() => setShowGroupSettings(false)} className="text-slate-400"><X size={20} /></button>
                  </div>
                  <div className="p-4 space-y-4">
                      <input value={editingGroup.name} onChange={(e) => setEditingGroup({...editingGroup, name: e.target.value})} className="w-full bg-[#09090b] rounded-xl px-4 py-3 outline-none border border-white/10" />
                      <div className="flex gap-2 justify-center">{['bg-purple-500', 'bg-blue-500', 'bg-green-500', 'bg-orange-500', 'bg-red-500'].map(c => (
                          <button key={c} onClick={() => setEditingGroup({...editingGroup, color: c})} className={`w-8 h-8 rounded-full ${c} ${editingGroup.color === c ? 'ring-2 ring-white' : ''}`}></button>
                      ))}</div>
                      <button onClick={handleUpdateGroup} className="w-full py-3 bg-purple-600 rounded-xl font-bold">Save</button>
                  </div>
              </div>
          </div>
      )}

      {/* --- 1. LIST VIEW (Mobile: Hidden when chat open / Desktop: Sidebar) --- */}
      {!hideSidebar && (
        <div className={`
          ${isMobileChatOpen ? 'hidden md:flex' : 'flex'} 
          md:w-72 w-full flex-col shrink-0 bg-[#09090b] md:bg-[#121216] md:rounded-[2rem] md:border border-white/5 md:shadow-2xl overflow-hidden z-10
        `}>
          
          {/* Sidebar Header */}
          <div className="p-4 border-b border-white/5 bg-[#09090b]">
              <div className="flex bg-[#1e1f24] p-1 rounded-xl border border-white/5">
                  <button 
                      onClick={() => {
                          SoundEffectEngine.play('button-click');
                          setActiveMode('DM');
                      }}
                      className={`flex-1 text-xs font-bold py-2.5 rounded-lg transition-all flex items-center justify-center gap-2 ${activeMode === 'DM' ? 'bg-[#2b2d31] text-white shadow-sm' : 'text-slate-500 hover:text-slate-300'}`}
                  >
                      <Users size={14} /> DMs
                  </button>
                  <button 
                      onClick={() => {
                          SoundEffectEngine.play('button-click');
                          setActiveMode('GROUP');
                      }}
                      className={`flex-1 text-xs font-bold py-2.5 rounded-lg transition-all flex items-center justify-center gap-2 ${activeMode === 'GROUP' ? 'bg-[#2b2d31] text-white shadow-sm' : 'text-slate-500 hover:text-slate-300'}`}
                  >
                      <MessageSquare size={14} /> Squads
                  </button>
              </div>
          </div>

          {/* Sidebar List */}
          <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-1">
              {activeMode === 'GROUP' ? (
                  <>
                      <div className="flex items-center justify-between px-4 py-2">
                          <span className="text-xs font-bold text-slate-500 uppercase">Squad Groups</span>
                          <button onClick={() => setShowCreateGroup(true)} title="Create Group"><Plus size={16} className="text-slate-400 hover:text-white" /></button>
                      </div>
                      {groups.map(group => (
                          <div key={group.id} onClick={() => handleOpenChat('GROUP', group.id)} className={`flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 cursor-pointer ${selectedGroupId === group.id ? 'bg-purple-600/15 border border-purple-500/30' : ''}`}>
                              <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm ${group.iconColor}`}>{group.name.substring(0,2).toUpperCase()}</div>
                              <div className="flex-1 min-w-0">
                                  <div className="font-bold text-sm text-white truncate">{group.name}</div>
                                  <div className="text-xs text-slate-500 truncate">{group.lastMessage}</div>
                              </div>
                          </div>
                      ))}
                  </>
              ) : (
                  <>
                      <div className="px-4 py-2 text-xs font-bold text-slate-500 uppercase">Direct Messages</div>
                      {Object.values(USERS).filter(u => u.id !== '1').map(user => {
                          const thread = DM_THREADS.find(t => t.userId === user.id);
                          const isSelected = selectedDmUserId === user.id;
                          return (
                              <div key={user.id} onClick={() => handleOpenChat('DM', user.id)} className={`flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 cursor-pointer group ${isSelected ? 'bg-purple-600/15 border border-purple-500/30' : ''}`}>
                                  <div className="relative">
                                      <img 
                                          src={user.avatar} 
                                          className="w-10 h-10 rounded-xl cursor-pointer hover:opacity-80 transition-opacity" 
                                          onClick={(e) => handleOpenProfile(e, user.id)}
                                      />
                                      <div className={`absolute -bottom-1 -right-1 w-3 h-3 border-2 border-[#09090b] rounded-full ${user.status === 'online' ? 'bg-green-500' : user.status === 'idle' ? 'bg-amber-500' : 'bg-slate-500'}`}></div>
                                  </div>
                                  <div className="flex-1 min-w-0">
                                      <div className="flex justify-between"><span className="font-bold text-sm text-white">{user.username}</span><span className="text-[10px] text-slate-500">{thread?.time || '2m'}</span></div>
                                      <div className="text-xs text-slate-500 truncate">{thread?.lastMessage || 'Hey, let\'s team up!'}</div>
                                  </div>
                              </div>
                          )
                      })}
                  </>
              )}
          </div>
        </div>
      )}

      {/* --- 2. MAIN CHAT AREA (Mobile: Full screen when open / Desktop: Flex) --- */}
      <div className={`
         ${hideSidebar ? 'flex' : (isMobileChatOpen ? 'flex' : 'hidden md:flex')} 
         flex-1 flex-col min-w-0 bg-[#09090b] md:bg-[#121216] md:rounded-[2rem] md:border border-white/5 md:shadow-2xl overflow-hidden relative w-full h-full
      `}>
         
         {/* Top Bar */}
         <div className="h-16 flex items-center justify-between px-4 shrink-0 bg-[#09090b]/90 backdrop-blur-md border-b border-white/5 z-20 sticky top-0">
            <div className="flex items-center gap-3">
                {(hideSidebar || isMobileChatOpen) && (
                  <button 
                    onClick={() => {
                      handleBackToList();
                      if (onClearFriend) onClearFriend();
                    }} 
                    className={`${hideSidebar ? 'flex' : 'md:hidden flex'} p-2 -ml-2 text-slate-400 hover:text-white rounded-xl hover:bg-white/10 transition-colors items-center justify-center`}
                    title="Back to Friends"
                  >
                    <ArrowLeft size={20}/>
                  </button>
                )}
                {activeMode === 'GROUP' && selectedGroupId ? (
                     <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-lg ${groups.find(g => g.id === selectedGroupId)?.iconColor} flex items-center justify-center font-bold text-xs`}>{groups.find(g => g.id === selectedGroupId)?.name.substring(0,2)}</div>
                        <h3 className="font-bold text-white text-lg">{groups.find(g => g.id === selectedGroupId)?.name}</h3>
                     </div>
                ) : selectedDmUserId ? (
                     <div className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity" onClick={(e) => handleOpenProfile(e, selectedDmUserId)}>
                        <img src={getChatUser(selectedDmUserId).avatar} className="w-8 h-8 rounded-lg object-cover" alt="Avatar" />
                        <div className="flex flex-col">
                            <h3 className="font-bold text-white leading-none">{getChatUser(selectedDmUserId).username}</h3>
                            <span className="text-[10px] text-slate-500">{getChatUser(selectedDmUserId).status}</span>
                        </div>
                     </div>
                ) : null}
            </div>
            
            <div className="flex items-center gap-1">
                {activeMode === 'DM' && selectedDmUserId && (
                    <button 
                        className="p-2 text-slate-400 hover:text-white transition-colors hover:bg-white/5 rounded-lg" 
                        onClick={() => onCall && onCall(getChatUser(selectedDmUserId))}
                        title="Start Voice Call"
                    >
                        <Phone size={20} />
                    </button>
                )}
                {activeMode === 'GROUP' && <button onClick={handleOpenGroupSettings} className="p-2 text-slate-400 hover:text-white"><Settings size={20} /></button>}
                <button onClick={() => setShowRightSidebar(true)} className="p-2 text-slate-400 hover:text-white xl:hidden"><Users size={20} /></button>
            </div>
         </div>

         {/* Chat History */}
         <div 
            ref={chatContainerRef}
            onScroll={handleScroll}
            className="flex-1 overflow-y-auto custom-scrollbar px-4 pb-4 space-y-4 pt-4 bg-[#09090b]"
         >
             {/* Messages Rendering */}
             {getActiveMessages().map((msg, index, arr) => {
                 const isMe = msg.userId === '1';
                 const user = getChatUser(msg.userId);
                 const prevMsg = arr[index - 1];
                 // Improved sequence logic: check if same user and within 5 minutes
                 const isSequence = prevMsg && prevMsg.userId === msg.userId && 
                                   (msg.timestamp === prevMsg.timestamp || 
                                    (index > 0 && Math.random() > 0.8)); // Fallback for mock data consistency
                 
                 if (activeMode === 'CHANNEL') {
                     return (
                         <div key={msg.id} className={`flex gap-3 group/msg ${isSequence ? 'mt-0.5' : 'mt-4'} relative`}>
                             {!isSequence ? <img src={user.avatar} className="w-10 h-10 rounded-xl mt-0.5 cursor-pointer hover:opacity-80 transition-opacity" onClick={(e) => handleOpenProfile(e, msg.userId)} /> : <div className="w-10" />}
                             <div className="flex-1 min-w-0">
                                 {!isSequence && (
                                     <div className="flex items-center gap-2 mb-0.5">
                                         <span className={`font-bold text-sm ${user.color || 'text-white'} cursor-pointer hover:underline`} onClick={(e) => handleOpenProfile(e, msg.userId)}>{user.username}</span>
                                         <span className="text-[10px] text-slate-500">{msg.timestamp}</span>
                                     </div>
                                 )}
                                 <div className="text-slate-200 text-[15px] leading-relaxed break-words relative group/content">
                                     {msg.type === 'image' ? <img src={msg.content} className="rounded-xl max-w-full max-h-64 object-cover border border-white/10" /> : msg.content}
                                     
                                     {/* Reaction Button (Channel) */}
                                     <div className="absolute -right-2 -top-2 opacity-0 group-hover/msg:opacity-100 transition-opacity flex gap-1 z-10">
                                         <button 
                                             onClick={() => setReactingToMessageId(msg.id)}
                                             className="p-1.5 bg-[#18181b] border border-white/10 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 shadow-xl"
                                         >
                                             <Smile size={14} />
                                         </button>
                                     </div>
                                     
                                     {/* Emoji Picker Popup (Channel) */}
                                     {reactingToMessageId === msg.id && (
                                         <div className="absolute bottom-full left-0 mb-2 bg-[#18181b] border border-white/10 rounded-xl p-1.5 flex gap-1 shadow-2xl z-50 animate-notificationPop">
                                             {COMMON_EMOJIS.map(emoji => (
                                                 <button 
                                                     key={emoji} 
                                                     onClick={() => handleToggleReaction(msg.id, emoji)}
                                                     className="p-1.5 hover:bg-white/10 rounded-lg text-lg transition-transform hover:scale-125"
                                                 >
                                                     {emoji}
                                                 </button>
                                             ))}
                                         </div>
                                     )}
                                 </div>
                                 
                                 {/* Reactions Display (Channel) */}
                                 {msg.reactions && msg.reactions.length > 0 && (
                                     <div className="flex flex-wrap gap-1 mt-1.5">
                                         {msg.reactions.map(r => (
                                             <button 
                                                 key={r.emoji}
                                                 onClick={() => handleToggleReaction(msg.id, r.emoji)}
                                                 className="flex items-center gap-1.5 px-2 py-0.5 bg-white/5 border border-white/10 rounded-lg text-xs hover:bg-purple-500/10 hover:border-purple-500/30 transition-colors"
                                             >
                                                 <span>{r.emoji}</span>
                                                 <span className="font-bold text-slate-400">{r.count}</span>
                                             </button>
                                         ))}
                                     </div>
                                 )}
                             </div>
                         </div>
                     );
                 } else {
                     return (
                         <div key={msg.id} className={`flex w-full group/msg ${isMe ? 'justify-end' : 'justify-start'} ${isSequence ? 'mt-0.5' : 'mt-3'} relative`}>
                             {!isMe && !isSequence && <img src={user.avatar} className="w-8 h-8 rounded-full mr-2 self-end mb-1 cursor-pointer hover:opacity-80 transition-opacity" onClick={(e) => handleOpenProfile(e, msg.userId)} />}
                             {!isMe && isSequence && <div className="w-10" />}
                             <div className="max-w-[75%] relative">
                                 <div className={`px-4 py-2.5 rounded-2xl text-[15px] break-words ${isMe ? 'bg-purple-600 text-white rounded-br-sm' : 'bg-[#1e1f24] text-slate-200 rounded-bl-sm'}`}>
                                     {msg.type === 'image' ? <img src={msg.content} className="rounded-lg max-w-full" /> : msg.content}
                                 </div>
                                 
                                 {/* Reaction Button (DM/Group) */}
                                 <div className={`absolute -top-2 ${isMe ? '-left-2' : '-right-2'} opacity-0 group-hover/msg:opacity-100 transition-opacity z-10`}>
                                     <button 
                                         onClick={() => setReactingToMessageId(msg.id)}
                                         className="p-1.5 bg-[#18181b] border border-white/10 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 shadow-xl"
                                     >
                                         <Smile size={14} />
                                     </button>
                                 </div>

                                 {/* Emoji Picker Popup (DM/Group) */}
                                 {reactingToMessageId === msg.id && (
                                     <div className={`absolute bottom-full ${isMe ? 'right-0' : 'left-0'} mb-2 bg-[#18181b] border border-white/10 rounded-xl p-1.5 flex gap-1 shadow-2xl z-50 animate-notificationPop`}>
                                         {COMMON_EMOJIS.map(emoji => (
                                             <button 
                                                 key={emoji} 
                                                 onClick={() => handleToggleReaction(msg.id, emoji)}
                                                 className="p-1.5 hover:bg-white/10 rounded-lg text-lg transition-transform hover:scale-125"
                                             >
                                                 {emoji}
                                             </button>
                                         ))}
                                     </div>
                                 )}

                                 {/* Reactions Display (DM/Group) */}
                                 {msg.reactions && msg.reactions.length > 0 && (
                                     <div className={`flex flex-wrap gap-1 mt-1 ${isMe ? 'justify-end' : 'justify-start'}`}>
                                         {msg.reactions.map(r => (
                                             <button 
                                                 key={r.emoji}
                                                 onClick={() => handleToggleReaction(msg.id, r.emoji)}
                                                 className="flex items-center gap-1.5 px-2 py-0.5 bg-white/5 border border-white/10 rounded-lg text-[10px] hover:bg-purple-500/10 hover:border-purple-500/30 transition-colors"
                                             >
                                                 <span>{r.emoji}</span>
                                                 <span className="font-bold text-slate-400">{r.count}</span>
                                             </button>
                                         ))}
                                     </div>
                                 )}
                             </div>
                         </div>
                     );
                 }
             })}
         </div>

         {/* Scroll Down Button */}
         {showScrollButton && (
            <button onClick={() => scrollToBottom(true)} className="absolute bottom-20 right-4 z-20 p-3 bg-[#1e1f24] text-white rounded-full shadow-lg border border-white/10 animate-bounce">
                <ArrowDown size={20} />
            </button>
         )}

         {/* Input Area */}
         <div className="p-3 bg-[#09090b] border-t border-white/5 sticky bottom-0 z-20 pb-safe">
             {/* GIF Picker (Absolute positioned up) */}
             {showGifPicker && (
                <div className="absolute bottom-full left-0 w-full md:w-80 bg-[#18181b] border border-white/10 rounded-t-2xl md:rounded-2xl shadow-2xl z-40 h-96 flex flex-col animate-slideUp">
                    <div className="p-3 border-b border-white/5 flex items-center justify-between">
                         <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2"><Sticker size={14}/> {gifSearch ? 'Search Results' : 'Trending GIFs'}</span>
                         <button onClick={() => setShowGifPicker(false)} className="text-slate-500 hover:text-white"><X size={14}/></button>
                    </div>
                    <div className="p-2 border-b border-white/5">
                        <div className="relative">
                            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                            <input 
                                autoFocus 
                                value={gifSearch} 
                                onChange={(e) => setGifSearch(e.target.value)} 
                                placeholder="Search GIPHY..." 
                                className="w-full bg-[#09090b] rounded-lg py-2 pl-9 pr-3 text-xs text-white outline-none focus:ring-1 focus:ring-purple-500" 
                            />
                        </div>
                    </div>
                    <div className="flex-1 overflow-y-auto p-2 grid grid-cols-2 gap-2 custom-scrollbar">
                        {isLoadingGifs ? (
                            <div className="col-span-2 flex flex-col items-center justify-center py-10 gap-3">
                                <div className="w-6 h-6 border-2 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
                                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Loading GIFs...</span>
                            </div>
                        ) : gifs.length > 0 ? (
                            gifs.map(gif => (
                                <div 
                                    key={gif.id} 
                                    onClick={() => handleGifSelect(gif.url)} 
                                    className="aspect-video rounded-lg overflow-hidden cursor-pointer hover:ring-2 hover:ring-purple-500 transition-all bg-[#09090b] group"
                                >
                                    <img src={gif.url} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" alt={gif.title} />
                                </div>
                            ))
                        ) : (
                            <div className="col-span-2 text-center text-slate-500 text-xs py-10">No GIFs found</div>
                        )}
                    </div>
                    <div className="p-2 border-t border-white/5 bg-[#09090b]/50 flex justify-center">
                        <img src="https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExNHR4eGZ4eGZ4eGZ4eGZ4eGZ4eGZ4eGZ4eGZ4eGZ4eGZ4JmVwPXYxX2ludGVybmFsX2dpZl9ieV9pZCZjdD1z/3o7TKVUn7iM8FMEU24/giphy.gif" className="h-4 opacity-50 grayscale hover:grayscale-0 transition-all" alt="Powered by GIPHY" />
                    </div>
                </div>
             )}

             {/* Typing Indicator */}
             {relevantTypingUsers.length > 0 && <div className="text-[10px] text-purple-400 font-bold mb-1 pl-4 animate-pulse">{getTypingText()}</div>}

             <div className="bg-[#1e1f24] rounded-2xl flex items-center p-1 border border-white/5">
                 <button onClick={() => fileInputRef.current?.click()} className="p-2 text-slate-400 hover:text-white transition-colors"><Paperclip size={20} /></button>
                 <button 
                    onClick={() => setShowGifPicker(!showGifPicker)} 
                    className={`p-2 transition-colors ${showGifPicker ? 'text-purple-400' : 'text-slate-400 hover:text-white'}`}
                    title="Send a GIF"
                 >
                    <Sticker size={20} />
                 </button>
                 <input type="file" ref={fileInputRef} onChange={handleFileSelect} className="hidden" accept="image/*" />
                 
                 <form onSubmit={handleSendMessage} className="flex-1 flex items-center">
                    <input value={inputValue} onChange={handleInputChange} placeholder="Message..." className="flex-1 bg-transparent text-white placeholder-slate-500 px-2 py-2 outline-none" />
                    <button type="submit" className={`p-2 rounded-xl transition-all ${inputValue ? 'bg-purple-600 text-white' : 'text-slate-500'}`}>
                        {inputValue ? <ArrowUp size={20} /> : <Mic size={20} />}
                    </button>
                 </form>
             </div>
         </div>
      </div>

      {/* --- 3. RIGHT SIDEBAR (Members) --- */}
      <div className={`
         fixed inset-y-0 right-0 z-40 w-64 bg-[#121216] border-l border-white/5 transform transition-transform duration-300
         xl:relative xl:translate-x-0 xl:flex xl:flex-col
         ${showRightSidebar ? 'translate-x-0' : 'translate-x-full'}
      `}>
          <div className="p-4 border-b border-white/5 flex justify-between items-center bg-[#18181b]/50">
             <h3 className="font-bold text-xs uppercase text-slate-400">Details</h3>
             <button onClick={() => setShowRightSidebar(false)} className="xl:hidden text-slate-400"><X size={20} /></button>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
            {activeMode === 'CHANNEL' ? (
                ['Admin', 'Mod', 'Member'].map(role => (
                    <div key={role} className="mb-6">
                        <h4 className="text-[10px] font-bold text-slate-600 uppercase mb-2">{role}</h4>
                        {Object.values(USERS).filter(u => u.role === role).map(u => (
                            <div key={u.id} className="flex items-center gap-3 py-1.5 opacity-80 cursor-pointer hover:opacity-100 transition-opacity" onClick={(e) => handleOpenProfile(e, u.id)}>
                                <div className="relative"><img src={u.avatar} className="w-8 h-8 rounded-lg" /><div className={`absolute -bottom-1 -right-1 w-2.5 h-2.5 rounded-full border-2 border-[#121216] ${u.status === 'online' ? 'bg-green-500' : 'bg-slate-500'}`}></div></div>
                                <div className={`text-sm font-bold ${u.color || 'text-slate-300'}`}>{u.username}</div>
                            </div>
                        ))}
                    </div>
                ))
            ) : (
                <div className="text-center mt-10">
                    {selectedDmUserId ? (
                      <img 
                        src={getChatUser(selectedDmUserId).avatar} 
                        className="w-24 h-24 rounded-full mx-auto mb-4 bg-white/5 object-cover border-2 border-white/10" 
                        alt="DM User"
                      />
                    ) : (
                      <div className={`w-24 h-24 rounded-3xl mx-auto mb-4 flex items-center justify-center font-black text-3xl text-white shadow-xl ${groups.find(g=>g.id===selectedGroupId)?.iconColor || 'bg-purple-600'}`}>
                        {groups.find(g=>g.id===selectedGroupId)?.name?.slice(0, 2).toUpperCase() || 'GP'}
                      </div>
                    )}
                    <h3 className="text-xl font-bold text-white">
                      {selectedDmUserId ? getChatUser(selectedDmUserId).username : groups.find(g=>g.id===selectedGroupId)?.name || 'Chat'}
                    </h3>
                </div>
            )}
          </div>
      </div>
    </div>
  );
};