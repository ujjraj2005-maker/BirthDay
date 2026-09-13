import React, { useState, useEffect, useRef } from 'react';

// =========================================================================
// 🎵 WEB AUDIO MUSIC BOX SYNTHESIZER (Fallback Birthday Melody)
// Generates a sweet vintage music-box Happy Birthday chime with 0 network calls!
// =========================================================================
class MusicBoxSynthesizer {
  constructor() {
    this.audioCtx = null;
    this.timer = null;
    this.isPlaying = false;

    this.notes = [
      { note: 261.63, dur: 0.4, pause: 0.45 }, // C4
      { note: 261.63, dur: 0.4, pause: 0.45 }, // C4
      { note: 293.66, dur: 0.7, pause: 0.8 },  // D4
      { note: 261.63, dur: 0.7, pause: 0.8 },  // C4
      { note: 349.23, dur: 0.7, pause: 0.8 },  // F4
      { note: 329.63, dur: 1.2, pause: 1.4 },  // E4

      { note: 261.63, dur: 0.4, pause: 0.45 }, // C4
      { note: 261.63, dur: 0.4, pause: 0.45 }, // C4
      { note: 293.66, dur: 0.7, pause: 0.8 },  // D4
      { note: 261.63, dur: 0.7, pause: 0.8 },  // C4
      { note: 392.00, dur: 0.7, pause: 0.8 },  // G4
      { note: 349.23, dur: 1.2, pause: 1.4 },  // F4

      { note: 261.63, dur: 0.4, pause: 0.45 }, // C4
      { note: 261.63, dur: 0.4, pause: 0.45 }, // C4
      { note: 523.25, dur: 0.7, pause: 0.8 },  // C5
      { note: 440.00, dur: 0.7, pause: 0.8 },  // A4
      { note: 349.23, dur: 0.7, pause: 0.8 },  // F4
      { note: 329.63, dur: 0.7, pause: 0.8 },  // E4
      { note: 293.66, dur: 1.0, pause: 1.2 },  // D4

      { note: 466.16, dur: 0.4, pause: 0.45 }, // A#4
      { note: 466.16, dur: 0.4, pause: 0.45 }, // A#4
      { note: 440.00, dur: 0.7, pause: 0.8 },  // A4
      { note: 349.23, dur: 0.7, pause: 0.8 },  // F4
      { note: 392.00, dur: 0.7, pause: 0.8 },  // G4
      { note: 349.23, dur: 1.4, pause: 1.8 },  // F4
    ];
  }

  init() {
    if (!this.audioCtx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      this.audioCtx = new AudioCtx();
    }
    if (this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
  }

  playNote(freq, duration) {
    if (!this.audioCtx) return;
    try {
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();

      osc.type = 'sine'; // Soft music-box chime
      osc.frequency.setValueAtTime(freq, this.audioCtx.currentTime);

      gain.gain.setValueAtTime(0.001, this.audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.18, this.audioCtx.currentTime + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.0001, this.audioCtx.currentTime + duration);

      osc.connect(gain);
      gain.connect(this.audioCtx.destination);

      osc.start();
      osc.stop(this.audioCtx.currentTime + duration);
    } catch (e) {}
  }

  start() {
    this.init();
    if (this.isPlaying) return;
    this.isPlaying = true;
    let step = 0;

    const tick = () => {
      if (!this.isPlaying) return;
      const current = this.notes[step];
      this.playNote(current.note, current.dur);

      step = (step + 1) % this.notes.length;
      this.timer = setTimeout(tick, current.pause * 1000);
    };

    tick();
  }

  stop() {
    this.isPlaying = false;
    if (this.timer) clearTimeout(this.timer);
  }
}

const synthPlayer = new MusicBoxSynthesizer();

const BackgroundMusic = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef(null);
  const hasUnlockedRef = useRef(false);

  const startAudio = () => {
    if (audioRef.current) {
      audioRef.current.play().then(() => {
        setIsPlaying(true);
        hasUnlockedRef.current = true;
      }).catch(() => {
        synthPlayer.start();
        setIsPlaying(true);
        hasUnlockedRef.current = true;
      });
    } else {
      synthPlayer.start();
      setIsPlaying(true);
      hasUnlockedRef.current = true;
    }
  };

  const togglePlay = (e) => {
    if (e) {
      e.stopPropagation();
    }
    if (isPlaying) {
      if (audioRef.current) audioRef.current.pause();
      synthPlayer.stop();
      setIsPlaying(false);
    } else {
      startAudio();
    }
  };

  useEffect(() => {
    // 1. Attempt autoplay on initial mount
    startAudio();

    // 2. First gesture listener to unlock audio if browser autoplay blocked zero-gesture playback
    const handleGesture = (e) => {
      // Ignore if user clicked directly on the Retro CD button (togglePlay handles that)
      if (e.target && e.target.closest('#retro-cd-button')) return;

      if (!hasUnlockedRef.current) {
        startAudio();
        removeListeners();
      }
    };

    const removeListeners = () => {
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
      removeListeners();
      synthPlayer.stop();
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
