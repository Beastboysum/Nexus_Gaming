import { CreatorChannel, VideoPost } from '../types';

export const CREATOR_DIRECTORY: CreatorChannel[] = [
  {
    id: 'tenz',
    name: 'Tyson Ngo (TenZ)',
    handle: '@TenZ',
    platform: 'both',
    avatar: 'https://images.unsplash.com/photo-1566492031773-4f4e44671857?q=80&w=400&auto=format&fit=crop',
    banner: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=1600&auto=format&fit=crop',
    subscribers: '3.8M subscribers • 4.1M Twitch followers',
    verified: true,
    bio: 'Professional Valorant champion & Sentinels creator. Radiant masterclasses, aim routines, and clutch tournament highlights.',
    category: 'Valorant',
    isLive: true,
    twitchChannel: 'tenz',
    youtubeChannelId: 'TenZ',
    kidFriendly: false,
    videos: [
      {
        id: 'tenz-vid-1',
        title: 'The VALORANT Ultimate Guide for Beginners !! | SEN TenZ',
        thumbnail: 'https://i.ytimg.com/vi/3xjpx8-2gD0/maxresdefault.jpg',
        views: '4.2M views',
        author: 'TenZ',
        duration: '23:04',
        category: 'Valorant',
        tags: ['Valorant', 'Aim', 'Pro Guide', 'Radiant'],
        sourceType: 'youtube',
        youtubeId: '3xjpx8-2gD0',
        videoUrl: 'https://www.youtube.com/watch?v=3xjpx8-2gD0',
        channelAvatar: 'https://images.unsplash.com/photo-1566492031773-4f4e44671857?q=80&w=400&auto=format&fit=crop',
        likes: 340000,
        kidFriendly: false
      },
      {
        id: 'tenz-vid-2',
        title: 'LOUD vs. VIT — FULL MATCH — VALORANT Champions Shanghai',
        thumbnail: 'https://i.ytimg.com/vi/lXdvR5iMU3Y/maxresdefault.jpg',
        views: '1.5M views',
        author: 'VALORANT Champions Tour',
        duration: '2:22:01',
        category: 'Valorant',
        tags: ['Valorant', 'VCT', 'Competitive'],
        sourceType: 'youtube',
        youtubeId: 'lXdvR5iMU3Y',
        videoUrl: 'https://www.youtube.com/watch?v=lXdvR5iMU3Y',
        channelAvatar: 'https://images.unsplash.com/photo-1566492031773-4f4e44671857?q=80&w=400&auto=format&fit=crop',
        likes: 180000,
        kidFriendly: false
      },
      {
        id: 'tenz-stream-live',
        title: 'TenZ Live Ranked Grind - Solo Queue to Rank 1 Radiant',
        thumbnail: 'https://static-cdn.jtvnw.net/previews-ttv/live_user_tenz-1280x720.jpg',
        views: '42.5K watching',
        author: 'TenZ',
        duration: 'LIVE',
        category: 'Valorant',
        tags: ['Twitch', 'Live', 'Pro', 'Radiant'],
        sourceType: 'twitch',
        twitchChannel: 'tenz',
        videoUrl: 'https://twitch.tv/tenz',
        channelAvatar: 'https://images.unsplash.com/photo-1566492031773-4f4e44671857?q=80&w=400&auto=format&fit=crop',
        likes: 95000,
        isLive: true,
        kidFriendly: false
      }
    ]
  },
  {
    id: 'tarik',
    name: 'Tarik Celik (tarik)',
    handle: '@tarik',
    platform: 'both',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=400&auto=format&fit=crop',
    banner: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?q=80&w=1600&auto=format&fit=crop',
    subscribers: '1.9M subscribers • 3.2M Twitch followers',
    verified: true,
    bio: 'CS:GO Major MVP turned King of Valorant Watch Parties & high-energy competitive streaming.',
    category: 'Valorant',
    isLive: true,
    twitchChannel: 'tarik',
    youtubeChannelId: 'tarik',
    kidFriendly: false,
    videos: [
      {
        id: 'tarik-stream-1',
        title: 'VCT AMERICAS WATCH PARTY & HIGH ELO WITH PROS',
        thumbnail: 'https://static-cdn.jtvnw.net/previews-ttv/live_user_tarik-1280x720.jpg',
        views: '85.3K watching',
        author: 'Tarik',
        duration: 'LIVE',
        category: 'Valorant',
        tags: ['Watch Party', 'Esports', 'Live Stream', 'Twitch'],
        sourceType: 'twitch',
        twitchChannel: 'tarik',
        videoUrl: 'https://twitch.tv/tarik',
        channelAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=400&auto=format&fit=crop',
        likes: 290000,
        isLive: true,
        kidFriendly: false
      },
      {
        id: 'tarik-vid-1',
        title: 'The VALORANT Ultimate Guide for Beginners !! | SEN TenZ',
        thumbnail: 'https://i.ytimg.com/vi/3xjpx8-2gD0/maxresdefault.jpg',
        views: '1.4M views',
        author: 'Tarik',
        duration: '23:04',
        category: 'Valorant',
        tags: ['Clutch', 'Sheriff', 'Funny', 'Ace'],
        sourceType: 'youtube',
        youtubeId: '3xjpx8-2gD0',
        videoUrl: 'https://www.youtube.com/watch?v=3xjpx8-2gD0',
        channelAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=400&auto=format&fit=crop',
        likes: 120000,
        kidFriendly: false
      }
    ]
  },
  {
    id: 'mrbeast',
    name: 'MrBeast Gaming & Main',
    handle: '@MrBeast',
    platform: 'youtube',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=400&auto=format&fit=crop',
    banner: 'https://images.unsplash.com/photo-1579202673506-ca3ce28943ef?q=80&w=1600&auto=format&fit=crop',
    subscribers: '330M subscribers',
    verified: true,
    bio: 'Wildest gaming challenges, massive Minecraft competitions, and giving millions of dollars to gamers and subscribers.',
    category: 'Entertainment & Gaming',
    youtubeChannelId: 'MrBeast',
    kidFriendly: true,
    videos: [
      {
        id: 'mrbeast-vid-1',
        title: '$456,000 Squid Game In Real Life!',
        thumbnail: 'https://i.ytimg.com/vi/0e3GPea1Tyg/maxresdefault.jpg',
        views: '650M views',
        author: 'MrBeast Gaming',
        duration: '25:41',
        category: 'Entertainment',
        tags: ['Challenge', 'MrBeast', 'Kids'],
        sourceType: 'youtube',
        youtubeId: '0e3GPea1Tyg',
        videoUrl: 'https://www.youtube.com/watch?v=0e3GPea1Tyg',
        channelAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=400&auto=format&fit=crop',
        likes: 18000000,
        kidFriendly: true
      },
      {
        id: 'mrbeast-vid-2',
        title: 'I Built THE ULTIMATE TREE HOUSE in Minecraft Hardcore',
        thumbnail: 'https://i.ytimg.com/vi/YiiHhT7NdGk/maxresdefault.jpg',
        views: '94M views',
        author: 'MrBeast Gaming',
        duration: '19:28',
        category: 'Minecraft',
        tags: ['Minecraft', 'Building', 'Prizes', 'Fun'],
        sourceType: 'youtube',
        youtubeId: 'YiiHhT7NdGk',
        videoUrl: 'https://www.youtube.com/watch?v=YiiHhT7NdGk',
        channelAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=400&auto=format&fit=crop',
        likes: 3800000,
        kidFriendly: true
      }
    ]
  },
  {
    id: 'dantdm',
    name: 'DanTDM',
    handle: '@DanTDM',
    platform: 'youtube',
    avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?q=80&w=400&auto=format&fit=crop',
    banner: 'https://images.unsplash.com/photo-1607677914754-58a36d240214?q=80&w=1600&auto=format&fit=crop',
    subscribers: '29.2M subscribers',
    verified: true,
    bio: 'Gaming adventures, Minecraft Hardcore survival, Roblox fun, and family-friendly laughs with Dan & Dr. Trayaurus!',
    category: 'Minecraft & Roblox',
    youtubeChannelId: 'DanTDM',
    kidFriendly: true,
    videos: [
      {
        id: 'dantdm-vid-1',
        title: 'I Built THE ULTIMATE TREE HOUSE in Minecraft Hardcore',
        thumbnail: 'https://i.ytimg.com/vi/YiiHhT7NdGk/maxresdefault.jpg',
        views: '8.4M views',
        author: 'DanTDM',
        duration: '19:28',
        category: 'Minecraft',
        tags: ['Minecraft', 'Hardcore', 'Kids', 'Survival', 'DanTDM'],
        sourceType: 'youtube',
        youtubeId: 'YiiHhT7NdGk',
        videoUrl: 'https://www.youtube.com/watch?v=YiiHhT7NdGk',
        channelAvatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?q=80&w=400&auto=format&fit=crop',
        likes: 620000,
        kidFriendly: true
      },
      {
        id: 'dantdm-vid-2',
        title: "LAVA BARRY'S PRISON RUN Escape In Roblox",
        thumbnail: 'https://i.ytimg.com/vi/R3Eos53EsfE/maxresdefault.jpg',
        views: '5.1M views',
        author: 'DanTDM',
        duration: '15:03',
        category: 'Roblox',
        tags: ['Roblox', 'Obby', 'Kids', 'Funny'],
        sourceType: 'youtube',
        youtubeId: 'R3Eos53EsfE',
        videoUrl: 'https://www.youtube.com/watch?v=R3Eos53EsfE',
        channelAvatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?q=80&w=400&auto=format&fit=crop',
        likes: 410000,
        kidFriendly: true
      }
    ]
  },
  {
    id: 'forgelabs',
    name: 'Forge Labs',
    handle: '@ForgeLabs',
    platform: 'youtube',
    avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?q=80&w=400&auto=format&fit=crop',
    banner: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=1600&auto=format&fit=crop',
    subscribers: '6.4M subscribers',
    verified: true,
    bio: 'Epic cinematic 100 Days survival stories in Minecraft, zombie apocalypses, and fantasy modded universes.',
    category: 'Minecraft Survival',
    youtubeChannelId: 'ForgeLabs',
    kidFriendly: true,
    videos: [
      {
        id: 'forgelabs-vid-1',
        title: 'I Survived 1000 Days in Minecraft Hardcore [MOVIE]',
        thumbnail: 'https://i.ytimg.com/vi/3n72DQR6WKk/maxresdefault.jpg',
        views: '24M views',
        author: 'Forge Labs',
        duration: '2:44:24',
        category: 'Minecraft',
        tags: ['Minecraft', '100 Days', 'Hardcore', 'Story'],
        sourceType: 'youtube',
        youtubeId: '3n72DQR6WKk',
        videoUrl: 'https://www.youtube.com/watch?v=3n72DQR6WKk',
        channelAvatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?q=80&w=400&auto=format&fit=crop',
        likes: 1100000,
        kidFriendly: true
      }
    ]
  },
  {
    id: 'shroud',
    name: 'Michael Grzesiek (Shroud)',
    handle: '@shroud',
    platform: 'both',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=400&auto=format&fit=crop',
    banner: 'https://images.unsplash.com/photo-1542751110-97427bbecf20?q=80&w=1600&auto=format&fit=crop',
    subscribers: '6.8M subscribers • 10.9M Twitch followers',
    verified: true,
    bio: 'The human aimbot. Former CS:GO professional player, variety gaming enthusiast, and tactical shooter specialist.',
    category: 'FPS & CS2',
    isLive: false,
    twitchChannel: 'shroud',
    youtubeChannelId: 'shroud',
    kidFriendly: false,
    videos: [
      {
        id: 'shroud-vid-1',
        title: 'Counter-Strike 2 - Official Launch Trailer & Highlights',
        thumbnail: 'https://i.ytimg.com/vi/c80dVYcL69E/maxresdefault.jpg',
        views: '5.6M views',
        author: 'Shroud',
        duration: '13:55',
        category: 'Counter-Strike 2',
        tags: ['CS2', 'Highlights', 'Pro Play'],
        sourceType: 'youtube',
        youtubeId: 'c80dVYcL69E',
        videoUrl: 'https://www.youtube.com/watch?v=c80dVYcL69E',
        channelAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=400&auto=format&fit=crop',
        likes: 145000,
        kidFriendly: false
      }
    ]
  },
  {
    id: 'vaatividya',
    name: 'VaatiVidya',
    handle: '@VaatiVidya',
    platform: 'youtube',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=400&auto=format&fit=crop',
    banner: 'https://images.unsplash.com/photo-1593508512255-86ab42a8e620?q=80&w=1600&auto=format&fit=crop',
    subscribers: '3.1M subscribers',
    verified: true,
    bio: 'The definitive voice in Elden Ring, Dark Souls, and Bloodborne lore, secret discoveries, and boss guides.',
    category: 'RPG & Elden Ring',
    youtubeChannelId: 'VaatiVidya',
    kidFriendly: false,
    videos: [
      {
        id: 'vaati-vid-1',
        title: 'What Boss Order to BEAT the Shadow of the Erdtree DLC ► Elden Ring',
        thumbnail: 'https://i.ytimg.com/vi/qXKvuRw-4R0/maxresdefault.jpg',
        views: '3.1M views',
        author: 'VaatiVidya',
        duration: '32:37',
        category: 'RPG & Action',
        tags: ['Elden Ring', 'Boss Fight', 'Secrets', 'Lore'],
        sourceType: 'youtube',
        youtubeId: 'qXKvuRw-4R0',
        videoUrl: 'https://www.youtube.com/watch?v=qXKvuRw-4R0',
        channelAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=400&auto=format&fit=crop',
        likes: 290000,
        kidFriendly: false
      }
    ]
  },
  {
    id: 'minecraft',
    name: 'Minecraft Championship & Official',
    handle: '@Minecraft',
    platform: 'both',
    avatar: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=400&auto=format&fit=crop',
    banner: 'https://images.unsplash.com/photo-1607677914754-58a36d240214?q=80&w=1600&auto=format&fit=crop',
    subscribers: '12M subscribers • 2M Twitch followers',
    verified: true,
    bio: 'The official home of Minecraft Live, championship tournament broadcasts, and community updates.',
    category: 'Minecraft',
    isLive: true,
    twitchChannel: 'minecraft',
    kidFriendly: true,
    videos: [
      {
        id: 'minecraft-stream-1',
        title: 'Minecraft Championship Creator Live Stream Showcase',
        thumbnail: 'https://static-cdn.jtvnw.net/previews-ttv/live_user_minecraft-1280x720.jpg',
        views: '68.1K watching',
        author: 'Minecraft Live',
        duration: 'LIVE',
        category: 'Minecraft',
        tags: ['Minecraft', 'Twitch', 'Live', 'Tournament'],
        sourceType: 'twitch',
        twitchChannel: 'minecraft',
        videoUrl: 'https://twitch.tv/minecraft',
        channelAvatar: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=400&auto=format&fit=crop',
        likes: 195000,
        isLive: true,
        kidFriendly: true
      }
    ]
  },
  {
    id: 'riotgames',
    name: 'Riot Games Esports & LCK',
    handle: '@RiotGames',
    platform: 'both',
    avatar: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=400&auto=format&fit=crop',
    banner: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?q=1600&auto=format&fit=crop',
    subscribers: '15M subscribers • 7M Twitch followers',
    verified: true,
    bio: 'World championships, VCT international tournaments, and LCK/LEC League of Legends grand finals broadcasts.',
    category: 'Esports',
    isLive: true,
    twitchChannel: 'riotgames',
    kidFriendly: false,
    videos: [
      {
        id: 'riot-stream-1',
        title: 'Riot Games World Championship Live Broadcast Stream',
        thumbnail: 'https://static-cdn.jtvnw.net/previews-ttv/live_user_riotgames-1280x720.jpg',
        views: '245K watching',
        author: 'Riot Games Official',
        duration: 'LIVE',
        category: 'Esports',
        tags: ['Esports', 'Twitch', 'Championship', 'Pro'],
        sourceType: 'twitch',
        twitchChannel: 'riotgames',
        videoUrl: 'https://twitch.tv/riotgames',
        channelAvatar: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=400&auto=format&fit=crop',
        likes: 410000,
        isLive: true,
        kidFriendly: false
      }
    ]
  },
  {
    id: 'pewdiepie',
    name: 'PewDiePie',
    handle: '@PewDiePie',
    platform: 'youtube',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=400&auto=format&fit=crop',
    banner: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?q=80&w=1600&auto=format&fit=crop',
    subscribers: '111M subscribers',
    verified: true,
    bio: 'The legend of YouTube gaming. Hilarious gameplay reactions, Minecraft epics, and legendary meme reviews.',
    category: 'Gaming & Comedy',
    youtubeChannelId: 'PewDiePie',
    kidFriendly: false,
    videos: [
      {
        id: 'pew-vid-1',
        title: '$456,000 Squid Game In Real Life!',
        thumbnail: 'https://i.ytimg.com/vi/0e3GPea1Tyg/maxresdefault.jpg',
        views: '54M views',
        author: 'PewDiePie',
        duration: '24:18',
        category: 'Minecraft',
        tags: ['Minecraft', 'PewDiePie', 'Survival'],
        sourceType: 'youtube',
        youtubeId: '0e3GPea1Tyg',
        videoUrl: 'https://www.youtube.com/watch?v=0e3GPea1Tyg',
        channelAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=400&auto=format&fit=crop',
        likes: 2400000,
        kidFriendly: false
      },
      {
        id: 'pew-vid-2',
        title: 'What Boss Order to BEAT the Shadow of the Erdtree DLC',
        thumbnail: 'https://i.ytimg.com/vi/qXKvuRw-4R0/maxresdefault.jpg',
        views: '6.8M views',
        author: 'PewDiePie',
        duration: '18:50',
        category: 'Elden Ring',
        tags: ['Elden Ring', 'Boss Fight', 'Funny'],
        sourceType: 'youtube',
        youtubeId: 'qXKvuRw-4R0',
        videoUrl: 'https://www.youtube.com/watch?v=qXKvuRw-4R0',
        channelAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=400&auto=format&fit=crop',
        likes: 420000,
        kidFriendly: false
      }
    ]
  },
  {
    id: 'kaicenat',
    name: 'Kai Cenat',
    handle: '@KaiCenat',
    platform: 'both',
    avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?q=80&w=400&auto=format&fit=crop',
    banner: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=1600&auto=format&fit=crop',
    subscribers: '10.5M subscribers • 13.8M Twitch followers',
    verified: true,
    bio: 'Record-breaking Twitch streamer of the year. Elden Ring 100+ hour marathon marathons, GTA RP, and high-energy broadcasts.',
    category: 'Variety & Elden Ring',
    isLive: true,
    twitchChannel: 'kaicenat',
    youtubeChannelId: 'KaiCenat',
    kidFriendly: false,
    videos: [
      {
        id: 'kai-stream-1',
        title: 'KAI CENAT LIVE - VARIETY GAMING & SPECIAL GUESTS',
        thumbnail: 'https://static-cdn.jtvnw.net/previews-ttv/live_user_kaicenat-1280x720.jpg',
        views: '110K watching',
        author: 'Kai Cenat',
        duration: 'LIVE',
        category: 'Variety',
        tags: ['Twitch', 'Live', 'Kai Cenat', 'Marathon'],
        sourceType: 'twitch',
        twitchChannel: 'kaicenat',
        videoUrl: 'https://twitch.tv/kaicenat',
        channelAvatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?q=80&w=400&auto=format&fit=crop',
        likes: 520000,
        isLive: true,
        kidFriendly: false
      },
      {
        id: 'kai-vid-1',
        title: 'What Boss Order to BEAT the Shadow of the Erdtree DLC',
        thumbnail: 'https://i.ytimg.com/vi/qXKvuRw-4R0/maxresdefault.jpg',
        views: '9.2M views',
        author: 'Kai Cenat',
        duration: '28:15',
        category: 'Elden Ring',
        tags: ['Elden Ring', 'Malenia', 'Reaction', 'Marathon'],
        sourceType: 'youtube',
        youtubeId: 'qXKvuRw-4R0',
        videoUrl: 'https://www.youtube.com/watch?v=qXKvuRw-4R0',
        channelAvatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?q=80&w=400&auto=format&fit=crop',
        likes: 640000,
        kidFriendly: false
      }
    ]
  },
  {
    id: 'ninja',
    name: 'Tyler Blevins (Ninja)',
    handle: '@Ninja',
    platform: 'both',
    avatar: 'https://images.unsplash.com/photo-1566492031773-4f4e44671857?q=80&w=400&auto=format&fit=crop',
    banner: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=1600&auto=format&fit=crop',
    subscribers: '23.8M subscribers • 19.1M Twitch followers',
    verified: true,
    bio: 'Gaming icon & Fortnite pioneer. High-skill Battle Royale victories, competitive gameplay, and live Twitch streams.',
    category: 'Battle Royale & Fortnite',
    isLive: true,
    twitchChannel: 'ninja',
    youtubeChannelId: 'Ninja',
    kidFriendly: true,
    videos: [
      {
        id: 'ninja-stream-1',
        title: 'NINJA LIVE - FORTNITE SQUAD VICTORY ROYALES',
        thumbnail: 'https://static-cdn.jtvnw.net/previews-ttv/live_user_ninja-1280x720.jpg',
        views: '35K watching',
        author: 'Ninja',
        duration: 'LIVE',
        category: 'Fortnite',
        tags: ['Fortnite', 'Battle Royale', 'Ninja', 'Twitch'],
        sourceType: 'twitch',
        twitchChannel: 'ninja',
        videoUrl: 'https://twitch.tv/ninja',
        channelAvatar: 'https://images.unsplash.com/photo-1566492031773-4f4e44671857?q=80&w=400&auto=format&fit=crop',
        likes: 310000,
        isLive: true,
        kidFriendly: true
      },
      {
        id: 'ninja-vid-1',
        title: 'ROCKET LEAGUE BEST OF INSANITY',
        thumbnail: 'https://i.ytimg.com/vi/9eOUDbbePII/maxresdefault.jpg',
        views: '12.4M views',
        author: 'Ninja',
        duration: '14:20',
        category: 'Highlights',
        tags: ['Sniper', 'Clutch', 'Highlights'],
        sourceType: 'youtube',
        youtubeId: '9eOUDbbePII',
        videoUrl: 'https://www.youtube.com/watch?v=9eOUDbbePII',
        channelAvatar: 'https://images.unsplash.com/photo-1566492031773-4f4e44671857?q=80&w=400&auto=format&fit=crop',
        likes: 540000,
        kidFriendly: true
      }
    ]
  },
  {
    id: 'aphmau',
    name: 'Aphmau',
    handle: '@Aphmau',
    platform: 'youtube',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=400&auto=format&fit=crop',
    banner: 'https://images.unsplash.com/photo-1607677914754-58a36d240214?q=80&w=1600&auto=format&fit=crop',
    subscribers: '21.5M subscribers',
    verified: true,
    bio: 'Family-friendly Minecraft roleplay adventures, cute story episodes, and kid-safe gaming fun with friends!',
    category: 'Minecraft Roleplay',
    youtubeChannelId: 'Aphmau',
    kidFriendly: true,
    videos: [
      {
        id: 'aph-vid-1',
        title: 'I Built THE ULTIMATE TREE HOUSE in Minecraft Hardcore',
        thumbnail: 'https://i.ytimg.com/vi/YiiHhT7NdGk/maxresdefault.jpg',
        views: '14.8M views',
        author: 'Aphmau',
        duration: '19:28',
        category: 'Minecraft',
        tags: ['Minecraft', 'Kids', 'Roleplay', 'Aphmau'],
        sourceType: 'youtube',
        youtubeId: 'YiiHhT7NdGk',
        videoUrl: 'https://www.youtube.com/watch?v=YiiHhT7NdGk',
        channelAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=400&auto=format&fit=crop',
        likes: 780000,
        kidFriendly: true
      },
      {
        id: 'aph-vid-2',
        title: "LAVA BARRY'S PRISON RUN Escape In Roblox",
        thumbnail: 'https://i.ytimg.com/vi/R3Eos53EsfE/maxresdefault.jpg',
        views: '9.3M views',
        author: 'Aphmau',
        duration: '15:03',
        category: 'Minecraft',
        tags: ['Minecraft', 'Adventure', 'Kids'],
        sourceType: 'youtube',
        youtubeId: 'R3Eos53EsfE',
        videoUrl: 'https://www.youtube.com/watch?v=R3Eos53EsfE',
        channelAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=400&auto=format&fit=crop',
        likes: 490000,
        kidFriendly: true
      }
    ]
  },
  {
    id: 'linustechtips',
    name: 'Linus Tech Tips',
    handle: '@LinusTechTips',
    platform: 'youtube',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=400&auto=format&fit=crop',
    banner: 'https://images.unsplash.com/photo-1587202372775-e229f172b9d7?q=80&w=1600&auto=format&fit=crop',
    subscribers: '15.7M subscribers',
    verified: true,
    bio: 'The biggest gaming tech & PC hardware channel. Extreme cooling builds, GPU benchmarks, and dream desk upgrades.',
    category: 'Hardware & Tech',
    youtubeChannelId: 'LinusTechTips',
    kidFriendly: true,
    videos: [
      {
        id: 'ltt-vid-1',
        title: 'We Built the BEST PC - Ultimate Gaming Setup',
        thumbnail: 'https://i.ytimg.com/vi/X8sgBpmdCT8/maxresdefault.jpg',
        views: '4.5M views',
        author: 'Linus Tech Tips',
        duration: '13:43',
        category: 'Hardware',
        tags: ['PC Build', 'Gaming Rig', 'Tech', 'Linus'],
        sourceType: 'youtube',
        youtubeId: 'X8sgBpmdCT8',
        videoUrl: 'https://www.youtube.com/watch?v=X8sgBpmdCT8',
        channelAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=400&auto=format&fit=crop',
        likes: 210000,
        kidFriendly: true
      }
    ]
  }
];

/**
 * Searches the local creator directory by name, handle, bio, or tags.
 * Normalizes handles (e.g. '@mrbeast' -> 'mrbeast') and URL formats.
 */
export function searchLocalCreators(query: string, isJunior: boolean = false): CreatorChannel[] {
  const raw = (query || '').toLowerCase().trim();
  const q = raw.replace(/^@/, '').replace(/^(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/@?|twitch\.tv\/)/, '');
  if (!q) return isJunior ? CREATOR_DIRECTORY.filter(c => c.kidFriendly) : CREATOR_DIRECTORY;

  return CREATOR_DIRECTORY.filter(creator => {
    if (isJunior && !creator.kidFriendly) return false;
    const nameHit = creator.name.toLowerCase().includes(q);
    const handleHit = creator.handle.toLowerCase().replace('@', '').includes(q);
    const catHit = creator.category.toLowerCase().includes(q);
    const bioHit = creator.bio.toLowerCase().includes(q);
    const twitchHit = creator.twitchChannel && creator.twitchChannel.toLowerCase().includes(q);
    const videoHit = creator.videos.some(v => v.title.toLowerCase().includes(q) || v.category?.toLowerCase().includes(q));

    return nameHit || handleHit || catHit || bioHit || twitchHit || videoHit;
  });
}

