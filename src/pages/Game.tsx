import { useRef, useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Matter from 'matter-js';

import {
  GAME_WIDTH,
  GAME_HEIGHT,
  AREA,
  DANGER_Y,
  GAME_OVER_Y,
  DROP_Y,
  DROP_CD,
  TIERS,
  BG_IMAGE,
  getRandomTier,
  THEME_COLOR,
  getTrapezoidBounds,
} from '../config';
import {
  createPhysicsEngine,
  createBottle,
  checkCollisions,
  updatePhysics,
  removeBody,
  clearWorld,
  setVelocity,
  clampBottles,
  BottleBody,
  MergeData,
} from '../physics';
import {
  initAudio,
  playDrop,
  playMerge,
  playGameOver,
  playClink,
  playStart,
  toggleSound,
  playBackgroundMusic,
  stopBackgroundMusic,
  vibrateLight,
  vibrateMedium,
  vibrateHeavy,
  vibrateError,
} from '../sounds';

interface Particle {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  sz: number;
  color: string;
  star: boolean;
  rotation: number;
  rotationSpeed: number;
}

interface FloatingText {
  id: number;
  x: number;
  y: number;
  t: string;
  c: string;
  life: number;
  vy: number;
}

export default function Game() {
  const navigate = useNavigate();
  
  // Referencias
  const engineRef = useRef<Matter.Engine | null>(null);
  const worldRef = useRef<Matter.World | null>(null);
  const gameLoopRef = useRef<number | null>(null);
  const lastTimeRef = useRef(0);
  const isDangerRef = useRef(false);
  const bottlesMapRef = useRef<Map<number, BottleBody>>(new Map());
  const dangerZoneEntryRef = useRef<Map<number, number>>(new Map());
  const gameAreaRef = useRef<HTMLDivElement>(null);
  const particleContainerRef = useRef<HTMLDivElement>(null);
  
  // Estados del juego
  const [gameState, setGameState] = useState<'play' | 'over'>('play');
  const [bottles, setBottles] = useState<BottleBody[]>([]);
  const [score, setScore] = useState(0);
  const [dScore, setDScore] = useState(0);
  const [bestScore, setBestScore] = useState(0);
  const [currentTier, setCurrentTier] = useState(0);
  const [nextTier, setNextTier] = useState(0);
  const [combo, setCombo] = useState(0);
  const [comboTime, setComboTime] = useState(0);
  const [maxTier, setMaxTier] = useState(0);
  const [dropX, setDropX] = useState(GAME_WIDTH / 2);
  const [canDrop, setCanDrop] = useState(true);
  const [lastDrop, setLastDrop] = useState(0);
  const [isNewRecord, setIsNewRecord] = useState(false);
  const [soundOn, setSoundOn] = useState(true);
  const [isDangerActive, setIsDangerActive] = useState(false);
  const [particles, setParticles] = useState<Particle[]>([]);
  const [floatingTexts, setFloatingTexts] = useState<FloatingText[]>([]);
  const [shake, setShake] = useState({ x: 0, y: 0 });
  
  // Calcular escala para responsive
  const [scale, setScale] = useState(1);
  
  useEffect(() => {
    const updateScale = () => {
      const screenWidth = window.innerWidth;
      const screenHeight = window.innerHeight - 80;
      const scaleX = screenWidth / GAME_WIDTH;
      const scaleY = screenHeight / GAME_HEIGHT;
      setScale(Math.min(scaleX, scaleY, 1));
    };
    
    updateScale();
    window.addEventListener('resize', updateScale);
    return () => window.removeEventListener('resize', updateScale);
  }, []);

  // Inicializar física y audio
  useEffect(() => {
    const { engine, world } = createPhysicsEngine();
    engineRef.current = engine;
    worldRef.current = world;
    
    initAudio();
    
    // Cargar mejor puntuación
    const saved = localStorage.getItem('mcc_best');
    if (saved) setBestScore(parseInt(saved));
    
    // Inicializar tiers
    setCurrentTier(getRandomTier());
    setNextTier(getRandomTier());
    
    playStart();
    playBackgroundMusic();
    
    return () => {
      if (gameLoopRef.current) {
        cancelAnimationFrame(gameLoopRef.current);
      }
      stopBackgroundMusic();
    };
  }, []);

  // Callback de merge
  const handleMerge = useCallback((mergeData: MergeData) => {
    const { x, y, oldTier, newTier, bodyA, bodyB } = mergeData;
    
    if (worldRef.current) {
      removeBody(worldRef.current, bodyA);
      bottlesMapRef.current.delete(bodyA.id);
      removeBody(worldRef.current, bodyB);
      bottlesMapRef.current.delete(bodyB.id);
    }

    if (worldRef.current) {
      const newBody = createBottle(x, y, newTier);
      setVelocity(newBody, { x: 0, y: 2 });
      Matter.World.add(worldRef.current, newBody);
      bottlesMapRef.current.set(newBody.id, newBody);
    }
    
    const pts = TIERS[oldTier].pts;
    const newCombo = combo + 1;
    const comboMultiplier = Math.min(newCombo, 5);
    const totalPts = pts * comboMultiplier;
    
    setCombo(newCombo);
    setComboTime(1500);
    setScore(prev => prev + totalPts);
    if (newTier > maxTier) setMaxTier(newTier);
    
    const particleColor = newTier >= 6 ? '#FFD700' : TIERS[newTier].c;
    const particleCount = newTier >= 6 ? 8 : 12 + newTier * 2;
    spawnParticles(x, y, particleColor, particleCount);
    if (newTier >= 6) spawnStars(x, y);
    
    const label = newCombo > 1 ? `+${totalPts} x${newCombo}` : `+${totalPts}`;
    const color = newCombo > 1 ? '#FF6B35' : THEME_COLOR;
    addFloatingText(x, y - 20, label, color);
    
    playMerge(newTier);
    
    if (newTier >= 6) vibrateHeavy();
    else if (newTier >= 3) vibrateMedium();
    else vibrateLight();
  }, [combo, maxTier]);

  const handleClink = useCallback((force: number) => {
    if (force > 0.5) {
      playClink(force);
    }
  }, []);

  useEffect(() => {
    if (!engineRef.current) return;
    const cleanup = checkCollisions(engineRef.current, handleMerge, handleClink);
    return cleanup;
  }, [handleMerge, handleClink]);

  useEffect(() => {
    if (gameState !== 'play') return;
    
    const gameLoop = (timestamp: number) => {
      if (!lastTimeRef.current) lastTimeRef.current = timestamp;
      const dt = Math.min(timestamp - lastTimeRef.current, 32);
      lastTimeRef.current = timestamp;
      
      if (engineRef.current) {
        updatePhysics(engineRef.current, dt);
      }
      
      if (worldRef.current) {
        clampBottles(worldRef.current);
      }
      
      if (comboTime > 0) {
        const newComboTime = comboTime - dt;
        setComboTime(newComboTime);
        if (newComboTime <= 0) {
          setCombo(0);
          setComboTime(0);
        }
      }
      
      setDScore(prev => prev + (score - prev) * 0.15);
      
      const currentBottles = Array.from(bottlesMapRef.current.values());
      const now = Date.now();

      currentBottles.forEach(bottle => {
        const tier = TIERS[bottle.tierIndex];
        if (!tier) return;
        
        const collisionRadius = tier.r * 0.85;
        const bottleTop = bottle.position.y - collisionRadius;
        const inDangerZone = bottleTop > GAME_OVER_Y;
        const isInvulnerable = bottle.invulnerableUntil && now < bottle.invulnerableUntil;
        const wasInvulnerable = dangerZoneEntryRef.current.get(bottle.id) === -1;
        
        if (inDangerZone && !isInvulnerable) {
          if (!dangerZoneEntryRef.current.has(bottle.id) || wasInvulnerable) {
            dangerZoneEntryRef.current.set(bottle.id, now);
          }
        } else if (inDangerZone && isInvulnerable) {
          dangerZoneEntryRef.current.set(bottle.id, -1);
        } else {
          if (dangerZoneEntryRef.current.has(bottle.id)) {
            dangerZoneEntryRef.current.delete(bottle.id);
          }
        }
      });

      const newIsDanger = currentBottles.some(b => {
        const t = TIERS[b.tierIndex];
        const collisionRadius = t ? t.r * 0.85 : 17;
        return t && b.position.y + collisionRadius > DANGER_Y && now - b.born > 800;
      });
      if (newIsDanger !== isDangerRef.current) {
        isDangerRef.current = newIsDanger;
        setIsDangerActive(newIsDanger);
        if (newIsDanger) shakeScreen(4);
      }

      if (checkGameOver()) {
        doGameOver();
        return;
      }

      setBottles([...currentBottles]);
      
      gameLoopRef.current = requestAnimationFrame(gameLoop);
    };
    
    gameLoopRef.current = requestAnimationFrame(gameLoop);
    
    return () => {
      if (gameLoopRef.current) {
        cancelAnimationFrame(gameLoopRef.current);
      }
    };
  }, [gameState, score, comboTime]);

  const checkGameOver = () => {
    const now = Date.now();
    
    for (const [, entryTime] of dangerZoneEntryRef.current.entries()) {
      if (entryTime > 0 && now - entryTime > 3000) {
        return true;
      }
    }
    
    for (const bottle of bottlesMapRef.current.values()) {
      const tier = TIERS[bottle.tierIndex];
      const isInvulnerable = bottle.invulnerableUntil && now < bottle.invulnerableUntil;
      const collisionRadius = tier ? tier.r * 0.85 : 17;
      if (tier && bottle.position.y + collisionRadius > DANGER_Y && now - bottle.born > 2500 && !isInvulnerable) {
        return true;
      }
    }
    return false;
  };

  const doGameOver = () => {
    setGameState('over');
    playGameOver();
    vibrateError();
    stopBackgroundMusic();

    if (score > bestScore) {
      setBestScore(score);
      setIsNewRecord(true);
      localStorage.setItem('mcc_best', score.toString());
    } else {
      setIsNewRecord(false);
    }
    
    if (gameLoopRef.current) {
      cancelAnimationFrame(gameLoopRef.current);
    }
  };

  const handleRestart = () => {
    if (worldRef.current) {
      clearWorld(worldRef.current);
    }
    setScore(0);
    setDScore(0);
    setCombo(0);
    setComboTime(0);
    setMaxTier(0);
    setCurrentTier(getRandomTier());
    setNextTier(getRandomTier());
    bottlesMapRef.current.clear();
    dangerZoneEntryRef.current.clear();
    setParticles([]);
    setFloatingTexts([]);
    setBottles([]);
    setIsDangerActive(false);
    isDangerRef.current = false;
    setGameState('play');
    lastTimeRef.current = 0;
    playStart();
    playBackgroundMusic();
  };

  const handleMenu = () => {
    navigate('/menu');
  };
  
  const dropBottle = (x: number) => {
    if (!canDrop || Date.now() - lastDrop < DROP_CD || !worldRef.current) return;

    const tier = TIERS[currentTier];
    const collisionRadius = tier.r * 0.85;
    const bounds = getTrapezoidBounds(DROP_Y);

    const clampedX = Math.max(
      bounds.minX + collisionRadius + 12,
      Math.min(bounds.maxX - collisionRadius - 12, x / scale)
    );

    const body = createBottle(clampedX, DROP_Y, currentTier);
    setVelocity(body, { x: 0, y: -8 });
    Matter.World.add(worldRef.current, body);
    bottlesMapRef.current.set(body.id, body);
    
    playDrop();
    vibrateLight();

    setCurrentTier(nextTier);
    setNextTier(getRandomTier());
    setLastDrop(Date.now());
    setCanDrop(false);
    
    setTimeout(() => {
      setCanDrop(true);
    }, DROP_CD);
  };

  const spawnParticles = (x: number, y: number, color: string, count: number) => {
    const newParticles: Particle[] = [];
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 3 + Math.random() * 6;
      const life = 0.8 + Math.random() * 0.4;
      newParticles.push({
        id: Date.now() + i + Math.random(),
        x, y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 2,
        life: life,
        maxLife: life,
        sz: 3 + Math.random() * 6,
        color,
        star: false,
        rotation: Math.random() * 360,
        rotationSpeed: (Math.random() - 0.5) * 10,
      });
    }
    setParticles(prev => [...prev, ...newParticles]);
  };

  const spawnStars = (x: number, y: number) => {
    const newStars: Particle[] = [];
    for (let i = 0; i < 8; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 4 + Math.random() * 4;
      const life = 1 + Math.random() * 0.5;
      newStars.push({
        id: Date.now() + i + Math.random(),
        x, y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 3,
        life: life,
        maxLife: life,
        sz: 4 + Math.random() * 4,
        color: '#FFD700',
        star: true,
        rotation: Math.random() * 360,
        rotationSpeed: (Math.random() - 0.5) * 15,
      });
    }
    setParticles(prev => [...prev, ...newStars]);
  };

  const addFloatingText = (x: number, y: number, text: string, color: string) => {
    setFloatingTexts(prev => [...prev, {
      id: Date.now(),
      x, y,
      t: text,
      c: color,
      life: 1,
      vy: -1.8,
    }]);
  };

  const shakeScreen = (intensity: number) => {
    setShake({ x: intensity, y: intensity });
    setTimeout(() => setShake({ x: -intensity, y: -intensity }), 50);
    setTimeout(() => setShake({ x: intensity * 0.5, y: intensity * 0.5 }), 100);
    setTimeout(() => setShake({ x: 0, y: 0 }), 150);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (gameState !== 'play' || !gameAreaRef.current) return;
    const rect = gameAreaRef.current.getBoundingClientRect();
    const gameX = (e.clientX - rect.left) / scale;
    setDropX(Math.max(AREA.x, Math.min(AREA.x + AREA.w, gameX)));
  };

  const handleClick = () => {
    if (gameState === 'play') {
      dropBottle(dropX * scale);
    }
  };

  const handleMouseLeave = () => {
    if (gameState === 'play' && canDrop) {
      dropBottle(dropX * scale);
    }
  };

  useEffect(() => {
    if (particles.length === 0 && floatingTexts.length === 0) return;
    
    let animationId: number;
    let lastTime = performance.now();
    
    const animate = (currentTime: number) => {
      const deltaTime = (currentTime - lastTime) / 16;
      lastTime = currentTime;
      
      setParticles(prev => prev
        .map(p => ({
          ...p,
          x: p.x + p.vx * deltaTime,
          y: p.y + p.vy * deltaTime,
          vy: p.vy + 0.15 * deltaTime,
          vx: p.vx * 0.98,
          life: p.life - 0.02 * deltaTime,
          rotation: p.rotation + p.rotationSpeed * deltaTime,
        }))
        .filter(p => p.life > 0)
      );
      
      setFloatingTexts(prev => prev
        .map(t => ({ ...t, y: t.y + t.vy * deltaTime, life: t.life - 0.025 * deltaTime }))
        .filter(t => t.life > 0)
      );
      
      animationId = requestAnimationFrame(animate);
    };
    
    animationId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationId);
  }, [particles.length, floatingTexts.length]);

  const getPreviewStyle = () => {
    const tier = TIERS[currentTier];
    const collisionRadius = tier.r * 0.85;
    const bounds = getTrapezoidBounds(DROP_Y);

    const x = Math.max(
      bounds.minX + collisionRadius + 12,
      Math.min(bounds.maxX - collisionRadius - 12, dropX)
    );

    return {
      left: x - tier.dw / 2,
      top: DROP_Y - tier.dh / 2,
      width: tier.dw,
      height: tier.dh,
    };
  };

  const displayScore = Math.floor(dScore || score);
  const tier = TIERS[maxTier] || TIERS[0];
  const topTiers = [];
  for (let i = Math.max(0, maxTier - 2); i <= maxTier; i++) {
    topTiers.push(i);
  }

  return (
    <div className="game-wrapper">
      <img 
        src={BG_IMAGE}
        className="game-background"
        alt=""
      />
      
      <div
        className="game-container"
        style={{
          transform: `translate(${shake.x}px, ${shake.y}px)`,
        }}
      >
        <div
          ref={gameAreaRef}
          className="game-area"
          onMouseMove={handleMouseMove}
          onClick={handleClick}
          onMouseLeave={handleMouseLeave}
          onTouchStart={(e) => {
            const touch = e.touches[0];
            const rect = gameAreaRef.current?.getBoundingClientRect();
            if (rect) {
              const x = ((touch.clientX - rect.left) / rect.width) * GAME_WIDTH;
              setDropX(Math.max(AREA.x, Math.min(AREA.x + AREA.w, x)));
            }
          }}
          onTouchMove={(e) => {
            e.preventDefault();
            const touch = e.touches[0];
            const rect = gameAreaRef.current?.getBoundingClientRect();
            if (rect) {
              const x = ((touch.clientX - rect.left) / rect.width) * GAME_WIDTH;
              setDropX(Math.max(AREA.x, Math.min(AREA.x + AREA.w, x)));
            }
          }}
          onTouchEnd={() => {
            dropBottle(dropX * scale);
          }}
        >
          <div 
            className="game-over-line"
            style={{ top: GAME_OVER_Y }}
          />
          
          <div 
            className={`danger-line ${isDangerActive ? 'active' : ''}`}
            style={{ top: DANGER_Y, transform: 'rotate(180deg)' }}
          />
          
          {bottles.map((bottle) => (
            <BottleComponent
              key={bottle.id}
              body={bottle}
              tierIndex={bottle.tierIndex}
            />
          ))}
          
          <div className="bottle-preview" style={{ ...getPreviewStyle(), transform: 'rotate(180deg)' }}>
            <div className="guide-line" style={{ top: -DROP_Y + AREA.y, transform: 'translateX(-50%) rotate(180deg)' }} />
            <img src={TIERS[currentTier].img} alt="" />
          </div>
          
          <div className="particle-layer" ref={particleContainerRef}>
            {particles.map(p => {
              const scale = p.life / p.maxLife;
              const size = p.sz * scale;
              return (
                <div
                  key={p.id}
                  className={`particle ${p.star ? 'star' : ''}`}
                  style={{
                    left: p.x - size / 2,
                    top: p.y - size / 2,
                    width: size,
                    height: size,
                    backgroundColor: p.color,
                    opacity: p.life,
                    transform: `rotate(${p.rotation}deg) scale(${scale})`,
                    boxShadow: p.star ? `0 0 ${size}px ${p.color}` : 'none',
                  }}
                >
                  {p.star && '★'}
                </div>
              );
            })}
            {floatingTexts.map(t => (
              <div
                key={t.id}
                className="floating-text"
                style={{
                  left: t.x - 30,
                  top: t.y - 10,
                  color: t.c,
                  opacity: t.life,
                }}
              >
                {t.t}
              </div>
            ))}
          </div>
          
          <div className="next-bottle">
            <span className="next-label">NEXT</span>
            <img src={TIERS[nextTier].img} alt={TIERS[nextTier].name} style={{ transform: 'rotate(180deg)' }} />
            <span className="next-name">{TIERS[nextTier].name}</span>
          </div>
          
          <div className="score-display">
            <div className="score-coin">
              <div className="coin-inner">
                <span>$</span>
              </div>
            </div>
            <span className="score-value">{displayScore.toLocaleString()}</span>
            {combo > 1 && comboTime > 0 && (
              <span 
                className="combo-text"
                style={{ opacity: Math.min(1, comboTime / 500) }}
              >
                x{combo} COMBO!
              </span>
            )}
          </div>
          
          {gameState === 'over' && (
            <div className="game-over-overlay">
              <div className="game-over-card">
                <h2 className="game-over-title">GAME OVER</h2>

                <div className="top-tiers">
                  {topTiers.map((tierIdx, i) => (
                    <div 
                      key={tierIdx} 
                      className="tier-showcase"
                      style={{ opacity: 0.5 + i * 0.25 }}
                    >
                      <img src={TIERS[tierIdx].img} alt={TIERS[tierIdx].name} style={{ transform: 'rotate(180deg)' }} />
                      <span style={{ color: TIERS[tierIdx].c }}>{TIERS[tierIdx].name}</span>
                    </div>
                  ))}
                </div>

                <span className="score-label">PUNTUACIÓN</span>
                <span className="final-score">{score.toLocaleString()}</span>
                <span className="best-score">
                  Mejor: {bestScore.toLocaleString()} | Max: {tier.name}
                </span>

                {isNewRecord && (
                  <span className="new-record">★ NUEVO RECORD ★</span>
                )}

                <button className="restart-button" onClick={handleRestart}>
                  JUGAR DE NUEVO
                </button>
                
                <button className="menu-button" onClick={handleMenu}>
                  MENÚ
                </button>
              </div>
            </div>
          )}
        </div>
        
        <button
          className="sound-button-game"
          onClick={() => {
            const newState = toggleSound();
            setSoundOn(newState);
          }}
        >
          {soundOn ? '🔊' : '🔇'}
        </button>
      </div>
    </div>
  );
}

interface BottleProps {
  body: BottleBody;
  tierIndex: number;
}

const BottleComponent = ({ body, tierIndex }: BottleProps) => {
  const { position } = body;
  const tier = TIERS[tierIndex];
  const [scale, setScale] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => setScale(1), 10);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div
      className="bottle"
      style={{
        left: position.x - tier.dw / 2,
        top: position.y - tier.dh / 2,
        width: tier.dw,
        height: tier.dh,
        transform: `scale(${scale}) rotate(180deg)`,
        transition: 'transform 0.3s ease',
      }}
    >
      <img src={tier.img} alt={tier.name} style={{ transform: 'rotate(180deg)' }} />
    </div>
  );
};
