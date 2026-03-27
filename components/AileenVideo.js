'use client';
import { useState, useEffect, useRef } from 'react';
import { useLanguage } from '../context/LanguageContext';

export default function AileenVideo({ onComplete }) {
  const [isFirstVisit, setIsFirstVisit] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);
  const [showVideo, setShowVideo] = useState(false);
  const videoRef = useRef(null);
  const { t } = useLanguage();

  useEffect(() => {
    const visited = localStorage.getItem('gc_visited');
    if (!visited) {
      setIsFirstVisit(true);
      localStorage.setItem('gc_visited', 'true');
    } else {
      setIsFirstVisit(false);
    }
    // Small delay before showing video
    setTimeout(() => setShowVideo(true), 800);
  }, []);

  const handleDismiss = () => {
    setIsDismissed(true);
    if (onComplete) onComplete();
  };

  if (!showVideo || isDismissed || isFirstVisit === null) return null;

  // Video URLs — replace with actual HeyGen rendered video URLs
  const videoUrl = isFirstVisit
    ? '/videos/aileen-welcome.mp4'      // Full welcome video ~70 seconds
    : '/videos/aileen-welcome-back.mp4'; // Short return video ~15 seconds

  const videoLabel = isFirstVisit
    ? (t('home.welcome') || 'Welcome to GlobalCeilidh.com')
    : 'Fàilte air ais — Welcome back';

  return (
    <div className={`fixed inset-0 z-40 flex items-center justify-center transition-all duration-500 ${
      showVideo ? 'opacity-100' : 'opacity-0'
    }`}
      style={{ background: 'rgba(15, 25, 35, 0.92)' }}
    >
      <div className="relative max-w-md w-full mx-4">

        {/* Video container */}
        <div className="relative rounded-2xl overflow-hidden shadow-2xl bg-gc-dark">

          {/* Video placeholder — replace src with actual video */}
          <div className="aspect-[9/16] bg-gradient-to-b from-gc-mid to-gc-dark flex flex-col items-center justify-center">

            {/* Aileen placeholder while video loads */}
            <div className="w-24 h-24 rounded-full bg-tarheel/20 border-2 border-tarheel/40 flex items-center justify-center mb-4">
              <span className="text-4xl">A</span>
            </div>
            <p className="text-tarheel text-sm font-display tracking-widest uppercase mb-2">Aileen</p>
            <p className="text-white/60 text-xs text-center px-6">{videoLabel}</p>

            {/* Actual video element — uncomment when video files are uploaded */}
            {/*
            <video
              ref={videoRef}
              src={videoUrl}
              autoPlay
              playsInline
              onEnded={handleDismiss}
              className="absolute inset-0 w-full h-full object-cover"
            />
            */}
          </div>

          {/* Skip / Continue button */}
          <div className="p-4 bg-gc-dark">
            <button
              onClick={handleDismiss}
              className="w-full py-3 rounded-xl bg-tarheel text-white font-medium tracking-wide hover:bg-tarheel-dark transition-colors text-sm"
            >
              {isFirstVisit ? 'Enter GlobalCeilidh.com →' : 'Fàilte air ais — Continue →'}
            </button>
          </div>
        </div>

        {/* Close button */}
        <button
          onClick={handleDismiss}
          className="absolute -top-4 -right-4 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors text-sm"
        >
          ✕
        </button>

        {/* Video label */}
        <p className="text-center text-white/40 text-xs mt-3 tracking-wide">
          GlobalCeilidh.com — {isFirstVisit ? 'First visit' : 'Welcome back'}
        </p>
      </div>
    </div>
  );
}
