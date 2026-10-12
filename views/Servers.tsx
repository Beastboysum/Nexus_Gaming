import React, { useState, useEffect, useRef } from 'react';
import { 
  Hash, 
  Volume2, 
  Plus, 
  Send, 
  Search, 
  MoreVertical, 
  Crown, 
  Shield, 
  Paperclip, 
  Bell, 
  Users, 
  ArrowLeft, 
  Mic, 
  MicOff,
  Headphones,
  Settings, 
  Compass, 
  Share2, 
  Copy, 
  Check, 
  X, 
  Smile, 
  Pin, 
  ChevronDown, 
  ChevronRight, 
  MessageSquare, 
  Radio, 
  Sparkles, 
  Flame, 
  PhoneCall, 
  PhoneOff,
  Trash2,
  Edit2,
  FolderPlus,
  Image as ImageIcon,
  Reply,
  Globe,
  Lock,
  UserPlus,
  Activity,
  Sliders,
  Palette,
  CheckSquare,
  Square,
  ShieldCheck,
  UserCheck,
  Link as LinkIcon,
  Clock,
  ExternalLink,
  RefreshCw,
  FileText,
  ClipboardList
} from 'lucide-react';
import { AuditLogAction, AuditLogEntry, Server, ServerChannel, ServerInvite, ServerMember, ServerMessage, ServerRole, User, ViewState } from '../types';
import { ServerService, CURRENT_USER } from '../services/serverService';
import { SoundEffectEngine } from '../services/SoundEffectEngine';
import { playCategorizedAudio } from '../services/audioManager';
import { InChannelActivityOverlay } from '../components/InChannelActivityOverlay';
import { VoiceAvatarWithGlowingRing } from '../components/VoiceAvatarWithGlowingRing';
import { VoiceChannelStage } from '../components/VoiceChannelStage';
import { VoiceActivityService } from '../services/voiceActivityService';

interface ServersViewProps {
  onNavigate?: (view: ViewState) => void;
  onOpenDM?: (user: User) => void;
  onCall?: (user: User) => void;
}

const PRESET_ICONS = [
  'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=200&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1542751110-97427bbecf20?q=80&w=200&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=200&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?q=80&w=200&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1511512578047-dfb367046420?q=80&w=200&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?q=80&w=200&auto=format&fit=crop',
];

const EMOJI_PALETTE = ['🔥', '👑', '🎯', '🚀', '💀', '⚡', '✨', '🏆', 'GG', '❤️'];

export const ROLE_COLOR_PRESETS = [
  { label: 'Cyber Purple', hex: '#c084fc' },
  { label: 'Neon Cyan', hex: '#38bdf8' },
  { label: 'Radiant Gold', hex: '#facc15' },
  { label: 'Phoenix Rose', hex: '#f43f5e' },
  { label: 'Emerald Jade', hex: '#4ade80' },
  { label: 'Blaze Orange', hex: '#fb923c' },
  { label: 'Valkyrie Pink', hex: '#ec4899' },
  { label: 'Tactical Slate', hex: '#94a3b8' },
];

export interface RoleTemplate {
  name: string;
  color: string;
  hoist: boolean;
  permissions: string[];
  description: string;
  icon?: string;
}

export const ROLE_TEMPLATES: RoleTemplate[] = [
  {
    name: 'Moderator',
    color: '#38bdf8',
    hoist: true,
    permissions: [
      'KICK_MEMBERS',
      'BAN_MEMBERS',
      'MANAGE_MESSAGES',
      'MANAGE_CHANNELS',
      'CREATE_INVITES',
      'SEND_MESSAGES',
      'ATTACH_FILES',
      'ADD_REACTIONS',
      'CONNECT_VOICE',
      'SPEAK_VOICE',
      'MUTE_MEMBERS'
    ],
    description: 'Enforces server rules, mutes disruptive users, deletes spam, and moderates voice channels.',
    icon: '🛡️'
  },
  {
    name: 'Member',
    color: '#94a3b8',
    hoist: false,
    permissions: [
      'SEND_MESSAGES',
      'ATTACH_FILES',
      'ADD_REACTIONS',
      'CONNECT_VOICE',
      'SPEAK_VOICE',
      'CREATE_INVITES'
    ],
    description: 'Standard community participant with chat, file attachments, and voice privileges.',
    icon: '🎮'
  },
  {
    name: 'Administrator',
    color: '#f43f5e',
    hoist: true,
    permissions: [
      'ADMINISTRATOR',
      'MANAGE_SERVER',
      'MANAGE_ROLES',
      'MANAGE_CHANNELS',
      'KICK_MEMBERS',
      'BAN_MEMBERS',
      'CREATE_INVITES',
      'SEND_MESSAGES',
      'ATTACH_FILES',
      'ADD_REACTIONS',
      'MENTION_EVERYONE',
      'MANAGE_MESSAGES',
      'CONNECT_VOICE',
      'SPEAK_VOICE',
      'MUTE_MEMBERS',
      'PRIORITY_SPEAKER'
    ],
    description: 'Full executive server control with unrestricted permissions across all channels.',
    icon: '👑'
  },
  {
    name: 'VIP Clan Veteran',
    color: '#facc15',
    hoist: true,
    permissions: [
      'SEND_MESSAGES',
      'ATTACH_FILES',
      'ADD_REACTIONS',
      'CONNECT_VOICE',
      'SPEAK_VOICE',
      'PRIORITY_SPEAKER',
      'CREATE_INVITES'
    ],
    description: 'Distinguished veteran role with priority speaking in voice rooms and custom recognition.',
    icon: '⭐'
  },
  {
    name: 'Tactical Shot-Caller',
    color: '#10b981',
    hoist: true,
    permissions: [
      'CONNECT_VOICE',
      'SPEAK_VOICE',
      'PRIORITY_SPEAKER',
      'MUTE_MEMBERS',
      'SEND_MESSAGES',
      'ADD_REACTIONS'
    ],
    description: 'In-game tournament and ranked caller with voice priority and communication controls.',
    icon: '🎯'
  }
];

export const AVAILABLE_PERMISSIONS = [
  { id: 'ADMINISTRATOR', name: 'Administrator', description: 'Members with this permission have every permission and bypass channel restrictions.', category: 'Server Control' },
  { id: 'MANAGE_SERVER', name: 'Manage Server', description: 'Allows changing server name, description, and guidelines.', category: 'Server Control' },
  { id: 'MANAGE_ROLES', name: 'Manage Roles', description: 'Allows creating new roles and editing roles lower than this one.', category: 'Server Control' },
  { id: 'MANAGE_CHANNELS', name: 'Manage Channels', description: 'Allows creating, modifying, or deleting channels.', category: 'Server Control' },
  { id: 'KICK_MEMBERS', name: 'Kick Members', description: 'Allows removing members from the server.', category: 'Membership' },
  { id: 'BAN_MEMBERS', name: 'Ban Members', description: 'Allows permanently banning disruptive users.', category: 'Membership' },
  { id: 'CREATE_INVITES', name: 'Create Invites', description: 'Allows generating shareable server invite links.', category: 'Membership' },
  { id: 'SEND_MESSAGES', name: 'Send Messages', description: 'Allows chatting in text channels.', category: 'Text Channels' },
  { id: 'ATTACH_FILES', name: 'Attach Files & Media', description: 'Allows uploading pictures and gameplay clips.', category: 'Text Channels' },
  { id: 'ADD_REACTIONS', name: 'Add Reactions', description: 'Allows reacting to messages with emojis.', category: 'Text Channels' },
  { id: 'MENTION_EVERYONE', name: 'Mention @everyone', description: 'Allows notifying everyone in the server.', category: 'Text Channels' },
  { id: 'MANAGE_MESSAGES', name: 'Manage Messages', description: 'Allows deleting messages from other members and pinning.', category: 'Text Channels' },
  { id: 'CONNECT_VOICE', name: 'Connect to Voice', description: 'Allows joining voice and audio rooms.', category: 'Voice Channels' },
  { id: 'SPEAK_VOICE', name: 'Speak in Voice', description: 'Allows speaking in voice channels.', category: 'Voice Channels' },
  { id: 'MUTE_MEMBERS', name: 'Mute Members', description: 'Allows muting members across voice channels.', category: 'Voice Channels' },
  { id: 'PRIORITY_SPEAKER', name: 'Priority Speaker', description: 'Lowers volume of other speakers when this member talks.', category: 'Voice Channels' },
];

export const ServersView: React.FC<ServersViewProps> = ({ onNavigate, onOpenDM, onCall }) => {
  // Servers list
  const [servers, setServers] = useState<Server[]>(() => ServerService.getServers());
  const [selectedServerId, setSelectedServerId] = useState<string>(() => servers[0]?.id || '');
  const [selectedChannelId, setSelectedChannelId] = useState<string>('');

  // Selected server object
  const currentServer = servers.find(s => s.id === selectedServerId) || servers[0];

  // Active channel
  useEffect(() => {
    if (currentServer) {
      const defaultText = currentServer.channels.find(c => c.type !== 'voice') || currentServer.channels[0];
      if (defaultText && (!selectedChannelId || !currentServer.channels.some(c => c.id === selectedChannelId))) {
        setSelectedChannelId(defaultText.id);
      }
    }
  }, [selectedServerId, currentServer]);

  const currentChannel = currentServer?.channels.find(c => c.id === selectedChannelId);

  // Messages in current channel
  const [messages, setMessages] = useState<ServerMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [replyingTo, setReplyingTo] = useState<ServerMessage | null>(null);

  // UI state toggles
  const [showMembersList, setShowMembersList] = useState(true);
  const [showActivityOverlay, setShowActivityOverlay] = useState(true);
  const [showServerMenu, setShowServerMenu] = useState(false);
  const [showCreateServerModal, setShowCreateServerModal] = useState(false);
  const [showCreateChannelModal, setShowCreateChannelModal] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showPinnedDrawer, setShowPinnedDrawer] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [selectedMemberModal, setSelectedMemberModal] = useState<ServerMember | null>(null);

  // Server Settings & Role Management Modal State
  const [showServerSettingsModal, setShowServerSettingsModal] = useState(false);
  const [serverSettingsTab, setServerSettingsTab] = useState<'overview' | 'roles' | 'invites' | 'members' | 'audit'>('overview');
  const [selectedRoleId, setSelectedRoleId] = useState<string>('');
  
  // Role Edit Form State
  const [editingRoleName, setEditingRoleName] = useState('');
  const [editingRoleColor, setEditingRoleColor] = useState('#c084fc');
  const [editingRoleHoist, setEditingRoleHoist] = useState(true);
  const [editingRolePermissions, setEditingRolePermissions] = useState<string[]>([]);

  // Role & Permission Management UI States
  const [roleSearchQuery, setRoleSearchQuery] = useState('');
  const [permissionSearchQuery, setPermissionSearchQuery] = useState('');
  const [permissionCategoryFilter, setPermissionCategoryFilter] = useState<string>('ALL');
  const [roleMemberSearchQuery, setRoleMemberSearchQuery] = useState('');
  const [roleSaveFeedback, setRoleSaveFeedback] = useState<string | null>(null);
  const [showCreateRoleDropdown, setShowCreateRoleDropdown] = useState(false);

  // Members Tab Management UI States
  const [membersTabSearch, setMembersTabSearch] = useState('');
  const [membersTabRoleFilter, setMembersTabRoleFilter] = useState<string>('ALL');
  const [activeMemberRolePopover, setActiveMemberRolePopover] = useState<string | null>(null);

  // Audit Log UI States
  const [auditActionFilter, setAuditActionFilter] = useState<string>('ALL');
  const [auditSearchQuery, setAuditSearchQuery] = useState('');

  // Invite state
  const [copiedInvite, setCopiedInvite] = useState(false);
  const [copiedInviteCode, setCopiedInviteCode] = useState<string | null>(null);
  const [inviteExpiryOption, setInviteExpiryOption] = useState<string>('7 days');
  const [inviteMaxUsesOption, setInviteMaxUsesOption] = useState<number>(0);
  const [recentlyGeneratedInvite, setRecentlyGeneratedInvite] = useState<ServerInvite | null>(null);

  // Join Server Modal State
  const [showJoinServerModal, setShowJoinServerModal] = useState(false);
  const [createOrJoinTab, setCreateOrJoinTab] = useState<'create' | 'join'>('create');
  const [joinInviteInput, setJoinInviteInput] = useState('');
  const [joinInviteFeedback, setJoinInviteFeedback] = useState<{ message: string; isError: boolean } | null>(null);

  // Sync role form when selected role changes
  useEffect(() => {
    if (currentServer?.roles?.length) {
      const activeRole = currentServer.roles.find(r => r.id === selectedRoleId) || currentServer.roles[0];
      if (activeRole) {
        if (selectedRoleId !== activeRole.id) {
          setSelectedRoleId(activeRole.id);
        }
        setEditingRoleName(activeRole.name);
        setEditingRoleColor(activeRole.color);
        setEditingRoleHoist(activeRole.hoist);
        setEditingRolePermissions(activeRole.permissions || []);
      }
    }
  }, [selectedRoleId, currentServer]);

  // Search & Filters
  const [serverSearchQuery, setServerSearchQuery] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [collapsedCategories, setCollapsedCategories] = useState<Record<string, boolean>>({});

  // Voice State
  const [activeVoiceChannel, setActiveVoiceChannel] = useState<string | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isDeafened, setIsDeafened] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [userVoiceVolume, setUserVoiceVolume] = useState(0);
  const [showVoiceTextDrawer, setShowVoiceTextDrawer] = useState(false);

  // Subscribe to real-time voice volume updates
  useEffect(() => {
    const unsubscribe = VoiceActivityService.subscribe((states) => {
      const userState = states[CURRENT_USER.id];
      if (userState) {
        setIsSpeaking(Boolean(userState.isSpeaking && !isMuted));
        setUserVoiceVolume(isMuted ? 0 : userState.volumeLevel || 0);
      }
    });
    return () => unsubscribe();
  }, [isMuted]);

  // Create Server Form State
  const [newServerName, setNewServerName] = useState('');
  const [newServerDesc, setNewServerDesc] = useState('');
  const [newServerIcon, setNewServerIcon] = useState(PRESET_ICONS[0]);
  const [newServerTemplate, setNewServerTemplate] = useState<'gaming' | 'esports' | 'chill' | 'scratch'>('gaming');

  // Create Channel Form State
  const [newChannelName, setNewChannelName] = useState('');
  const [newChannelType, setNewChannelType] = useState<'text' | 'voice' | 'announcement'>('text');
  const [newChannelCategory, setNewChannelCategory] = useState('');
  const [newChannelTopic, setNewChannelTopic] = useState('');

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const serverMenuRef = useRef<HTMLDivElement>(null);

  // Load messages when channel changes
  useEffect(() => {
    if (selectedChannelId) {
      setMessages(ServerService.getMessages(selectedChannelId));
    }
  }, [selectedChannelId]);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Sync external server events
  useEffect(() => {
    const handleServersUpdated = (e: any) => {
      if (e?.detail?.servers) {
        setServers(e.detail.servers);
      } else {
        setServers(ServerService.getServers());
      }
    };

    const handleMessageReceived = (e: any) => {
      if (e?.detail?.channelId === selectedChannelId) {
        setMessages(ServerService.getMessages(selectedChannelId));
      }
    };

    window.addEventListener('nexus_servers_updated', handleServersUpdated);
    window.addEventListener('nexus_channel_message_received', handleMessageReceived);

    return () => {
      window.removeEventListener('nexus_servers_updated', handleServersUpdated);
      window.removeEventListener('nexus_channel_message_received', handleMessageReceived);
    };
  }, [selectedChannelId]);

  // Close server menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (serverMenuRef.current && !serverMenuRef.current.contains(e.target as Node)) {
        setShowServerMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Discord hotkeys: Ctrl+Shift+M (Mute) & Ctrl+Shift+D (Deafen)
  useEffect(() => {
    const handleVoiceHotkeys = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey) {
        if (e.key.toLowerCase() === 'm') {
          e.preventDefault();
          SoundEffectEngine.play('button-click');
          setIsMuted(prev => {
            const next = !prev;
            if (!next && isDeafened) setIsDeafened(false);
            return next;
          });
        } else if (e.key.toLowerCase() === 'd') {
          e.preventDefault();
          SoundEffectEngine.play('button-click');
          setIsDeafened(prev => {
            const next = !prev;
            if (next) setIsMuted(true);
            return next;
          });
        }
      }
    };
    window.addEventListener('keydown', handleVoiceHotkeys);
    return () => window.removeEventListener('keydown', handleVoiceHotkeys);
  }, [isDeafened]);

  // Send message
  const handleSendMessage = () => {
    if (!inputText.trim() || !currentServer || !selectedChannelId) return;

    SoundEffectEngine.play('button-click');
    playCategorizedAudio('https://assets.mixkit.co/sfx/preview/mixkit-software-interface-start-2574.mp3', 'system', 0.4);

    const newMsg = ServerService.sendServerMessage(currentServer.id, selectedChannelId, {
      userId: CURRENT_USER.id,
      content: inputText.trim(),
      replyTo: replyingTo ? {
        id: replyingTo.id,
        username: getMemberUser(replyingTo.userId)?.username || 'User',
        content: replyingTo.content.slice(0, 60),
      } : undefined,
    });

    setMessages(prev => [...prev, newMsg]);
    setInputText('');
    setReplyingTo(null);
  };

  // Helper to find member user details
  const getMemberUser = (userId: string): User | undefined => {
    const member = currentServer?.members.find(m => m.userId === userId);
    return member?.user;
  };

  const getMemberRole = (userId: string): ServerRole | undefined => {
    const member = currentServer?.members.find(m => m.userId === userId);
    if (!member || !member.roleIds.length) return undefined;
    return currentServer?.roles.find(r => r.id === member.roleIds[0]);
  };

  // Create Server Action
  const handleCreateServer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newServerName.trim()) return;

    SoundEffectEngine.play('task-complete');
    const created = ServerService.createServer({
      name: newServerName.trim(),
      description: newServerDesc.trim() || 'Custom Nexus Gaming Hub',
      icon: newServerIcon,
      categoryTemplate: newServerTemplate,
    });

    setServers(ServerService.getServers());
    setSelectedServerId(created.id);
    setShowCreateServerModal(false);
    setNewServerName('');
    setNewServerDesc('');
  };

  // Role Management Handlers
  const handleCreateRole = (template?: RoleTemplate) => {
    if (!currentServer) return;
    SoundEffectEngine.play('button-click');
    setShowCreateRoleDropdown(false);
    const newRole = ServerService.addRole(currentServer.id, {
      name: template ? template.name : 'New Custom Role',
      color: template ? template.color : '#c084fc',
      hoist: template ? template.hoist : true,
      permissions: template ? [...template.permissions] : ['SEND_MESSAGES', 'ATTACH_FILES', 'CONNECT_VOICE', 'SPEAK_VOICE', 'ADD_REACTIONS'],
    });
    setServers(ServerService.getServers());
    setSelectedRoleId(newRole.id);
    setRoleSaveFeedback(`Role "${newRole.name}" created!`);
    setTimeout(() => setRoleSaveFeedback(null), 3000);
  };

  const handleApplyTemplate = (template: RoleTemplate) => {
    SoundEffectEngine.play('button-click');
    setEditingRoleName(template.name);
    setEditingRoleColor(template.color);
    setEditingRoleHoist(template.hoist);
    setEditingRolePermissions([...template.permissions]);
    setRoleSaveFeedback(`Applied "${template.name}" template. Click "Save Role Changes" to persist.`);
    setTimeout(() => setRoleSaveFeedback(null), 3500);
  };

  const handleSaveRole = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!currentServer || !selectedRoleId) return;
    SoundEffectEngine.play('task-complete');
    ServerService.updateRole(currentServer.id, selectedRoleId, {
      name: editingRoleName.trim() || 'Custom Role',
      color: editingRoleColor,
      hoist: editingRoleHoist,
      permissions: editingRolePermissions,
    });
    const updated = ServerService.getServers();
    setServers(updated);
    setRoleSaveFeedback(`Role "${editingRoleName.trim() || 'Custom Role'}" saved successfully!`);
    setTimeout(() => setRoleSaveFeedback(null), 3500);
  };

  const handleDeleteRole = (roleId: string) => {
    if (!currentServer) return;
    const roleToDelete = currentServer.roles.find(r => r.id === roleId);
    if (confirm(`Delete role "${roleToDelete?.name || 'Role'}"? Members will be unassigned from this role.`)) {
      SoundEffectEngine.play('button-click');
      ServerService.deleteRole(currentServer.id, roleId);
      const remaining = ServerService.getServers();
      setServers(remaining);
      const srv = remaining.find(s => s.id === currentServer.id);
      if (srv?.roles?.length) {
        setSelectedRoleId(srv.roles[0].id);
      }
      setRoleSaveFeedback(`Role deleted.`);
      setTimeout(() => setRoleSaveFeedback(null), 3000);
    }
  };

  const handleToggleMemberRole = (userId: string, roleId: string) => {
    if (!currentServer) return;
    SoundEffectEngine.play('button-click');
    const member = currentServer.members.find(m => m.userId === userId);
    if (!member) return;
    if (member.roleIds.includes(roleId)) {
      ServerService.removeMemberRole(currentServer.id, userId, roleId);
    } else {
      ServerService.assignMemberRole(currentServer.id, userId, roleId);
    }
    const updated = ServerService.getServers();
    setServers(updated);
    const updatedCur = updated.find(s => s.id === currentServer.id);
    if (selectedMemberModal && updatedCur) {
      const updatedMem = updatedCur.members.find(m => m.userId === selectedMemberModal.userId);
      if (updatedMem) setSelectedMemberModal(updatedMem);
    }
  };

  const handleAssignAllToRole = (roleId: string) => {
    if (!currentServer) return;
    SoundEffectEngine.play('task-complete');
    currentServer.members.forEach(m => {
      if (!m.roleIds.includes(roleId)) {
        ServerService.assignMemberRole(currentServer.id, m.userId, roleId);
      }
    });
    setServers(ServerService.getServers());
    setRoleSaveFeedback(`Assigned all members to this role!`);
    setTimeout(() => setRoleSaveFeedback(null), 3000);
  };

  const handleRemoveAllFromRole = (roleId: string) => {
    if (!currentServer) return;
    SoundEffectEngine.play('button-click');
    currentServer.members.forEach(m => {
      if (m.roleIds.includes(roleId)) {
        ServerService.removeMemberRole(currentServer.id, m.userId, roleId);
      }
    });
    setServers(ServerService.getServers());
    setRoleSaveFeedback(`Unassigned all members from this role!`);
    setTimeout(() => setRoleSaveFeedback(null), 3000);
  };

  const handleTogglePermission = (permId: string) => {
    setEditingRolePermissions(prev => {
      const exists = prev.includes(permId);
      return exists ? prev.filter(p => p !== permId) : [...prev, permId];
    });
  };

  // Delete Server Action
  const handleDeleteServer = () => {
    if (!currentServer) return;
    if (confirm(`Are you sure you want to delete "${currentServer.name}"?`)) {
      ServerService.deleteServer(currentServer.id);
      const remaining = ServerService.getServers();
      setServers(remaining);
      setSelectedServerId(remaining[0]?.id || '');
      setShowServerMenu(false);
    }
  };

  // Create Channel Action
  const handleCreateChannel = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newChannelName.trim() || !currentServer) return;

    SoundEffectEngine.play('button-click');
    const cleanName = newChannelName.toLowerCase().replace(/\s+/g, '-');
    const category = newChannelCategory || currentServer.categories[0] || 'GENERAL';

    const created = ServerService.addChannel(currentServer.id, {
      name: cleanName,
      type: newChannelType,
      category,
      topic: newChannelTopic.trim() || undefined,
    });

    setServers(ServerService.getServers());
    setSelectedChannelId(created.id);
    setShowCreateChannelModal(false);
    setNewChannelName('');
    setNewChannelTopic('');
  };

  // Delete Channel Action
  const handleDeleteChannel = (channelId: string, channelName: string) => {
    if (!currentServer) return;
    if (confirm(`Delete channel #${channelName}?`)) {
      ServerService.deleteChannel(currentServer.id, channelId);
      setServers(ServerService.getServers());
      const remaining = currentServer.channels.filter(c => c.id !== channelId);
      if (remaining.length > 0) {
        setSelectedChannelId(remaining[0].id);
      }
    }
  };

  // Toggle Voice Connection
  const handleToggleVoiceChannel = (channel: ServerChannel) => {
    if (channel.type !== 'voice') return;

    if (activeVoiceChannel === channel.id) {
      // Disconnect
      SoundEffectEngine.play('button-click');
      playCategorizedAudio('https://assets.mixkit.co/sfx/preview/mixkit-simple-game-countdown-921.mp3', 'calls', 0.4);
      setActiveVoiceChannel(null);
    } else {
      // Connect
      SoundEffectEngine.play('button-click');
      playCategorizedAudio('https://assets.mixkit.co/sfx/preview/mixkit-sci-fi-positive-notification-266.mp3', 'calls', 0.4);
      setActiveVoiceChannel(channel.id);
      setSelectedChannelId(channel.id);
    }
  };

  // Copy Invite Code or Custom URL
  const handleCopyInvite = (customCodeOrUrl?: string) => {
    if (!currentServer) return;
    const rawTarget = customCodeOrUrl || currentServer.inviteCode;
    const finalUrl = rawTarget.startsWith('http') ? rawTarget : `https://${rawTarget}`;
    navigator.clipboard.writeText(finalUrl);
    setCopiedInvite(true);
    setCopiedInviteCode(rawTarget);
    SoundEffectEngine.play('button-click');
    setTimeout(() => {
      setCopiedInvite(false);
      setCopiedInviteCode(null);
    }, 2500);
  };

  // Generate Unique Invite Link (from server settings or invite modal)
  const handleGenerateInvite = (customOptions?: { expiresIn?: string; maxUses?: number }) => {
    if (!currentServer) return;
    SoundEffectEngine.play('streak-burst');
    playCategorizedAudio('https://assets.mixkit.co/sfx/preview/mixkit-sci-fi-positive-notification-266.mp3', 'system', 0.5);

    const generated = ServerService.generateInvite(currentServer.id, {
      expiresIn: customOptions?.expiresIn || inviteExpiryOption,
      maxUses: customOptions?.maxUses ?? inviteMaxUsesOption,
    });

    setRecentlyGeneratedInvite(generated);
    setServers(ServerService.getServers());

    // Auto copy the generated link immediately
    navigator.clipboard.writeText(generated.url);
    setCopiedInvite(true);
    setCopiedInviteCode(generated.code);
    setTimeout(() => {
      setCopiedInvite(false);
      setCopiedInviteCode(null);
    }, 3500);
  };

  // Revoke an active invite
  const handleRevokeInvite = (inviteId: string) => {
    if (!currentServer) return;
    SoundEffectEngine.play('button-click');
    ServerService.revokeInvite(currentServer.id, inviteId);
    setServers(ServerService.getServers());
    if (recentlyGeneratedInvite?.id === inviteId) {
      setRecentlyGeneratedInvite(null);
    }
  };

  // Join server with an invite code or link
  const handleJoinServer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!joinInviteInput.trim()) return;

    const result = ServerService.joinServerByInvite(joinInviteInput, CURRENT_USER);
    if (result.success && result.server) {
      SoundEffectEngine.play('task-complete');
      playCategorizedAudio('https://assets.mixkit.co/sfx/preview/mixkit-game-level-completed-2059.mp3', 'system', 0.5);
      setServers(ServerService.getServers());
      setSelectedServerId(result.server.id);
      setShowJoinServerModal(false);
      setShowCreateServerModal(false);
      setJoinInviteInput('');
      setJoinInviteFeedback({ message: result.message, isError: false });
      setTimeout(() => setJoinInviteFeedback(null), 3500);
    } else {
      SoundEffectEngine.play('button-click');
      setJoinInviteFeedback({ message: result.message, isError: true });
    }
  };

  // Add emoji reaction
  const handleAddReaction = (messageId: string, emoji: string) => {
    if (!selectedChannelId) return;
    SoundEffectEngine.play('button-click');
    ServerService.toggleReaction(selectedChannelId, messageId, emoji, CURRENT_USER.id);
    setMessages(ServerService.getMessages(selectedChannelId));
  };

  // Toggle pin
  const handleTogglePin = (messageId: string) => {
    if (!selectedChannelId) return;
    SoundEffectEngine.play('button-click');
    ServerService.togglePin(selectedChannelId, messageId);
    setMessages(ServerService.getMessages(selectedChannelId));
  };

  // Group channels by category
  const channelsByCategory = (currentServer?.categories || []).reduce<Record<string, ServerChannel[]>>((acc, cat) => {
    acc[cat] = (currentServer?.channels || []).filter(c => c.category === cat);
    return acc;
  }, {});

  // Any unclassified channels
  const uncategorizedChannels = (currentServer?.channels || []).filter(
    c => !currentServer?.categories.includes(c.category)
  );
  if (uncategorizedChannels.length > 0) {
    channelsByCategory['OTHER CHANNELS'] = uncategorizedChannels;
  }

  // Filter messages by search
  const filteredMessages = messages.filter(m => {
    if (!searchQuery) return true;
    return m.content.toLowerCase().includes(searchQuery.toLowerCase());
  });

  // Filter joined servers by name (and description)
  const filteredServers = servers.filter(s => {
    if (!serverSearchQuery.trim()) return true;
    const q = serverSearchQuery.trim().toLowerCase();
    return (
      s.name.toLowerCase().includes(q) ||
      (s.description && s.description.toLowerCase().includes(q))
    );
  });

  return (
    <div className="flex flex-col h-full w-full bg-[#09090b] text-white overflow-hidden select-none font-sans">
      
      {/* ======================================================== */}
      {/* 0. TOP SEARCH & FILTER BAR FOR JOINED SERVERS            */}
      {/* ======================================================== */}
      <div className="bg-[#0c0c11] border-b border-white/10 shrink-0 z-30">
        <div className="h-14 px-3 sm:px-4 flex items-center justify-between gap-3">
          
          {/* Left: Server Count & Category Pill */}
          <div className="flex items-center gap-2.5 shrink-0">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-purple-600/30 to-indigo-600/30 border border-purple-500/40 flex items-center justify-center text-purple-400 shadow-sm">
              <Shield size={16} />
            </div>
            <div className="hidden sm:flex flex-col">
              <div className="flex items-center gap-2">
                <span className="text-xs font-black tracking-wider text-white uppercase">Joined Servers</span>
                <span className="px-1.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-white/5 border border-white/10 text-purple-300">
                  {filteredServers.length} / {servers.length}
                </span>
              </div>
              <span className="text-[10px] text-slate-500 font-medium">Quick switcher & name filter</span>
            </div>
          </div>

          {/* Center: Search Bar Input */}
          <div className="flex-1 max-w-md mx-auto relative group">
            <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-slate-400 group-focus-within:text-purple-400 transition-colors">
              <Search size={15} />
            </div>
            <input
              type="text"
              value={serverSearchQuery}
              onChange={(e) => setServerSearchQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Escape') {
                  setServerSearchQuery('');
                } else if (e.key === 'Enter' && filteredServers.length > 0) {
                  SoundEffectEngine.play('button-click');
                  setSelectedServerId(filteredServers[0].id);
                }
              }}
              placeholder="Search joined servers by name... (e.g. Valorant, Syndicate)"
              className="w-full pl-9 pr-9 py-2 rounded-xl bg-[#14141c] hover:bg-[#181822] focus:bg-[#181822] border border-white/10 focus:border-purple-500/60 focus:ring-1 focus:ring-purple-500/40 text-white placeholder-slate-500 text-xs transition-all outline-none"
            />
            {serverSearchQuery ? (
              <button
                onClick={() => {
                  setServerSearchQuery('');
                  SoundEffectEngine.play('button-click');
                }}
                className="absolute inset-y-0 right-2.5 my-auto w-5 h-5 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white flex items-center justify-center transition-colors"
                title="Clear search (Esc)"
              >
                <X size={12} />
              </button>
            ) : (
              <span className="hidden md:flex absolute inset-y-0 right-3 my-auto items-center text-[10px] font-mono font-bold text-slate-500 pointer-events-none">
                ESC
              </span>
            )}
          </div>

          {/* Right: Quick Server Actions */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            <button
              onClick={() => {
                SoundEffectEngine.play('button-click');
                setCreateOrJoinTab('create');
                setShowCreateServerModal(true);
              }}
              className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-600/20 hover:bg-purple-600 text-purple-300 hover:text-white border border-purple-500/30 text-xs font-bold transition-all active:scale-95 shadow-sm"
            >
              <Plus size={14} />
              <span>Create Server</span>
            </button>

            <button
              onClick={() => {
                SoundEffectEngine.play('button-click');
                setShowJoinServerModal(true);
              }}
              className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/10 text-xs font-bold transition-all active:scale-95"
              title="Join Server with Invite Link"
            >
              <Compass size={14} className="text-cyan-400" />
              <span className="hidden sm:inline">Join Server</span>
            </button>
          </div>
        </div>

        {/* Dynamic Search Results & Quick Switch Chips Sub-Bar */}
        {serverSearchQuery.trim() && (
          <div className="px-3 sm:px-4 py-2 bg-purple-950/20 border-t border-purple-500/20 flex items-center justify-between gap-3 text-xs overflow-x-auto no-scrollbar">
            <div className="flex items-center gap-2 shrink-0">
              <span className="text-[11px] font-bold text-slate-400">
                Found ({filteredServers.length}):
              </span>
              <div className="flex items-center gap-1.5">
                {filteredServers.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => {
                      SoundEffectEngine.play('button-click');
                      setSelectedServerId(s.id);
                    }}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
                      s.id === selectedServerId
                        ? 'bg-purple-600 text-white shadow-sm'
                        : 'bg-white/5 hover:bg-white/10 text-slate-300 border border-white/5'
                    }`}
                  >
                    {s.icon ? (
                      <img src={s.icon} alt={s.name} className="w-3.5 h-3.5 rounded-full object-cover" />
                    ) : (
                      <span className="w-3.5 h-3.5 rounded bg-purple-500/30 flex items-center justify-center text-[9px] font-bold">
                        {s.name[0]}
                      </span>
                    )}
                    <span className="truncate max-w-[120px]">{s.name}</span>
                  </button>
                ))}
                {filteredServers.length === 0 && (
                  <span className="text-rose-400 font-semibold text-xs flex items-center gap-1">
                    No joined servers matching "{serverSearchQuery}".
                  </span>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {filteredServers.length > 0 && (
                <span className="text-[10px] text-slate-400 hidden sm:inline">
                  Press <kbd className="px-1 py-0.5 rounded bg-white/10 font-mono text-[9px] text-slate-300">Enter</kbd> to jump to first
                </span>
              )}
              <button
                onClick={() => {
                  setServerSearchQuery('');
                  SoundEffectEngine.play('button-click');
                }}
                className="text-[11px] text-purple-400 hover:text-purple-300 font-bold hover:underline"
              >
                Clear Filter
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Main Workspace (Dock + Channels + Chat + Members) */}
      <div className="flex flex-1 min-h-0 w-full overflow-hidden">
        
        {/* ======================================================== */}
        {/* 1. DISCORD-STYLE SERVER RAIL / DOCK (LEFT-MOST COLUMN) */}
        {/* ======================================================== */}
        <div className="w-[72px] bg-[#0c0c0f] border-r border-white/5 flex flex-col items-center py-3 gap-2.5 shrink-0 z-20">
          
          {/* Direct Messages / Nexus Home Pill */}
          <div className="relative group flex items-center justify-center">
            <div className="absolute -left-3 w-1 bg-white rounded-r-full transition-all duration-300 h-0 group-hover:h-5" />
            <button
              onClick={() => onNavigate && onNavigate('home')}
              title="Nexus Gaming Dashboard"
              className="w-12 h-12 rounded-[24px] hover:rounded-[16px] bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center shadow-lg transition-all duration-300 hover:scale-105 active:scale-95 group-hover:shadow-purple-500/25"
            >
              <span className="font-black text-white text-lg tracking-wider">N</span>
            </button>
          </div>

          {/* Separator */}
          <div className="w-8 h-[2px] bg-white/10 rounded-full my-1" />

          {/* Server List */}
          <div className="flex-1 w-full flex flex-col items-center gap-2.5 overflow-y-auto no-scrollbar">
            {filteredServers.map((server) => {
              const isActive = server.id === selectedServerId;
              return (
                <div key={server.id} className="relative group flex items-center justify-center w-full">
                  {/* Active Indicator Pill */}
                  <div 
                    className={`absolute left-0 w-1 bg-white rounded-r-full transition-all duration-300 ${
                      isActive ? 'h-10' : 'h-0 group-hover:h-5'
                    }`} 
                  />

                  <button
                    onClick={() => {
                      SoundEffectEngine.play('button-click');
                      setSelectedServerId(server.id);
                    }}
                    title={server.name}
                    className={`relative w-12 h-12 transition-all duration-300 flex items-center justify-center overflow-hidden border shadow-md active:scale-95 ${
                      isActive 
                        ? 'rounded-[16px] border-purple-500 shadow-purple-500/30' 
                        : 'rounded-[24px] hover:rounded-[16px] border-white/10 hover:border-white/30 bg-[#16161b]'
                    }`}
                  >
                    {server.icon ? (
                      <img src={server.icon} alt={server.name} className="w-full h-full object-cover" />
                    ) : (
                      <span className="font-bold text-sm text-slate-200">
                        {server.name.slice(0, 2).toUpperCase()}
                      </span>
                    )}

                    {/* Owner Crown Marker */}
                    {server.ownerId === CURRENT_USER.id && (
                      <div className="absolute top-0 right-0 bg-yellow-500 text-black p-0.5 rounded-bl-md shadow">
                        <Crown size={9} />
                      </div>
                    )}
                  </button>
                </div>
              );
            })}

            {filteredServers.length === 0 && (
              <div className="flex flex-col items-center justify-center py-4 px-1 text-center text-slate-500 gap-1.5">
                <Search size={18} className="text-purple-400/60" />
                <span className="text-[9px] font-bold text-slate-400 leading-tight">No Match</span>
                <button
                  onClick={() => {
                    setServerSearchQuery('');
                    SoundEffectEngine.play('button-click');
                  }}
                  className="text-[9px] text-purple-400 hover:underline font-bold"
                >
                  Reset
                </button>
              </div>
            )}

          {/* Add / Create Server Button */}
          <div className="relative group flex items-center justify-center w-full">
            <button
              onClick={() => {
                SoundEffectEngine.play('button-click');
                setCreateOrJoinTab('create');
                setShowCreateServerModal(true);
              }}
              title="Create a New Server"
              className="w-12 h-12 rounded-[24px] hover:rounded-[16px] bg-[#1a1a24] hover:bg-emerald-600 text-emerald-400 hover:text-white flex items-center justify-center transition-all duration-300 shadow-md group-hover:shadow-emerald-500/30 active:scale-95 border border-emerald-500/30 hover:border-emerald-500"
            >
              <Plus size={22} />
            </button>
          </div>

          {/* Join Server via Invite Button */}
          <div className="relative group flex items-center justify-center w-full">
            <button
              onClick={() => {
                SoundEffectEngine.play('button-click');
                setShowJoinServerModal(true);
              }}
              title="Join Server with Invite Link or Code"
              className="w-12 h-12 rounded-[24px] hover:rounded-[16px] bg-[#1a1a24] hover:bg-purple-600 text-purple-400 hover:text-white flex items-center justify-center transition-all duration-300 shadow-md group-hover:shadow-purple-500/30 active:scale-95 border border-purple-500/30 hover:border-purple-500"
            >
              <Compass size={20} />
            </button>
          </div>

          {/* Invite Friends / Share Server */}
          <div className="relative group flex items-center justify-center w-full">
            <button
              onClick={() => {
                SoundEffectEngine.play('button-click');
                setShowInviteModal(true);
              }}
              title="Invite Friends to Server"
              className="w-12 h-12 rounded-[24px] hover:rounded-[16px] bg-[#1a1a24] hover:bg-cyan-600 text-cyan-400 hover:text-white flex items-center justify-center transition-all duration-300 shadow-md active:scale-95 border border-cyan-500/30"
            >
              <UserPlus size={20} />
            </button>
          </div>
        </div>

      </div>

      {/* ======================================================== */}
      {/* 2. CHANNELS SIDEBAR (MIDDLE COLUMN) */}
      {/* ======================================================== */}
      <div className="w-60 md:w-64 bg-[#121217] border-r border-white/5 flex flex-col shrink-0 z-10 select-none">
        
        {/* Server Header Dropdown */}
        <div className="relative" ref={serverMenuRef}>
          <button
            onClick={() => {
              SoundEffectEngine.play('button-click');
              setShowServerMenu(!showServerMenu);
            }}
            className="w-full h-14 px-4 border-b border-white/5 flex items-center justify-between hover:bg-white/5 transition-colors font-bold text-sm tracking-wide text-white group"
          >
            <div className="flex items-center gap-2 min-w-0">
              <span className="truncate">{currentServer?.name || 'Nexus Server'}</span>
              {currentServer?.isCustom && (
                <span className="text-[10px] font-black px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/40 shrink-0">
                  MINE
                </span>
              )}
            </div>
            <ChevronDown 
              size={18} 
              className={`text-slate-400 transition-transform duration-200 shrink-0 ${showServerMenu ? 'rotate-180 text-white' : ''}`} 
            />
          </button>

          {/* Discord-style Dropdown Menu */}
          {showServerMenu && (
            <div className="absolute top-16 left-3 right-3 bg-[#181822] border border-white/10 rounded-2xl shadow-2xl p-1.5 space-y-1 z-50 animate-notificationPop">
              <button
                onClick={() => {
                  SoundEffectEngine.play('button-click');
                  setShowServerSettingsModal(true);
                  setShowServerMenu(false);
                }}
                className="w-full px-3 py-2 text-xs font-bold rounded-xl text-purple-300 hover:bg-purple-600 hover:text-white flex items-center justify-between transition-colors"
              >
                <span>Server Settings & Roles</span>
                <Shield size={14} />
              </button>

              <button
                onClick={() => {
                  setShowCreateChannelModal(true);
                  setShowServerMenu(false);
                }}
                className="w-full px-3 py-2 text-xs font-bold rounded-xl text-slate-200 hover:bg-purple-600 hover:text-white flex items-center justify-between transition-colors"
              >
                <span>Create Channel</span>
                <Plus size={14} />
              </button>

              <button
                onClick={() => {
                  setShowInviteModal(true);
                  setShowServerMenu(false);
                }}
                className="w-full px-3 py-2 text-xs font-bold rounded-xl text-purple-300 hover:bg-purple-600 hover:text-white flex items-center justify-between transition-colors"
              >
                <span>Invite People</span>
                <UserPlus size={14} />
              </button>

              {currentServer?.ownerId === CURRENT_USER.id && (
                <>
                  <div className="h-[1px] bg-white/5 my-1" />
                  <button
                    onClick={handleDeleteServer}
                    className="w-full px-3 py-2 text-xs font-bold rounded-xl text-rose-400 hover:bg-rose-600 hover:text-white flex items-center justify-between transition-colors"
                  >
                    <span>Delete Server</span>
                    <Trash2 size={14} />
                  </button>
                </>
              )}
            </div>
          )}
        </div>

        {/* Channels Categorized List */}
        <div className="flex-1 overflow-y-auto px-2 py-3 space-y-4 custom-scrollbar">
          {(Object.entries(channelsByCategory) as [string, ServerChannel[]][]).map(([category, catChannels]) => {
            const isCollapsed = collapsedCategories[category];

            return (
              <div key={category} className="space-y-0.5">
                {/* Category Header */}
                <div className="flex items-center justify-between px-2 py-1 text-[11px] font-black tracking-wider text-slate-500 hover:text-slate-300 group">
                  <button
                    onClick={() => {
                      setCollapsedCategories(prev => ({ ...prev, [category]: !prev[category] }));
                    }}
                    className="flex items-center gap-1 uppercase truncate"
                  >
                    <ChevronRight size={12} className={`transition-transform duration-200 ${isCollapsed ? '' : 'rotate-90'}`} />
                    <span className="truncate">{category}</span>
                  </button>
                  
                  <button
                    onClick={() => {
                      setNewChannelCategory(category);
                      setShowCreateChannelModal(true);
                    }}
                    title={`Create channel in ${category}`}
                    className="opacity-0 group-hover:opacity-100 p-0.5 hover:text-white transition-opacity"
                  >
                    <Plus size={14} />
                  </button>
                </div>

                {/* Channels inside this category */}
                {!isCollapsed && (
                  <div className="space-y-0.5">
                    {catChannels.map((channel) => {
                      const isSelected = channel.id === selectedChannelId;
                      const isVoiceActive = activeVoiceChannel === channel.id;

                      return (
                        <div key={channel.id} className="relative group/ch">
                          <button
                            onClick={() => {
                              SoundEffectEngine.play('button-click');
                              if (channel.type === 'voice') {
                                handleToggleVoiceChannel(channel);
                              } else {
                                setSelectedChannelId(channel.id);
                              }
                            }}
                            className={`w-full px-2.5 py-1.5 rounded-xl flex items-center justify-between text-xs font-bold transition-all ${
                              isSelected
                                ? 'bg-purple-600/20 text-purple-200 border border-purple-500/30'
                                : 'text-slate-400 hover:bg-white/5 hover:text-slate-200'
                            }`}
                          >
                            <div className="flex items-center gap-2 truncate">
                              {channel.type === 'voice' ? (
                                <Volume2 size={15} className={isVoiceActive ? 'text-emerald-400 animate-pulse' : 'text-slate-400'} />
                              ) : channel.type === 'announcement' ? (
                                <Radio size={15} className="text-amber-400" />
                              ) : (
                                <Hash size={15} className="text-slate-400" />
                              )}
                              <span className="truncate">{channel.name}</span>
                            </div>

                            {/* Voice status pill or unread */}
                            {channel.type === 'voice' && isVoiceActive && (
                              <span className="text-[10px] font-black px-1.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                                CONNECTED
                              </span>
                            )}
                          </button>

                          {/* Connected voice participants list under active voice channel */}
                          {channel.type === 'voice' && isVoiceActive && (
                            <div className="pl-6 pr-2 py-1 space-y-1 animate-fadeIn">
                              <div className="flex items-center justify-between py-1 px-2 rounded-lg bg-black/40 border border-white/5">
                                <div className="flex items-center gap-2 min-w-0">
                                  <VoiceAvatarWithGlowingRing
                                    avatar={CURRENT_USER.avatar}
                                    username={CURRENT_USER.username}
                                    isSpeaking={isSpeaking}
                                    volumeLevel={userVoiceVolume}
                                    size="xs"
                                    shape="circle"
                                    isMuted={isMuted}
                                    isDeafened={isDeafened}
                                  />
                                  <span className="text-xs font-bold text-white truncate">{CURRENT_USER.username}</span>
                                </div>
                                <div className="flex items-center gap-1 shrink-0">
                                  {isMuted && (
                                    <span title="Microphone Muted" className="text-rose-400 inline-flex items-center">
                                      <MicOff size={13} className="text-rose-400" />
                                    </span>
                                  )}
                                  {isDeafened && (
                                    <span title="Audio Deafened" className="text-rose-400 inline-flex items-center">
                                      <Headphones size={13} className="text-rose-400" />
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          )}

                          {/* Quick Delete channel on hover (for custom servers) */}
                          {currentServer.ownerId === CURRENT_USER.id && currentServer.channels.length > 1 && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteChannel(channel.id, channel.name);
                              }}
                              className="absolute right-2 top-2 opacity-0 group-hover/ch:opacity-100 text-slate-500 hover:text-rose-400 p-0.5 transition-opacity"
                              title="Delete Channel"
                            >
                              <X size={12} />
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Voice Connected Status Widget (Appears when active in a voice room) with Mute & Deafen User Controls */}
        {activeVoiceChannel && (
          <div className="p-3 bg-[#0d161a] border-t border-emerald-500/30 flex items-center justify-between">
            <div className="flex items-center gap-2.5 min-w-0">
              <VoiceAvatarWithGlowingRing
                avatar={CURRENT_USER.avatar}
                username={CURRENT_USER.username}
                isSpeaking={isSpeaking}
                volumeLevel={userVoiceVolume}
                size="sm"
                shape="rounded"
                isMuted={isMuted}
                isDeafened={isDeafened}
              />
              <div className="min-w-0">
                <p className="text-xs font-black text-emerald-400 flex items-center gap-1">
                  <span>Voice Connected</span>
                  <span className="text-[9px] font-mono text-slate-400">22ms</span>
                </p>
                <p className="text-[10px] text-slate-400 truncate max-w-[90px]">
                  {currentServer.channels.find(c => c.id === activeVoiceChannel)?.name}
                </p>
              </div>
            </div>

            {/* Voice Chat Footer Controls (Mute, Deafen, Disconnect) */}
            <div className="flex items-center gap-1 shrink-0">
              <button
                onClick={() => {
                  SoundEffectEngine.play('button-click');
                  const nextMuted = !isMuted;
                  setIsMuted(nextMuted);
                  if (!nextMuted && isDeafened) setIsDeafened(false);
                }}
                title={isMuted ? 'Unmute Microphone' : 'Mute Microphone'}
                className={`p-1.5 rounded-xl border transition-all ${
                  isMuted
                    ? 'bg-rose-500/20 text-rose-400 border-rose-500/40'
                    : 'bg-white/5 hover:bg-white/10 text-slate-300 border-white/5'
                }`}
              >
                {isMuted ? <MicOff size={14} className="text-rose-400" /> : <Mic size={14} />}
              </button>

              <button
                onClick={() => {
                  SoundEffectEngine.play('button-click');
                  const nextDeafened = !isDeafened;
                  setIsDeafened(nextDeafened);
                  if (nextDeafened) setIsMuted(true);
                }}
                title={isDeafened ? 'Undeafen Audio' : 'Deafen Audio'}
                className={`p-1.5 rounded-xl border transition-all ${
                  isDeafened
                    ? 'bg-rose-500/20 text-rose-400 border-rose-500/40'
                    : 'bg-white/5 hover:bg-white/10 text-slate-300 border-white/5'
                }`}
              >
                <Headphones size={14} className={isDeafened ? 'text-rose-400' : ''} />
              </button>

              <button
                onClick={() => {
                  SoundEffectEngine.play('button-click');
                  playCategorizedAudio('https://assets.mixkit.co/sfx/preview/mixkit-simple-game-countdown-921.mp3', 'calls', 0.4);
                  setActiveVoiceChannel(null);
                }}
                title="Disconnect Voice"
                className="p-1.5 rounded-xl bg-rose-600/20 hover:bg-rose-600 text-rose-400 hover:text-white border border-rose-500/30 transition-colors"
              >
                <PhoneOff size={14} />
              </button>
            </div>
          </div>
        )}

        {/* Discord-style Bottom User Bar */}
        <div className="h-14 px-3 bg-[#0a0a0e] border-t border-white/5 flex items-center justify-between">
          <div 
            onClick={() => onNavigate && onNavigate('settings')}
            className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity min-w-0"
          >
            <VoiceAvatarWithGlowingRing
              avatar={CURRENT_USER.avatar}
              username={CURRENT_USER.username}
              isSpeaking={Boolean(activeVoiceChannel && isSpeaking)}
              volumeLevel={userVoiceVolume}
              size="sm"
              shape="rounded"
              isMuted={isMuted}
              isDeafened={isDeafened}
              statusBadge="online"
            />
            <div className="truncate">
              <div className="flex items-center gap-1.5 truncate">
                <p className="text-xs font-black text-white truncate leading-tight">{CURRENT_USER.username}</p>
                {/* Visual indicator when muted */}
                {isMuted && (
                  <span title="Microphone Muted" className="text-rose-400 shrink-0 inline-flex items-center">
                    <MicOff size={12} className="text-rose-400" />
                  </span>
                )}
                {isDeafened && (
                  <span title="Audio Deafened" className="text-rose-400 shrink-0 inline-flex items-center">
                    <Headphones size={12} className="text-rose-400" />
                  </span>
                )}
              </div>
              <p className="text-[10px] text-slate-500 font-mono">#0001</p>
            </div>
          </div>

          <div className="flex items-center gap-1 text-slate-400">
            <button
              onClick={() => {
                SoundEffectEngine.play('button-click');
                const nextMuted = !isMuted;
                setIsMuted(nextMuted);
                if (!nextMuted && isDeafened) setIsDeafened(false);
              }}
              className={`p-1.5 rounded-lg hover:bg-white/10 transition-colors ${
                isMuted ? 'text-rose-400 bg-rose-500/20 border border-rose-500/40' : ''
              }`}
              title={isMuted ? 'Unmute (Ctrl+Shift+M)' : 'Mute (Ctrl+Shift+M)'}
            >
              {isMuted ? <MicOff size={15} className="text-rose-400" /> : <Mic size={15} />}
            </button>

            <button
              onClick={() => {
                SoundEffectEngine.play('button-click');
                const nextDeafened = !isDeafened;
                setIsDeafened(nextDeafened);
                if (nextDeafened) setIsMuted(true);
              }}
              className={`p-1.5 rounded-lg hover:bg-white/10 transition-colors ${
                isDeafened ? 'text-rose-400 bg-rose-500/20 border border-rose-500/40' : ''
              }`}
              title={isDeafened ? 'Undeafen (Ctrl+Shift+D)' : 'Deafen (Ctrl+Shift+D)'}
            >
              <Headphones size={15} className={isDeafened ? 'text-rose-400' : ''} />
            </button>

            <button
              onClick={() => onNavigate && onNavigate('settings')}
              className="p-1.5 rounded-lg hover:bg-white/10 transition-colors"
              title="User Settings"
            >
              <Settings size={15} />
            </button>
          </div>
        </div>

      </div>

      {/* ======================================================== */}
      {/* 3. MAIN CHAT / STAGE AREA */}
      {/* ======================================================== */}
      <div className="flex-1 flex flex-col bg-[#09090b] min-w-0 overflow-hidden relative">
        
        {/* Channel Header Bar */}
        <div className="h-14 px-4 border-b border-white/5 flex items-center justify-between shrink-0 bg-[#09090b]/80 backdrop-blur-md z-10">
          <div className="flex items-center gap-2.5 min-w-0">
            {currentChannel?.type === 'voice' ? (
              <Volume2 size={20} className="text-emerald-400 shrink-0" />
            ) : currentChannel?.type === 'announcement' ? (
              <Radio size={20} className="text-amber-400 shrink-0" />
            ) : (
              <Hash size={20} className="text-slate-400 shrink-0" />
            )}
            
            <h2 className="font-black text-sm md:text-base text-white truncate">
              {currentChannel?.name || 'select-channel'}
            </h2>

            {currentChannel?.topic && (
              <>
                <div className="h-4 w-[1px] bg-white/10 hidden md:block shrink-0" />
                <p className="text-xs text-slate-400 truncate max-w-md hidden md:block">
                  {currentChannel.topic}
                </p>
              </>
            )}
          </div>

          <div className="flex items-center gap-2 text-slate-400 shrink-0">
            {/* Search Input */}
            <div className="relative hidden sm:block">
              <Search size={14} className="absolute left-2.5 top-2.5 text-slate-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search channel..."
                className="w-36 md:w-48 pl-8 pr-3 py-1.5 rounded-xl bg-white/5 border border-white/5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500/50 transition-all"
              />
            </div>

            {/* Real-time In-Channel Activity Overlay Toggle */}
            <button
              onClick={() => {
                SoundEffectEngine.play('button-click');
                setShowActivityOverlay(!showActivityOverlay);
              }}
              className={`p-2 rounded-xl hover:bg-white/5 transition-colors ${showActivityOverlay ? 'text-emerald-400 bg-emerald-500/10' : ''}`}
              title="Toggle Live In-Channel Voice & Activity Radar"
            >
              <Activity size={17} />
            </button>

            {/* Pinned Messages Toggle */}
            <button
              onClick={() => setShowPinnedDrawer(!showPinnedDrawer)}
              className={`p-2 rounded-xl hover:bg-white/5 transition-colors ${showPinnedDrawer ? 'text-amber-400 bg-amber-500/10' : ''}`}
              title="Pinned Messages"
            >
              <Pin size={17} />
            </button>

            {/* Member List Toggle */}
            <button
              onClick={() => setShowMembersList(!showMembersList)}
              className={`p-2 rounded-xl hover:bg-white/5 transition-colors ${showMembersList ? 'text-purple-400 bg-purple-500/10' : ''}`}
              title="Toggle Member List"
            >
              <Users size={17} />
            </button>
          </div>
        </div>

        {/* Real-Time In-Channel User Activity & Voice Radar Overlay */}
        {showActivityOverlay && currentChannel && (
          <div className="px-4 pt-3 shrink-0">
            <InChannelActivityOverlay
              channel={currentChannel}
              members={currentServer.members}
              currentUser={CURRENT_USER}
              isVoiceConnected={activeVoiceChannel === currentChannel.id}
              onToggleMute={() => setIsMuted(!isMuted)}
              isMuted={isMuted}
            />
          </div>
        )}

        {/* Main Content: If voice channel, render VoiceChannelStage with reactive glowing avatar rings */}
        {currentChannel?.type === 'voice' ? (
          <div className="flex-1 flex overflow-hidden relative">
            <VoiceChannelStage
              channel={currentChannel}
              members={currentServer.members}
              currentUser={CURRENT_USER}
              isVoiceConnected={activeVoiceChannel === currentChannel.id}
              onConnectVoice={() => handleToggleVoiceChannel(currentChannel)}
              onDisconnectVoice={() => {
                SoundEffectEngine.play('button-click');
                playCategorizedAudio('https://assets.mixkit.co/sfx/preview/mixkit-simple-game-countdown-921.mp3', 'calls', 0.4);
                setActiveVoiceChannel(null);
              }}
              isMuted={isMuted}
              onToggleMute={() => {
                const nextMuted = !isMuted;
                setIsMuted(nextMuted);
                if (!nextMuted && isDeafened) setIsDeafened(false);
              }}
              isDeafened={isDeafened}
              onToggleDeafen={() => {
                const nextDeafened = !isDeafened;
                setIsDeafened(nextDeafened);
                if (nextDeafened) setIsMuted(true);
              }}
              onOpenTextChat={() => setShowVoiceTextDrawer(!showVoiceTextDrawer)}
            />

            {/* In-Room Text Chat Drawer for Voice Room */}
            {showVoiceTextDrawer && (
              <div className="w-80 border-l border-white/5 bg-[#0e0e16] flex flex-col shrink-0 animate-fadeIn z-20">
                <div className="p-3 border-b border-white/5 flex items-center justify-between">
                  <h3 className="text-xs font-black text-white flex items-center gap-1.5">
                    <MessageSquare size={14} className="text-purple-400" />
                    <span>In-Room Voice Chat</span>
                  </h3>
                  <button 
                    onClick={() => setShowVoiceTextDrawer(false)}
                    className="p-1 text-slate-400 hover:text-white"
                  >
                    <X size={14} />
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto p-3 space-y-3 custom-scrollbar text-xs">
                  {messages.map((m) => (
                    <div key={m.id} className="space-y-0.5">
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-white">{getMemberUser(m.userId)?.username || CURRENT_USER.username}</span>
                        <span className="text-[10px] text-slate-500">{m.timestamp}</span>
                      </div>
                      <p className="text-slate-300">{m.content}</p>
                    </div>
                  ))}
                </div>

                <div className="p-2 border-t border-white/5">
                  <input
                    type="text"
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleSendMessage();
                      }
                    }}
                    placeholder={`Message in #${currentChannel.name}...`}
                    className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>
            )}
          </div>
        ) : (
          <>
            {/* Message Feed Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
          
          {/* Welcome Banner at Top of Channel */}
          <div className="p-6 rounded-3xl bg-gradient-to-br from-purple-900/15 to-transparent border border-white/5 space-y-2 mb-6">
            <div className="w-12 h-12 rounded-2xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-purple-400">
              <Hash size={24} />
            </div>
            <h3 className="text-xl font-black text-white">Welcome to #{currentChannel?.name}!</h3>
            <p className="text-sm text-slate-400">
              This is the beginning of the #{currentChannel?.name} channel in {currentServer?.name}.
            </p>
          </div>

          {/* Messages */}
          {filteredMessages.length === 0 ? (
            <div className="text-center py-12 text-slate-500 text-sm">
              No messages found. Start the conversation below!
            </div>
          ) : (
            filteredMessages.map((msg) => {
              const sender = getMemberUser(msg.userId) || CURRENT_USER;
              const role = getMemberRole(msg.userId);

              return (
                <div 
                  key={msg.id}
                  className="group relative flex items-start gap-3.5 p-2 rounded-2xl hover:bg-white/[0.03] transition-colors"
                >
                  {/* Avatar */}
                  <img 
                    src={sender.avatar} 
                    alt={sender.username} 
                    className="w-10 h-10 rounded-2xl object-cover shrink-0 cursor-pointer border border-white/10"
                    onClick={() => {
                      const member = currentServer.members.find(m => m.userId === msg.userId);
                      if (member) setSelectedMemberModal(member);
                    }}
                  />

                  {/* Content Container */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span 
                        className="font-extrabold text-xs cursor-pointer hover:underline"
                        style={{ color: role?.color || '#ffffff' }}
                        onClick={() => {
                          const member = currentServer.members.find(m => m.userId === msg.userId);
                          if (member) setSelectedMemberModal(member);
                        }}
                      >
                        {sender.username}
                      </span>

                      {/* Role Pill */}
                      {role && (
                        <span 
                          className="text-[9px] font-black px-1.5 py-0.2 rounded border"
                          style={{ borderColor: `${role.color}40`, backgroundColor: `${role.color}15`, color: role.color }}
                        >
                          {role.name}
                        </span>
                      )}

                      <span className="text-[10px] text-slate-500 font-medium">
                        {msg.timestamp}
                      </span>

                      {msg.isPinned && (
                        <span className="text-[10px] text-amber-400 flex items-center gap-0.5 font-bold">
                          <Pin size={10} /> Pinned
                        </span>
                      )}
                    </div>

                    {/* Quoted Reply Preview */}
                    {msg.replyTo && (
                      <div className="mb-1 text-xs text-slate-400 bg-white/5 border-l-2 border-purple-500 px-2 py-1 rounded-r-lg truncate">
                        <span className="font-bold text-slate-300">@{msg.replyTo.username}: </span>
                        <span>{msg.replyTo.content}</span>
                      </div>
                    )}

                    {/* Text Body */}
                    <div className="text-sm text-slate-200 leading-relaxed break-words whitespace-pre-wrap font-medium">
                      {msg.content}
                    </div>

                    {/* Attachments */}
                    {msg.attachments && msg.attachments.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-2">
                        {msg.attachments.map((img, i) => (
                          <img 
                            key={i} 
                            src={img} 
                            alt="Attachment" 
                            className="max-h-60 rounded-2xl border border-white/10 object-cover shadow-lg" 
                          />
                        ))}
                      </div>
                    )}

                    {/* Reactions Pill Row */}
                    {msg.reactions && msg.reactions.length > 0 && (
                      <div className="flex flex-wrap items-center gap-1.5 mt-2">
                        {msg.reactions.map((r, i) => {
                          const userReacted = r.users.includes(CURRENT_USER.id);
                          return (
                            <button
                              key={i}
                              onClick={() => handleAddReaction(msg.id, r.emoji)}
                              className={`px-2 py-0.5 rounded-lg border text-xs font-bold flex items-center gap-1 transition-all active:scale-95 ${
                                userReacted 
                                  ? 'bg-purple-600/20 border-purple-500/50 text-purple-300' 
                                  : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10'
                              }`}
                            >
                              <span>{r.emoji}</span>
                              <span className="text-[11px]">{r.count}</span>
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* Hover Floating Actions Menu */}
                  <div className="absolute right-3 top-2 opacity-0 group-hover:opacity-100 transition-opacity bg-[#181822] border border-white/10 rounded-xl p-1 flex items-center gap-1 shadow-lg z-10">
                    <button
                      onClick={() => handleAddReaction(msg.id, '🔥')}
                      title="React with 🔥"
                      className="p-1 hover:bg-white/10 rounded-lg text-slate-400 hover:text-white transition-colors"
                    >
                      🔥
                    </button>
                    <button
                      onClick={() => handleAddReaction(msg.id, '👑')}
                      title="React with 👑"
                      className="p-1 hover:bg-white/10 rounded-lg text-slate-400 hover:text-white transition-colors"
                    >
                      👑
                    </button>
                    <button
                      onClick={() => setReplyingTo(msg)}
                      title="Reply"
                      className="p-1.5 hover:bg-white/10 rounded-lg text-slate-400 hover:text-white transition-colors"
                    >
                      <Reply size={14} />
                    </button>
                    <button
                      onClick={() => handleTogglePin(msg.id)}
                      title={msg.isPinned ? 'Unpin Message' : 'Pin Message'}
                      className="p-1.5 hover:bg-white/10 rounded-lg text-slate-400 hover:text-amber-400 transition-colors"
                    >
                      <Pin size={14} />
                    </button>
                  </div>

                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Replying Banner */}
        {replyingTo && (
          <div className="px-4 py-2 bg-[#181822] border-t border-purple-500/30 flex items-center justify-between text-xs text-slate-300">
            <div className="flex items-center gap-2 truncate">
              <Reply size={14} className="text-purple-400 shrink-0" />
              <span>Replying to <span className="font-bold text-white">@{getMemberUser(replyingTo.userId)?.username}</span></span>
              <span className="text-slate-500 truncate max-w-md">"{replyingTo.content}"</span>
            </div>
            <button onClick={() => setReplyingTo(null)} className="p-1 hover:text-white">
              <X size={14} />
            </button>
          </div>
        )}

        {/* Discord-style Message Input Box */}
        <div className="p-4 pt-1">
          <div className="relative bg-[#16161e] border border-white/10 rounded-2xl p-2.5 flex items-center gap-2 shadow-xl focus-within:border-purple-500/50 transition-all">
            
            {/* Attachment Button */}
            <button
              onClick={() => {
                SoundEffectEngine.play('button-click');
                const sampleAttachment = 'https://images.unsplash.com/photo-1542751110-97427bbecf20?q=80&w=800&auto=format&fit=crop';
                ServerService.sendServerMessage(currentServer.id, selectedChannelId, {
                  userId: CURRENT_USER.id,
                  content: 'Shared a battle screenshot!',
                  attachments: [sampleAttachment]
                });
                setMessages(ServerService.getMessages(selectedChannelId));
              }}
              title="Add Image Attachment"
              className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
            >
              <Plus size={18} />
            </button>

            {/* Text Input */}
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
              placeholder={`Message #${currentChannel?.name || 'channel'}`}
              className="flex-1 bg-transparent text-sm text-white placeholder-slate-500 focus:outline-none"
            />

            {/* Quick Emoji Trigger Button */}
            <div className="relative">
              <button
                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                title="Gaming Emojis"
                className="p-2 rounded-xl hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
              >
                <Smile size={18} />
              </button>

              {/* Emoji Picker Popover */}
              {showEmojiPicker && (
                <div className="absolute bottom-12 right-0 bg-[#181822] border border-white/10 rounded-2xl p-2.5 shadow-2xl flex gap-1 z-50 animate-notificationPop">
                  {EMOJI_PALETTE.map((emoji) => (
                    <button
                      key={emoji}
                      onClick={() => {
                        setInputText(prev => prev + emoji);
                        setShowEmojiPicker(false);
                      }}
                      className="p-1.5 hover:bg-white/10 rounded-lg text-lg"
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Send Button */}
            <button
              onClick={handleSendMessage}
              disabled={!inputText.trim()}
              title="Send Message (Enter)"
              className="p-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white disabled:opacity-40 disabled:hover:bg-purple-600 transition-all shadow-md active:scale-95"
            >
              <Send size={16} />
            </button>

          </div>
        </div>
      </>
    )}

  </div>

      {/* ======================================================== */}
      {/* 4. SERVER MEMBERS LIST DRAWER (RIGHT-MOST COLUMN) */}
      {/* ======================================================== */}
      {showMembersList && (
        <div className="w-56 md:w-60 bg-[#101015] border-l border-white/5 flex flex-col shrink-0 custom-scrollbar overflow-y-auto p-3 space-y-4 select-none">
          
          {/* Members grouped by Roles */}
          {currentServer?.roles.map((role) => {
            const roleMembers = (currentServer.members || []).filter(m => m.roleIds.includes(role.id));
            if (roleMembers.length === 0) return null;

            return (
              <div key={role.id} className="space-y-1">
                <div className="text-[10px] font-black uppercase tracking-wider text-slate-500 px-2 flex items-center justify-between">
                  <span>{role.name}</span>
                  <span>— {roleMembers.length}</span>
                </div>

                <div className="space-y-0.5">
                  {roleMembers.map((member) => (
                    <div
                      key={member.userId}
                      onClick={() => setSelectedMemberModal(member)}
                      className="flex items-center gap-2.5 px-2.5 py-1.5 rounded-xl hover:bg-white/5 cursor-pointer transition-colors group"
                    >
                      <div className="relative w-8 h-8 rounded-xl overflow-hidden shrink-0 border border-white/10">
                        <img src={member.user.avatar} alt={member.user.username} className="w-full h-full object-cover" />
                        <div className={`absolute bottom-0 right-0 w-2 h-2 rounded-full border border-[#101015] ${
                          member.user.status === 'online' ? 'bg-emerald-500' :
                          member.user.status === 'idle' ? 'bg-amber-500' :
                          member.user.status === 'dnd' ? 'bg-rose-500' : 'bg-slate-500'
                        }`} />
                      </div>

                      <div className="truncate flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 min-w-0">
                          <p 
                            className="text-xs font-bold truncate group-hover:underline"
                            style={{ color: role.color }}
                          >
                            {member.user.username}
                          </p>
                          {/* Visual indicator (a slash-through microphone icon) next to user's name when mute toggle is active */}
                          {member.userId === CURRENT_USER.id && isMuted && (
                            <span 
                              title="Microphone Muted" 
                              className="text-rose-400 shrink-0 inline-flex items-center animate-fadeIn"
                            >
                              <MicOff size={12} className="text-rose-400" />
                            </span>
                          )}
                          {member.userId === CURRENT_USER.id && isDeafened && (
                            <span 
                              title="Audio Deafened" 
                              className="text-rose-400 shrink-0 inline-flex items-center"
                            >
                              <Headphones size={12} className="text-rose-400" />
                            </span>
                          )}
                        </div>
                        <p className="text-[10px] text-slate-500 capitalize">{member.user.status}</p>
                      </div>

                      {member.isOwner && (
                        <Crown size={12} className="text-yellow-400 shrink-0" />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}

        </div>
      )}

      </div> {/* End Main Workspace */}

      {/* ======================================================== */}
      {/* 5. MODAL: CREATE SERVER WIZARD */}
      {/* ======================================================== */}
      {showCreateServerModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#181822] border border-white/10 rounded-3xl w-full max-w-md p-6 shadow-2xl relative animate-notificationPop space-y-5">
            <button 
              onClick={() => setShowCreateServerModal(false)}
              className="absolute right-4 top-4 text-slate-400 hover:text-white p-1 rounded-full"
            >
              <X size={18} />
            </button>

            <div className="text-center space-y-1">
              <h2 className="text-2xl font-black text-white">Create Your Server</h2>
              <p className="text-xs text-slate-400">
                Your server is where you and your gaming squad hang out. Make it yours!
              </p>
            </div>

            <form onSubmit={handleCreateServer} className="space-y-4">
              
              {/* Server Name */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wide">
                  SERVER NAME
                </label>
                <input
                  type="text"
                  required
                  value={newServerName}
                  onChange={(e) => setNewServerName(e.target.value)}
                  placeholder="e.g. Radiant Valkyries, Chill Pixel Lounge"
                  className="w-full px-4 py-3 rounded-2xl bg-[#101015] border border-white/10 text-white text-sm focus:outline-none focus:border-purple-500 transition-colors"
                />
              </div>

              {/* Description */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wide">
                  SERVER TOPIC & GUIDELINES
                </label>
                <textarea
                  rows={2}
                  value={newServerDesc}
                  onChange={(e) => setNewServerDesc(e.target.value)}
                  placeholder="What is your community about?"
                  className="w-full px-4 py-2.5 rounded-2xl bg-[#101015] border border-white/10 text-white text-sm focus:outline-none focus:border-purple-500 transition-colors resize-none"
                />
              </div>

              {/* Template Choice */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wide">
                  START FROM TEMPLATE
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: 'gaming', label: '🎮 Gaming Squad' },
                    { id: 'esports', label: '🏆 Esports Clan' },
                    { id: 'chill', label: '☕ Chill Lounge' },
                    { id: 'scratch', label: '✨ From Scratch' },
                  ].map((tpl) => (
                    <button
                      key={tpl.id}
                      type="button"
                      onClick={() => setNewServerTemplate(tpl.id as any)}
                      className={`p-2.5 rounded-xl border text-xs font-bold text-left transition-all ${
                        newServerTemplate === tpl.id
                          ? 'bg-purple-600/25 border-purple-500 text-white shadow-md'
                          : 'bg-[#101015] border-white/5 text-slate-400 hover:text-white'
                      }`}
                    >
                      {tpl.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Icon Preset Picker */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wide">
                  SERVER BADGE ICON
                </label>
                <div className="flex gap-2 justify-center py-1">
                  {PRESET_ICONS.map((icon, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setNewServerIcon(icon)}
                      className={`w-11 h-11 rounded-2xl overflow-hidden border-2 transition-all ${
                        newServerIcon === icon ? 'border-purple-500 scale-110 shadow-lg shadow-purple-500/30' : 'border-transparent opacity-60 hover:opacity-100'
                      }`}
                    >
                      <img src={icon} alt="Preset" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex justify-between items-center pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateServerModal(false);
                    setShowJoinServerModal(true);
                  }}
                  className="text-xs font-bold text-purple-400 hover:text-purple-300 hover:underline"
                >
                  Have an invite already? Join a Server
                </button>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setShowCreateServerModal(false)}
                    className="px-4 py-2.5 rounded-xl text-slate-400 hover:text-white text-xs font-bold transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-lg shadow-purple-600/30 transition-all active:scale-95"
                  >
                    Create Server
                  </button>
                </div>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 5B. MODAL: JOIN SERVER VIA INVITE CODE / LINK            */}
      {/* ======================================================== */}
      {showJoinServerModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#181822] border border-white/10 rounded-3xl w-full max-w-md p-6 shadow-2xl relative animate-notificationPop space-y-5">
            <button 
              onClick={() => {
                setShowJoinServerModal(false);
                setJoinInviteFeedback(null);
              }}
              className="absolute right-4 top-4 text-slate-400 hover:text-white p-1 rounded-full"
            >
              <X size={18} />
            </button>

            <div className="text-center space-y-1">
              <div className="w-12 h-12 rounded-2xl bg-purple-600/20 border border-purple-500/30 mx-auto flex items-center justify-center text-purple-400 mb-2">
                <Compass size={24} />
              </div>
              <h2 className="text-2xl font-black text-white">Join a Server</h2>
              <p className="text-xs text-slate-400">
                Enter an invite link or code below to join an existing gaming community on Nexus.
              </p>
            </div>

            <form onSubmit={handleJoinServer} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wide">
                  INVITE LINK OR CODE
                </label>
                <input
                  type="text"
                  required
                  value={joinInviteInput}
                  onChange={(e) => setJoinInviteInput(e.target.value)}
                  placeholder="https://nexus.gg/join/val-syndicate-101 or code"
                  className="w-full px-4 py-3 rounded-2xl bg-[#101015] border border-white/10 text-white text-sm focus:outline-none focus:border-purple-500 transition-colors font-mono text-xs"
                />
              </div>

              {/* Sample invites quick helper */}
              <div className="space-y-1.5 bg-black/30 p-3 rounded-2xl border border-white/5">
                <p className="text-[10px] font-black uppercase text-slate-400 tracking-wider">
                  SAMPLE INVITE CODES (CLICK TO TEST)
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    { label: 'Nexus Central', code: 'nexus.gg/join/hq-central' },
                    { label: 'Valorant Syndicate', code: 'nexus.gg/join/val-syndicate' },
                    { label: 'Pixel Lo-Fi', code: 'nexus.gg/join/pixel-lofi' },
                  ].map((s) => (
                    <button
                      key={s.code}
                      type="button"
                      onClick={() => setJoinInviteInput(s.code)}
                      className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-purple-600/20 text-slate-300 hover:text-purple-300 text-[11px] font-mono border border-white/5 transition-colors"
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>

              {joinInviteFeedback && (
                <div className={`p-3 rounded-xl text-xs font-bold ${
                  joinInviteFeedback.isError
                    ? 'bg-rose-500/15 border border-rose-500/30 text-rose-300'
                    : 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-300'
                }`}>
                  {joinInviteFeedback.message}
                </div>
              )}

              <div className="flex justify-between items-center pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowJoinServerModal(false);
                    setShowCreateServerModal(true);
                  }}
                  className="text-xs font-bold text-slate-400 hover:text-white"
                >
                  Create a server instead
                </button>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setShowJoinServerModal(false);
                      setJoinInviteFeedback(null);
                    }}
                    className="px-4 py-2.5 rounded-xl text-slate-400 hover:text-white text-xs font-bold transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-lg shadow-purple-600/30 transition-all active:scale-95"
                  >
                    Join Server
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 6. MODAL: CREATE CHANNEL MODAL */}
      {/* ======================================================== */}
      {showCreateChannelModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#181822] border border-white/10 rounded-3xl w-full max-w-sm p-6 shadow-2xl relative animate-notificationPop space-y-4">
            <button 
              onClick={() => setShowCreateChannelModal(false)}
              className="absolute right-4 top-4 text-slate-400 hover:text-white p-1 rounded-full"
            >
              <X size={18} />
            </button>

            <div>
              <h2 className="text-xl font-black text-white">Create Channel</h2>
              <p className="text-xs text-slate-400">in {currentServer?.name}</p>
            </div>

            <form onSubmit={handleCreateChannel} className="space-y-4">
              
              {/* Channel Type */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wide">
                  CHANNEL TYPE
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setNewChannelType('text')}
                    className={`p-3 rounded-2xl border text-xs font-bold flex items-center gap-2 transition-all ${
                      newChannelType === 'text' 
                        ? 'bg-purple-600/25 border-purple-500 text-white' 
                        : 'bg-[#101015] border-white/5 text-slate-400'
                    }`}
                  >
                    <Hash size={16} /> Text
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewChannelType('voice')}
                    className={`p-3 rounded-2xl border text-xs font-bold flex items-center gap-2 transition-all ${
                      newChannelType === 'voice' 
                        ? 'bg-emerald-600/25 border-emerald-500 text-white' 
                        : 'bg-[#101015] border-white/5 text-slate-400'
                    }`}
                  >
                    <Volume2 size={16} /> Voice
                  </button>
                </div>
              </div>

              {/* Channel Name */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wide">
                  CHANNEL NAME
                </label>
                <input
                  type="text"
                  required
                  value={newChannelName}
                  onChange={(e) => setNewChannelName(e.target.value)}
                  placeholder="new-channel"
                  className="w-full px-4 py-2.5 rounded-2xl bg-[#101015] border border-white/10 text-white text-sm focus:outline-none focus:border-purple-500 transition-colors"
                />
              </div>

              {/* Channel Topic */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wide">
                  CHANNEL TOPIC (OPTIONAL)
                </label>
                <input
                  type="text"
                  value={newChannelTopic}
                  onChange={(e) => setNewChannelTopic(e.target.value)}
                  placeholder="What is this channel about?"
                  className="w-full px-4 py-2.5 rounded-2xl bg-[#101015] border border-white/10 text-white text-sm focus:outline-none focus:border-purple-500 transition-colors"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateChannelModal(false)}
                  className="px-4 py-2 rounded-xl text-slate-400 hover:text-white text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-md transition-all active:scale-95"
                >
                  Create
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 7. MODAL: INVITE FRIENDS / SHARE LINK */}
      {/* ======================================================== */}
      {showInviteModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#181822] border border-white/10 rounded-3xl w-full max-w-md p-6 shadow-2xl relative animate-notificationPop space-y-4">
            <button 
              onClick={() => setShowInviteModal(false)}
              className="absolute right-4 top-4 text-slate-400 hover:text-white p-1 rounded-full"
            >
              <X size={18} />
            </button>

            <div>
              <h2 className="text-xl font-black text-white">Invite Friends</h2>
              <p className="text-xs text-slate-400">to {currentServer?.name}</p>
            </div>

            {/* Instant Invite Link Box */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-300 uppercase">SHAREABLE INVITE LINK</label>
                <button
                  type="button"
                  onClick={() => handleGenerateInvite()}
                  className="text-xs font-bold text-purple-400 hover:text-purple-300 flex items-center gap-1 hover:underline"
                >
                  <Sparkles size={12} className="text-amber-300" />
                  <span>Generate New Link</span>
                </button>
              </div>

              <div className="flex items-center gap-2 bg-[#101015] border border-white/10 rounded-2xl p-1.5 pl-3">
                <span className="font-mono text-xs text-purple-300 flex-1 truncate">
                  {recentlyGeneratedInvite ? recentlyGeneratedInvite.url : (currentServer?.inviteCode.startsWith('http') ? currentServer.inviteCode : `https://${currentServer?.inviteCode}`)}
                </span>
                <button
                  onClick={() => handleCopyInvite(recentlyGeneratedInvite?.url || currentServer?.inviteCode)}
                  className={`px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all active:scale-95 ${
                    copiedInvite ? 'bg-emerald-600 text-white' : 'bg-purple-600 hover:bg-purple-500 text-white'
                  }`}
                >
                  {copiedInvite ? (
                    <>
                      <Check size={14} /> Copied!
                    </>
                  ) : (
                    <>
                      <Copy size={14} /> Copy
                    </>
                  )}
                </button>
              </div>

              <div className="flex items-center justify-between text-[11px] text-slate-400 pt-0.5">
                <span>{recentlyGeneratedInvite ? `Unique link active (${recentlyGeneratedInvite.expiresIn})` : 'Default community link'}</span>
                <button
                  type="button"
                  onClick={() => {
                    setShowInviteModal(false);
                    setServerSettingsTab('invites');
                    setShowServerSettingsModal(true);
                  }}
                  className="text-purple-400 hover:text-purple-300 font-bold hover:underline flex items-center gap-1"
                >
                  <span>Invite Settings</span>
                  <ChevronRight size={12} />
                </button>
              </div>
            </div>

            {/* Online Friends to Invite */}
            <div className="space-y-2 pt-2">
              <p className="text-xs font-bold text-slate-400 uppercase">DIRECT INVITE ONLINE FRIENDS</p>
              <div className="space-y-1 max-h-48 overflow-y-auto custom-scrollbar">
                {[
                  { username: 'Nelly', role: 'Valorant Duelist', avatar: 'https://picsum.photos/100/100?random=10' },
                  { username: 'Mallow', role: 'Apex Champion', avatar: 'https://picsum.photos/100/100?random=11' },
                  { username: 'Graggle', role: 'Minecraft Builder', avatar: 'https://picsum.photos/100/100?random=12' },
                ].map((f, i) => (
                  <div key={i} className="flex items-center justify-between p-2 rounded-xl bg-white/5 border border-white/5">
                    <div className="flex items-center gap-2.5">
                      <img src={f.avatar} alt={f.username} className="w-8 h-8 rounded-xl object-cover" />
                      <div>
                        <p className="text-xs font-bold text-white">{f.username}</p>
                        <p className="text-[10px] text-slate-400">{f.role}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        SoundEffectEngine.play('button-click');
                        alert(`Invite dispatched to ${f.username}!`);
                      }}
                      className="px-3 py-1 rounded-xl bg-purple-600/20 hover:bg-purple-600 text-purple-300 hover:text-white border border-purple-500/40 text-xs font-bold transition-all"
                    >
                      Invite
                    </button>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 8. MODAL: MEMBER PROFILE CARD POPUP */}
      {/* ======================================================== */}
      {selectedMemberModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#181822] border border-white/10 rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl relative animate-notificationPop">
            {/* Banner */}
            <div className="h-24 bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 relative">
              <button 
                onClick={() => setSelectedMemberModal(null)}
                className="absolute right-3 top-3 text-white/80 hover:text-white p-1 rounded-full bg-black/30"
              >
                <X size={16} />
              </button>
            </div>

            <div className="px-5 pb-6 pt-0 space-y-4 relative">
              {/* Avatar overlapping banner */}
              <div className="relative -mt-10 mb-2">
                <div className="w-20 h-20 rounded-2xl overflow-hidden border-4 border-[#181822] shadow-xl">
                  <img src={selectedMemberModal.user.avatar} alt="User" className="w-full h-full object-cover" />
                </div>
              </div>

              <div>
                <h3 className="text-lg font-black text-white flex items-center gap-1.5">
                  <span>{selectedMemberModal.user.username}</span>
                  {selectedMemberModal.userId === CURRENT_USER.id && isMuted && (
                    <span title="Microphone Muted" className="text-rose-400 shrink-0 inline-flex items-center">
                      <MicOff size={16} className="text-rose-400" />
                    </span>
                  )}
                  {selectedMemberModal.isOwner && <Crown size={16} className="text-yellow-400" />}
                </h3>
                <p className="text-xs text-slate-400 font-mono">ID: {selectedMemberModal.userId}</p>
              </div>

              {/* Roles */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <p className="text-[10px] font-black uppercase text-slate-500 tracking-wider">ROLES IN SERVER</p>
                  <span className="text-[10px] text-purple-400 font-bold">Click role to assign / revoke</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {currentServer.roles.map((r) => {
                    const hasRole = selectedMemberModal.roleIds.includes(r.id);
                    return (
                      <button
                        key={r.id}
                        type="button"
                        onClick={() => handleToggleMemberRole(selectedMemberModal.userId, r.id)}
                        className={`px-2.5 py-1 rounded-lg border text-xs font-bold transition-all flex items-center gap-1.5 active:scale-95 ${
                          hasRole
                            ? 'shadow-sm'
                            : 'opacity-45 hover:opacity-90 border-dashed border-white/20 text-slate-400 bg-white/5 hover:bg-white/10'
                        }`}
                        style={hasRole ? {
                          borderColor: `${r.color}60`,
                          backgroundColor: `${r.color}25`,
                          color: r.color,
                        } : {}}
                      >
                        {hasRole ? <Check size={11} /> : <Plus size={11} />}
                        <span>{r.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Direct Actions */}
              <div className="grid grid-cols-2 gap-2 pt-2">
                <button
                  onClick={() => {
                    setSelectedMemberModal(null);
                    if (onOpenDM) onOpenDM(selectedMemberModal.user);
                  }}
                  className="py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-md active:scale-95"
                >
                  <MessageSquare size={14} /> Send DM
                </button>
                <button
                  onClick={() => {
                    setSelectedMemberModal(null);
                    if (onCall) onCall(selectedMemberModal.user);
                  }}
                  className="py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all active:scale-95"
                >
                  <PhoneCall size={14} /> Start Call
                </button>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 9. MODAL: SERVER SETTINGS & ROLE MANAGEMENT INTERFACE    */}
      {/* ======================================================== */}
      {showServerSettingsModal && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 md:p-6">
          <div className="bg-[#14141c] border border-white/10 rounded-3xl w-full max-w-4xl h-[92vh] max-h-[740px] shadow-2xl flex flex-col md:flex-row overflow-hidden relative animate-notificationPop">
            
            {/* Modal Close Button */}
            <button 
              onClick={() => setShowServerSettingsModal(false)}
              className="absolute right-4 top-4 z-20 text-slate-400 hover:text-white p-2 rounded-xl bg-white/5 hover:bg-white/10 transition-colors"
              title="Close Server Settings"
            >
              <X size={18} />
            </button>

            {/* Left Settings Navigation Sidebar */}
            <div className="w-full md:w-64 bg-[#0e0e14] border-b md:border-b-0 md:border-r border-white/5 p-4 flex flex-col shrink-0">
              <div className="mb-4">
                <p className="text-[10px] font-black uppercase tracking-wider text-slate-500">SERVER SETTINGS</p>
                <h3 className="text-base font-black text-white truncate">{currentServer?.name}</h3>
              </div>

              <div className="flex md:flex-col gap-1.5 overflow-x-auto md:overflow-visible">
                <button
                  onClick={() => {
                    SoundEffectEngine.play('button-click');
                    setServerSettingsTab('overview');
                  }}
                  className={`px-3 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2.5 transition-all text-left ${
                    serverSettingsTab === 'overview'
                      ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30'
                      : 'text-slate-400 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  <Sliders size={16} />
                  <span>Overview</span>
                </button>

                <button
                  onClick={() => {
                    SoundEffectEngine.play('button-click');
                    setServerSettingsTab('roles');
                  }}
                  className={`px-3 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2.5 transition-all text-left ${
                    serverSettingsTab === 'roles'
                      ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30'
                      : 'text-slate-400 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  <Shield size={16} />
                  <span>Roles & Permissions</span>
                </button>

                <button
                  onClick={() => {
                    SoundEffectEngine.play('button-click');
                    setServerSettingsTab('invites');
                  }}
                  className={`px-3 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2.5 transition-all text-left ${
                    serverSettingsTab === 'invites'
                      ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30'
                      : 'text-slate-400 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  <LinkIcon size={16} />
                  <span>Invites & Links</span>
                </button>

                <button
                  onClick={() => {
                    SoundEffectEngine.play('button-click');
                    setServerSettingsTab('members');
                  }}
                  className={`px-3 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2.5 transition-all text-left ${
                    serverSettingsTab === 'members'
                      ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30'
                      : 'text-slate-400 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  <Users size={16} />
                  <span>Members & Access</span>
                </button>

                <button
                  onClick={() => {
                    SoundEffectEngine.play('button-click');
                    setServerSettingsTab('audit');
                  }}
                  className={`px-3 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2.5 transition-all text-left ${
                    serverSettingsTab === 'audit'
                      ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30'
                      : 'text-slate-400 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  <FileText size={16} />
                  <span>Audit Log</span>
                </button>
              </div>

              {/* Server Stats footer */}
              <div className="mt-auto hidden md:block pt-4 border-t border-white/5 space-y-1 text-[11px] text-slate-500">
                <p>Owner ID: <span className="text-slate-400 font-mono truncate">{currentServer?.ownerId}</span></p>
                <p>Channels: <span className="text-slate-400 font-bold">{currentServer?.channels.length}</span></p>
                <p>Members: <span className="text-slate-400 font-bold">{currentServer?.members.length}</span></p>
                <p>Invite: <span className="text-purple-400 font-mono text-[10px] truncate block">{currentServer?.inviteCode}</span></p>
              </div>
            </div>

            {/* Right Settings Content Area */}
            <div className="flex-1 flex flex-col min-w-0 overflow-y-auto custom-scrollbar p-4 md:p-6 bg-[#14141c]">
              
              {/* TAB 1: ROLES & PERMISSIONS MANAGEMENT */}
              {serverSettingsTab === 'roles' && (
                <div className="space-y-6">
                  
                  {/* Section Title & Creation Header */}
                  <div className="border-b border-white/5 pb-4 flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <h2 className="text-xl font-black text-white flex items-center gap-2">
                        <Shield className="text-purple-400" size={22} />
                        <span>Roles & Permissions Management</span>
                      </h2>
                      <p className="text-xs text-slate-400">
                        Define custom ranks, role hierarchy, and granular channel permissions for server members.
                      </p>
                    </div>

                    <div className="flex items-center gap-2 relative">
                      {roleSaveFeedback && (
                        <div className="px-3 py-1.5 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold flex items-center gap-1.5 animate-fadeIn">
                          <Check size={14} />
                          <span>{roleSaveFeedback}</span>
                        </div>
                      )}

                      <div className="relative">
                        <button
                          type="button"
                          onClick={() => setShowCreateRoleDropdown(!showCreateRoleDropdown)}
                          className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs flex items-center gap-1.5 transition-all shadow-md active:scale-95"
                        >
                          <Plus size={15} />
                          <span>Create Role</span>
                          <ChevronDown size={13} className={`transition-transform ${showCreateRoleDropdown ? 'rotate-180' : ''}`} />
                        </button>

                        {/* Template Dropdown */}
                        {showCreateRoleDropdown && (
                          <div className="absolute right-0 top-full mt-2 w-72 bg-[#181824] border border-white/10 rounded-2xl p-2 shadow-2xl z-30 space-y-1 animate-notificationPop">
                            <p className="text-[10px] font-black uppercase text-slate-400 px-2 py-1 tracking-wider">
                              CREATE FROM TEMPLATE OR SCRATCH
                            </p>
                            
                            <button
                              type="button"
                              onClick={() => handleCreateRole()}
                              className="w-full px-3 py-2 rounded-xl text-left hover:bg-white/5 text-xs font-bold text-white flex items-center gap-2.5 transition-colors"
                            >
                              <span className="w-5 h-5 rounded-lg bg-purple-600/30 border border-purple-500/40 flex items-center justify-center text-[10px] text-purple-300">
                                ✨
                              </span>
                              <div>
                                <p className="font-bold">Blank Custom Role</p>
                                <p className="text-[10px] text-slate-400 font-normal">Start with standard permissions</p>
                              </div>
                            </button>

                            <div className="border-t border-white/5 my-1" />

                            {ROLE_TEMPLATES.map((tmpl) => (
                              <button
                                key={tmpl.name}
                                type="button"
                                onClick={() => handleCreateRole(tmpl)}
                                className="w-full px-3 py-2 rounded-xl text-left hover:bg-white/5 text-xs font-bold text-white flex items-center gap-2.5 transition-colors"
                              >
                                <span 
                                  className="w-5 h-5 rounded-lg flex items-center justify-center text-[11px] shrink-0 border"
                                  style={{ borderColor: `${tmpl.color}50`, backgroundColor: `${tmpl.color}20` }}
                                >
                                  {tmpl.icon}
                                </span>
                                <div className="min-w-0">
                                  <p className="font-bold truncate" style={{ color: tmpl.color }}>{tmpl.name}</p>
                                  <p className="text-[10px] text-slate-400 font-normal truncate">{tmpl.description}</p>
                                </div>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Two-Column Role Editor Grid */}
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                    
                    {/* Role Selector List (lg:col-span-4) */}
                    <div className="lg:col-span-4 space-y-2">
                      <div className="flex items-center justify-between">
                        <p className="text-xs font-black uppercase text-slate-400 tracking-wider">
                          ROLES ({currentServer?.roles.length || 0})
                        </p>
                        <span className="text-[10px] text-slate-500 font-bold">Top = Highest Rank</span>
                      </div>

                      {/* Role search input */}
                      <div className="relative">
                        <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                        <input
                          type="text"
                          value={roleSearchQuery}
                          onChange={(e) => setRoleSearchQuery(e.target.value)}
                          placeholder="Search roles..."
                          className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-black/40 border border-white/5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 transition-colors"
                        />
                        {roleSearchQuery && (
                          <button onClick={() => setRoleSearchQuery('')} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white">
                            <X size={12} />
                          </button>
                        )}
                      </div>
                      
                      {/* Roles List */}
                      <div className="space-y-1 max-h-[500px] overflow-y-auto custom-scrollbar pr-1">
                        {currentServer?.roles
                          .filter(r => !roleSearchQuery || r.name.toLowerCase().includes(roleSearchQuery.toLowerCase()))
                          .map((role) => {
                            const isSelected = role.id === selectedRoleId;
                            const memberCount = currentServer.members.filter(m => m.roleIds.includes(role.id)).length;

                            return (
                              <div
                                key={role.id}
                                onClick={() => {
                                  SoundEffectEngine.play('button-click');
                                  setSelectedRoleId(role.id);
                                }}
                                className={`p-2.5 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                                  isSelected
                                    ? 'bg-purple-600/20 border-purple-500 text-white shadow-md'
                                    : 'bg-black/30 border-white/5 hover:bg-white/5 text-slate-300'
                                }`}
                              >
                                <div className="flex items-center gap-2.5 truncate">
                                  <span 
                                    className="w-3.5 h-3.5 rounded-full shrink-0 shadow-sm border border-white/20"
                                    style={{ backgroundColor: role.color }}
                                  />
                                  <div className="truncate">
                                    <span className="font-bold text-xs truncate block">{role.name}</span>
                                    {role.hoist && (
                                      <span className="text-[9px] text-purple-400 font-mono">Hoisted</span>
                                    )}
                                  </div>
                                </div>

                                <span className="text-[10px] font-mono text-slate-400 font-bold shrink-0 bg-white/5 px-2 py-0.5 rounded-md border border-white/5">
                                  {memberCount} {memberCount === 1 ? 'user' : 'users'}
                                </span>
                              </div>
                            );
                          })}
                      </div>

                      {/* Quick Add Button */}
                      <button
                        type="button"
                        onClick={() => handleCreateRole()}
                        className="w-full py-2 rounded-xl border border-dashed border-white/10 hover:border-purple-500/50 text-slate-400 hover:text-purple-300 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
                      >
                        <Plus size={14} />
                        <span>Add New Role</span>
                      </button>
                    </div>

                    {/* Role Details & Permissions Editor (lg:col-span-8) */}
                    <div className="lg:col-span-8 bg-[#101017] border border-white/5 rounded-2xl p-4 md:p-5 space-y-5">
                      
                      {/* Live Preview Banner */}
                      <div className="p-3.5 rounded-2xl bg-black/40 border border-white/5 flex flex-wrap items-center justify-between gap-3">
                        <div>
                          <p className="text-[10px] font-black uppercase text-slate-400 tracking-wider">LIVE ROLE BADGE PREVIEW</p>
                          <div className="flex items-center gap-2 mt-1.5">
                            <span 
                              className="px-2.5 py-1 rounded-lg border text-xs font-black shadow-sm"
                              style={{ 
                                borderColor: `${editingRoleColor}60`, 
                                backgroundColor: `${editingRoleColor}20`, 
                                color: editingRoleColor 
                              }}
                            >
                              {editingRoleName || 'Unnamed Role'}
                            </span>
                            <span className="text-[11px] text-slate-400">
                              {editingRoleHoist ? '• Hoisted in member list' : '• Standard member display'}
                            </span>
                          </div>
                        </div>

                        {/* Quick Archetype Preset Buttons */}
                        <div className="flex flex-wrap items-center gap-1.5">
                          <span className="text-[10px] font-bold text-slate-500 mr-1">Load Archetype:</span>
                          {ROLE_TEMPLATES.map((tpl) => (
                            <button
                              key={tpl.name}
                              type="button"
                              onClick={() => handleApplyTemplate(tpl)}
                              title={`Apply ${tpl.name} preset permissions and styling`}
                              className="px-2 py-1 rounded-lg bg-white/5 hover:bg-white/10 border border-white/5 text-[11px] font-bold text-slate-300 hover:text-white transition-colors"
                            >
                              <span>{tpl.icon} {tpl.name.split(' ')[0]}</span>
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Role Basic Settings */}
                      <div className="space-y-4">
                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-slate-300 uppercase tracking-wide">
                            ROLE NAME
                          </label>
                          <input
                            type="text"
                            value={editingRoleName}
                            onChange={(e) => setEditingRoleName(e.target.value)}
                            placeholder="e.g. Moderator, Radiant Clan, Member"
                            className="w-full px-4 py-2.5 rounded-xl bg-black/40 border border-white/10 text-white text-sm font-bold focus:outline-none focus:border-purple-500 transition-colors"
                          />
                        </div>

                        {/* Color Picker Swatches */}
                        <div className="space-y-2">
                          <label className="text-xs font-bold text-slate-300 uppercase tracking-wide flex items-center gap-2">
                            <Palette size={14} className="text-purple-400" />
                            <span>ROLE COLOR</span>
                          </label>
                          <div className="flex flex-wrap items-center gap-2">
                            {ROLE_COLOR_PRESETS.map((p) => (
                              <button
                                key={p.hex}
                                type="button"
                                onClick={() => setEditingRoleColor(p.hex)}
                                title={p.label}
                                className={`w-8 h-8 rounded-xl border-2 transition-all ${
                                  editingRoleColor === p.hex
                                    ? 'scale-110 border-white shadow-lg shadow-purple-500/40'
                                    : 'border-transparent opacity-75 hover:opacity-100'
                                }`}
                                style={{ backgroundColor: p.hex }}
                              />
                            ))}

                            {/* Custom Hex input */}
                            <div className="flex items-center gap-1.5 bg-black/40 border border-white/10 rounded-xl px-2.5 py-1">
                              <span className="text-xs text-slate-500 font-mono">#</span>
                              <input
                                type="text"
                                value={editingRoleColor.replace('#', '')}
                                onChange={(e) => setEditingRoleColor(`#${e.target.value}`)}
                                placeholder="HEX"
                                className="w-16 bg-transparent text-xs text-white font-mono uppercase focus:outline-none"
                              />
                            </div>
                          </div>
                        </div>

                        {/* Hoist Toggle */}
                        <div className="p-3.5 rounded-xl bg-black/30 border border-white/5 flex items-center justify-between">
                          <div>
                            <p className="text-xs font-bold text-white">Display Role Members Separately (Hoist)</p>
                            <p className="text-[11px] text-slate-400">Shows members in this role grouped under their own header in the online member sidebar.</p>
                          </div>
                          <button
                            type="button"
                            onClick={() => setEditingRoleHoist(!editingRoleHoist)}
                            className={`w-12 h-6 rounded-full transition-colors relative p-0.5 shrink-0 ${
                              editingRoleHoist ? 'bg-purple-600' : 'bg-slate-700'
                            }`}
                          >
                            <div className={`w-5 h-5 rounded-full bg-white transition-transform ${
                              editingRoleHoist ? 'translate-x-6' : 'translate-x-0'
                            }`} />
                          </button>
                        </div>
                      </div>

                      {/* Granular Permissions Checklist */}
                      <div className="space-y-3 pt-2 border-t border-white/5">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <p className="text-xs font-black uppercase text-slate-300 tracking-wider flex items-center gap-1.5">
                            <CheckSquare size={14} className="text-purple-400" />
                            <span>ROLE PERMISSIONS ({editingRolePermissions.length} / {AVAILABLE_PERMISSIONS.length} Active)</span>
                          </p>

                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => {
                                setEditingRolePermissions(['SEND_MESSAGES', 'ATTACH_FILES', 'ADD_REACTIONS', 'CONNECT_VOICE', 'SPEAK_VOICE', 'CREATE_INVITES']);
                              }}
                              className="text-[11px] font-bold text-slate-400 hover:text-white"
                            >
                              Standard Set
                            </button>
                            <span className="text-slate-600">•</span>
                            <button
                              type="button"
                              onClick={() => {
                                setEditingRolePermissions(['KICK_MEMBERS', 'BAN_MEMBERS', 'MANAGE_MESSAGES', 'MANAGE_CHANNELS', 'CREATE_INVITES', 'SEND_MESSAGES', 'ATTACH_FILES', 'ADD_REACTIONS', 'CONNECT_VOICE', 'SPEAK_VOICE', 'MUTE_MEMBERS']);
                              }}
                              className="text-[11px] font-bold text-cyan-400 hover:text-cyan-300"
                            >
                              Moderator Set
                            </button>
                            <span className="text-slate-600">•</span>
                            <button
                              type="button"
                              onClick={() => {
                                if (editingRolePermissions.length === AVAILABLE_PERMISSIONS.length) {
                                  setEditingRolePermissions([]);
                                } else {
                                  setEditingRolePermissions(AVAILABLE_PERMISSIONS.map(p => p.id));
                                }
                              }}
                              className="text-[11px] font-bold text-purple-400 hover:text-purple-300"
                            >
                              {editingRolePermissions.length === AVAILABLE_PERMISSIONS.length ? 'Clear All' : 'Select All'}
                            </button>
                          </div>
                        </div>

                        {/* Permission Filter & Category Tabs */}
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div className="flex flex-wrap gap-1">
                            {['ALL', 'Server Control', 'Membership', 'Text Channels', 'Voice Channels'].map((cat) => (
                              <button
                                key={cat}
                                type="button"
                                onClick={() => setPermissionCategoryFilter(cat)}
                                className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all ${
                                  permissionCategoryFilter === cat
                                    ? 'bg-purple-600 text-white shadow-sm'
                                    : 'bg-black/30 text-slate-400 hover:text-white border border-white/5'
                                }`}
                              >
                                {cat}
                              </button>
                            ))}
                          </div>

                          <div className="relative min-w-[160px]">
                            <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500" />
                            <input
                              type="text"
                              value={permissionSearchQuery}
                              onChange={(e) => setPermissionSearchQuery(e.target.value)}
                              placeholder="Filter perms..."
                              className="w-full pl-7 pr-2.5 py-1 rounded-lg bg-black/40 border border-white/5 text-[11px] text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
                            />
                          </div>
                        </div>

                        {/* Permissions Items */}
                        <div className="space-y-2 max-h-56 overflow-y-auto custom-scrollbar pr-1">
                          {AVAILABLE_PERMISSIONS
                            .filter(p => {
                              if (permissionCategoryFilter !== 'ALL' && p.category !== permissionCategoryFilter) return false;
                              if (permissionSearchQuery) {
                                const q = permissionSearchQuery.toLowerCase();
                                return p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q);
                              }
                              return true;
                            })
                            .map((perm) => {
                              const isAllowed = editingRolePermissions.includes(perm.id);

                              return (
                                <div
                                  key={perm.id}
                                  onClick={() => handleTogglePermission(perm.id)}
                                  className={`p-2.5 rounded-xl border flex items-start justify-between cursor-pointer transition-colors ${
                                    isAllowed
                                      ? 'bg-purple-600/15 border-purple-500/40 text-white'
                                      : 'bg-black/20 border-white/5 text-slate-400 hover:bg-white/5'
                                  }`}
                                >
                                  <div className="space-y-0.5 min-w-0 pr-3">
                                    <div className="flex items-center gap-2">
                                      <p className="text-xs font-bold text-white">{perm.name}</p>
                                      <span className="text-[9px] font-black px-1.5 py-0.2 rounded bg-white/5 text-slate-400 border border-white/5">
                                        {perm.category}
                                      </span>
                                    </div>
                                    <p className="text-[10px] text-slate-400 leading-tight">
                                      {perm.description}
                                    </p>
                                  </div>

                                  <button
                                    type="button"
                                    className={`p-1 rounded-lg shrink-0 ${isAllowed ? 'text-purple-400' : 'text-slate-600'}`}
                                  >
                                    {isAllowed ? <CheckSquare size={18} /> : <Square size={18} />}
                                  </button>
                                </div>
                              );
                            })}
                        </div>
                      </div>

                      {/* Direct Member Assignment to This Role */}
                      <div className="space-y-3 pt-3 border-t border-white/5">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div>
                            <p className="text-xs font-black uppercase text-slate-300 tracking-wider flex items-center gap-1.5">
                              <UserCheck size={14} className="text-purple-400" />
                              <span>
                                ASSIGNED MEMBERS ({currentServer?.members.filter(m => m.roleIds.includes(selectedRoleId)).length} of {currentServer?.members.length})
                              </span>
                            </p>
                            <p className="text-[10px] text-slate-400">
                              Click on any member to grant or revoke "{editingRoleName || 'this role'}".
                            </p>
                          </div>

                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => handleAssignAllToRole(selectedRoleId)}
                              className="text-[11px] font-bold text-purple-400 hover:text-purple-300"
                            >
                              Assign All
                            </button>
                            <span className="text-slate-600">•</span>
                            <button
                              type="button"
                              onClick={() => handleRemoveAllFromRole(selectedRoleId)}
                              className="text-[11px] font-bold text-slate-400 hover:text-white"
                            >
                              Remove All
                            </button>
                          </div>
                        </div>

                        {/* Search members for this role */}
                        <div className="relative">
                          <Search size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                          <input
                            type="text"
                            value={roleMemberSearchQuery}
                            onChange={(e) => setRoleMemberSearchQuery(e.target.value)}
                            placeholder="Search members to assign..."
                            className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-black/40 border border-white/5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
                          />
                        </div>
                        
                        {/* Member assignment chips */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto custom-scrollbar pr-1">
                          {currentServer?.members
                            .filter(m => !roleMemberSearchQuery || m.user.username.toLowerCase().includes(roleMemberSearchQuery.toLowerCase()))
                            .map((member) => {
                              const hasRole = member.roleIds.includes(selectedRoleId);

                              return (
                                <button
                                  key={member.userId}
                                  type="button"
                                  onClick={() => handleToggleMemberRole(member.userId, selectedRoleId)}
                                  className={`p-2 rounded-xl border text-xs font-bold flex items-center justify-between transition-all active:scale-95 ${
                                    hasRole
                                      ? 'bg-purple-600/20 border-purple-500/50 text-white shadow-sm'
                                      : 'bg-black/30 border-white/5 text-slate-400 hover:text-white hover:bg-white/5'
                                  }`}
                                >
                                  <div className="flex items-center gap-2 truncate">
                                    <div className="relative">
                                      <img src={member.user.avatar} alt="User" className="w-5 h-5 rounded-full object-cover shrink-0" />
                                      {member.isOwner && <Crown size={10} className="text-amber-400 absolute -top-1 -right-1" />}
                                    </div>
                                    <span className="truncate">{member.user.username}</span>
                                    {member.userId === CURRENT_USER.id && isMuted && (
                                      <span title="Microphone Muted" className="text-rose-400 shrink-0 inline-flex items-center">
                                        <MicOff size={11} className="text-rose-400" />
                                      </span>
                                    )}
                                  </div>

                                  <span className={`text-[10px] px-2 py-0.5 rounded-md flex items-center gap-1 shrink-0 ${
                                    hasRole
                                      ? 'bg-purple-600 text-white font-bold'
                                      : 'bg-white/5 text-slate-500 border border-white/5'
                                  }`}>
                                    {hasRole ? (
                                      <>
                                        <Check size={11} />
                                        <span>Assigned</span>
                                      </>
                                    ) : (
                                      <>
                                        <Plus size={11} />
                                        <span>Add</span>
                                      </>
                                    )}
                                  </span>
                                </button>
                              );
                            })}
                        </div>
                      </div>

                      {/* Role Actions Footer */}
                      <div className="flex items-center justify-between pt-3 border-t border-white/5">
                        {currentServer?.roles.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleDeleteRole(selectedRoleId)}
                            className="px-4 py-2 rounded-xl text-rose-400 hover:bg-rose-500/10 text-xs font-bold transition-colors flex items-center gap-1.5"
                          >
                            <Trash2 size={14} />
                            <span>Delete Role</span>
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={() => handleSaveRole()}
                          className="ml-auto px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-lg shadow-purple-600/30 transition-all active:scale-95 flex items-center gap-1.5"
                        >
                          <ShieldCheck size={15} />
                          <span>Save Role Changes</span>
                        </button>
                      </div>

                    </div>

                  </div>

                </div>
              )}

              {/* TAB 2: OVERVIEW */}
              {serverSettingsTab === 'overview' && (
                <div className="space-y-6 max-w-2xl">
                  <div className="border-b border-white/5 pb-3">
                    <h2 className="text-xl font-black text-white">Server Overview</h2>
                    <p className="text-xs text-slate-400">
                      Configure community identification, guidelines, and instant invite generation.
                    </p>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-300 uppercase tracking-wide">SERVER NAME</label>
                      <input
                        type="text"
                        value={currentServer?.name}
                        onChange={(e) => {
                          const serversCopy = [...servers];
                          const idx = serversCopy.findIndex(s => s.id === currentServer.id);
                          if (idx !== -1) {
                            serversCopy[idx].name = e.target.value;
                            ServerService.saveServers(serversCopy);
                            setServers(serversCopy);
                          }
                        }}
                        className="w-full px-4 py-2.5 rounded-xl bg-black/40 border border-white/10 text-white text-sm font-bold focus:outline-none focus:border-purple-500 transition-colors"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-300 uppercase tracking-wide">DESCRIPTION & TOPIC</label>
                      <textarea
                        rows={3}
                        value={currentServer?.description}
                        onChange={(e) => {
                          const serversCopy = [...servers];
                          const idx = serversCopy.findIndex(s => s.id === currentServer.id);
                          if (idx !== -1) {
                            serversCopy[idx].description = e.target.value;
                            ServerService.saveServers(serversCopy);
                            setServers(serversCopy);
                          }
                        }}
                        className="w-full px-4 py-2.5 rounded-xl bg-black/40 border border-white/10 text-white text-sm focus:outline-none focus:border-purple-500 resize-none transition-colors"
                      />
                    </div>

                    {/* Dedicated Generate Invite Section in Overview */}
                    <div className="p-4 md:p-5 rounded-2xl bg-gradient-to-br from-purple-900/25 via-black/40 to-black/60 border border-purple-500/30 space-y-3 shadow-lg">
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <Sparkles size={16} className="text-purple-400" />
                            <h3 className="text-sm font-black text-white">Instant Server Invite</h3>
                          </div>
                          <p className="text-xs text-slate-400 mt-0.5">
                            Produce a unique, shareable link to invite new members directly to {currentServer?.name}.
                          </p>
                        </div>

                        {/* PROMINENT GENERATE INVITE BUTTON */}
                        <button
                          type="button"
                          onClick={() => handleGenerateInvite()}
                          className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-black flex items-center gap-2 shadow-lg shadow-purple-600/30 active:scale-95 transition-all shrink-0"
                          title="Generate a brand new unique invite code"
                        >
                          <Sparkles size={14} className="text-amber-300" />
                          <span>Generate Invite</span>
                        </button>
                      </div>

                      {/* Primary Link Display & Quick Copy */}
                      <div className="flex items-center gap-2 bg-black/60 border border-white/10 rounded-xl p-2 px-3">
                        <LinkIcon size={14} className="text-purple-400 shrink-0" />
                        <span className="font-mono text-xs text-purple-200 flex-1 truncate select-all">
                          {recentlyGeneratedInvite ? recentlyGeneratedInvite.url : (currentServer?.inviteCode.startsWith('http') ? currentServer.inviteCode : `https://${currentServer?.inviteCode}`)}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleCopyInvite(recentlyGeneratedInvite?.url || currentServer?.inviteCode)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all active:scale-95 ${
                            copiedInvite
                              ? 'bg-emerald-600 text-white shadow-emerald-500/25 shadow-md'
                              : 'bg-purple-600/80 hover:bg-purple-600 text-white'
                          }`}
                        >
                          {copiedInvite ? (
                            <>
                              <Check size={13} />
                              <span>Copied!</span>
                            </>
                          ) : (
                            <>
                              <Copy size={13} />
                              <span>Copy Link</span>
                            </>
                          )}
                        </button>
                      </div>

                      {recentlyGeneratedInvite && (
                        <div className="flex items-center justify-between text-[11px] text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-xl">
                          <span className="flex items-center gap-1.5 font-bold">
                            <Check size={13} /> Fresh unique invite active • {recentlyGeneratedInvite.expiresIn === 'Never' ? 'Never expires' : `Expires in ${recentlyGeneratedInvite.expiresIn}`}
                          </span>
                          <span className="text-slate-400 font-mono text-[10px]">Ready to share</span>
                        </div>
                      )}

                      <div className="flex items-center justify-between pt-1 text-[11px] text-slate-400">
                        <span>Need custom expiration or usage caps?</span>
                        <button
                          type="button"
                          onClick={() => {
                            SoundEffectEngine.play('button-click');
                            setServerSettingsTab('invites');
                          }}
                          className="text-purple-400 hover:text-purple-300 font-bold flex items-center gap-1 hover:underline"
                        >
                          <span>Manage All Server Invites</span>
                          <ChevronRight size={13} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: INVITES & ACCESS LINKS */}
              {serverSettingsTab === 'invites' && (
                <div className="space-y-6">
                  {/* Title & Top Action */}
                  <div className="border-b border-white/5 pb-4 flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <h2 className="text-xl font-black text-white flex items-center gap-2">
                        <LinkIcon className="text-purple-400" size={22} />
                        <span>Server Invites & Access Links</span>
                      </h2>
                      <p className="text-xs text-slate-400">
                        Create unique, copyable invite links to invite new members to this specific server. Configure expiration times and usage limits.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleGenerateInvite()}
                      className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-black text-xs flex items-center gap-2 shadow-lg shadow-purple-600/30 active:scale-95 transition-all"
                    >
                      <Sparkles size={14} className="text-amber-300" />
                      <span>Generate Invite</span>
                    </button>
                  </div>

                  {/* Configurator Card */}
                  <div className="p-4 md:p-5 rounded-2xl bg-[#101017] border border-white/5 space-y-4">
                    <h3 className="text-xs font-black uppercase text-slate-300 tracking-wider flex items-center gap-2">
                      <Sliders size={14} className="text-purple-400" />
                      <span>CUSTOMIZE NEW INVITE PARAMETERS</span>
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Expiration selector */}
                      <div className="space-y-1.5">
                        <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wide flex items-center gap-1.5">
                          <Clock size={12} className="text-purple-400" />
                          <span>EXPIRE AFTER</span>
                        </label>
                        <div className="flex flex-wrap gap-1.5">
                          {['30 minutes', '6 hours', '1 day', '7 days', 'Never'].map((exp) => (
                            <button
                              key={exp}
                              type="button"
                              onClick={() => setInviteExpiryOption(exp)}
                              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                                inviteExpiryOption === exp
                                  ? 'bg-purple-600 text-white shadow-sm'
                                  : 'bg-black/30 text-slate-400 hover:text-white border border-white/5'
                              }`}
                            >
                              {exp}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Max Uses selector */}
                      <div className="space-y-1.5">
                        <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wide flex items-center gap-1.5">
                          <Users size={12} className="text-purple-400" />
                          <span>MAX NUMBER OF USES</span>
                        </label>
                        <div className="flex flex-wrap gap-1.5">
                          {[
                            { label: 'No limit', value: 0 },
                            { label: '1 use', value: 1 },
                            { label: '5 uses', value: 5 },
                            { label: '10 uses', value: 10 },
                            { label: '25 uses', value: 25 },
                          ].map((opt) => (
                            <button
                              key={opt.value}
                              type="button"
                              onClick={() => setInviteMaxUsesOption(opt.value)}
                              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                                inviteMaxUsesOption === opt.value
                                  ? 'bg-purple-600 text-white shadow-sm'
                                  : 'bg-black/30 text-slate-400 hover:text-white border border-white/5'
                              }`}
                            >
                              {opt.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Generate Button Row */}
                    <div className="pt-2 flex flex-wrap items-center justify-between gap-3 border-t border-white/5">
                      <p className="text-[11px] text-slate-400">
                        Link will expire after <span className="text-purple-300 font-bold">{inviteExpiryOption}</span> with <span className="text-purple-300 font-bold">{inviteMaxUsesOption === 0 ? 'unlimited' : `${inviteMaxUsesOption} max`}</span> uses.
                      </p>

                      <button
                        type="button"
                        onClick={() => handleGenerateInvite()}
                        className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-black text-xs flex items-center gap-2 shadow-lg shadow-purple-600/30 transition-all active:scale-95"
                      >
                        <Sparkles size={14} className="text-amber-300" />
                        <span>Generate & Copy Link</span>
                      </button>
                    </div>
                  </div>

                  {/* Active Invites List */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xs font-black uppercase text-slate-400 tracking-wider">
                        ACTIVE SERVER INVITES ({ServerService.getInvites(currentServer?.id || '').length})
                      </h3>
                      <span className="text-[11px] text-slate-500">Links can be shared across web, mobile, and desktop</span>
                    </div>

                    <div className="space-y-2">
                      {ServerService.getInvites(currentServer?.id || '').map((inv) => {
                        const isJustCopied = copiedInviteCode === inv.code;

                        return (
                          <div
                            key={inv.id}
                            className="p-3.5 rounded-2xl bg-black/30 border border-white/5 hover:border-white/10 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                          >
                            <div className="space-y-1 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="font-mono text-xs font-bold text-purple-300 bg-purple-500/10 px-2 py-0.5 rounded-lg border border-purple-500/20 truncate">
                                  {inv.url}
                                </span>
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/5 text-slate-400 border border-white/5">
                                  {inv.expiresIn === 'Never' ? 'Permanent' : `Expires in ${inv.expiresIn}`}
                                </span>
                                {inv.maxUses ? (
                                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30">
                                    {inv.uses} / {inv.maxUses} Uses
                                  </span>
                                ) : (
                                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                                    {inv.uses} {inv.uses === 1 ? 'Use' : 'Uses'} (Unlimited)
                                  </span>
                                )}
                              </div>
                              <p className="text-[11px] text-slate-500">
                                Created by <span className="text-slate-400 font-bold">{inv.createdBy}</span> • {inv.createdAt}
                              </p>
                            </div>

                            <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                              <button
                                type="button"
                                onClick={() => handleCopyInvite(inv.url)}
                                className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all active:scale-95 ${
                                  isJustCopied
                                    ? 'bg-emerald-600 text-white shadow-emerald-500/30 shadow'
                                    : 'bg-purple-600/20 hover:bg-purple-600 text-purple-300 hover:text-white border border-purple-500/30'
                                }`}
                              >
                                {isJustCopied ? <Check size={13} /> : <Copy size={13} />}
                                <span>{isJustCopied ? 'Copied!' : 'Copy Link'}</span>
                              </button>

                              <button
                                type="button"
                                onClick={() => handleRevokeInvite(inv.id)}
                                title="Revoke this invite link"
                                className="p-2 rounded-xl text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                              >
                                <Trash2 size={15} />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: MEMBERS & ACCESS MANAGEMENT */}
              {serverSettingsTab === 'members' && (
                <div className="space-y-5">
                  <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/5 pb-4">
                    <div>
                      <h2 className="text-xl font-black text-white flex items-center gap-2">
                        <Users className="text-purple-400" size={22} />
                        <span>Server Members & Role Assignments</span>
                      </h2>
                      <p className="text-xs text-slate-400">
                        Assign custom roles, manage hierarchy, and configure permissions per user ({currentServer?.members.length} total members).
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => setShowInviteModal(true)}
                      className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs flex items-center gap-1.5 transition-all shadow-md active:scale-95"
                    >
                      <UserPlus size={14} />
                      <span>Invite Member</span>
                    </button>
                  </div>

                  {/* Filters Bar: Search & Role Filter */}
                  <div className="flex flex-wrap items-center justify-between gap-3 bg-[#101017] p-3 rounded-2xl border border-white/5">
                    <div className="relative flex-1 min-w-[200px] max-w-md">
                      <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                      <input
                        type="text"
                        value={membersTabSearch}
                        onChange={(e) => setMembersTabSearch(e.target.value)}
                        placeholder="Search members by username..."
                        className="w-full pl-9 pr-3 py-2 rounded-xl bg-black/40 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 transition-colors"
                      />
                      {membersTabSearch && (
                        <button onClick={() => setMembersTabSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white">
                          <X size={13} />
                        </button>
                      )}
                    </div>

                    {/* Filter by Role Dropdown */}
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-bold text-slate-400 uppercase">Filter Role:</span>
                      <select
                        value={membersTabRoleFilter}
                        onChange={(e) => setMembersTabRoleFilter(e.target.value)}
                        className="px-3 py-1.5 rounded-xl bg-black/40 border border-white/10 text-xs font-bold text-white focus:outline-none focus:border-purple-500"
                      >
                        <option value="ALL">All Roles ({currentServer?.members.length})</option>
                        {currentServer?.roles.map((r) => (
                          <option key={r.id} value={r.id}>
                            {r.name} ({currentServer.members.filter(m => m.roleIds.includes(r.id)).length})
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Members List with Role Assignment Controls */}
                  <div className="space-y-2">
                    {currentServer?.members
                      .filter(m => {
                        if (membersTabRoleFilter !== 'ALL' && !m.roleIds.includes(membersTabRoleFilter)) return false;
                        if (membersTabSearch && !m.user.username.toLowerCase().includes(membersTabSearch.toLowerCase())) return false;
                        return true;
                      })
                      .map((member) => {
                        const isPopoverOpen = activeMemberRolePopover === member.userId;

                        return (
                          <div
                            key={member.userId}
                            className="p-3.5 rounded-2xl bg-black/30 border border-white/5 hover:border-white/10 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-3 relative"
                          >
                            {/* Member Avatar & Info */}
                            <div className="flex items-center gap-3 min-w-0">
                              <div className="relative">
                                <img src={member.user.avatar} alt="User" className="w-10 h-10 rounded-xl object-cover" />
                                <div className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-[#14141c] ${
                                  member.user.status === 'online' ? 'bg-emerald-500' :
                                  member.user.status === 'idle' ? 'bg-amber-500' :
                                  member.user.status === 'dnd' ? 'bg-rose-500' : 'bg-slate-500'
                                }`} />
                              </div>
                              <div className="min-w-0">
                                <div className="flex items-center gap-2">
                                  <p className="text-sm font-bold text-white truncate">{member.user.username}</p>
                                  {member.userId === CURRENT_USER.id && isMuted && (
                                    <span title="Microphone Muted" className="text-rose-400 shrink-0 inline-flex items-center">
                                      <MicOff size={13} className="text-rose-400" />
                                    </span>
                                  )}
                                  {member.userId === CURRENT_USER.id && isDeafened && (
                                    <span title="Audio Deafened" className="text-rose-400 shrink-0 inline-flex items-center">
                                      <Headphones size={13} className="text-rose-400" />
                                    </span>
                                  )}
                                  {member.isOwner && (
                                    <span className="flex items-center gap-1 text-[10px] font-black px-1.5 py-0.2 rounded bg-amber-500/15 text-amber-300 border border-amber-500/30">
                                      <Crown size={11} className="text-amber-400" />
                                      <span>OWNER</span>
                                    </span>
                                  )}
                                </div>
                                <p className="text-[11px] text-slate-500">
                                  Joined {member.joinedAt} • ID: <span className="font-mono">{member.userId}</span>
                                </p>
                              </div>
                            </div>

                            {/* Assigned Roles List & Role Assignment Button */}
                            <div className="flex flex-wrap items-center gap-2 md:justify-end">
                              {/* Removable Role Badges */}
                              {member.roleIds.map((rid) => {
                                const r = currentServer.roles.find(ro => ro.id === rid);
                                if (!r) return null;

                                return (
                                  <span
                                    key={rid}
                                    className="px-2 py-0.5 rounded-lg border text-[11px] font-bold flex items-center gap-1.5 shadow-sm group"
                                    style={{ 
                                      borderColor: `${r.color}50`, 
                                      backgroundColor: `${r.color}15`, 
                                      color: r.color 
                                    }}
                                  >
                                    <span 
                                      className="w-1.5 h-1.5 rounded-full"
                                      style={{ backgroundColor: r.color }}
                                    />
                                    <span>{r.name}</span>
                                    <button
                                      type="button"
                                      onClick={() => handleToggleMemberRole(member.userId, rid)}
                                      title={`Remove ${r.name} from ${member.user.username}`}
                                      className="hover:bg-white/20 rounded p-0.5 text-slate-400 hover:text-white transition-colors"
                                    >
                                      <X size={11} />
                                    </button>
                                  </span>
                                );
                              })}

                              {/* Add / Manage Role Popover Button */}
                              <div className="relative">
                                <button
                                  type="button"
                                  onClick={() => setActiveMemberRolePopover(isPopoverOpen ? null : member.userId)}
                                  className={`px-2.5 py-1 rounded-xl text-xs font-bold border transition-all flex items-center gap-1.5 ${
                                    isPopoverOpen
                                      ? 'bg-purple-600 text-white border-purple-500'
                                      : 'bg-white/5 hover:bg-white/10 text-slate-300 border-white/10'
                                  }`}
                                >
                                  <Plus size={13} />
                                  <span>Role</span>
                                </button>

                                {/* Role Selector Popover */}
                                {isPopoverOpen && (
                                  <div className="absolute right-0 top-full mt-2 w-56 bg-[#181824] border border-white/10 rounded-2xl p-2 shadow-2xl z-30 space-y-1 animate-notificationPop">
                                    <div className="px-2 py-1 flex items-center justify-between border-b border-white/5 mb-1">
                                      <p className="text-[10px] font-black uppercase text-slate-400">ASSIGN ROLES</p>
                                      <button onClick={() => setActiveMemberRolePopover(null)} className="text-slate-500 hover:text-white">
                                        <X size={12} />
                                      </button>
                                    </div>

                                    <div className="space-y-1 max-h-48 overflow-y-auto custom-scrollbar">
                                      {currentServer.roles.map((r) => {
                                        const hasRole = member.roleIds.includes(r.id);

                                        return (
                                          <button
                                            key={r.id}
                                            type="button"
                                            onClick={() => handleToggleMemberRole(member.userId, r.id)}
                                            className={`w-full px-2.5 py-1.5 rounded-xl text-left text-xs font-bold flex items-center justify-between transition-colors ${
                                              hasRole
                                                ? 'bg-purple-600/20 text-white border border-purple-500/30'
                                                : 'hover:bg-white/5 text-slate-300'
                                            }`}
                                          >
                                            <div className="flex items-center gap-2 truncate">
                                              <span 
                                                className="w-2.5 h-2.5 rounded-full shrink-0"
                                                style={{ backgroundColor: r.color }}
                                              />
                                              <span className="truncate">{r.name}</span>
                                            </div>

                                            {hasRole && <Check size={13} className="text-purple-400 shrink-0" />}
                                          </button>
                                        );
                                      })}
                                    </div>
                                  </div>
                                )}
                              </div>

                              {/* Direct DM Action */}
                              <button
                                type="button"
                                onClick={() => {
                                  setShowServerSettingsModal(false);
                                  if (onOpenDM) onOpenDM(member.user);
                                }}
                                title={`Direct Message ${member.user.username}`}
                                className="p-1.5 rounded-xl text-slate-500 hover:text-white hover:bg-white/5 transition-colors"
                              >
                                <MessageSquare size={14} />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                  </div>
                </div>
              )}

              {/* TAB 4: AUDIT LOG & ADMINISTRATIVE RECORD */}
              {serverSettingsTab === 'audit' && (
                <div className="space-y-5">
                  {/* Header */}
                  <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/5 pb-4">
                    <div>
                      <h2 className="text-xl font-black text-white flex items-center gap-2">
                        <FileText className="text-purple-400" size={22} />
                        <span>Audit Log</span>
                      </h2>
                      <p className="text-xs text-slate-400">
                        Administrative activity tracking member joins, role changes, channel creations, and invite modifications.
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-xs px-2.5 py-1 rounded-xl bg-purple-500/10 text-purple-300 border border-purple-500/20 font-bold flex items-center gap-1.5">
                        <Clock size={13} />
                        <span>{(currentServer?.auditLogs || []).length} Recorded Events</span>
                      </span>
                    </div>
                  </div>

                  {/* Filter and Search Controls */}
                  <div className="flex flex-wrap items-center justify-between gap-3 bg-[#101017] p-3 rounded-2xl border border-white/5">
                    <div className="relative flex-1 min-w-[200px] max-w-md">
                      <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                      <input
                        type="text"
                        value={auditSearchQuery}
                        onChange={(e) => setAuditSearchQuery(e.target.value)}
                        placeholder="Search audit events by user, target, or details..."
                        className="w-full pl-9 pr-3 py-2 rounded-xl bg-black/40 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 transition-colors"
                      />
                      {auditSearchQuery && (
                        <button onClick={() => setAuditSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white">
                          <X size={13} />
                        </button>
                      )}
                    </div>

                    {/* Filter by Action Dropdown */}
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-bold text-slate-400 uppercase">Action Type:</span>
                      <select
                        value={auditActionFilter}
                        onChange={(e) => setAuditActionFilter(e.target.value)}
                        className="px-3 py-1.5 rounded-xl bg-black/40 border border-white/10 text-xs font-bold text-white focus:outline-none focus:border-purple-500"
                      >
                        <option value="ALL">All Events</option>
                        <option value="MEMBER_JOIN">Member Joins</option>
                        <option value="ROLE_ASSIGN">Role Assigned</option>
                        <option value="ROLE_REVOKE">Role Revoked</option>
                        <option value="ROLE_CREATE">Role Created</option>
                        <option value="ROLE_UPDATE">Role Updated</option>
                        <option value="ROLE_DELETE">Role Deleted</option>
                        <option value="CHANNEL_CREATE">Channel Created</option>
                        <option value="CHANNEL_DELETE">Channel Deleted</option>
                        <option value="INVITE_CREATE">Invite Created</option>
                        <option value="INVITE_REVOKE">Invite Revoked</option>
                      </select>

                      {(auditActionFilter !== 'ALL' || auditSearchQuery) && (
                        <button
                          onClick={() => {
                            setAuditActionFilter('ALL');
                            setAuditSearchQuery('');
                          }}
                          className="px-2.5 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white text-xs font-bold transition-colors"
                          title="Clear all filters"
                        >
                          Clear
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Audit Log Entries List */}
                  {(() => {
                    const logs = (currentServer?.auditLogs || []).filter((log) => {
                      if (auditActionFilter !== 'ALL' && log.action !== auditActionFilter) return false;
                      if (auditSearchQuery) {
                        const q = auditSearchQuery.toLowerCase();
                        const actorMatch = log.actor?.username?.toLowerCase().includes(q);
                        const targetMatch = log.targetName?.toLowerCase().includes(q);
                        const detailsMatch = log.details?.toLowerCase().includes(q);
                        const actionMatch = log.action.toLowerCase().includes(q);
                        return actorMatch || targetMatch || detailsMatch || actionMatch;
                      }
                      return true;
                    });

                    if (logs.length === 0) {
                      return (
                        <div className="p-10 rounded-2xl bg-black/30 border border-white/5 text-center space-y-3">
                          <div className="w-12 h-12 rounded-2xl bg-purple-500/10 text-purple-400 flex items-center justify-center mx-auto">
                            <ClipboardList size={24} />
                          </div>
                          <div>
                            <p className="text-sm font-bold text-white">No Audit Events Found</p>
                            <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
                              {auditSearchQuery || auditActionFilter !== 'ALL'
                                ? 'No events matched your current search or filter query.'
                                : 'Administrative actions like role modifications, member joins, and channel creations will be recorded here.'}
                            </p>
                          </div>
                          {(auditSearchQuery || auditActionFilter !== 'ALL') ? (
                            <button
                              onClick={() => {
                                setAuditActionFilter('ALL');
                                setAuditSearchQuery('');
                              }}
                              className="px-4 py-2 rounded-xl bg-purple-600/20 hover:bg-purple-600 text-purple-300 hover:text-white text-xs font-bold border border-purple-500/30 transition-all"
                            >
                              Reset Filters
                            </button>
                          ) : (
                            <button
                              onClick={() => {
                                ServerService.logAuditEvent(currentServer.id, {
                                  action: 'SERVER_UPDATE',
                                  actor: { id: CURRENT_USER.id, username: CURRENT_USER.username, avatar: CURRENT_USER.avatar },
                                  targetName: currentServer.name,
                                  details: 'Admin verified audit log tracking',
                                });
                                setServers(ServerService.getServers());
                              }}
                              className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition-all shadow-md active:scale-95"
                            >
                              Log Test Activity Event
                            </button>
                          )}
                        </div>
                      );
                    }

                    return (
                      <div className="space-y-2.5">
                        {logs.map((entry) => {
                          // Badge styling
                          let badgeBg = 'bg-slate-500/15 border-slate-500/30 text-slate-300';
                          let actionLabel = entry.action.replace('_', ' ');
                          let ActionIcon = FileText;

                          if (entry.action === 'MEMBER_JOIN') {
                            badgeBg = 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300';
                            actionLabel = 'Member Joined';
                            ActionIcon = UserPlus;
                          } else if (entry.action === 'ROLE_ASSIGN') {
                            badgeBg = 'bg-purple-500/15 border-purple-500/30 text-purple-300';
                            actionLabel = 'Role Assigned';
                            ActionIcon = UserCheck;
                          } else if (entry.action === 'ROLE_REVOKE') {
                            badgeBg = 'bg-orange-500/15 border-orange-500/30 text-orange-300';
                            actionLabel = 'Role Revoked';
                            ActionIcon = Shield;
                          } else if (entry.action === 'ROLE_CREATE') {
                            badgeBg = 'bg-indigo-500/15 border-indigo-500/30 text-indigo-300';
                            actionLabel = 'Role Created';
                            ActionIcon = ShieldCheck;
                          } else if (entry.action === 'ROLE_UPDATE') {
                            badgeBg = 'bg-amber-500/15 border-amber-500/30 text-amber-300';
                            actionLabel = 'Role Updated';
                            ActionIcon = Edit2;
                          } else if (entry.action === 'ROLE_DELETE') {
                            badgeBg = 'bg-rose-500/15 border-rose-500/30 text-rose-300';
                            actionLabel = 'Role Deleted';
                            ActionIcon = Trash2;
                          } else if (entry.action === 'CHANNEL_CREATE') {
                            badgeBg = 'bg-cyan-500/15 border-cyan-500/30 text-cyan-300';
                            actionLabel = 'Channel Created';
                            ActionIcon = Plus;
                          } else if (entry.action === 'CHANNEL_DELETE') {
                            badgeBg = 'bg-rose-500/15 border-rose-500/30 text-rose-300';
                            actionLabel = 'Channel Deleted';
                            ActionIcon = Trash2;
                          } else if (entry.action === 'INVITE_CREATE') {
                            badgeBg = 'bg-blue-500/15 border-blue-500/30 text-blue-300';
                            actionLabel = 'Invite Created';
                            ActionIcon = LinkIcon;
                          } else if (entry.action === 'INVITE_REVOKE') {
                            badgeBg = 'bg-rose-500/15 border-rose-500/30 text-rose-300';
                            actionLabel = 'Invite Revoked';
                            ActionIcon = Trash2;
                          }

                          return (
                            <div
                              key={entry.id}
                              className="p-3.5 rounded-2xl bg-black/30 border border-white/5 hover:border-white/10 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                            >
                              <div className="flex items-start sm:items-center gap-3 min-w-0">
                                {/* Actor Avatar */}
                                <div className="relative shrink-0 mt-0.5 sm:mt-0">
                                  <img
                                    src={entry.actor.avatar || 'https://picsum.photos/100/100?random=99'}
                                    alt={entry.actor.username}
                                    className="w-9 h-9 rounded-xl object-cover border border-white/10"
                                  />
                                </div>

                                {/* Event Summary */}
                                <div className="min-w-0 space-y-0.5">
                                  <div className="flex flex-wrap items-center gap-2">
                                    <span className="text-xs font-bold text-white">
                                      {entry.actor.username}
                                    </span>

                                    {/* Action Type Badge */}
                                    <span className={`px-2 py-0.5 rounded-lg border text-[10px] font-black uppercase flex items-center gap-1 ${badgeBg}`}>
                                      <ActionIcon size={11} />
                                      <span>{actionLabel}</span>
                                    </span>

                                    {/* Target Name Badge if present */}
                                    {entry.targetName && (
                                      <span className="px-2 py-0.5 rounded-lg bg-white/5 border border-white/10 text-[11px] font-bold text-slate-200">
                                        {entry.targetName}
                                      </span>
                                    )}
                                  </div>

                                  {/* Event Details */}
                                  {entry.details && (
                                    <p className="text-xs text-slate-400">
                                      {entry.details}
                                    </p>
                                  )}
                                </div>
                              </div>

                              {/* Timestamp & ID info */}
                              <div className="flex items-center gap-3 text-right self-end sm:self-center shrink-0">
                                <div className="text-right">
                                  <p className="text-xs text-slate-400 flex items-center gap-1 justify-end font-medium">
                                    <Clock size={12} className="text-slate-500" />
                                    <span>{entry.timestamp}</span>
                                  </p>
                                  <p className="text-[10px] text-slate-600 font-mono">
                                    {entry.id}
                                  </p>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    );
                  })()}
                </div>
              )}

            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default ServersView;
