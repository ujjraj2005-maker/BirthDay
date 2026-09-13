import React, { useState, useEffect, useRef } from 'react';

const BackgroundMusic = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef(null);

  const startAudio = () => {
    if (!audioRef.current) return;

    audioRef.current.play().then(() => {
      setIsPlaying(true);
    }).catch(() => {
      setIsPlaying(false);
    });
  };

  const togglePlay = (e) => {
    if (e) e.stopPropagation();
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play().then(() => {
        setIsPlaying(true);
      }).catch((err) => {
        console.log("Play error:", err);
      });
    }
  };

  useEffect(() => {
    // 1. Attempt immediate autoplay when page opens
    startAudio();

    // 2. Gesture listener for first tap/click anywhere on screen to trigger playback if autoplay was blocked by browser
    const handleGesture = (e) => {
      // Ignore if clicking the Retro CD button directly (togglePlay handles it)
      if (e.target && e.target.closest('#retro-cd-button')) return;

      if (audioRef.current && audioRef.current.paused) {
        audioRef.current.play().then(() => {
          setIsPlaying(true);
          removeGestureListeners();
        }).catch(() => {});
      }
    };

    const removeGestureListeners = () => {
      window.removeEventListener('click', handleGesture);
      window.removeEventListener('touchstart', handleGesture);
      window.removeEventListener('pointerdown', handleGesture);
      window.removeEventListener('keydown', handleGesture);
    };

    window.addEventListener('click', handleGesture);
    window.addEventListener('touchstart', handleGesture);
    window.addEventListener('pointerdown', handleGesture);
    window.addEventListener('keydown', handleGesture);

    return () => {
      removeGestureListeners();
      if (audioRef.current) {
        audioRef.current.pause();
      }
    };
  }, []);

  return (
    <div className="fixed bottom-6 right-6 z-[99999] flex items-center">
      <audio ref={audioRef} loop autoPlay preload="auto">
        <source src="/Sonnngg.mp3" type="audio/mpeg" />
      </audio>

      {/* Retro CD Player Button */}
      <button
        id="retro-cd-button"
        onClick={togglePlay}
        className="group relative flex items-center gap-2.5 p-1.5 pr-4 rounded-full bg-black/60 hover:bg-black/80 backdrop-blur-xl border border-white/30 shadow-[0_10px_30px_rgba(0,0,0,0.6)] active:scale-95 transition-all duration-300 cursor-pointer hover:border-rose-300/60"
        title={isPlaying ? "Click to Pause Retro CD" : "Click to Play Retro CD"}
        aria-label="Toggle Retro CD Music"
      >
        {/* Floating Musical Notes when Playing */}
        {isPlaying && (
          <>
            <span className="absolute -top-5 left-3 text-xs animate-bounce text-pink-300 pointer-events-none">🎵</span>
            <span className="absolute -top-7 right-4 text-sm animate-pulse text-rose-400 pointer-events-none">🎶</span>
          </>
        )}

        {/* Retro CD Disc Body */}
        <div
          className={`relative w-12 h-12 md:w-14 md:h-14 rounded-full bg-gradient-to-tr from-gray-900 via-gray-850 to-gray-950 border-2 border-gray-400/50 shadow-lg flex items-center justify-center overflow-hidden transition-transform ${
            isPlaying ? 'animate-[spin_4s_linear_infinite]' : ''
          }`}
        >
          {/* CD Metallic Grooves & Reflection Overlay */}
          <div 
            className="absolute inset-0 rounded-full opacity-45 pointer-events-none"
            style={{
              background: 'conic-gradient(from 0deg, transparent 0deg, rgba(255,255,255,0.4) 45deg, transparent 90deg, rgba(255,255,255,0.4) 225deg, transparent 270deg)'
            }}
          ></div>

          {/* Concentric Groove Rings */}
          <div className="absolute inset-1 rounded-full border border-gray-600/40"></div>
          <div className="absolute inset-2.5 rounded-full border border-gray-600/30"></div>

          {/* Retro Center Vinyl Label */}
          <div className="w-5 h-5 md:w-6 md:h-6 rounded-full bg-gradient-to-br from-rose-600 to-red-800 border border-rose-200/80 shadow-md flex items-center justify-center relative z-10">
            {/* Center Spindle Hole */}
            <div className="w-1.5 h-1.5 rounded-full bg-gray-950 border border-gray-300"></div>
          </div>
        </div>

        {/* Retro Label Text */}
        <div className="flex flex-col items-start font-sriracha text-left">
          <span className="text-[10px] text-rose-300/90 uppercase tracking-widest font-sans leading-tight">Retro CD</span>
          <span className="text-xs md:text-sm font-medium text-white drop-shadow flex items-center gap-1">
            {isPlaying ? "Playing... 🎵" : "Tap to Play 🎵"}
          </span>
        </div>
      </button>
    </div>
  );
};

export default BackgroundMusic;
