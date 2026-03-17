// ==========================================
// INTRO VIDEO - Mr. Cool Cat Tap Frenzy (Web)
// ==========================================

import { useEffect, useRef, useState } from 'react';
import { INTRO_VIDEO, THEME_COLOR } from './config';

interface IntroVideoProps {
  onComplete: () => void;
  onSkip: () => void;
}

export const IntroVideo = ({ onComplete, onSkip }: IntroVideoProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isReady, setIsReady] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const hasStarted = useRef(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) {
      console.log('[IntroVideo] No video ref yet');
      return;
    }

    console.log('[IntroVideo] Setting up video, readyState:', video.readyState);

    const handleEnded = () => {
      console.log('[IntroVideo] Video ended');
      onComplete();
    };

    const handleCanPlay = () => {
      console.log('[IntroVideo] Can play event');
      setIsReady(true);
    };

    const handleLoadedData = () => {
      console.log('[IntroVideo] Loaded data event');
      setIsReady(true);
    };

    const handleError = (e: Event) => {
      console.error('[IntroVideo] Error:', video.error, e);
      // Si hay error, permitir saltar
      setIsReady(true);
    };

    // Event listeners
    video.addEventListener('ended', handleEnded);
    video.addEventListener('canplay', handleCanPlay);
    video.addEventListener('canplaythrough', handleCanPlay);
    video.addEventListener('loadeddata', handleLoadedData);
    video.addEventListener('error', handleError);

    // Check if already ready
    if (video.readyState >= 3) {
      console.log('[IntroVideo] Already ready, showing button');
      setIsReady(true);
    } else {
      // Force load
      video.load();
    }

    // Safety timeout - show button after 3 seconds regardless
    const timeout = setTimeout(() => {
      console.log('[IntroVideo] Timeout reached');
      setIsReady(true);
    }, 3000);

    return () => {
      clearTimeout(timeout);
      video.removeEventListener('ended', handleEnded);
      video.removeEventListener('canplay', handleCanPlay);
      video.removeEventListener('canplaythrough', handleCanPlay);
      video.removeEventListener('loadeddata', handleLoadedData);
      video.removeEventListener('error', handleError);
    };
  }, []);

  const handleStart = async () => {
    if (hasStarted.current) return;
    hasStarted.current = true;

    const video = videoRef.current;
    if (!video) {
      onSkip();
      return;
    }

    setIsPlaying(true);

    try {
      video.muted = false;
      video.currentTime = 0;
      await video.play();
      console.log('[IntroVideo] Playing');
    } catch (err) {
      console.error('[IntroVideo] Play error:', err);
      onSkip();
    }
  };

  const handleSkip = () => {
    onSkip();
  };

  return (
    <div className="intro-container">
      {/* Loading screen */}
      {!isReady && (
        <div className="loading-screen">
          <div className="loading-spinner">
            <div className="spinner-ring"></div>
            <div className="spinner-ring"></div>
            <div className="spinner-ring"></div>
          </div>
          <span className="loading-text">CARGANDO...</span>
          <div className="loading-beer">🍺</div>
          <button 
            className="intro-skip-button"
            onClick={handleSkip}
            style={{ 
              borderColor: THEME_COLOR,
              marginTop: '20px',
              position: 'relative',
              top: 'auto',
              right: 'auto',
            }}
          >
            Saltar ⏭
          </button>
        </div>
      )}

      {/* Start button */}
      {isReady && !isPlaying && (
        <div className="start-screen" onClick={handleStart}>
          <div className="start-button-circle">
            <span className="start-icon">▶</span>
          </div>
          <span className="start-text">TOCA PARA INICIAR</span>
        </div>
      )}
      
      {/* Video */}
      <video
        ref={videoRef}
        className="intro-video"
        src={INTRO_VIDEO}
        preload="auto"
        playsInline
        muted
        style={{ 
          opacity: isPlaying ? 1 : 0,
          transition: 'opacity 0.3s ease'
        }}
      />
      
      {/* Skip button during playback */}
      {isPlaying && (
        <button 
          className="intro-skip-button"
          onClick={handleSkip}
          style={{ 
            borderColor: THEME_COLOR,
            opacity: 1,
          }}
        >
          Saltar ⏭
        </button>
      )}
    </div>
  );
};
