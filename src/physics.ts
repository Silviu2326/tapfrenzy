// ==========================================
// SISTEMA DE FÍSICA CON MATTER.JS
// ==========================================

import Matter from 'matter-js';
import { AREA, MERGE_DELAY, TIERS, getTrapezoidBounds } from './config';

// Tipos
export interface MergeData {
  x: number;
  y: number;
  oldTier: number;
  newTier: number;
  bodyA: Matter.Body;
  bodyB: Matter.Body;
}

export interface BottleBody extends Matter.Body {
  tierIndex: number;
  born: number;
  isRemoving: boolean;
  invulnerableUntil: number; // Timestamp hasta cuando es invulnerable
  vulnerableSince: number;   // Timestamp desde cuando es vulnerable en zona de game over
  isBomb?: boolean;          // Indica si es una bomba
}

// Singleton para el engine
let engineInstance: Matter.Engine | null = null;

export const createPhysicsEngine = (): { engine: Matter.Engine; world: Matter.World } => {
  if (engineInstance) {
    Matter.World.clear(engineInstance.world, false);
    Matter.Engine.clear(engineInstance);
  }
  
  const engine = Matter.Engine.create({
    enableSleeping: true,
    gravity: { x: 0, y: -1.6 }, // Gravedad negativa (lanzamiento hacia arriba)
    positionIterations: 10,     // Más iteraciones para posición (mejor estabilidad)
    velocityIterations: 10,     // Más iteraciones para velocidad (mejor estabilidad)
  });
  
  engineInstance = engine;
  
  const { world } = engine;
  
  // Crear paredes - muy baja fricción y biselado para evitar atascos
  const wallOpts: Matter.IChamferableBodyDefinition = { 
    isStatic: true, 
    restitution: 0.1, 
    friction: 0.01, 
    frictionStatic: 0.01,
    chamfer: { radius: 4 }, // Biselado para evitar esquinas afiladas
    label: 'wall',
    render: { visible: false }
  };
  
  // Paredes en forma de trapecio - más ANCHAS abajo que arriba
  const topWidth = 300;      // 300px arriba
  const bottomWidth = 440;   // 440px abajo
  const wallHeight = AREA.h + 100;

  // Calcular posiciones para paredes inclinadas
  const centerX = AREA.x + AREA.w / 2;
  const topLeftX = centerX - topWidth / 2;
  const topRightX = centerX + topWidth / 2;
  const bottomLeftX = centerX - bottomWidth / 2;
  const bottomRightX = centerX + bottomWidth / 2;

  const walls = [
    // Techo (top) - estrecho
    Matter.Bodies.rectangle(
      centerX,
      AREA.y + 10,
      topWidth,
      12,
      wallOpts
    ),
    // Pared izquierda inclinada hacia afuera - ángulo calculado para 300→440px
    Matter.Bodies.rectangle(
      (topLeftX + bottomLeftX) / 2,
      AREA.y + AREA.h / 2,
      12,
      wallHeight,
      { ...wallOpts, angle: 0.114 }
    ),
    // Pared derecha inclinada hacia afuera - ángulo calculado para 300→440px
    Matter.Bodies.rectangle(
      (topRightX + bottomRightX) / 2,
      AREA.y + AREA.h / 2,
      12,
      wallHeight,
      { ...wallOpts, angle: -0.114 }
    ),
    // Suelo (catch) - ancho 380px
    Matter.Bodies.rectangle(
      centerX,
      AREA.y + AREA.h + 80,
      bottomWidth,
      12,
      wallOpts
    ),
  ];
  
  Matter.World.add(world, walls);
  
  return { engine, world };
};

export const createBottle = (x: number, y: number, tierIndex: number): BottleBody => {
  const tier = TIERS[tierIndex];
  
  // Usar un solo círculo para la física - más estable y sin problemas de colisión
  // Radio promedio entre el cuerpo y el cuello para colisiones suaves
  const collisionRadius = tier.r * 0.85;
  
  const body = Matter.Bodies.circle(x, y, collisionRadius, {
    restitution: 0.2,           // Rebote moderado
    friction: 0.3,              // Menos fricción para resbalar mejor
    frictionStatic: 0.4,        // Menos fricción estática
    frictionAir: 0.01,          // Mínima resistencia al aire
    density: 0.002 + tierIndex * 0.001,
    label: 'bottle',
    angle: Math.PI,             // Rotar 180 grados al inicio (volteada)
  }) as BottleBody;
  
  // Bloquear rotación completamente
  Matter.Body.setInertia(body, Infinity);
  
  const now = Date.now();
  body.tierIndex = tierIndex;
  body.born = now;
  body.isRemoving = false;
  body.invulnerableUntil = now + 4000; // 4 segundos de invulnerabilidad
  body.vulnerableSince = 0; // 0 significa que aún no está vulnerable en zona de game over
  
  return body;
};

export const getBottles = (world: Matter.World): BottleBody[] => {
  const allBodies = Matter.Composite.allBodies(world);
  const bottles: BottleBody[] = [];
  
  for (const body of allBodies) {
    if (body.label === 'bottle' && !(body as BottleBody).isRemoving) {
      bottles.push(body as BottleBody);
    }
  }
  
  return bottles;
};

/** Verifica y corrige botellas que se salieron de los límites del trapecio */
export const clampBottles = (world: Matter.World): void => {
  const bottles = getBottles(world);

  bottles.forEach(bottle => {
    const tier = TIERS[bottle.tierIndex];
    const r = tier ? tier.r * 0.85 : 17;

    // Obtener límites del trapecio en la posición Y actual
    const bounds = getTrapezoidBounds(bottle.position.y);
    const minX = bounds.minX + r;
    const maxX = bounds.maxX - r;

    // Verificar límites X con empujón hacia adentro
    if (bottle.position.x < minX) {
      Matter.Body.setPosition(bottle, { x: minX + 5, y: bottle.position.y });
      Matter.Body.setVelocity(bottle, { x: 3, y: bottle.velocity.y });
    } else if (bottle.position.x > maxX) {
      Matter.Body.setPosition(bottle, { x: maxX - 5, y: bottle.position.y });
      Matter.Body.setVelocity(bottle, { x: -3, y: bottle.velocity.y });
    }

    // Detectar botellas atascadas cerca de las paredes y empujarlas fuertemente hacia el centro
    const margin = 15;
    const speed = Math.sqrt(bottle.velocity.x ** 2 + bottle.velocity.y ** 2);
    const isNearLeftWall = bottle.position.x < minX + margin;
    const isNearRightWall = bottle.position.x > maxX - margin;

    if (speed < 1.5) {
      if (isNearLeftWall) {
        // Empujar fuertemente hacia la derecha
        Matter.Body.applyForce(bottle, bottle.position, { x: 0.008, y: -0.002 });
      } else if (isNearRightWall) {
        // Empujar fuertemente hacia la izquierda
        Matter.Body.applyForce(bottle, bottle.position, { x: -0.008, y: -0.002 });
      }
    }

    // Verificar límite Y superior
    if (bottle.position.y - r < AREA.y + 16) {
      const newY = AREA.y + 16 + r;
      Matter.Body.setPosition(bottle, { x: bottle.position.x, y: newY });
      Matter.Body.setVelocity(bottle, { x: bottle.velocity.x, y: Math.abs(bottle.velocity.y) });
    }
  });
};

export const checkCollisions = (
  engine: Matter.Engine, 
  onMerge?: (data: MergeData) => void, 
  onClink?: (force: number) => void
): () => void => {
  const processedPairs = new Set<string>();
  
  const handler = (event: Matter.IEventCollision<Matter.Engine>) => {
    const pairs = event.pairs;
    
    for (let i = 0; i < pairs.length; i++) {
      const { bodyA, bodyB } = pairs[i];
      
      const bottleA = bodyA as BottleBody;
      const bottleB = bodyB as BottleBody;
      
      // Ignorar paredes
      if (bodyA.label === 'wall' || bodyB.label === 'wall') continue;
      if (bottleA.tierIndex == null || bottleB.tierIndex == null) continue;
      
      // Calcular velocidad relativa para sonido
      const relV = Math.abs(bodyA.velocity.x - bodyB.velocity.x) + 
                   Math.abs(bodyA.velocity.y - bodyB.velocity.y);
      if (onClink && relV > 0.5) {
        onClink(relV);
      }
      
      // Verificar si son del mismo tier para merge
      if (bottleA.tierIndex !== bottleB.tierIndex) continue;
      if (bottleA.tierIndex >= TIERS.length - 1) continue; // Barril no se fusiona
      if (bottleA.isRemoving || bottleB.isRemoving) continue;
      
      const now = Date.now();
      if ((bottleA.born && now - bottleA.born < MERGE_DELAY) || 
          (bottleB.born && now - bottleB.born < MERGE_DELAY)) continue;
      
      const pairId = [bodyA.id, bodyB.id].sort().join('-');
      if (processedPairs.has(pairId)) continue;
      
      processedPairs.add(pairId);
      bottleA.isRemoving = true;
      bottleB.isRemoving = true;
      
      // Calcular posición del merge
      const mx = (bodyA.position.x + bodyB.position.x) / 2;
      const my = (bodyA.position.y + bodyB.position.y) / 2;
      
      if (onMerge) {
        onMerge({
          x: mx,
          y: my,
          oldTier: bottleA.tierIndex,
          newTier: bottleA.tierIndex + 1,
          bodyA: bodyA,
          bodyB: bodyB,
        });
      }
    }
  };
  
  Matter.Events.on(engine, 'collisionStart' as any, handler);
  
  return () => {
    // No-op cleanup
  };
};

export const updatePhysics = (engine: Matter.Engine, dt: number): void => {
  Matter.Engine.update(engine, dt);
  
  // Forzar sleeping de botellas que están casi quietas para estabilidad
  const allBodies = Matter.Composite.allBodies(engine.world);
  for (const body of allBodies) {
    if (body.label === 'bottle' && !body.isStatic) {
      const speed = Math.sqrt(body.velocity.x ** 2 + body.velocity.y ** 2);
      // Si la velocidad es muy baja, forzar sleeping
      if (speed < 0.05 && !(body as any).isSleeping) {
        const bottle = body as BottleBody;
        // Solo dormir si nació hace más de 800ms (para permitir movimiento inicial)
        if (Date.now() - bottle.born > 800) {
          Matter.Sleeping.set(body, true);
        }
      }
    }
  }
};

export const removeBody = (world: Matter.World, body: Matter.Body): void => {
  Matter.World.remove(world, body);
};

export const clearWorld = (world: Matter.World): void => {
  const allBodies = Matter.Composite.allBodies(world);
  
  for (const body of allBodies) {
    if (body.label === 'bottle') {
      Matter.World.remove(world, body);
    }
  }
};

export const setVelocity = (body: Matter.Body, velocity: { x: number; y: number }): void => {
  Matter.Body.setVelocity(body, velocity);
};

export const applyForce = (body: Matter.Body, force: { x: number; y: number }): void => {
  Matter.Body.applyForce(body, body.position, force);
};
