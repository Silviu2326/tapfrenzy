// ==========================================
// SISTEMA DE FÍSICA CON MATTER.JS
// ==========================================

import Matter from 'matter-js';
import { AREA, MERGE_DELAY, TIERS } from './config';

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
    gravity: { x: 0, y: -1.4 }, // Gravedad negativa (lanzamiento hacia arriba)
    positionIterations: 8,     // Más iteraciones para posición (mejor estabilidad)
    velocityIterations: 8,     // Más iteraciones para velocidad (mejor estabilidad)
  });
  
  engineInstance = engine;
  
  const { world } = engine;
  
  // Crear paredes
  const wallOpts: Matter.IChamferableBodyDefinition = { 
    isStatic: true, 
    restitution: 0.1, 
    friction: 0.4, 
    frictionStatic: 0.3,
    label: 'wall',
    render: { visible: false }
  };
  
  // La mesa tiene forma de trapecio - más ancha arriba, más estrecha abajo
  const topWidth = AREA.w + 30;  // 30px más arriba (cerca de la barra)
  const bottomWidth = AREA.w - 20; // 20px menos abajo (cerca del gato)
  const wallHeight = AREA.h + 100;
  
  // Calcular posiciones para paredes inclinadas - centradas
  const centerX = AREA.x + AREA.w / 2;
  const topLeftX = centerX - topWidth / 2;
  const topRightX = centerX + topWidth / 2;
  const bottomLeftX = centerX - bottomWidth / 2;
  const bottomRightX = centerX + bottomWidth / 2;
  
  // Ángulo de inclinación
  const leftAngle = Math.atan2(bottomLeftX - topLeftX, wallHeight);
  const rightAngle = Math.atan2(bottomRightX - topRightX, wallHeight);
  
  const walls = [
    // Techo (top) - más estrecho, bajado 16px
    Matter.Bodies.rectangle(
      AREA.x + AREA.w / 2,
      AREA.y + 10,
      topWidth,
      12,
      wallOpts
    ),
    // Pared izquierda inclinada
    Matter.Bodies.rectangle(
      (topLeftX + bottomLeftX) / 2, 
      AREA.y + AREA.h / 2, 
      12, 
      wallHeight, 
      { ...wallOpts, angle: leftAngle }
    ),
    // Pared derecha inclinada
    Matter.Bodies.rectangle(
      (topRightX + bottomRightX) / 2, 
      AREA.y + AREA.h / 2, 
      12, 
      wallHeight, 
      { ...wallOpts, angle: rightAngle }
    ),
    // Suelo (catch) - más ancho
    Matter.Bodies.rectangle(
      AREA.x + AREA.w / 2, 
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
  
  // Crear cuerpo compuesto: círculo grande para el cuerpo + círculo pequeño para el cuello
  const bodyRadius = tier.r; // Radio del cuerpo
  const neckRadius = tier.r * 0.6; // Radio del cuello (60% del cuerpo)
  const neckOffset = tier.dh * 0.3; // Distancia desde el centro al cuello
  
  // Cuerpo principal (parte inferior/ancha)
  const bodyCircle = Matter.Bodies.circle(x, y + neckOffset * 0.3, bodyRadius, {
    label: 'bottle_part',
    restitution: 0.1,
    friction: 0.6,
  });
  
  // Cuello (parte superior/estrecha)
  const neckCircle = Matter.Bodies.circle(x, y - neckOffset, neckRadius, {
    label: 'bottle_part',
    restitution: 0.1,
    friction: 0.6,
  });
  
  // Crear cuerpo compuesto
  const body = Matter.Body.create({
    parts: [bodyCircle, neckCircle],
    restitution: 0.1,           // Menor rebote para estabilidad
    friction: 0.6,              // Mayor fricción entre botellas
    frictionStatic: 0.8,        // Mayor fricción estática para que no resbalen
    frictionAir: 0.025,         // Mayor resistencia al aire para frenar movimiento
    density: 0.002 + tierIndex * 0.001,
    label: 'bottle',
  }) as BottleBody;
  
  // Añadir amortiguación angular para que giren menos
  (body as any).angularDamping = 0.15;
  
  const now = Date.now();
  body.tierIndex = tierIndex;
  body.born = now;
  body.isRemoving = false;
  body.invulnerableUntil = now + 4000; // 4 segundos de invulnerabilidad
  body.vulnerableSince = 0; // 0 significa que aún no está vulnerable en zona de game over
  
  return body;
};

export const getBottles = (world: Matter.World): BottleBody[] => {
  // Obtener todos los bodies y filtrar por los que tienen label 'bottle' (cuerpos compuestos padre)
  const allBodies = Matter.Composite.allBodies(world);
  const bottles: BottleBody[] = [];
  const seenIds = new Set<number>();
  
  for (const body of allBodies) {
    // Para cuerpos compuestos, obtener el padre
    const parent = (body.parent && body.parent !== body) ? body.parent : body;
    
    if (parent.label === 'bottle' && !seenIds.has(parent.id)) {
      seenIds.add(parent.id);
      if (!(parent as BottleBody).isRemoving) {
        bottles.push(parent as BottleBody);
      }
    }
  }
  
  return bottles;
};

/** Verifica y corrige botellas que se salieron de los límites */
export const clampBottles = (world: Matter.World): void => {
  const bottles = getBottles(world);
  bottles.forEach(bottle => {
    const tier = TIERS[bottle.tierIndex];
    const r = tier ? tier.r : 20;
    // Para cuerpo compuesto: cuello está arriba, offset ~30% de altura
    const neckOffset = tier ? tier.dh * 0.3 : 25;
    const topY = bottle.position.y - neckOffset - r * 0.6; // Posición Y del tope del cuello
    
    // Verificar límites X (izquierda y derecha) - usar radio del cuerpo
    if (bottle.position.x < AREA.x + r) {
      Matter.Body.setPosition(bottle, { x: AREA.x + r, y: bottle.position.y });
      Matter.Body.setVelocity(bottle, { x: Math.abs(bottle.velocity.x) * 0.5, y: bottle.velocity.y });
    } else if (bottle.position.x > AREA.x + AREA.w - r) {
      Matter.Body.setPosition(bottle, { x: AREA.x + AREA.w - r, y: bottle.position.y });
      Matter.Body.setVelocity(bottle, { x: -Math.abs(bottle.velocity.x) * 0.5, y: bottle.velocity.y });
    }
    
    // Verificar límite Y superior (no pueden salir por arriba) - techo bajado 16px
    // El cuello es lo que más arriba llega
    if (topY < AREA.y + 16) {
      const newY = AREA.y + 16 + neckOffset + r * 0.6;
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
      
      // Obtener el cuerpo padre (para cuerpos compuestos)
      const parentA = (bodyA.parent && bodyA.parent !== bodyA) ? bodyA.parent : bodyA;
      const parentB = (bodyB.parent && bodyB.parent !== bodyB) ? bodyB.parent : bodyB;
      
      const bottleA = parentA as BottleBody;
      const bottleB = parentB as BottleBody;
      
      // Ignorar paredes
      if (parentA.label === 'wall' || parentB.label === 'wall') continue;
      if (bottleA.tierIndex == null || bottleB.tierIndex == null) continue;
      
      // Calcular velocidad relativa para sonido (usar padres)
      const relV = Math.abs(parentA.velocity.x - parentB.velocity.x) + 
                   Math.abs(parentA.velocity.y - parentB.velocity.y);
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
      
      // Usar IDs de los padres para evitar duplicados
      const pairId = [parentA.id, parentB.id].sort().join('-');
      if (processedPairs.has(pairId)) continue;
      
      processedPairs.add(pairId);
      bottleA.isRemoving = true;
      bottleB.isRemoving = true;
      
      // Calcular posición del merge (usar posiciones de los padres)
      const mx = (parentA.position.x + parentB.position.x) / 2;
      const my = (parentA.position.y + parentB.position.y) / 2;
      
      if (onMerge) {
        onMerge({
          x: mx,
          y: my,
          oldTier: bottleA.tierIndex,
          newTier: bottleA.tierIndex + 1,
          bodyA: parentA,
          bodyB: parentB,
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
    const parent = (body.parent && body.parent !== body) ? body.parent : body;
    if (parent.label === 'bottle' && !parent.isStatic) {
      const speed = Math.sqrt(parent.velocity.x ** 2 + parent.velocity.y ** 2);
      const angularSpeed = Math.abs(parent.angularVelocity);
      // Si la velocidad es muy baja, forzar sleeping
      if (speed < 0.1 && angularSpeed < 0.05 && !(parent as any).isSleeping) {
        const bottle = parent as BottleBody;
        // Solo dormir si nació hace más de 500ms (para permitir movimiento inicial)
        if (Date.now() - bottle.born > 500) {
          Matter.Sleeping.set(parent, true);
        }
      }
    }
  }
};

export const removeBody = (world: Matter.World, body: Matter.Body): void => {
  Matter.World.remove(world, body);
};

export const clearWorld = (world: Matter.World): void => {
  // Obtener todos los bodies padre únicos con label 'bottle'
  const allBodies = Matter.Composite.allBodies(world);
  const seenIds = new Set<number>();
  
  for (const body of allBodies) {
    const parent = (body.parent && body.parent !== body) ? body.parent : body;
    if (parent.label === 'bottle' && !seenIds.has(parent.id)) {
      seenIds.add(parent.id);
      Matter.World.remove(world, parent);
    }
  }
};

export const setVelocity = (body: Matter.Body, velocity: { x: number; y: number }): void => {
  Matter.Body.setVelocity(body, velocity);
};

export const applyForce = (body: Matter.Body, force: { x: number; y: number }): void => {
  Matter.Body.applyForce(body, body.position, force);
};
