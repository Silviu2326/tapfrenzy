import { useEffect, useState, useCallback } from 'react';

interface ConfettiPiece {
  id: number;
  x: number;
  y: number;
  color: string;
  rotation: number;
  rotationSpeed: number;
  scale: number;
  velocityY: number;
  velocityX: number;
  sway: number;
}

interface ConfettiSystemProps {
  active: boolean;
  count?: number;
  duration?: number;
}

export default function ConfettiSystem({ active, count = 50, duration = 3000 }: ConfettiSystemProps) {
  const [pieces, setPieces] = useState<ConfettiPiece[]>([]);

  const createPieces = useCallback(() => {
    const colors = ['#FF6B00', '#FFD700', '#FF8C33', '#CC5500', '#FF6B35', '#FFA500', '#27AE60', '#3498DB'];
    const newPieces: ConfettiPiece[] = [];

    for (let i = 0; i < count; i++) {
      newPieces.push({
        id: Date.now() + i,
        x: Math.random() * 100, // porcentaje
        y: -10 - Math.random() * 20,
        color: colors[Math.floor(Math.random() * colors.length)],
        rotation: Math.random() * 360,
        rotationSpeed: (Math.random() - 0.5) * 10,
        scale: 0.5 + Math.random() * 0.8,
        velocityY: 2 + Math.random() * 3,
        velocityX: (Math.random() - 0.5) * 2,
        sway: Math.random() * 2,
      });
    }

    return newPieces;
  }, [count]);

  useEffect(() => {
    if (!active) {
      setPieces([]);
      return;
    }

    const newPieces = createPieces();
    setPieces(newPieces);

    const startTime = Date.now();
    let animationId: number;

    const animate = () => {
      const elapsed = Date.now() - startTime;

      if (elapsed >= duration) {
        setPieces([]);
        return;
      }

      setPieces(prev =>
        prev.map(piece => ({
          ...piece,
          y: piece.y + piece.velocityY * 0.5,
          x: piece.x + Math.sin(elapsed * 0.002 + piece.sway) * 0.1,
          rotation: piece.rotation + piece.rotationSpeed,
        })).filter(piece => piece.y < 110)
      );

      animationId = requestAnimationFrame(animate);
    };

    animationId = requestAnimationFrame(animate);

    return () => {
      if (animationId) cancelAnimationFrame(animationId);
    };
  }, [active, createPieces, duration]);

  if (pieces.length === 0) return null;

  return (
    <div className="confetti-system">
      {pieces.map(piece => (
        <div
          key={piece.id}
          className="confetti-piece-enhanced"
          style={{
            left: `${piece.x}%`,
            top: `${piece.y}%`,
            backgroundColor: piece.color,
            transform: `rotate(${piece.rotation}deg) scale(${piece.scale})`,
          }}
        />
      ))}
    </div>
  );
}
