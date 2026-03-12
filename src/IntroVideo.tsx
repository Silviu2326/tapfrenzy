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
  const [isLoaded, setIsLoaded] = useState(false);
  const [loadProgress, setLoadProgress] = useState(0);
  const [showStartButton, setShowStartButton] = useState(false);
  const hasStarted = useRef(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || hasStarted.current) return;

    const handleEnded = () => {
      onComplete();
    };

    const handleProgress = () => {
      if (video.buffered.length > 0 && video.duration > 0) {
        const bufferedEnd = video.buffered.end(video.buffered.length - 1);
        const progress = (bufferedEnd / video.duration) * 100;
        setLoadProgress(progress);
      }
    };

    const handleCanPlay = () => {
      console.log('[IntroVideo] Video ready');
      setIsLoaded(true);
      setShowStartButton(true);
    };

    const handleError = () => {
      console.error('[IntroVideo] Video error');
      onSkip();
    };

    // Eventos
    video.addEventListener('ended', handleEnded);
    video.addEventListener('canplay', handleCanPlay);
    video.addEventListener('canplaythrough', handleCanPlay);
    video.addEventListener('progress', handleProgress);
    video.addEventListener('error', handleError);

    // Precargar video
    video.load();

    return () => {
      video.removeEventListener('ended', handleEnded);
      video.removeEventListener('canplay', handleCanPlay);
      video.removeEventListener('canplaythrough', handleCanPlay);
      video.removeEventListener('progress', handleProgress);
      video.removeEventListener('error', handleError);
    };
  }, [onComplete, onSkip]);

  const handleStart = async () => {
    if (hasStarted.current) return;
    hasStarted.current = true;

    const video = videoRef.current;
    if (!video) return;

    setShowStartButton(false);

    try {
      // Ahora podemos reproducir CON sonido porque hubo interacción
      video.muted = false;
      await video.play();
      console.log('[IntroVideo] Playing with sound!');
    } catch (error) {
      console.error('[IntroVideo] Failed to play:', error);
      onSkip();
    }
  };

  return (
    <div className="intro-container">
      {/* Pantalla de carga */}
      {!isLoaded && (
        <div className="loading-screen">
          <div className="loading-spinner">
            <div className="spinner-ring"></div>
            <div className="spinner-ring"></div>
            <div className="spinner-ring"></div>
          </div>
          <span className="loading-text">CARGANDO...</span>
          <div className="loading-progress">{Math.round(loadProgress)}%</div>
          <div className="loading-beer">🍺</div>
        </div>
      )}

      {/* Botón de inicio - REQUIERE INTERACCIÓN PARA SONIDO */}
      {showStartButton && (
        <div className="start-screen" onClick={handleStart}>
          <div className="start-button-circle">
            <span className="start-icon">▶</span>
          </div>
          <span className="start-text">TOCA PARA INICIAR</span>
        </div>
      )}
      
      {/* Video a pantalla completa */}
      <video
        ref={videoRef}
        className="intro-video"
        src={INTRO_VIDEO}
        preload="auto"
        playsInline
        style={{ 
          opacity: isLoaded && !showStartButton ? 1 : 0, 
          transition: 'opacity 0.5s ease'
        }}
      />
      
      {/* Skip button - solo visible cuando el video está reproduciéndose */}
      <button 
        className="intro-skip-button"
        onClick={onSkip}
        style={{ 
          borderColor: THEME_COLOR,
          opacity: isLoaded && !showStartButton ? 1 : 0,
          transition: 'opacity 0.3s',
        }}
      >
        Saltar ⏭
      </button>
    </div>
  );
};
