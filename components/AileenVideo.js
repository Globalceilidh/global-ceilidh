'use client';
import { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';

const WELCOME_VIDEO_ID = 'IwO6_a6ovig';
const WELCOME_BACK_VIDEO_ID = 'IwO6_a6ovig';

export default function AileenVideo({ onComplete }) {
  const [isFirstVisit, setIsFirstVisit] = useState(null);
  const [isDismissed, setIsDismissed] = useState(false);
  const [showVideo, setShowVideo] = useState(false);
  const { t } = useLanguage();

  useEffect(() => {
    const visited = localStorage.getItem('gc_visited');
    if (!visited) {
      setIsFirstVisit(true);
      localStorage.setItem('gc_visited', 'true');
    } else {
      setIsFirstVisit(false);
    }
    setTimeout(() => setShowVideo(true), 800);
  }, []);

  const handleDismiss = () => {
    setIsDismissed(true);
    if (onComplete) onComplete();
  };

  if (!showVideo || isDismissed || isFirstVisit === null) return null;

  const videoId = isFirstVisit ? WELCOME_VIDEO_ID : WELCOME_BACK_VIDEO_ID;
  const embedUrl = `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=0&controls=0&modestbranding=1&rel=0&showinfo=0&loop=1&playlist=${videoId}`;

  return (
    <div
      className={`fixed inset-0 z-40 flex items-center justify-center transition-all duration-500 ${showVideo ? 'opacity-100' : 'opacity-0'}`}
      style={{ background: 'rgba(15, 25, 35, 0.92)' }}
    >
      <div className="relative max-w-sm w-full mx-4">
        <div className="relative rounded-2xl overflow-hidden shadow-2xl bg-gc-dark">
          <div className="aspect-[9/16] relative">
            <iframe
              src={embedUrl}
              className="absolute inset-0 w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              title="Aileen — GlobalCeilidh.com"
            />
          </div>
          <div className="p-4 bg-gc-dark">
            <button
              onClick={handleDismiss}
              className="w-full py-3 rounded-xl bg-tarheel text-white font-medium tracking-wide hover:bg-tarheel-dark transition-colors text-sm"
            >
              {isFirstVisit ? 'Enter GlobalCeilidh.com →' : 'Fàilte air ais — Continue →'}
            </button>
          </div>
        </div>
        <button
          onClick={handleDismiss}
          className="absolute -top-4 -right-4 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors text-sm"
        >
          ✕
        </button>
        <p className="text-center text-white/40 text-xs mt-3 tracking-wide">
          {isFirstVisit ? 'Fàilte gu GlobalCeilidh.com' : 'Fàilte air ais — Welcome back'}
        </p>
      </div>
    </div>
  );
}
