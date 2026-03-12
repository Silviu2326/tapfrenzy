// ==========================================
// JUEGO MR. COOL CAT TAP FRENZY - REACT WEB
// ==========================================

import { useRef, useState, useEffect, useCallback } from 'react';
import './App.css';

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
} from './config';
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
} from './physics';
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
} from './sounds';
import { DailyTip } from './Tutorial';
import { IntroVideo } from './IntroVideo';
import Matter from 'matter-js';

// ==========================================
// COMPONENTE PRINCIPAL
// ==========================================
function App() {
  // Referencias
  const engineRef = useRef<Matter.Engine | null>(null);
  const worldRef = useRef<Matter.World | null>(null);
  const gameLoopRef = useRef<number | null>(null);
  const lastTimeRef = useRef(0);
  const isDangerRef = useRef(false);
  const bottlesMapRef = useRef<Map<number, BottleBody>>(new Map());
  const dangerZoneEntryRef = useRef<Map<number, number>>(new Map()); // id -> timestamp de entrada
  const gameAreaRef = useRef<HTMLDivElement>(null);
  const particleContainerRef = useRef<HTMLDivElement>(null);
  
  // Estados del juego
  const [gameState, setGameState] = useState<'intro' | 'menu' | 'play' | 'over'>('intro');
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
  const [showDailyTip, setShowDailyTip] = useState(false);
  
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
    
    return () => {
      if (gameLoopRef.current) {
        cancelAnimationFrame(gameLoopRef.current);
      }
    };
  }, []);

  // Callback de merge
  const handleMerge = useCallback((mergeData: MergeData) => {
    const { x, y, oldTier, newTier, bodyA, bodyB } = mergeData;
    
    // Eliminar cuerpos antiguos
    if (worldRef.current) {
      removeBody(worldRef.current, bodyA);
      bottlesMapRef.current.delete(bodyA.id);
      removeBody(worldRef.current, bodyB);
      bottlesMapRef.current.delete(bodyB.id);
    }

    // Crear nueva botella
    if (worldRef.current) {
      const newBody = createBottle(x, y, newTier);
      setVelocity(newBody, { x: 0, y: 2 });
      Matter.World.add(worldRef.current, newBody);
      bottlesMapRef.current.set(newBody.id, newBody);
    }
    
    // Actualizar score
    const pts = TIERS[oldTier].pts;
    const newCombo = combo + 1;
    const comboMultiplier = Math.min(newCombo, 5);
    const totalPts = pts * comboMultiplier;
    
    setCombo(newCombo);
    setComboTime(1500);
    setScore(prev => prev + totalPts);
    if (newTier > maxTier) setMaxTier(newTier);
    
    // Efectos visuales
    // Para cervezas finales (tier >= 6), menos partículas y color dorado
    const particleColor = newTier >= 6 ? '#FFD700' : TIERS[newTier].c;
    const particleCount = newTier >= 6 ? 8 : 12 + newTier * 2;
    spawnParticles(x, y, particleColor, particleCount);
    if (newTier >= 6) spawnStars(x, y);
    
    const label = newCombo > 1 ? `+${totalPts} x${newCombo}` : `+${totalPts}`;
    const color = newCombo > 1 ? '#FF6B35' : THEME_COLOR;
    addFloatingText(x, y - 20, label, color);
    
    // Shake para tiers altos
    if (newTier >= 4) {
      shakeScreen(3 + newTier * 2);
    }
    
    playMerge(newTier);
    
    // Vibración según tier
    if (newTier >= 6) vibrateHeavy();
    else if (newTier >= 3) vibrateMedium();
    else vibrateLight();
  }, [combo, maxTier]);

  // Callback de colisión (clink)
  const handleClink = useCallback((force: number) => {
    if (force > 0.5) {
      playClink(force);
    }
  }, []);

  // Configurar colisiones
  useEffect(() => {
    if (!engineRef.current) return;
    
    const cleanup = checkCollisions(engineRef.current, handleMerge, handleClink);
    return cleanup;
  }, [handleMerge, handleClink]);

  // Game Loop
  useEffect(() => {
    if (gameState !== 'play') return;
    
    const gameLoop = (timestamp: number) => {
      if (!lastTimeRef.current) lastTimeRef.current = timestamp;
      const dt = Math.min(timestamp - lastTimeRef.current, 32);
      lastTimeRef.current = timestamp;
      
      if (engineRef.current) {
        updatePhysics(engineRef.current, dt);
      }
      
      // Corregir botellas que se salieron
      if (worldRef.current) {
        clampBottles(worldRef.current);
      }
      
      // Actualizar combo timer
      if (comboTime > 0) {
        const newComboTime = comboTime - dt;
        setComboTime(newComboTime);
        if (newComboTime <= 0) {
          setCombo(0);
          setComboTime(0);
        }
      }
      
      // Animar score
      setDScore(prev => prev + (score - prev) * 0.15);
      
      // Leer botellas desde el mapa
      const currentBottles = Array.from(bottlesMapRef.current.values());
      const now = Date.now();

      // Trackear entradas en zona de game over
      currentBottles.forEach(bottle => {
        const tier = TIERS[bottle.tierIndex];
        if (!tier) return;
        
        const bottleTop = bottle.position.y - tier.r;
        const inDangerZone = bottleTop > GAME_OVER_Y; // Cuando la parte superior baja más allá de la línea
        const isInvulnerable = bottle.invulnerableUntil && now < bottle.invulnerableUntil;
        const wasInvulnerable = dangerZoneEntryRef.current.get(bottle.id) === -1;
        
        if (inDangerZone && !isInvulnerable) {
          // Si está en zona peligrosa y no es invulnerable
          if (!dangerZoneEntryRef.current.has(bottle.id) || wasInvulnerable) {
            // Si acaba de dejar de ser invulnerable, reiniciar el contador desde ahora
            console.log(`[GAME OVER ZONE] Botella ${bottle.id} ENTRÓ en zona. Pos Y: ${bottle.position.y.toFixed(1)}, top: ${bottleTop.toFixed(1)}, gameOverY: ${GAME_OVER_Y}`);
            dangerZoneEntryRef.current.set(bottle.id, now);
          }
        } else if (inDangerZone && isInvulnerable) {
          // Si está en zona peligrosa pero es invulnerable, marcar como -1
          dangerZoneEntryRef.current.set(bottle.id, -1);
        } else {
          // Si salió de la zona, resetear
          if (dangerZoneEntryRef.current.has(bottle.id)) {
            console.log(`[GAME OVER ZONE] Botella ${bottle.id} SALIÓ de zona`);
            dangerZoneEntryRef.current.delete(bottle.id);
          }
        }
      });

      // Detectar peligro
      const newIsDanger = currentBottles.some(b => {
        const t = TIERS[b.tierIndex];
        return t && b.position.y + t.r > DANGER_Y && now - b.born > 800;
      });
      if (newIsDanger !== isDangerRef.current) {
        isDangerRef.current = newIsDanger;
        setIsDangerActive(newIsDanger);
        if (newIsDanger) shakeScreen(4);
      }

      // Verificar game over
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

  // Verificar game over
  const checkGameOver = () => {
    const now = Date.now();
    
    // Game over por arriba - si pasa mucho tiempo en zona de peligro (trackeado)
    for (const [, entryTime] of dangerZoneEntryRef.current.entries()) {
      if (entryTime > 0 && now - entryTime > 3000) { // 3 segundos en zona de peligro (ignorar -1 que es invulnerable)
        return true;
      }
    }
    
    // Game over por abajo
    for (const bottle of bottlesMapRef.current.values()) {
      const tier = TIERS[bottle.tierIndex];
      const isInvulnerable = bottle.invulnerableUntil && now < bottle.invulnerableUntil;
      if (tier && bottle.position.y + tier.r > DANGER_Y && now - bottle.born > 2500 && !isInvulnerable) {
        return true;
      }
    }
    return false;
  };

  // Game over
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

  // Mostrar consejo al llegar al menú
  useEffect(() => {
    if (gameState === 'menu') {
      const timer = setTimeout(() => {
        setShowDailyTip(true);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [gameState]);

  // Iniciar juego
  const startGame = () => {
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
  
  // Soltar botella
  const dropBottle = (x: number) => {
    if (!canDrop || Date.now() - lastDrop < DROP_CD || !worldRef.current) return;
    
    const tier = TIERS[currentTier];
    const clampedX = Math.max(
      AREA.x + tier.r + 3,
      Math.min(AREA.x + AREA.w - tier.r - 3, x / scale)
    );
    
    const body = createBottle(clampedX, DROP_Y, currentTier);
    setVelocity(body, { x: 0, y: -7 });
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

  // Partículas con animación mejorada
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
        vy: Math.sin(angle) * speed - 2, // Ligeramente hacia arriba
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

  // Textos flotantes
  interface FloatingText {
    id: number;
    x: number;
    y: number;
    t: string;
    c: string;
    life: number;
    vy: number;
  }

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

  // Shake effect
  const shakeScreen = (intensity: number) => {
    setShake({ x: intensity, y: intensity });
    setTimeout(() => setShake({ x: -intensity, y: -intensity }), 50);
    setTimeout(() => setShake({ x: intensity * 0.5, y: intensity * 0.5 }), 100);
    setTimeout(() => setShake({ x: 0, y: 0 }), 150);
  };

  // Manejadores de mouse/touch
  const handleMouseMove = (e: React.MouseEvent) => {
    if (gameState !== 'play' || !gameAreaRef.current) return;
    const rect = gameAreaRef.current.getBoundingClientRect();
    const gameX = (e.clientX - rect.left) / scale;
    setDropX(Math.max(AREA.x, Math.min(AREA.x + AREA.w, gameX)));
  };

  const handleClick = () => {
    if (gameState === 'play') {
      dropBottle(dropX * scale);
    } else if (gameState === 'over') {
      startGame();
    }
  };

  const handleMouseLeave = () => {
    if (gameState === 'play' && canDrop) {
      dropBottle(dropX * scale);
    }
  };

  // Animación de partículas mejorada
  useEffect(() => {
    if (particles.length === 0 && floatingTexts.length === 0) return;
    
    let animationId: number;
    let lastTime = performance.now();
    
    const animate = (currentTime: number) => {
      const deltaTime = (currentTime - lastTime) / 16; // Normalizar a ~60fps
      lastTime = currentTime;
      
      setParticles(prev => prev
        .map(p => ({
          ...p,
          x: p.x + p.vx * deltaTime,
          y: p.y + p.vy * deltaTime,
          vy: p.vy + 0.15 * deltaTime, // Gravedad
          vx: p.vx * 0.98, // Fricción
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

  // Handle intro complete
  const handleIntroComplete = () => {
    setGameState('menu');
  };

  const handleIntroSkip = () => {
    setGameState('menu');
  };

  // Si el intro está activo
  if (gameState === 'intro') {
    return (
      <IntroVideo 
        onComplete={handleIntroComplete}
        onSkip={handleIntroSkip}
      />
    );
  }

  // Calcular posición del preview
  const getPreviewStyle = () => {
    const tier = TIERS[currentTier];
    const x = Math.max(
      AREA.x + tier.r + 3,
      Math.min(AREA.x + AREA.w - tier.r - 3, dropX)
    );
    
    return {
      left: x - tier.dw / 2,
      top: DROP_Y - tier.dh / 2,
      width: tier.dw,
      height: tier.dh,
    };
  };

  return (
    <div className="game-wrapper">
      {/* Fondo de pantalla completa */}
      <img 
        src={BG_IMAGE}
        className="game-background"
        alt=""
      />
      
      {/* Game Container con escala */}
      <div
        className="game-container"
        style={{
          transform: `translate(${shake.x}px, ${shake.y}px)`,
        }}
      >
        {/* Área de juego */}
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
          {/* Línea de game over superior */}
          {gameState === 'play' && (
            <div 
              className="game-over-line"
              style={{ top: GAME_OVER_Y }}
            />
          )}
          
          {/* Línea de peligro */}
          {gameState === 'play' && (
            <div 
              className={`danger-line ${isDangerActive ? 'active' : ''}`}
              style={{ top: DANGER_Y }}
            />
          )}
          
          {/* Botellas */}
          {bottles.map((bottle) => (
            <BottleComponent
              key={bottle.id}
              body={bottle}
              tierIndex={bottle.tierIndex}
            />
          ))}
          
          {/* Preview */}
          {gameState === 'play' && (
            <div className="bottle-preview" style={getPreviewStyle()}>
              <div className="guide-line" style={{ top: -DROP_Y + AREA.y }} />
              <img src={TIERS[currentTier].img} alt="" />
            </div>
          )}
          
          {/* Partículas animadas */}
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
          
          {/* UI: Next */}
          {gameState === 'play' && <NextBottle tierIndex={nextTier} />}
          
          {/* UI: Score */}
          {gameState !== 'menu' && (
            <ScoreDisplay
              score={score}
              dScore={dScore}
              combo={combo}
              comboTime={comboTime}
            />
          )}
          
          {/* Menú */}
          {gameState === 'menu' && (
            <MainMenu 
              onStart={startGame}
              bestScore={bestScore}
            />
          )}
          
          {/* Game Over */}
          {gameState === 'over' && (
            <GameOverOverlay
              score={score}
              best={bestScore}
              maxTier={maxTier}
              onRestart={startGame}
              isNewRecord={isNewRecord}
            />
          )}
        </div>
        
        {/* Botón de sonido - fuera del game-area pero dentro del container */}
        {gameState !== 'menu' && (
          <button
            className="sound-button-game"
            onClick={() => {
              const newState = toggleSound();
              setSoundOn(newState);
            }}
          >
            {soundOn ? '🔊' : '🔇'}
          </button>
        )}
      </div>
      
      {/* Daily Tip */}
      <DailyTip 
        visible={showDailyTip} 
        onClose={() => setShowDailyTip(false)}
      />
    </div>
  );
}

// ==========================================
// COMPONENTE BOTELLA
// ==========================================
interface BottleProps {
  body: BottleBody;
  tierIndex: number;
}

const BottleComponent = ({ body, tierIndex }: BottleProps) => {
  const { position, angle } = body;
  const tier = TIERS[tierIndex];
  const [scale, setScale] = useState(0);

  useEffect(() => {
    // Animación de aparición
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
        transform: `scale(${scale}) rotate(${angle}rad)`,
        transition: 'transform 0.3s ease',
      }}
    >
      <img src={tier.img} alt={tier.name} />
    </div>
  );
};

// ==========================================
// UI: NEXT BOTTLE
// ==========================================
interface NextBottleProps {
  tierIndex: number;
}

const NextBottle = ({ tierIndex }: NextBottleProps) => {
  const tier = TIERS[tierIndex];
  
  return (
    <div className="next-bottle">
      <span className="next-label">NEXT</span>
      <img src={tier.img} alt={tier.name} />
      <span className="next-name">{tier.name}</span>
    </div>
  );
};

// ==========================================
// UI: SCORE
// ==========================================
interface ScoreDisplayProps {
  score: number;
  dScore: number;
  combo: number;
  comboTime: number;
}

const ScoreDisplay = ({ score, dScore, combo, comboTime }: ScoreDisplayProps) => {
  const displayScore = Math.floor(dScore || score);
  
  return (
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
  );
};

// ==========================================
// GAME OVER OVERLAY
// ==========================================
interface GameOverOverlayProps {
  score: number;
  best: number;
  maxTier: number;
  onRestart: () => void;
  isNewRecord: boolean;
}

const GameOverOverlay = ({ score, best, maxTier, onRestart, isNewRecord }: GameOverOverlayProps) => {
  const tier = TIERS[maxTier] || TIERS[0];
  
  // Top 3 tiers conseguidos
  const topTiers = [];
  for (let i = Math.max(0, maxTier - 2); i <= maxTier; i++) {
    topTiers.push(i);
  }

  return (
    <div className="game-over-overlay">
      <div className="game-over-card">
        <h2 className="game-over-title">GAME OVER</h2>

        {/* Top 3 botellas conseguidas */}
        <div className="top-tiers">
          {topTiers.map((tierIdx, i) => (
            <div 
              key={tierIdx} 
              className="tier-showcase"
              style={{ opacity: 0.5 + i * 0.25 }}
            >
              <img src={TIERS[tierIdx].img} alt={TIERS[tierIdx].name} />
              <span style={{ color: TIERS[tierIdx].c }}>{TIERS[tierIdx].name}</span>
            </div>
          ))}
        </div>

        <span className="score-label">PUNTUACIÓN</span>
        <span className="final-score">{score.toLocaleString()}</span>
        <span className="best-score">
          Mejor: {best.toLocaleString()} | Max: {tier.name}
        </span>

        {isNewRecord && (
          <span className="new-record">★ NUEVO RECORD ★</span>
        )}

        <button className="restart-button" onClick={onRestart}>
          JUGAR DE NUEVO
        </button>
      </div>
    </div>
  );
};

// ==========================================
// MENÚ PRINCIPAL
// ==========================================
interface MainMenuProps {
  onStart: () => void;
  bestScore: number;
}

const MainMenu = ({ onStart, bestScore }: MainMenuProps) => {
  const [time, setTime] = useState(0);
  
  useEffect(() => {
    const interval = setInterval(() => {
      setTime(Date.now() / 1000);
    }, 50);
    return () => clearInterval(interval);
  }, []);
  
  const bottleNames = ['CERVEZA_MORENA', 'CERVEZA_GUAJIRA', 'CERVEZA_SIFRINA', 'CERVEZA_CANDELA', 'CERVEZA_CATIRA', 'CERVEZA_MEDUSA'];

  return (
    <div className="main-menu" onClick={onStart}>
      {/* Título */}
      <h1 className="game-title">MR. COOL CAT</h1>
      <h2 className="game-subtitle">CRAFT BEER</h2>
      <p className="game-tagline">TAP FRENZY</p>
      
      {/* Botellas animadas */}
      <div className="animated-bottles">
        {bottleNames.map((name, i) => {
          const img = BOTTLE_IMAGES[name];
          const offset = Math.sin(time + i * 0.8) * 8 + Math.abs(i - 2.5) * 4;
          const rotation = (i - 2.5) * 3.5;
          
          return (
            <div
              key={name}
              className="animated-bottle"
              style={{
                transform: `translateY(${offset}px) rotate(${rotation}deg)`,
              }}
            >
              {img && <img src={img} alt={name} />}
            </div>
          );
        })}
      </div>
      
      {/* Instrucciones */}
      <p className="instructions">Suelta cervezas desde abajo</p>
      <p className="instructions">Combina iguales para evolucionar</p>
      
      {/* Cadena de evolución */}
      <div className="evolution-chain">
        {TIERS.map((tier, i) => (
          <div key={tier.name} className="evolution-item">
            <img src={tier.img} alt={tier.name} />
            {i < TIERS.length - 1 && <span className="arrow">›</span>}
          </div>
        ))}
      </div>
      
      {/* Botón JUGAR */}
      <button className="play-button" onClick={onStart}>
        JUGAR
      </button>
      
      {bestScore > 0 && (
        <p className="best-score-text">
          Mejor puntuación: {bestScore.toLocaleString()}
        </p>
      )}
    </div>
  );
};

// Importar BOTTLE_IMAGES para el menú
import { BOTTLE_IMAGES } from './config';

export default App;
