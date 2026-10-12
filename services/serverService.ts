import { AuditLogAction, AuditLogEntry, Server, ServerChannel, ServerInvite, ServerMember, ServerMessage, ServerRole, User } from '../types';

const SERVERS_STORAGE_KEY = 'nexus_servers_list';
const MESSAGES_STORAGE_PREFIX = 'nexus_server_msgs_';

const CURRENT_USER_KEY = 'nexus_current_user_profile';

const loadSavedCurrentUser = (): User => {
  try {
    const saved = typeof window !== 'undefined' ? localStorage.getItem(CURRENT_USER_KEY) : null;
    if (saved) return JSON.parse(saved);
  } catch (_) {}
  return {
    id: '1',
    username: 'Bogdan Nikitin',
    avatar: 'https://picsum.photos/100/100?random=88',
    status: 'online',
  };
};

export const CURRENT_USER: User = loadSavedCurrentUser();

export const updateCurrentUser = (user: Partial<User> & { id: string; username: string }): void => {
  CURRENT_USER.id = user.id;
  CURRENT_USER.username = user.username;
  if (user.avatar) CURRENT_USER.avatar = user.avatar;
  if (user.status) CURRENT_USER.status = user.status;
  if (user.email) CURRENT_USER.email = user.email;
  if (user.provider) CURRENT_USER.provider = user.provider;
  if (user.createdAt) CURRENT_USER.createdAt = user.createdAt;

  try {
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(CURRENT_USER));
    window.dispatchEvent(new CustomEvent('nexus_current_user_updated', { detail: { user: CURRENT_USER } }));
  } catch (_) {}
};

const COMMUNITY_MEMBERS: User[] = [
  { id: '2', username: 'Nelly', avatar: 'https://picsum.photos/100/100?random=10', status: 'online' },
  { id: '3', username: 'Mallow', avatar: 'https://picsum.photos/100/100?random=11', status: 'idle' },
  { id: '4', username: 'Graggle', avatar: 'https://picsum.photos/100/100?random=12', status: 'dnd' },
  { id: '5', username: 'Jinx_Main', avatar: 'https://picsum.photos/100/100?random=45', status: 'offline' },
  { id: '6', username: 'ViperSniper', avatar: 'https://picsum.photos/100/100?random=23', status: 'online' },
  { id: '7', username: 'CypherKey', avatar: 'https://picsum.photos/100/100?random=77', status: 'online' },
];

export const INITIAL_SERVERS: Server[] = [
  {
    id: 'srv-nexus-central',
    name: 'Nexus HQ & Esports Lounge',
    icon: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=200&auto=format&fit=crop',
    banner: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=1200&auto=format&fit=crop',
    description: 'The official competitive gaming headquarters of Nexus. Scrims, tournaments, game clips, and community hangouts.',
    ownerId: '1',
    isCustom: false,
    inviteCode: 'nexus.gg/join/hq-central',
    categories: ['WELCOME & RULES', 'TEXT CHANNELS', 'VOICE CHANNELS', 'MEDIA & CLIPS'],
    createdAt: '2026-01-15',
    roles: [
      { id: 'r-founder', name: 'Server Founder', color: '#c084fc', hoist: true, permissions: ['ALL'] },
      { id: 'r-moderator', name: 'Moderator', color: '#38bdf8', hoist: true, permissions: ['MANAGE_MESSAGES', 'KICK_MEMBERS'] },
      { id: 'r-radiant', name: 'Radiant VIP', color: '#facc15', hoist: true, permissions: ['ATTACH_FILES', 'USE_EMOJIS'] },
      { id: 'r-member', name: 'Community Gamer', color: '#94a3b8', hoist: false, permissions: ['SEND_MESSAGES'] },
    ],
    channels: [
      { id: 'c-announcements', name: 'announcements', type: 'announcement', category: 'WELCOME & RULES', topic: 'Official platform patch notes, server updates, and major events.' },
      { id: 'c-rules', name: 'rules-and-faq', type: 'text', category: 'WELCOME & RULES', topic: 'Community standards, tournament guidelines, and server FAQ.' },
      { id: 'c-general', name: 'general-chat', type: 'text', category: 'TEXT CHANNELS', topic: 'Main lobby for gaming banter, team searches, and daily tech talk.' },
      { id: 'c-lfg', name: 'lfg-ranked-squad', type: 'text', category: 'TEXT CHANNELS', topic: 'Find teammates for Valorant, Apex, CS2, and Overwatch 2.' },
      { id: 'c-clips', name: 'clutch-clips', type: 'text', category: 'MEDIA & CLIPS', topic: 'Drop your nastiest 1v5 aces and high-flying highlight reels!' },
      { id: 'c-voice-lounge', name: 'Lobby Hangout', type: 'voice', category: 'VOICE CHANNELS', topic: 'Casual open voice channel for everyone.' },
      { id: 'c-voice-duo', name: 'Duo Queue [2/2]', type: 'voice', category: 'VOICE CHANNELS', topic: 'Tactical comms room for competitive duo pairs.' },
      { id: 'c-voice-squad', name: 'Ranked 5-Stack', type: 'voice', category: 'VOICE CHANNELS', topic: 'High-focus tournament & scrims comms.' },
    ],
    members: [
      { userId: '1', user: CURRENT_USER, roleIds: ['r-founder'], joinedAt: '2026-01-15', isOwner: true },
      { userId: '2', user: COMMUNITY_MEMBERS[0], roleIds: ['r-moderator', 'r-radiant'], joinedAt: '2026-01-16' },
      { userId: '3', user: COMMUNITY_MEMBERS[1], roleIds: ['r-radiant'], joinedAt: '2026-01-18' },
      { userId: '4', user: COMMUNITY_MEMBERS[2], roleIds: ['r-member'], joinedAt: '2026-02-01' },
      { userId: '6', user: COMMUNITY_MEMBERS[4], roleIds: ['r-member'], joinedAt: '2026-02-05' },
      { userId: '7', user: COMMUNITY_MEMBERS[5], roleIds: ['r-member'], joinedAt: '2026-02-10' },
    ],
    auditLogs: [
      {
        id: 'al-nexus-1',
        serverId: 'srv-nexus-central',
        action: 'MEMBER_JOIN',
        actor: { id: '7', username: 'CypherKey', avatar: 'https://picsum.photos/100/100?random=77' },
        targetName: 'CypherKey',
        targetId: '7',
        details: 'Joined via permanent invite code nexus.gg/join/hq-central',
        timestamp: 'Today at 2:45 PM'
      },
      {
        id: 'al-nexus-2',
        serverId: 'srv-nexus-central',
        action: 'ROLE_ASSIGN',
        actor: { id: '1', username: 'Bogdan Nikitin', avatar: CURRENT_USER.avatar },
        targetName: 'Nelly',
        targetId: '2',
        details: 'Assigned role Moderator and Radiant VIP',
        timestamp: 'Today at 1:12 PM'
      },
      {
        id: 'al-nexus-3',
        serverId: 'srv-nexus-central',
        action: 'CHANNEL_CREATE',
        actor: { id: '1', username: 'Bogdan Nikitin', avatar: CURRENT_USER.avatar },
        targetName: '#clutch-clips',
        details: 'Created text channel in MEDIA & CLIPS',
        timestamp: 'Yesterday at 8:30 PM'
      },
      {
        id: 'al-nexus-4',
        serverId: 'srv-nexus-central',
        action: 'ROLE_CREATE',
        actor: { id: '1', username: 'Bogdan Nikitin', avatar: CURRENT_USER.avatar },
        targetName: 'Radiant VIP',
        details: 'Created role with permissions: ATTACH_FILES, USE_EMOJIS, PRIORITY_SPEAKER',
        timestamp: '2 days ago'
      },
      {
        id: 'al-nexus-5',
        serverId: 'srv-nexus-central',
        action: 'MEMBER_JOIN',
        actor: { id: '2', username: 'Nelly', avatar: 'https://picsum.photos/100/100?random=10' },
        targetName: 'Nelly',
        targetId: '2',
        details: 'Joined server community',
        timestamp: '3 days ago'
      }
    ],
  },
  {
    id: 'srv-valorant-syndicate',
    name: 'Valorant Radiant Syndicate',
    icon: 'https://images.unsplash.com/photo-1542751110-97427bbecf20?q=80&w=200&auto=format&fit=crop',
    banner: 'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?q=80&w=1200&auto=format&fit=crop',
    description: 'Premier tactical FPS community. Lineups, agent strategies, scrim tournaments, and aim lab coaching.',
    ownerId: '2',
    isCustom: false,
    inviteCode: 'nexus.gg/join/val-syndicate',
    categories: ['STRATEGY & INTEL', 'COMMUNITY', 'VOICE COMMS'],
    createdAt: '2026-02-10',
    roles: [
      { id: 'r-val-lead', name: 'Syndicate Leader', color: '#f43f5e', hoist: true, permissions: ['ALL'] },
      { id: 'r-val-coach', name: 'Aim Coach', color: '#10b981', hoist: true, permissions: ['MANAGE_MESSAGES'] },
      { id: 'r-val-member', name: 'Tactical Agent', color: '#94a3b8', hoist: false, permissions: ['SEND_MESSAGES'] },
    ],
    channels: [
      { id: 'c-val-meta', name: 'meta-tier-list', type: 'text', category: 'STRATEGY & INTEL', topic: 'Patch 9.0 agent balance and weapon analytics.' },
      { id: 'c-val-lineups', name: 'sova-fade-lineups', type: 'text', category: 'STRATEGY & INTEL', topic: 'Post-plant setups and recon darts.' },
      { id: 'c-val-chat', name: 'agent-lounge', type: 'text', category: 'COMMUNITY', topic: 'General discussion and crosshair codes.' },
      { id: 'c-val-vc1', name: 'Ascendant & Immortal Comms', type: 'voice', category: 'VOICE COMMS', topic: 'Strict comms only.' },
    ],
    members: [
      { userId: '2', user: COMMUNITY_MEMBERS[0], roleIds: ['r-val-lead'], joinedAt: '2026-02-10', isOwner: true },
      { userId: '1', user: CURRENT_USER, roleIds: ['r-val-coach'], joinedAt: '2026-02-11' },
      { userId: '4', user: COMMUNITY_MEMBERS[2], roleIds: ['r-val-member'], joinedAt: '2026-02-12' },
      { userId: '6', user: COMMUNITY_MEMBERS[4], roleIds: ['r-val-member'], joinedAt: '2026-02-14' },
    ],
  },
  {
    id: 'srv-chill-pixel',
    name: 'Pixel & Lo-Fi Lounge ☕',
    icon: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=200&auto=format&fit=crop',
    banner: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=1200&auto=format&fit=crop',
    description: 'Cozy indie gaming, Minecraft builds, retro emulators, and late night synthwave listening party.',
    ownerId: '4',
    isCustom: false,
    inviteCode: 'nexus.gg/join/pixel-lofi',
    categories: ['CHILL VIBES', 'PROJECTS', 'AUDIO STAGE'],
    createdAt: '2026-03-01',
    roles: [
      { id: 'r-host', name: 'Lounge Host', color: '#fb923c', hoist: true, permissions: ['ALL'] },
      { id: 'r-builder', name: 'Master Architect', color: '#4ade80', hoist: true, permissions: ['SEND_MESSAGES'] },
      { id: 'r-chiller', name: 'Cozy Chiller', color: '#94a3b8', hoist: false, permissions: ['SEND_MESSAGES'] },
    ],
    channels: [
      { id: 'c-pixel-chat', name: 'fireside-chat', type: 'text', category: 'CHILL VIBES', topic: 'Grab coffee and talk about cozy games.' },
      { id: 'c-pixel-builds', name: 'creative-builds', type: 'text', category: 'PROJECTS', topic: 'Screenshots of mega-bases and pixel art.' },
      { id: 'c-pixel-radio', name: '24/7 Lo-Fi Stage', type: 'voice', category: 'AUDIO STAGE', topic: 'Chilled beats to study / rank up to.' },
    ],
    members: [
      { userId: '4', user: COMMUNITY_MEMBERS[2], roleIds: ['r-host'], joinedAt: '2026-03-01', isOwner: true },
      { userId: '1', user: CURRENT_USER, roleIds: ['r-builder'], joinedAt: '2026-03-02' },
      { userId: '3', user: COMMUNITY_MEMBERS[1], roleIds: ['r-chiller'], joinedAt: '2026-03-03' },
    ],
  },
];

const INITIAL_MESSAGES: Record<string, ServerMessage[]> = {
  'c-announcements': [
    {
      id: 'm-ann-1',
      channelId: 'c-announcements',
      userId: '1',
      content: '🚨 **NEXUS SYSTEM UPDATE 4.2 DEPLOYED**\n\n• Centralized Web Audio SoundEffectEngine active.\n• Framer Motion Interactive Mascot now tracking daily login streaks.\n• Dedicated Discord-style Servers tab launched with custom server builder!\n\nReact below to test the reaction engine! 🚀',
      timestamp: 'Today at 10:00 AM',
      isPinned: true,
      reactions: [
        { emoji: '🚀', count: 12, users: ['1', '2', '3'] },
        { emoji: '🔥', count: 8, users: ['4', '6'] },
        { emoji: '👑', count: 5, users: ['2'] }
      ]
    }
  ],
  'c-general': [
    {
      id: 'm-gen-1',
      channelId: 'c-general',
      userId: '2',
      content: 'Anyone queueing ranked tonight? Need a solid initiator or smokes player.',
      timestamp: 'Today at 3:15 PM',
      reactions: [{ emoji: '🎯', count: 3, users: ['3', '4'] }]
    },
    {
      id: 'm-gen-2',
      channelId: 'c-general',
      userId: '3',
      content: 'I can play Omen or Brimstone in about 20 mins! Just grabbing snacks.',
      timestamp: 'Today at 3:18 PM',
      replyTo: { id: 'm-gen-1', username: 'Nelly', content: 'Anyone queueing ranked tonight?' }
    },
    {
      id: 'm-gen-3',
      channelId: 'c-general',
      userId: '1',
      content: 'Let\'s run a 5-stack in `#Ranked 5-Stack` voice channel. We can warm up in Range first.',
      timestamp: 'Today at 3:20 PM',
      reactions: [{ emoji: '🔥', count: 4, users: ['2', '3', '4'] }]
    }
  ],
  'c-clips': [
    {
      id: 'm-clip-1',
      channelId: 'c-clips',
      userId: '2',
      content: 'Clean 1v4 clutch on Ascent B site! Operator flick at the end was pure muscle memory.',
      timestamp: 'Yesterday at 8:40 PM',
      attachments: ['https://images.unsplash.com/photo-1542751110-97427bbecf20?q=80&w=800&auto=format&fit=crop'],
      reactions: [{ emoji: '🔥', count: 7, users: ['1', '3', '4', '6'] }]
    }
  ]
};

export const ServerService = {
  getServers(): Server[] {
    if (typeof window === 'undefined') return INITIAL_SERVERS;
    try {
      const saved = localStorage.getItem(SERVERS_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (_) {}
    // Seed initial servers
    localStorage.setItem(SERVERS_STORAGE_KEY, JSON.stringify(INITIAL_SERVERS));
    return INITIAL_SERVERS;
  },

  saveServers(servers: Server[]): void {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(SERVERS_STORAGE_KEY, JSON.stringify(servers));
      window.dispatchEvent(new CustomEvent('nexus_servers_updated', { detail: { servers } }));
    } catch (_) {}
  },

  createServer(data: {
    name: string;
    description: string;
    icon?: string;
    banner?: string;
    categoryTemplate?: 'gaming' | 'esports' | 'chill' | 'scratch';
  }): Server {
    const servers = this.getServers();
    const newId = `srv-custom-${Date.now()}`;
    const inviteCode = `nexus.gg/join/${data.name.toLowerCase().replace(/[^a-z0-9]/g, '-') || 'server'}-${Math.floor(1000 + Math.random() * 9000)}`;

    let categories = ['TEXT CHANNELS', 'VOICE CHANNELS'];
    let channels: ServerChannel[] = [
      { id: `${newId}-general`, name: 'general', type: 'text', category: 'TEXT CHANNELS', topic: 'Welcome to your new server!' },
      { id: `${newId}-lounge`, name: 'General Voice', type: 'voice', category: 'VOICE CHANNELS', topic: 'Talk with friends' },
    ];

    if (data.categoryTemplate === 'gaming') {
      categories = ['INFORMATION', 'GAMING SQUADS', 'VOICE COMMS'];
      channels = [
        { id: `${newId}-welcome`, name: 'welcome-and-rules', type: 'announcement', category: 'INFORMATION', topic: 'Rules for members' },
        { id: `${newId}-lfg`, name: 'lfg-squad', type: 'text', category: 'GAMING SQUADS', topic: 'Find duo and squad mates' },
        { id: `${newId}-clips`, name: 'game-clips', type: 'text', category: 'GAMING SQUADS', topic: 'Showcase your highlights' },
        { id: `${newId}-voice1`, name: 'Squad Voice 1', type: 'voice', category: 'VOICE COMMS', topic: 'High-comms voice' },
        { id: `${newId}-voice2`, name: 'Squad Voice 2', type: 'voice', category: 'VOICE COMMS', topic: 'Casual voice' },
      ];
    } else if (data.categoryTemplate === 'esports') {
      categories = ['ANNOUNCEMENTS', 'STRATEGY & SCOUTING', 'TOURNAMENT COMMS'];
      channels = [
        { id: `${newId}-ann`, name: 'announcements', type: 'announcement', category: 'ANNOUNCEMENTS', topic: 'Team alerts' },
        { id: `${newId}-strats`, name: 'tactics-and-meta', type: 'text', category: 'STRATEGY & SCOUTING', topic: 'VOD review & strats' },
        { id: `${newId}-scrims`, name: 'scrim-schedules', type: 'text', category: 'STRATEGY & SCOUTING', topic: 'Match dates' },
        { id: `${newId}-scrim-vc`, name: 'Match Stage Comms', type: 'voice', category: 'TOURNAMENT COMMS', topic: 'Live match voice' },
      ];
    }

    const roles: ServerRole[] = [
      { id: `${newId}-owner`, name: 'Server Owner', color: '#c084fc', hoist: true, permissions: ['ALL'] },
      { id: `${newId}-admin`, name: 'Admin', color: '#38bdf8', hoist: true, permissions: ['ADMIN'] },
      { id: `${newId}-member`, name: 'Member', color: '#94a3b8', hoist: false, permissions: ['SEND_MESSAGES'] },
    ];

    const newServer: Server = {
      id: newId,
      name: data.name,
      description: data.description || 'Welcome to our Nexus custom gaming community!',
      icon: data.icon || `https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=200&auto=format&fit=crop`,
      banner: data.banner || 'https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=1200&auto=format&fit=crop',
      ownerId: CURRENT_USER.id,
      isCustom: true,
      inviteCode,
      categories,
      channels,
      roles,
      invites: [
        {
          id: `inv-${Date.now()}`,
          code: inviteCode,
          url: `https://${inviteCode}`,
          createdAt: 'Just now',
          createdBy: CURRENT_USER.username,
          expiresIn: 'Never',
          maxUses: 0,
          uses: 0,
        }
      ],
      members: [
        { userId: CURRENT_USER.id, user: CURRENT_USER, roleIds: [`${newId}-owner`], joinedAt: new Date().toISOString().split('T')[0], isOwner: true },
        { userId: '2', user: COMMUNITY_MEMBERS[0], roleIds: [`${newId}-admin`], joinedAt: new Date().toISOString().split('T')[0] },
        { userId: '3', user: COMMUNITY_MEMBERS[1], roleIds: [`${newId}-member`], joinedAt: new Date().toISOString().split('T')[0] },
      ],
      createdAt: new Date().toISOString().split('T')[0],
    };

    const updated = [newServer, ...servers];
    this.saveServers(updated);

    // Seed initial message for first text channel
    const firstText = channels.find(c => c.type !== 'voice');
    if (firstText) {
      this.sendServerMessage(newId, firstText.id, {
        userId: CURRENT_USER.id,
        content: `🎉 Welcome to **${newServer.name}**! This server was custom created. Invite friends, configure roles, and jump into voice channels!`,
      });
    }

    return newServer;
  },

  deleteServer(serverId: string): void {
    const servers = this.getServers();
    const updated = servers.filter(s => s.id !== serverId);
    this.saveServers(updated);
  },

  addChannel(serverId: string, channel: Omit<ServerChannel, 'id'>): ServerChannel {
    const servers = this.getServers();
    const serverIndex = servers.findIndex(s => s.id === serverId);
    if (serverIndex === -1) throw new Error('Server not found');

    const newChannel: ServerChannel = {
      ...channel,
      id: `c-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    };

    servers[serverIndex].channels.push(newChannel);
    this.saveServers(servers);

    this.logAuditEvent(serverId, {
      action: 'CHANNEL_CREATE',
      actor: { id: CURRENT_USER.id, username: CURRENT_USER.username, avatar: CURRENT_USER.avatar },
      targetName: `#${newChannel.name}`,
      details: `Created ${newChannel.type} channel in category "${newChannel.category}"`,
    });

    return newChannel;
  },

  deleteChannel(serverId: string, channelId: string): void {
    const servers = this.getServers();
    const serverIndex = servers.findIndex(s => s.id === serverId);
    if (serverIndex === -1) return;

    const channelToDelete = servers[serverIndex].channels.find(c => c.id === channelId);
    servers[serverIndex].channels = servers[serverIndex].channels.filter(c => c.id !== channelId);
    this.saveServers(servers);

    if (channelToDelete) {
      this.logAuditEvent(serverId, {
        action: 'CHANNEL_DELETE',
        actor: { id: CURRENT_USER.id, username: CURRENT_USER.username, avatar: CURRENT_USER.avatar },
        targetName: `#${channelToDelete.name}`,
        details: `Deleted channel from category "${channelToDelete.category}"`,
      });
    }
  },

  addCategory(serverId: string, categoryName: string): void {
    const servers = this.getServers();
    const serverIndex = servers.findIndex(s => s.id === serverId);
    if (serverIndex === -1) return;

    if (!servers[serverIndex].categories.includes(categoryName)) {
      servers[serverIndex].categories.push(categoryName);
      this.saveServers(servers);
    }
  },

  // Message persistence
  getMessages(channelId: string): ServerMessage[] {
    if (typeof window === 'undefined') return INITIAL_MESSAGES[channelId] || [];
    try {
      const saved = localStorage.getItem(`${MESSAGES_STORAGE_PREFIX}${channelId}`);
      if (saved) return JSON.parse(saved);
    } catch (_) {}
    return INITIAL_MESSAGES[channelId] || [];
  },

  sendServerMessage(serverId: string, channelId: string, data: {
    userId: string;
    content: string;
    attachments?: string[];
    replyTo?: { id: string; username: string; content: string };
  }): ServerMessage {
    const msgs = this.getMessages(channelId);
    const now = new Date();
    const timeStr = `Today at ${now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;

    const newMsg: ServerMessage = {
      id: `m-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      channelId,
      userId: data.userId,
      content: data.content,
      timestamp: timeStr,
      attachments: data.attachments,
      replyTo: data.replyTo,
      reactions: [],
    };

    const updated = [...msgs, newMsg];
    try {
      localStorage.setItem(`${MESSAGES_STORAGE_PREFIX}${channelId}`, JSON.stringify(updated));
      window.dispatchEvent(new CustomEvent('nexus_channel_message_received', { detail: { serverId, channelId, message: newMsg } }));
    } catch (_) {}

    return newMsg;
  },

  toggleReaction(channelId: string, messageId: string, emoji: string, userId: string): void {
    const msgs = this.getMessages(channelId);
    const msg = msgs.find(m => m.id === messageId);
    if (!msg) return;

    if (!msg.reactions) msg.reactions = [];
    const existing = msg.reactions.find(r => r.emoji === emoji);

    if (existing) {
      if (existing.users.includes(userId)) {
        existing.users = existing.users.filter(u => u !== userId);
        existing.count = existing.users.length;
      } else {
        existing.users.push(userId);
        existing.count = existing.users.length;
      }
      msg.reactions = msg.reactions.filter(r => r.count > 0);
    } else {
      msg.reactions.push({ emoji, count: 1, users: [userId] });
    }

    try {
      localStorage.setItem(`${MESSAGES_STORAGE_PREFIX}${channelId}`, JSON.stringify(msgs));
      window.dispatchEvent(new CustomEvent('nexus_channel_message_received', { detail: { channelId, messageId } }));
    } catch (_) {}
  },

  togglePin(channelId: string, messageId: string): void {
    const msgs = this.getMessages(channelId);
    const msg = msgs.find(m => m.id === messageId);
    if (!msg) return;
    msg.isPinned = !msg.isPinned;
    try {
      localStorage.setItem(`${MESSAGES_STORAGE_PREFIX}${channelId}`, JSON.stringify(msgs));
      window.dispatchEvent(new CustomEvent('nexus_channel_message_received', { detail: { channelId, messageId } }));
    } catch (_) {}
  },

  // Role & Permissions Management
  addRole(serverId: string, roleData: Omit<ServerRole, 'id'>): ServerRole {
    const servers = this.getServers();
    const serverIndex = servers.findIndex(s => s.id === serverId);
    if (serverIndex === -1) throw new Error('Server not found');

    const newRole: ServerRole = {
      ...roleData,
      id: `r-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    };

    servers[serverIndex].roles.push(newRole);
    this.saveServers(servers);

    this.logAuditEvent(serverId, {
      action: 'ROLE_CREATE',
      actor: { id: CURRENT_USER.id, username: CURRENT_USER.username, avatar: CURRENT_USER.avatar },
      targetName: newRole.name,
      details: `Created new role with ${newRole.permissions.length} permissions (Color: ${newRole.color})`,
    });

    return newRole;
  },

  updateRole(serverId: string, roleId: string, roleData: Partial<ServerRole>): void {
    const servers = this.getServers();
    const serverIndex = servers.findIndex(s => s.id === serverId);
    if (serverIndex === -1) return;

    const roleIndex = servers[serverIndex].roles.findIndex(r => r.id === roleId);
    if (roleIndex === -1) return;

    const prevRole = servers[serverIndex].roles[roleIndex];
    servers[serverIndex].roles[roleIndex] = {
      ...prevRole,
      ...roleData,
    };
    this.saveServers(servers);

    this.logAuditEvent(serverId, {
      action: 'ROLE_UPDATE',
      actor: { id: CURRENT_USER.id, username: CURRENT_USER.username, avatar: CURRENT_USER.avatar },
      targetName: roleData.name || prevRole.name,
      details: `Updated role properties & permissions`,
    });
  },

  deleteRole(serverId: string, roleId: string): void {
    const servers = this.getServers();
    const serverIndex = servers.findIndex(s => s.id === serverId);
    if (serverIndex === -1) return;

    const roleToDelete = servers[serverIndex].roles.find(r => r.id === roleId);
    servers[serverIndex].roles = servers[serverIndex].roles.filter(r => r.id !== roleId);
    // Remove deleted role from any members who had it
    servers[serverIndex].members = servers[serverIndex].members.map(m => ({
      ...m,
      roleIds: m.roleIds.filter(rid => rid !== roleId),
    }));

    this.saveServers(servers);

    if (roleToDelete) {
      this.logAuditEvent(serverId, {
        action: 'ROLE_DELETE',
        actor: { id: CURRENT_USER.id, username: CURRENT_USER.username, avatar: CURRENT_USER.avatar },
        targetName: roleToDelete.name,
        details: `Deleted role and unassigned from members`,
      });
    }
  },

  assignMemberRole(serverId: string, userId: string, roleId: string): void {
    const servers = this.getServers();
    const serverIndex = servers.findIndex(s => s.id === serverId);
    if (serverIndex === -1) return;

    const memberIndex = servers[serverIndex].members.findIndex(m => m.userId === userId);
    if (memberIndex === -1) return;

    const targetMember = servers[serverIndex].members[memberIndex];
    const targetRole = servers[serverIndex].roles.find(r => r.id === roleId);

    if (!targetMember.roleIds.includes(roleId)) {
      targetMember.roleIds.push(roleId);
      this.saveServers(servers);

      this.logAuditEvent(serverId, {
        action: 'ROLE_ASSIGN',
        actor: { id: CURRENT_USER.id, username: CURRENT_USER.username, avatar: CURRENT_USER.avatar },
        targetName: targetMember.user.username,
        targetId: userId,
        details: `Assigned role "${targetRole?.name || 'Role'}"`,
      });
    }
  },

  removeMemberRole(serverId: string, userId: string, roleId: string): void {
    const servers = this.getServers();
    const serverIndex = servers.findIndex(s => s.id === serverId);
    if (serverIndex === -1) return;

    const memberIndex = servers[serverIndex].members.findIndex(m => m.userId === userId);
    if (memberIndex === -1) return;

    const targetMember = servers[serverIndex].members[memberIndex];
    const targetRole = servers[serverIndex].roles.find(r => r.id === roleId);

    targetMember.roleIds = targetMember.roleIds.filter(rid => rid !== roleId);
    this.saveServers(servers);

    this.logAuditEvent(serverId, {
      action: 'ROLE_REVOKE',
      actor: { id: CURRENT_USER.id, username: CURRENT_USER.username, avatar: CURRENT_USER.avatar },
      targetName: targetMember.user.username,
      targetId: userId,
      details: `Removed role "${targetRole?.name || 'Role'}"`,
    });
  },

  // Invite Management
  getInvites(serverId: string): ServerInvite[] {
    const servers = this.getServers();
    const server = servers.find(s => s.id === serverId);
    if (!server) return [];
    if (!server.invites || server.invites.length === 0) {
      // Seed default invite if empty
      const defaultInv: ServerInvite = {
        id: `inv-${server.id}-default`,
        code: server.inviteCode || `nexus.gg/join/${server.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}-101`,
        url: `https://${server.inviteCode || `nexus.gg/join/${server.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}-101`}`,
        createdAt: 'Permanent Link',
        createdBy: 'Server Creator',
        expiresIn: 'Never',
        maxUses: 0,
        uses: 3,
      };
      server.invites = [defaultInv];
      this.saveServers(servers);
      return [defaultInv];
    }
    return server.invites;
  },

  generateInvite(serverId: string, options?: { expiresIn?: string; maxUses?: number }): ServerInvite {
    const servers = this.getServers();
    const serverIndex = servers.findIndex(s => s.id === serverId);
    if (serverIndex === -1) throw new Error('Server not found');

    const server = servers[serverIndex];
    if (!server.invites) server.invites = [];

    // Unique random token generator
    const randomHex = Math.random().toString(36).substring(2, 7) + Math.random().toString(36).substring(2, 5);
    const serverSlug = server.name.toLowerCase().replace(/[^a-z0-9]/g, '-').slice(0, 15) || 'server';
    const code = `nexus.gg/join/${serverSlug}-${randomHex}`;
    const url = `https://${code}`;

    const newInvite: ServerInvite = {
      id: `inv-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      code,
      url,
      createdAt: 'Just now',
      createdBy: CURRENT_USER.username,
      expiresIn: options?.expiresIn || '7 days',
      maxUses: options?.maxUses ?? 0,
      uses: 0,
    };

    server.invites.unshift(newInvite);
    // Also update server default inviteCode to this freshly generated one
    server.inviteCode = code;
    this.saveServers(servers);

    this.logAuditEvent(serverId, {
      action: 'INVITE_CREATE',
      actor: { id: CURRENT_USER.id, username: CURRENT_USER.username, avatar: CURRENT_USER.avatar },
      targetName: code,
      details: `Generated invite link (${options?.expiresIn || '7 days'}, ${options?.maxUses ? `${options.maxUses} max uses` : 'unlimited'})`,
    });

    return newInvite;
  },

  revokeInvite(serverId: string, inviteId: string): void {
    const servers = this.getServers();
    const serverIndex = servers.findIndex(s => s.id === serverId);
    if (serverIndex === -1) return;

    if (servers[serverIndex].invites) {
      const revoked = servers[serverIndex].invites!.find(inv => inv.id !== inviteId);
      servers[serverIndex].invites = servers[serverIndex].invites!.filter(inv => inv.id !== inviteId);
      this.saveServers(servers);

      if (revoked) {
        this.logAuditEvent(serverId, {
          action: 'INVITE_REVOKE',
          actor: { id: CURRENT_USER.id, username: CURRENT_USER.username, avatar: CURRENT_USER.avatar },
          targetName: revoked.code,
          details: `Revoked invite code`,
        });
      }
    }
  },

  joinServerByInvite(inviteQuery: string, user: User): { success: boolean; server?: Server; message: string } {
    const cleanQuery = inviteQuery.trim().toLowerCase().replace(/^https?:\/\//, '').replace(/\/$/, '');
    const servers = this.getServers();

    const targetServer = servers.find(s => {
      const mainCode = s.inviteCode.toLowerCase().replace(/^https?:\/\//, '').replace(/\/$/, '');
      if (mainCode === cleanQuery || cleanQuery.includes(mainCode) || mainCode.includes(cleanQuery)) return true;
      if (s.invites?.some(inv => {
        const invCode = inv.code.toLowerCase().replace(/^https?:\/\//, '').replace(/\/$/, '');
        return invCode === cleanQuery || cleanQuery.includes(invCode) || invCode.includes(cleanQuery);
      })) return true;
      return false;
    });

    if (!targetServer) {
      return { success: false, message: 'Invalid or expired invite code. Please verify the link.' };
    }

    // Check if user is already a member
    const alreadyMember = targetServer.members.some(m => m.userId === user.id);
    if (alreadyMember) {
      return { success: true, server: targetServer, message: `You are already a member of ${targetServer.name}!` };
    }

    // Assign default member role
    const defaultRole = targetServer.roles.find(r => r.name.toLowerCase().includes('member')) || targetServer.roles[targetServer.roles.length - 1];

    const newMember: ServerMember = {
      userId: user.id,
      user,
      roleIds: defaultRole ? [defaultRole.id] : [],
      joinedAt: new Date().toISOString().split('T')[0],
    };

    targetServer.members.push(newMember);

    // Update invite usage count if matched
    if (targetServer.invites) {
      const matchedInv = targetServer.invites.find(inv => {
        const invCode = inv.code.toLowerCase().replace(/^https?:\/\//, '');
        return invCode === cleanQuery || cleanQuery.includes(invCode);
      });
      if (matchedInv) {
        matchedInv.uses += 1;
      }
    }

    this.saveServers(servers);

    this.logAuditEvent(targetServer.id, {
      action: 'MEMBER_JOIN',
      actor: { id: user.id, username: user.username, avatar: user.avatar },
      targetName: user.username,
      targetId: user.id,
      details: `Joined server via invite link (${cleanQuery})`,
    });

    return { success: true, server: targetServer, message: `Successfully joined ${targetServer.name}!` };
  },

  // Audit Logs
  getAuditLogs(serverId: string): AuditLogEntry[] {
    const servers = this.getServers();
    const server = servers.find(s => s.id === serverId);
    return server?.auditLogs || [];
  },

  logAuditEvent(serverId: string, entry: Omit<AuditLogEntry, 'id' | 'serverId' | 'timestamp'>): AuditLogEntry {
    const servers = this.getServers();
    const serverIndex = servers.findIndex(s => s.id === serverId);
    if (serverIndex === -1) throw new Error('Server not found');

    const now = new Date();
    const timeStr = `Today at ${now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;

    const newLog: AuditLogEntry = {
      ...entry,
      id: `al-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      serverId,
      timestamp: timeStr,
    };

    if (!servers[serverIndex].auditLogs) {
      servers[serverIndex].auditLogs = [];
    }
    servers[serverIndex].auditLogs!.unshift(newLog);
    if (servers[serverIndex].auditLogs!.length > 100) {
      servers[serverIndex].auditLogs = servers[serverIndex].auditLogs!.slice(0, 100);
    }

    this.saveServers(servers);
    return newLog;
  }
};
