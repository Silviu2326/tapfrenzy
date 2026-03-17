import { useEffect, useState, useRef } from 'react';

interface TrailDot {
  id: number;
  x: number;
  y: number;
  opacity: number;
  scale: number;
}

interface FallingTrailProps {
  x: number;
  y: number;
  active: boolean;
  color?: string;
}

export default function FallingTrail({ x, y, active, color = 'rgba(255, 255, 200, 0.6)' }: FallingTrailProps) {
  const [trail, setTrail] = useState<TrailDot[]>([]);
  const lastPosRef = useRef({ x, y });
  const dotIdRef = useRef(0);

  useEffect(() => {
    if (!active) {
      setTrail([]);
      return;
    }

    // Crear nuevo punto si se movió suficiente
    const distance = Math.sqrt(
      Math.pow(x - lastPosRef.current.x, 2) + 
      Math.pow(y - lastPosRef.current.y, 2)
    );

    if (distance > 5) {
      const newDot: TrailDot = {
        id: dotIdRef.current++,
        x,
        y,
        opacity: 0.6,
        scale: 1,
      };

      setTrail(prev => [...prev.slice(-10), newDot]); // Mantener solo últimos 10
      lastPosRef.current = { x, y };
    }
  }, [x, y, active]);

  // Animar desvanecimiento
  useEffect(() => {
    if (trail.length === 0) return;

    const interval = setInterval(() => {
      setTrail(prev =>
        prev
          .map(dot => ({
            ...dot,
            opacity: dot.opacity - 0.05,
            scale: dot.scale - 0.02,
          }))
          .filter(dot => dot.opacity > 0)
      );
    }, 50);

    return () => clearInterval(interval);
  }, [trail.length]);

  return (
    <>
      {trail.map(dot => (
        <div
          key={dot.id}
          className="trail-dot"
          style={{
            left: dot.x - 3,
            top: dot.y - 3,
            width: 6 * dot.scale,
            height: 6 * dot.scale,
            backgroundColor: color,
            opacity: dot.opacity,
          }}
        />
      ))}
    </>
  );
}
