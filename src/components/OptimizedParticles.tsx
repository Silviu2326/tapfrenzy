import { useEffect, useRef, useState } from 'react';
import { particlePool, Particle, autoAdjustQuality, QUALITY_PRESETS } from '../systems/ParticleSystem';

interface OptimizedParticlesProps {
  trigger: number; // Cambia para activar efecto
  x: number;
  y: number;
  tier: number;
  type: 'merge' | 'explosion' | 'sparkle' | 'trail';
}

export default function OptimizedParticles({ trigger, x, y, tier, type }: OptimizedParticlesProps) {
  const [particles, setParticles] = useState<Particle[]>([]);
  const animationRef = useRef<number | null>(null);
  const lastTriggerRef = useRef(trigger);
  const qualityRef = useRef(QUALITY_PRESETS.medium);

  // Auto-ajustar calidad al inicio
  useEffect(() => {
    autoAdjustQuality().then(quality => {
      qualityRef.current = quality;
      particlePool.setQuality(quality);
    });
  }, []);

  // Crear partículas cuando cambia trigger
  useEffect(() => {
    if (trigger === lastTriggerRef.current) return;
    lastTriggerRef.current = trigger;

    const quality = qualityRef.current;
    let newParticles: Particle[] = [];

    switch (type) {
      case 'merge':
        // Partículas según tier
        if (tier < 3) {
          // Tiers bajos: partículas simples
          newParticles = particlePool.createExplosion(
            x, y, 
            getTierColor(tier), 
            quality.maxParticles > 15 ? 8 : 5,
            4,
            3,
            'circle'
          );
        } else if (tier < 6) {
          // Tiers medios: chispas
          newParticles = [
            ...particlePool.createExplosion(x, y, getTierColor(tier), quality.maxParticles > 15 ? 12 : 8, 5, 4, 'circle'),
            ...particlePool.createSparks(x, y, '#FFD700', quality.maxParticles > 15 ? 6 : 4)
          ];
        } else {
          // Tiers altos: explosión épica
          newParticles = [
            ...particlePool.createExplosion(x, y, getTierColor(tier), quality.maxParticles > 15 ? 15 : 10, 6, 5, 'circle'),
            ...particlePool.createSparks(x, y, '#FFD700', quality.maxParticles > 15 ? 8 : 5),
            ...particlePool.createStars(x, y, quality.maxParticles > 15 ? 6 : 4)
          ];
        }
        break;

      case 'explosion':
        newParticles = particlePool.createExplosion(
          x, y, '#FF6B00', quality.maxParticles > 15 ? 12 : 8, 6
        );
        break;

      case 'sparkle':
        newParticles = particlePool.createSparks(x, y, '#FFD700', quality.maxParticles > 15 ? 6 : 4);
        break;

      case 'trail':
        // Rastro simple
        if (quality.trails) {
          const particle = particlePool.spawn(x, y, 0, 0, 'rgba(255,255,200,0.5)', 2, 'trail', 0.5);
          if (particle) newParticles.push(particle);
        }
        break;
    }

    setParticles(prev => [...prev, ...newParticles]);
  }, [trigger, x, y, tier, type]);

  // Animación optimizada
  useEffect(() => {
    const animate = () => {
      const activeParticles = particlePool.update(16); // asumir 60fps
      setParticles([...activeParticles]);
      
      if (activeParticles.length > 0) {
        animationRef.current = requestAnimationFrame(animate);
      }
    };

    if (particles.length > 0) {
      animationRef.current = requestAnimationFrame(animate);
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [particles.length]);

  const getTierColor = (tier: number): string => {
    const colors = [
      '#D4763A', // Morena
      '#FF8C33', // Guajira
      '#8B6FBF', // Sifrina
      '#C0392B', // Candela
      '#2E86C1', // Catira
      '#27AE60', // Medusa
      '#FF6B00', // Vaso
      '#E67E22', // Jarra
      '#8B4513', // Barril
    ];
    return colors[tier] || '#FF6B00';
  };

  return (
    <>
      {particles.map(particle => (
        <div
          key={particle.id}
          className={`optimized-particle ${particle.type}`}
          style={{
            left: particle.x - particle.size / 2,
            top: particle.y - particle.size / 2,
            width: particle.size,
            height: particle.size,
            backgroundColor: particle.type === 'star' ? 'transparent' : particle.color,
            opacity: particle.life / particle.maxLife,
            transform: `rotate(${particle.rotation}deg) scale(${particle.life / particle.maxLife})`,
            boxShadow: qualityRef.current.glow ? `0 0 ${particle.size}px ${particle.color}` : 'none',
          }}
        >
          {particle.type === 'star' && '★'}
        </div>
      ))}
    </>
  );
}
