# Authentic Video Metadata & Universal Availability Architecture

Preserve the existing video projection player and workflow exactly as it currently operates, while upgrading the search and metadata ingestion engine so that **every single video and live stream from YouTube and Twitch** is available with its **official thumbnail**, **real creator channel name**, and **exact title**.

---

## User Review & Critical Decisions

> [!IMPORTANT]
> Based on direct user guidance, the plan has been revised with the following strict constraints:
>
> - **Preserve Existing Projection System**: Do NOT alter the visual layout, controls, or workflow of the current video projection player (`VideoPlayerModal.tsx`). The existing player mechanics, reactions, and controls remain 100% intact.
> - **Universal Availability**: Any video or live stream on YouTube or Twitch can be searched, pasted, and projected without restrictions.
> - **Official Thumbnails Guaranteed**: Every video uses its official high-definition thumbnail directly from the source platform (`https://img.youtube.com/vi/{id}/hqdefault.jpg` or `maxresdefault.jpg` for YouTube; official live channel preview for Twitch) with zero broken image placeholders.
> - **Authentic Creator Channel Names**: Replace all generic placeholder author names (e.g. `"YouTube Creator"`, `"Custom Stream"`) with the real creator's channel name obtained via live metadata resolution (e.g. `"MrBeast"`, `"TenZ"`, `"shroud"`, `"DanTDM"`).
> - **Exact Titles**: Ensure the title displayed in the projector, search results, and cards matches the video's actual title on YouTube or Twitch.

---

## 1. Overview & Core Concept

- **What It Does**: Enhances the existing projection system and search engine by introducing an automated metadata resolution pipeline. When any YouTube video or Twitch stream is searched, pasted, or discovered, the platform resolves the official oEmbed and channel data to display the authentic thumbnail, exact title, and creator channel name.
- **Target Audience & Context**: Gamers using the Nexus projection system to watch any video from YouTube or Twitch, wanting to see real channel names, exact titles, and official thumbnails as they appear on the original platforms.
- **Key Value**: 100% video availability with authentic platform fidelity, keeping the familiar player experience without disruptive UI changes.

---

## 2. Technical Architecture & Data Flow

### 1. Live Metadata Resolution Pipeline (`server.ts` & `services/recommendationEngine.ts`)

- **Dedicated Metadata Resolver Endpoint (`POST /api/resolve-media`)**:
  - Accepts any YouTube URL (standard, shortened `youtu.be`, Shorts, embed, or raw 11-char ID) or Twitch stream URL/channel name.
  - **YouTube Resolution**:
    - Queries YouTube's official oEmbed service (`https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v={id}&format=json`).
    - Extracts `title` (exact video title), `author_name` (real creator channel name), `author_url` (creator's channel link), and `thumbnail_url`.
    - Generates high-resolution thumbnail URLs with automatic fallback (`maxresdefault.jpg` $\rightarrow$ `hqdefault.jpg`).
  - **Twitch Resolution**:
    - Formats authentic channel handle and preview thumbnail (`https://static-cdn.jtvnw.net/previews-ttv/live_user_{channel}-1280x720.jpg`).
  - Returns structured, verified metadata to the client.

- **Universal Search Engine Enhancement (`POST /api/search-media`)**:
  - When users search for any game, creator, or topic in the search bar, the engine queries real video catalogs and returns authentic 11-character YouTube IDs, genuine creator channel names, and official thumbnails.

### 2. Client-Side Video Creation (`services/recommendationEngine.ts`)

- **`createProjectedVideo` Upgrade**:
  - Immediately extracts the video ID or Twitch channel.
  - Asynchronously calls `/api/resolve-media` to fetch the verified `title` and `author` (creator channel name), updating the active video metadata seamlessly.
  - Sets the thumbnail to `https://img.youtube.com/vi/{id}/hqdefault.jpg` immediately, ensuring zero delay in displaying the official thumbnail.

- **`getVideoThumbnail` Guarantee**:
  - Ensures every video object always resolves to its official platform thumbnail.

### 3. Seamless Integration in Existing Projection Player (`components/VideoPlayerModal.tsx`)

- **Preserve Existing UI**: Retains the current modal layout, ambient backlight glow, like tracker, kid-friendly toggles, reaction emojis, and projection input form.
- **Real-Time Metadata Update**:
  - When a user enters a custom stream URL in the projector input bar, the modal immediately displays the official thumbnail, fetches the real creator channel name and exact title, and streams the video without changing the player layout.

---

## 3. Key Source Files & Changes

1. **`server.ts`**:
   - Add `POST /api/resolve-media`: Fetches YouTube oEmbed data (`title`, `author_name`, `thumbnail_url`) and Twitch channel data for any URL or ID.
   - Enhance `POST /api/search-media`: Ensures all search results return real creator channel names and valid YouTube IDs.

2. **`services/recommendationEngine.ts`**:
   - Update `createProjectedVideo` to support asynchronous resolution of real creator channel names and exact titles.
   - Update `parseMediaStreamUrl` to recognize all variations of YouTube links (`youtu.be`, `youtube.com/watch`, `shorts`, `live`, raw IDs) and Twitch links.

3. **`components/VideoPlayerModal.tsx`**:
   - Update `handleProjectCustomStream` to resolve real creator channel names and exact titles upon projection.
   - Ensure the player header displays the verified creator name and title without placeholder text.

4. **`views/Browse.tsx` & `views/Home.tsx`**:
   - Ensure all search bars and video shelves use the resolved authentic creator channel names and official thumbnails.

---

## 4. Verification Protocol

1. **Static Analysis & Linting**:
   - Run `lint_applet` (`tsc --noEmit`) to verify zero syntax or type errors.
2. **Build Verification**:
   - Run `compile_applet` to confirm the application builds cleanly.
3. **Fidelity Verification**:
   - Paste any YouTube video URL or ID $\rightarrow$ Verify official thumbnail loads, creator channel name matches YouTube (e.g. "MrBeast", "Veritasium", "TenZ"), and title is exact.
   - Paste any Twitch stream URL $\rightarrow$ Verify official Twitch preview and channel name load.
   - Search for any gaming topic in the search bar $\rightarrow$ Verify all results display official thumbnails and creator channel names.
   - Verify the existing video projection player UI, animations, and controls continue to function exactly as before.
