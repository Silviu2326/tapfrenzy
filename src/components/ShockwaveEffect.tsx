import { useEffect, useState } from 'react';

interface ShockwaveEffectProps {
  x: number;
  y: number;
  trigger: number;
  intensity?: 'low' | 'medium' | 'high';
}

export default function ShockwaveEffect({ x, y, trigger, intensity = 'medium' }: ShockwaveEffectProps) {
  const [waves, setWaves] = useState<Array<{ id: number; scale: number; opacity: number }>>([]);

  useEffect(() => {
    if (trigger === 0) return;

    const newWave = {
      id: Date.now(),
      scale: 0,
      opacity: 1,
    };

    setWaves(prev => [...prev, newWave]);

    // Animar la onda
    const duration = intensity === 'high' ? 800 : intensity === 'medium' ? 600 : 400;
    const maxScale = intensity === 'high' ? 3 : intensity === 'medium' ? 2.5 : 2;

    const startTime = Date.now();
    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = elapsed / duration;

      if (progress >= 1) {
        setWaves(prev => prev.filter(w => w.id !== newWave.id));
        return;
      }

      setWaves(prev =>
        prev.map(w =>
          w.id === newWave.id
            ? {
                ...w,
                scale: progress * maxScale,
                opacity: 1 - progress,
              }
            : w
        )
      );

      requestAnimationFrame(animate);
    };

    requestAnimationFrame(animate);
  }, [trigger, intensity]);

  const size = intensity === 'high' ? 100 : intensity === 'medium' ? 80 : 60;

  return (
    <>
      {waves.map(wave => (
        <div
          key={wave.id}
          className="shockwave-ring"
          style={{
            left: x - size / 2,
            top: y - size / 2,
            width: size,
            height: size,
            transform: `scale(${wave.scale})`,
            opacity: wave.opacity,
          }}
        />
      ))}
    </>
  );
}

// Hook para usar ondas de choque
export function useShockwave() {
  const [shockwaves, setShockwaves] = useState<Array<{ x: number; y: number; trigger: number; intensity: 'low' | 'medium' | 'high' }>>([]);

  const createShockwave = (x: number, y: number, intensity: 'low' | 'medium' | 'high' = 'medium') => {
    setShockwaves(prev => [
      ...prev,
      { x, y, trigger: Date.now(), intensity }
    ]);

    // Limpiar después de la animación
    setTimeout(() => {
      setShockwaves(prev => prev.filter((_, i) => i !== 0));
    }, 1000);
  };

  return { shockwaves, createShockwave };
}
