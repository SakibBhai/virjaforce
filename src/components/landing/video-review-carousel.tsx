'use client';

import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, X, Star, ChevronLeft, ChevronRight } from 'lucide-react';

interface VideoReview {
  id: string;
  name: string;
  age: number;
  city: string;
  text: string;
  stars: number;
  weeks: number;
  youtubeUrl: string;
}

interface VideoReviewCarouselProps {
  videos: VideoReview[];
}

function extractYouTubeId(url: string): string {
  const match = url.match(
    /(?:youtube\.com\/(?:embed\/|v\/|watch\?v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/
  );
  return match ? match[1] : '';
}

function getYouTubeThumbnail(videoId: string): string {
  return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
}

export default function VideoReviewCarousel({ videos }: VideoReviewCarouselProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const next = () => setActiveIndex((i) => (i + 1) % videos.length);
  const prev = () => setActiveIndex((i) => (i - 1 + videos.length) % videos.length);

  return (
    <div className="space-y-4">
      {/* Main Video / Player */}
      <div className="relative rounded-xl overflow-hidden bg-vf-dark4 border border-vf-gold-dim/20 aspect-video">
        <AnimatePresence mode="wait">
          {isPlaying !== null ? (
            <motion.div
              key={`playing-${isPlaying}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0"
            >
              <iframe
                src={`${videos[isPlaying].youtubeUrl}?autoplay=1&rel=0`}
                className="w-full h-full"
                allow="autoplay; encrypted-media"
                allowFullScreen
                title={videos[isPlaying].name}
              />
              <button
                onClick={() => setIsPlaying(null)}
                className="absolute top-3 right-3 w-8 h-8 bg-black/60 hover:bg-black/80 rounded-full flex items-center justify-center text-white transition-colors z-10"
              >
                <X className="w-4 h-4" />
              </button>
            </motion.div>
          ) : (
            <motion.div
              key={`thumb-${activeIndex}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 cursor-pointer group"
              onClick={() => setIsPlaying(activeIndex)}
            >
              <img
                src={getYouTubeThumbnail(extractYouTubeId(videos[activeIndex].youtubeUrl))}
                alt={videos[activeIndex].name}
                className="w-full h-full object-cover"
              />
              {/* Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
              {/* Play Button */}
              <div className="absolute inset-0 flex items-center justify-center">
                <motion.div
                  className="w-16 h-16 sm:w-20 sm:h-20 bg-vf-gold/90 rounded-full flex items-center justify-center group-hover:bg-vf-gold group-hover:scale-110 transition-all duration-300 shadow-lg shadow-vf-gold/30"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Play className="w-7 h-7 sm:w-8 sm:h-8 text-vf-dark ml-1" fill="currentColor" />
                </motion.div>
              </div>
              {/* Info Overlay */}
              <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-5">
                <div className="flex items-center gap-1 mb-1">
                  {Array.from({ length: videos[activeIndex].stars }).map((_, i) => (
                    <Star key={i} className="w-3 h-3 text-vf-gold fill-vf-gold" />
                  ))}
                </div>
                <p className="text-vf-cream text-sm sm:text-base font-semibold">
                  {videos[activeIndex].name} — {videos[activeIndex].city}
                </p>
                <p className="text-vf-cream2 text-xs sm:text-sm mt-1 line-clamp-2">
                  {videos[activeIndex].text}
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={prev}
          className="w-10 h-10 bg-vf-dark3 border border-vf-gold-dim/20 rounded-full flex items-center justify-center text-vf-gold hover:border-vf-gold-dim/50 transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        {/* Thumbnails Row */}
        <div className="flex gap-2 overflow-x-auto flex-1 mx-3 px-1 py-1" ref={containerRef}>
          {videos.map((video, i) => (
            <button
              key={video.id}
              onClick={() => {
                setActiveIndex(i);
                setIsPlaying(null);
              }}
              className={`relative flex-shrink-0 w-20 h-14 sm:w-28 sm:h-16 rounded-lg overflow-hidden border-2 transition-all ${
                i === activeIndex
                  ? 'border-vf-gold shadow-md shadow-vf-gold/20'
                  : 'border-transparent opacity-60 hover:opacity-90'
              }`}
            >
              <img
                src={getYouTubeThumbnail(extractYouTubeId(video.youtubeUrl))}
                alt={video.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                <Play className="w-4 h-4 text-white fill-white/80" />
              </div>
            </button>
          ))}
        </div>

        <button
          onClick={next}
          className="w-10 h-10 bg-vf-dark3 border border-vf-gold-dim/20 rounded-full flex items-center justify-center text-vf-gold hover:border-vf-gold-dim/50 transition-colors"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
