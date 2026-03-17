import { useEffect, useState } from 'react';

interface FlashEffectProps {
  trigger: number;
  duration?: number;
  intensity?: 'low' | 'medium' | 'high';
}

export default function FlashEffect({ trigger, duration = 300, intensity = 'medium' }: FlashEffectProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (trigger === 0) return;

    setIsVisible(true);
    const timer = setTimeout(() => {
      setIsVisible(false);
    }, duration);

    return () => clearTimeout(timer);
  }, [trigger, duration]);

  if (!isVisible) return null;

  const opacity = intensity === 'high' ? 0.8 : intensity === 'medium' ? 0.5 : 0.3;

  return (
    <div
      className="flash-overlay"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: `rgba(255, 255, 255, ${opacity})`,
        pointerEvents: 'none',
        zIndex: 100,
        animation: `flash-fade ${duration}ms ease-out`,
      }}
    />
  );
}

// Hook para usar destellos
export function useFlash() {
  const [flashTrigger, setFlashTrigger] = useState(0);

  const triggerFlash = () => {
    setFlashTrigger(prev => prev + 1);
  };

  return { flashTrigger, triggerFlash };
}
