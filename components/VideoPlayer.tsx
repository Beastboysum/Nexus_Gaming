import React, { useState } from 'react';
import { Play, X, Heart, MessageCircle, Share2 } from 'lucide-react';
import { VideoPost } from '../types';
import { playCategorizedAudio } from '../services/audioManager';

const MOCK_VIDEOS: VideoPost[] = [
  { id: '1', title: 'INSANE 1v5 Clutch!', thumbnail: 'https://picsum.photos/600/400?random=1', views: '1.2M', author: 'ProGamer_X', duration: '4:20' },
  { id: '2', title: 'Funny Moments #42', thumbnail: 'https://picsum.photos/600/400?random=2', views: '850K', author: 'MemeLord', duration: '10:05' },
  { id: '3', title: 'Speedrun Any% WR', thumbnail: 'https://picsum.photos/600/400?random=3', views: '2.1M', author: 'FastBoy', duration: '25:30' },
];

export const VideoFeed: React.FC = () => {
  const [selectedVideo, setSelectedVideo] = useState<VideoPost | null>(null);

  const handleVideoClick = (video: VideoPost) => {
    // Play sound effect
    playCategorizedAudio('https://assets.mixkit.co/sfx/preview/mixkit-sci-fi-interface-click-901.mp3', 'system', 0.35);
    setSelectedVideo(video);
  };

  const closeVideo = () => {
    setSelectedVideo(null);
  };

  return (
    <div className="p-6">
        <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-6">Trending Clips</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {MOCK_VIDEOS.map((video) => (
            <div 
                key={video.id}
                onClick={() => handleVideoClick(video)}
                className="group relative rounded-2xl overflow-hidden cursor-pointer shadow-lg hover:shadow-2xl hover:shadow-purple-500/20 transition-all duration-300 transform hover:-translate-y-1 bg-white dark:bg-slate-800"
            >
                <div className="relative aspect-video">
                    <img src={video.thumbnail} alt={video.title} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm">
                        <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-md">
                            <Play fill="white" className="text-white ml-1" />
                        </div>
                    </div>
                    <span className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded-md">{video.duration}</span>
                </div>
                <div className="p-4">
                    <h3 className="font-bold text-slate-800 dark:text-white truncate">{video.title}</h3>
                    <div className="flex justify-between items-center mt-2 text-sm text-slate-500 dark:text-slate-400">
                        <span>{video.author}</span>
                        <span>{video.views} views</span>
                    </div>
                </div>
            </div>
            ))}
        </div>

        {/* Zoom Animation Modal */}
        {selectedVideo && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4" onClick={closeVideo}>
                <div 
                    className="relative w-full max-w-4xl aspect-video bg-black rounded-3xl shadow-2xl overflow-hidden animate-zoomIn"
                    onClick={(e) => e.stopPropagation()}
                    style={{ animation: 'zoomIn 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)' }}
                >
                    <button onClick={closeVideo} className="absolute top-4 right-4 z-10 w-10 h-10 bg-black/50 hover:bg-black/70 rounded-full flex items-center justify-center text-white transition-colors">
                        <X />
                    </button>
                    
                    <div className="absolute inset-0 flex items-center justify-center bg-slate-900">
                        {/* Placeholder for actual video player */}
                        <div className="text-center">
                            <Play size={64} className="text-purple-500 mx-auto mb-4 animate-pulse" />
                            <p className="text-slate-400">Playing: {selectedVideo.title}</p>
                            <div className="mt-8 flex gap-4 justify-center">
                                <button className="p-3 bg-white/10 rounded-full hover:bg-purple-600 transition-colors"><Heart size={20} className="text-white"/></button>
                                <button className="p-3 bg-white/10 rounded-full hover:bg-blue-600 transition-colors"><MessageCircle size={20} className="text-white"/></button>
                                <button className="p-3 bg-white/10 rounded-full hover:bg-green-600 transition-colors"><Share2 size={20} className="text-white"/></button>
                            </div>
                        </div>
                    </div>
                    
                    {/* Fake progress bar */}
                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-800">
                        <div className="h-full w-1/3 bg-purple-500"></div>
                    </div>
                </div>
            </div>
        )}
        <style>{`
            @keyframes zoomIn {
                from { opacity: 0; transform: scale(0.5); }
                to { opacity: 1; transform: scale(1); }
            }
        `}</style>
    </div>
  );
};
