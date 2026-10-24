export interface User {
  id: string;
  username: string;
  avatar: string;
  status: 'online' | 'idle' | 'dnd' | 'offline';
  email?: string;
  provider?: string;
  createdAt?: string;
}

export interface GamingTask {
  id: string;
  title: string;
  xp: number;
  completed: boolean;
  type: 'daily' | 'weekly';
  category?: 'Daily Login' | 'Social Engagement' | 'Stream Performance';
  coins?: number;
  description?: string;
}

export interface VideoPost {
  id: string;
  title: string;
  thumbnail: string;
  views: string;
  author: string;
  duration: string;
  category?: string;
  tags?: string[];
  kidFriendly?: boolean;
  videoUrl?: string;
  likes?: number;
  description?: string;
  channelAvatar?: string;
  uploadDate?: string;
  sourceType?: 'youtube' | 'twitch' | 'direct';
  youtubeId?: string;
  twitchChannel?: string;
  isLive?: boolean;
  isFreshUpload?: boolean;
  syncTimestamp?: number;
}

export interface ScoredVideo extends VideoPost {
  score: number;
  matchPercentage: number;
  reasonBadge: string;
  userWatchDuration: number;
  isLikedByUser: boolean;
  isFreshUpload?: boolean;
  syncTimestamp?: number;
}

export interface CreatorChannel {
  id: string;
  name: string;
  handle: string;
  platform: 'youtube' | 'twitch' | 'both';
  avatar: string;
  banner: string;
  subscribers: string;
  verified: boolean;
  bio: string;
  category: string;
  isLive?: boolean;
  twitchChannel?: string;
  youtubeChannelId?: string;
  videos: VideoPost[];
  kidFriendly?: boolean;
}

export interface UserTasteProfile {
  watchDurations: Record<string, number>; // videoId -> seconds
  completedVideos: Record<string, number>; // videoId -> count
  likedVideoIds: string[];
  searchHistory: string[];
  categoryAffinities: Record<string, number>; // category -> points
  tagAffinities: Record<string, number>; // tag -> points
  creatorAffinities?: Record<string, number>; // creator channel name -> points
  lastRefreshTimestamp?: number;
  lastUpdated: string;
}

export interface StatPoint {
  date: string;
  kills: number;
  deaths: number;
  assists: number;
  winRate: number;
}

export interface LeaderboardEntry {
  rank: number;
  user: User;
  score: number;
  trend: 'up' | 'down' | 'same';
}

export type Theme = 'dark' | 'light';

export type ViewState = 'login' | 'home' | 'dashboard' | 'voice' | 'social' | 'tasks' | 'settings' | 'friends' | 'chat' | 'metapulse' | 'servers';

export type ChannelType = 'text' | 'voice' | 'announcement';

export interface ServerRole {
  id: string;
  name: string;
  color: string;
  hoist: boolean;
  permissions: string[];
}

export interface ServerChannel {
  id: string;
  name: string;
  type: ChannelType;
  category: string;
  topic?: string;
  unreadCount?: number;
  isPrivate?: boolean;
}

export interface ServerMember {
  userId: string;
  user: User;
  roleIds: string[];
  joinedAt: string;
  isOwner?: boolean;
  isMuted?: boolean;
  isDeafened?: boolean;
  isSpeaking?: boolean;
}

export interface ServerMessage {
  id: string;
  channelId: string;
  userId: string;
  content: string;
  timestamp: string;
  attachments?: string[];
  isPinned?: boolean;
  reactions?: { emoji: string; count: number; users: string[] }[];
  replyTo?: { id: string; username: string; content: string };
}

export interface ServerInvite {
  id: string;
  code: string;
  url: string;
  createdAt: string;
  createdBy: string;
  expiresIn?: string; // e.g. '7 days', '24 hours', 'Never'
  maxUses?: number; // 0 or undefined for unlimited
  uses: number;
}

export type AuditLogAction = 
  | 'MEMBER_JOIN'
  | 'MEMBER_LEAVE'
  | 'ROLE_CREATE'
  | 'ROLE_UPDATE'
  | 'ROLE_DELETE'
  | 'ROLE_ASSIGN'
  | 'ROLE_REVOKE'
  | 'CHANNEL_CREATE'
  | 'CHANNEL_DELETE'
  | 'CHANNEL_UPDATE'
  | 'INVITE_CREATE'
  | 'INVITE_REVOKE'
  | 'SERVER_UPDATE';

export interface AuditLogEntry {
  id: string;
  serverId: string;
  action: AuditLogAction;
  actor: {
    id: string;
    username: string;
    avatar?: string;
  };
  targetName?: string;
  targetId?: string;
  details?: string;
  timestamp: string;
}

export interface Server {
  id: string;
  name: string;
  icon?: string;
  banner?: string;
  description: string;
  ownerId: string;
  isCustom?: boolean;
  inviteCode: string;
  invites?: ServerInvite[];
  categories: string[];
  channels: ServerChannel[];
  roles: ServerRole[];
  members: ServerMember[];
  auditLogs?: AuditLogEntry[];
  createdAt: string;
}