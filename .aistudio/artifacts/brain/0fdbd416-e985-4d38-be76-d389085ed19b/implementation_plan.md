# YouTube-Style Personalization Algorithm, Pull-to-Refresh & Live Video Sync

Upgrade the platform with an authentic YouTube-like recommendation engine that dynamically learns from user watch time, likes, and search topics, featuring an interactive pull-to-refresh feed with shimmer skeleton animations, and live multi-platform ingestion to surface the freshest creator uploads immediately.

---

## User Review & Critical Decisions

> [!IMPORTANT]
> The following architectural decisions were confirmed via interactive user clarification and must guide execution:
>
> - **Recommendation Algorithm**: Combines three explicit affinity signals: accumulated watch time (seconds spent watching in player), user video likes (+40 category/+20 tag points), and recent search queries (+15 category/+20 tag points). Videos are scored dynamically with temporal freshness boosts and exploratory discovery slots.
> - **Refresh Flow**: Authentic YouTube-like refresh experience featuring both an interactive **Pull-to-Refresh** touch gesture (with elastic pull distance, rotation indicator, and threshold haptics/audio) and a dedicated **Refresh Feed** button with spinning state, transitioning into animated skeleton card shimmers before revealing the new recommendation batch.
> - **Instant Platform Video Availability**: Live synchronization pipeline querying official YouTube and Twitch endpoints upon feed refresh, creator search, and channel browsing, ensuring newly uploaded creator videos appear immediately on our platform with authentic thumbnails, exact titles, and verified creator channel names.
> - **Preserve Existing Video Projection Workflow**: Zero changes to the underlying video projection modal mechanics, player controls, or projection input flow—enhancing solely the feed discovery, recommendation intelligence, and real-time media ingestion.

---

## 1. Overview & Core Concept

- **What It Does**: Transforms the recommended video feed into an adaptive, self-tuning content engine tailored to the gamer's unique tastes. As users watch streams, like videos, or search for titles (e.g. Valorant, Minecraft, CS2, League of Legends), the feed recalculates affinity scores. Gamers can pull down or click refresh at any time to trigger an instant live sync that fetches the latest videos from top gaming channels and presents them with fluid shimmer animations.
- **Target Audience / Persona**: Competitive gamers and gaming enthusiasts wanting a personalized stream and video hub that feels as fast, smart, and fresh as YouTube.
- **Key Value**: Delivers hyper-relevant content tailored to individual viewing habits, instant availability of newly published creator videos, and a satisfying, responsive feed refresh experience.

---

## 2. User Experience & Visual Design

### Key User Flows

1. **Viewing & Interacting with Recommended Feed**:
   - The user opens the Home or Browse page to find a curated **Recommended For You** section.
   - Each card displays the video's official 16:9 thumbnail, duration badge, channel avatar, title, creator channel name, and unboxed metadata (`views · time ago · why recommended`).
   - Clicking a video opens the projection player modal, immediately logging watch time milestones (10s, 30s, 60s, completion) that strengthen the user's taste profile.

2. **YouTube-Style Pull-to-Refresh & Shimmer Loading**:
   - On touch devices or mobile viewports, the user pulls down from the top of the feed container. An elastic pull indicator emerges with a rotating spinner that snaps into a loading state when dragged past the threshold ($65\text{px}$).
   - On desktop, clicking the **Refresh Feed** button triggers the identical refresh sequence.
   - The grid smoothly transitions into 6–8 animated shimmering skeleton cards (`bg-slate-800/60 animate-pulse` with diagonal gradient sweeps) mimicking the thumbnail and text layout.
   - Within 400ms–800ms, fresh live recommendations slide into place with subtle fade-ins.

3. **Live Platform Video Ingestion & Instant Availability**:
   - When refreshed, the engine executes a parallel live sync to fetch latest gaming uploads from authentic YouTube creators (e.g. TenZ, Shroud, Forge Labs, Tarik, Riot Games) and Twitch live channels.
   - Users can search any topic or creator name; the search bar queries live YouTube APIs via the server proxy to inject authentic, newly uploaded videos into the user's catalog on the fly.

### Visual Identity & Theme

- **Aesthetic Direction**: High-tech cyber-slate gaming console aesthetic adhering strictly to the universal design constitution (zero-pill metadata discipline, single-elevation depth, and WCAG AA contrast).
- **Color Palette & Mood**:
  - Dominant neutral canvas: Deep obsidian slate (`#0B0F17` / `bg-slate-950`).
  - Structural surfaces: Elevated obsidian cards (`#131B2B` / `bg-slate-900/70`) with subtle hairline borders (`border border-slate-800`).
  - High-intent accent: Electric violet/magenta (`#8B5CF6` / `#EC4899`) reserved exclusively for active play states, progress bars, and the refresh spinner.
- **Typography & Hierarchy**:
  - Display face: `Plus Jakarta Sans` for bold, punchy section headers (`text-xl font-bold tracking-tight`).
  - Body prose: Clean, highly legible sans (`text-sm font-medium text-slate-300`).
  - Metadata: Clean unboxed text (`text-xs text-slate-400 font-normal`) using `·` typographic separators (no pill enclosures or candy chips).
- **Interactive Feedback & Motion**:
  - Elastic pull-to-refresh with tension physics and rotation clamping.
  - Skeleton shimmer animation using CSS gradient translation (`cubic-bezier(0.16, 1, 0.3, 1)`).
  - Micro-scale transitions (`active:scale-[0.98]`) on video card clicks.

---

## 3. Key Product Decisions & Trade-Offs

- **Decision 1: Multi-Signal Scoring vs Simple Category Matching**:
  - *Chosen Approach*: A composite scoring formula:
    $$\text{Score} = (\text{WatchTimePoints} \times 1.2) + (\text{LikeAffinity} \times 1.5) + (\text{SearchKeywordMatch} \times 1.0) + \text{FreshnessBoost} + \text{SerendipityRandomizer}$$
  - *Why*: Direct watch time and explicit likes are the strongest predictors of enjoyment in YouTube's real recommendation algorithm. Adding a 15% serendipity slot prevents echo chambers and surfaces newly discovered creators.
  - *Alternatives Considered*: Pure chronological feed (ignores user taste) or pure tag matching (causes stale repetitive cards).

- **Decision 2: Server-Proxied Live Platform Ingestion vs Static Mock Seeds**:
  - *Chosen Approach*: Server endpoint `POST /api/sync-feed` that extracts current live YouTube search and RSS items for active game categories, alongside `POST /api/resolve-media` for authentic channel names and official thumbnail resolution.
  - *Why*: Guarantees that any newly released gaming videos and tournaments are immediately available on our platform with authentic thumbnails and creator channel names.
  - *Alternatives Considered*: Client-side CORS scraping (fails due to browser security restrictions).

- **Decision 3: Client Gesture Pull-to-Refresh with Graceful Desktop Fallback**:
  - *Chosen Approach*: Native touch event listeners (`touchstart`, `touchmove`, `touchend`) attached to the feed wrapper with transform translation, coupled with a prominent header Refresh action button for desktop users.
  - *Why*: Mirrors the exact mobile YouTube app experience while providing equal tactile control for desktop browser sessions.

---

## 4. Technical Architecture & Data Strategy

### System Architecture Diagram

```
┌────────────────────────────────────────────────────────────────────────┐
│                          Client Interface                              │
│                                                                        │
│  ┌───────────────────────┐              ┌───────────────────────────┐  │
│  │   Home / Browse View  │              │    VideoPlayerModal       │  │
│  │  ┌─────────────────┐  │              │  ┌─────────────────────┐  │  │
│  │  │PersonalizedShelf│  │              │  │ Watch Time Tracker  │  │  │
│  │  │ - Pull-to-Refresh  │  │              │  │ Like Button Handler │  │  │
│  │  │ - Shimmer Grid  │  │              │  └──────────┬──────────┘  │  │
│  │  └────────┬────────┘  │              └─────────────┼─────────────┘  │
│  └───────────┼───────────┘                            │                │
│              │ User Actions (Pull, Click, Search)     │ Telemetry      │
│              ▼                                        ▼                │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │              Client Recommendation Engine Service                │  │
│  │  - UserTasteProfile (Watch time, Liked IDs, Search history)       │  │
│  │  - Multi-Signal Scoring & Freshness Re-Ranking                   │  │
│  │  - Local Cache & Custom Event Dispatcher                         │  │
│  └───────────────────────────────┬──────────────────────────────────┘  │
└──────────────────────────────────┼─────────────────────────────────────┘
                                   │ HTTP (REST)
                                   ▼
┌────────────────────────────────────────────────────────────────────────┐
│                        Node.js Server Runtime                          │
│                                                                        │
│  ┌───────────────────────┐              ┌───────────────────────────┐  │
│  │   POST /api/sync-feed │              │   POST /api/resolve-media │  │
│  │ - Live YouTube Ingest │              │ - oEmbed Channel Resolver │  │
│  │ - Category Fetchers   │              │ - Official Thumbnails     │  │
│  └───────────────────────┘              └───────────────────────────┘  │
└────────────────────────────────────────────────────────────────────────┘
```

### Data Model & State

- **`UserTasteProfile`**:
  ```ts
  interface UserTasteProfile {
    watchTimeSecondsByVideo: Record<string, number>; // Video ID -> seconds watched
    categoryAffinities: Record<string, number>;      // Category -> cumulative score
    tagAffinities: Record<string, number>;           // Tag -> cumulative score
    creatorAffinities: Record<string, number>;       // Creator channel name -> score
    likedVideoIds: string[];                         // Array of liked video IDs
    searchHistory: string[];                         // Last 15 search queries
    lastRefreshTimestamp: number;                    // Epoch time of last refresh
  }
  ```

- **`ScoredVideo`**:
  ```ts
  interface ScoredVideo extends VideoPost {
    recommendationScore: number;
    recommendationReason: string; // e.g. "Because you watched Valorant", "New from Tarik"
    isFreshUpload?: boolean;
    syncTimestamp?: number;
  }
  ```

### Interactive Component & State Mapping

1. **`PersonalizedVideoShelf.tsx`**:
   - Manages pull-to-refresh touch states (`pullDistance`, `isPulling`, `isRefreshing`).
   - Renders animated SVG pull spinner indicator above the feed container.
   - Displays 6 skeleton shimmer cards when `isRefreshing === true`.
   - Renders unboxed metadata: channel name, viewer count, publication time, and recommendation reason.
2. **`services/recommendationEngine.ts`**:
   - `getPersonalizedRecommendations(limit, isJunior)`: Ranks videos using multi-signal scoring.
   - `recordWatchTime(videoId, durationSeconds)`: Increments category and creator affinities dynamically.
   - `syncFreshPlatformVideos()`: Calls `/api/sync-feed` to ingest new creator uploads.
3. **`server.ts`**:
   - `POST /api/sync-feed`: Dispatches concurrent queries to YouTube for latest uploads across top gaming categories (Valorant, Minecraft, CS2, League, Roblox) and returns deduplicated items with official thumbnails and verified channel names.

---

## 5. Verification Protocol

1. **Static Analysis & Linting**:
   - Run `lint_applet` (`npm run lint` / `tsc --noEmit`) to verify zero syntax or type regressions.
2. **Build Verification**:
   - Run `compile_applet` (`npm run build`) to ensure client bundle and server compile cleanly.
3. **Interactive Algorithmic & UX Testing**:
   - **Recommendation Algorithm**: Play a Minecraft video for 30s and click like; verify Minecraft-related videos immediately boost to top ranks with personalized reason badges.
   - **Refresh Experience**: Drag pull-to-refresh down past threshold and click the Refresh button; observe smooth spinner animation, shimmer card placeholders, and arrival of newly shuffled/fresh video cards.
   - **Live Video Sync**: Verify that newly fetched videos have official YouTube thumbnails (`hqdefault.jpg`), real creator channel names, and can be clicked and projected seamlessly without disrupting existing player mechanics.
