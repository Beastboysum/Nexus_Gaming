import React, { useState, useEffect, useRef } from 'react';

interface HDImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src?: string;
  youtubeId?: string;
  alt: string;
  className?: string;
  fallbackIcon?: React.ReactNode;
  aspectRatioClass?: string;
}

/**
 * Extracts a YouTube Video ID from any standard YouTube URL or returns the ID directly.
 */
export function extractYouTubeId(urlOrId?: string): string | null {
  if (!urlOrId) return null;
  // If already an 11-character alphanumeric/dash ID
  if (/^[a-zA-Z0-9_-]{11}$/.test(urlOrId)) {
    return urlOrId;
  }
  const match = urlOrId.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/);
  if (match && match[1]) {
    return match[1];
  }
  const imgMatch = urlOrId.match(/\/vi\/([\w-]{11})\//);
  if (imgMatch && imgMatch[1]) {
    return imgMatch[1];
  }
  return null;
}

/**
 * Formats a Twitch thumbnail template URL to high-definition 1280x720
 */
export function formatTwitchHdUrl(url?: string): string {
  if (!url) return '';
  return url
    .replace('{width}x{height}', '1280x720')
    .replace('-%7Bwidth%7Dx%7Bheight%7D', '-1280x720')
    .replace('-320x180', '-1280x720')
    .replace('-640x360', '-1280x720');
}

/**
 * High-Definition Image component with multi-tier YouTube / Twitch fallback cascade.
 * YouTube CDN returns a 120x90 placeholder on missing maxresdefault without a 404,
 * so this component monitors naturalWidth <= 120 to seamlessly cascade to sddefault and hqdefault.
 */
export const HDImage: React.FC<HDImageProps> = ({
  src,
  youtubeId: explicitYtId,
  alt,
  className = '',
  aspectRatioClass = 'aspect-video',
  fallbackIcon,
  ...rest
}) => {
  const ytId = explicitYtId || extractYouTubeId(src);
  const isTwitch = src?.includes('twitch') || src?.includes('ttvnw.net');

  // Build cascade list for YouTube videos
  const candidateUrls = React.useMemo(() => {
    if (ytId) {
      return [
        `https://i.ytimg.com/vi/${ytId}/maxresdefault.jpg`,
        `https://i.ytimg.com/vi/${ytId}/sddefault.jpg`,
        `https://i.ytimg.com/vi/${ytId}/hqdefault.jpg`,
        `https://i.ytimg.com/vi/${ytId}/mqdefault.jpg`,
      ];
    }
    if (isTwitch && src) {
      const hdTwitch = formatTwitchHdUrl(src);
      const candidates = [hdTwitch];
      const channelMatch = src.match(/live_user_([a-zA-Z0-9_]+)/i);
      if (channelMatch && channelMatch[1]) {
        const channelName = channelMatch[1].toLowerCase();
        const gamingFallbacks: Record<string, string> = {
          tarik: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=1280&auto=format&fit=crop',
          riotgames: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?q=80&w=1280&auto=format&fit=crop',
          shroud: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=1280&auto=format&fit=crop',
          minecraft: 'https://images.unsplash.com/photo-1607677914754-58a36d240214?q=80&w=1280&auto=format&fit=crop',
          tenz: 'https://images.unsplash.com/photo-1624138784180-48145465d61f?q=80&w=1280&auto=format&fit=crop',
        };
        if (gamingFallbacks[channelName]) {
          candidates.push(gamingFallbacks[channelName]);
        }
      }
      return candidates;
    }
    if (src) {
      return [src];
    }
    return [];
  }, [ytId, isTwitch, src]);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [hasError, setHasError] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const imgRef = useRef<HTMLImageElement | null>(null);

  // Reset state whenever src or candidate list changes
  useEffect(() => {
    setCurrentIndex(0);
    setHasError(false);
    setIsLoaded(false);
  }, [src, ytId]);

  const currentSrc = candidateUrls[currentIndex] || src || '';

  const handleNextCandidate = () => {
    if (currentIndex + 1 < candidateUrls.length) {
      setCurrentIndex((prev) => prev + 1);
      setIsLoaded(false);
    } else {
      setHasError(true);
    }
  };

  const handleLoad = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    const img = e.currentTarget;
    // YouTube specific check: YouTube CDN returns a 120x90 grey camera placeholder on missing/invalid video thumbnails
    // If the image is <= 120px wide or <= 90px tall, it is YouTube's default placeholder, NOT the real video thumbnail!
    if (ytId && (img.naturalWidth <= 120 || img.naturalHeight <= 90)) {
      handleNextCandidate();
      return;
    }
    setIsLoaded(true);
  };

  const handleError = () => {
    handleNextCandidate();
  };

  if (!currentSrc || hasError) {
    return (
      <div className={`relative flex items-center justify-center bg-gradient-to-br from-[#12121a] via-[#1a1728] to-[#0d0d15] overflow-hidden border border-purple-500/10 ${aspectRatioClass} ${className}`}>
        {fallbackIcon ? (
          fallbackIcon
        ) : (
          <div className="flex flex-col items-center justify-center text-slate-500 p-4 text-center">
            <div className="w-10 h-10 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center mb-2 text-purple-400">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            </div>
            <span className="text-xs font-semibold text-slate-300 line-clamp-1">{alt || 'Gaming Broadcast'}</span>
            <span className="text-[10px] text-purple-400 font-medium mt-0.5">Nexus Verified Stream</span>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={`relative overflow-hidden bg-slate-900/50 ${aspectRatioClass} ${className}`}>
      {!isLoaded && (
        <div className="absolute inset-0 bg-[#12121a] animate-pulse flex items-center justify-center">
          <div className="w-6 h-6 border-2 border-purple-500/20 border-t-purple-500 rounded-full animate-spin" />
        </div>
      )}
      <img
        ref={imgRef}
        src={currentSrc}
        alt={alt}
        loading="lazy"
        decoding="async"
        onLoad={handleLoad}
        onError={handleError}
        className={`w-full h-full object-cover transition-opacity duration-300 ${
          isLoaded ? 'opacity-100' : 'opacity-0'
        }`}
        {...rest}
      />
    </div>
  );
};
