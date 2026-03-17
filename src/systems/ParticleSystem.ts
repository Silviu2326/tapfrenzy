// ==========================================
// SISTEMA DE PARTÍCULAS OPTIMIZADO PARA MÓVIL
// ==========================================

export interface Particle {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  size: number;
  color: string;
  type: 'circle' | 'star' | 'spark' | 'trail';
  rotation: number;
  rotationSpeed: number;
  active: boolean;
}

export interface QualitySettings {
  maxParticles: number;
  shadows: boolean;
  glow: boolean;
  trails: boolean;
  particleDetail: 'high' | 'medium' | 'low';
}

// Configuraciones de calidad según nivel de batería/rendimiento
export const QUALITY_PRESETS: Record<'high' | 'medium' | 'low' | 'battery-saver', QualitySettings> = {
  high: {
    maxParticles: 30,
    shadows: true,
    glow: true,
    trails: true,
    particleDetail: 'high',
  },
  medium: {
    maxParticles: 20,
    shadows: false,
    glow: true,
    trails: true,
    particleDetail: 'medium',
  },
  low: {
    maxParticles: 15,
    shadows: false,
    glow: false,
    trails: false,
    particleDetail: 'low',
  },
  'battery-saver': {
    maxParticles: 8,
    shadows: false,
    glow: false,
    trails: false,
    particleDetail: 'low',
  },
};

// Pool de partículas para reutilización
export class ParticlePool {
  private pool: Particle[] = [];
  private activeCount: number = 0;
  private maxSize: number = 30;
  private quality: QualitySettings = QUALITY_PRESETS.medium;

  constructor(initialSize: number = 30) {
    this.maxSize = initialSize;
    this.initializePool();
  }

  private initializePool() {
    for (let i = 0; i < this.maxSize; i++) {
      this.pool.push({
        id: i,
        x: 0,
        y: 0,
        vx: 0,
        vy: 0,
        life: 0,
        maxLife: 0,
        size: 0,
        color: '',
        type: 'circle',
        rotation: 0,
        rotationSpeed: 0,
        active: false,
      });
    }
  }

  setQuality(quality: QualitySettings) {
    this.quality = quality;
    this.maxSize = quality.maxParticles;
    
    // Ajustar pool si es necesario
    if (this.pool.length < this.maxSize) {
      const toAdd = this.maxSize - this.pool.length;
      for (let i = 0; i < toAdd; i++) {
        this.pool.push({
          id: this.pool.length,
          x: 0,
          y: 0,
          vx: 0,
          vy: 0,
          life: 0,
          maxLife: 0,
          size: 0,
          color: '',
          type: 'circle',
          rotation: 0,
          rotationSpeed: 0,
          active: false,
        });
      }
    }
  }

  // Obtener una partícula del pool
  spawn(
    x: number,
    y: number,
    vx: number,
    vy: number,
    color: string,
    size: number = 4,
    type: Particle['type'] = 'circle',
    life: number = 1
  ): Particle | null {
    // Buscar partícula inactiva
    const particle = this.pool.find(p => !p.active);
    
    if (!particle) {
      // Si no hay disponibles, reusar la más antigua si estamos al límite
      if (this.activeCount >= this.quality.maxParticles) {
        const oldest = this.pool.reduce((prev, curr) => 
          curr.active && curr.life < prev.life ? curr : prev
        );
        if (oldest) {
          this.resetParticle(oldest, x, y, vx, vy, color, size, type, life);
          return oldest;
        }
        return null;
      }
      return null;
    }

    this.resetParticle(particle, x, y, vx, vy, color, size, type, life);
    this.activeCount++;
    return particle;
  }

  private resetParticle(
    particle: Particle,
    x: number,
    y: number,
    vx: number,
    vy: number,
    color: string,
    size: number,
    type: Particle['type'],
    life: number
  ) {
    particle.x = x;
    particle.y = y;
    particle.vx = vx;
    particle.vy = vy;
    particle.color = color;
    particle.size = size;
    particle.type = type;
    particle.maxLife = life;
    particle.life = life;
    particle.rotation = Math.random() * 360;
    particle.rotationSpeed = (Math.random() - 0.5) * 10;
    particle.active = true;
  }

  // Actualizar todas las partículas activas
  update(dt: number): Particle[] {
    const activeParticles: Particle[] = [];
    
    for (const particle of this.pool) {
      if (!particle.active) continue;

      // Actualizar física
      particle.x += particle.vx * dt * 0.016;
      particle.y += particle.vy * dt * 0.016;
      particle.vy += 0.3 * dt * 0.016; // gravedad
      particle.vx *= 0.98; // fricción
      particle.rotation += particle.rotationSpeed * dt * 0.016;
      
      // Actualizar vida
      particle.life -= 0.016 * dt * 0.016;
      
      if (particle.life <= 0) {
        particle.active = false;
        this.activeCount--;
      } else {
        activeParticles.push(particle);
      }
    }
    
    return activeParticles;
  }

  // Crear explosión de partículas
  createExplosion(
    x: number,
    y: number,
    color: string,
    count: number,
    speed: number = 5,
    size: number = 4,
    type: Particle['type'] = 'circle'
  ): Particle[] {
    const particles: Particle[] = [];
    const actualCount = Math.min(count, Math.floor(this.quality.maxParticles * 0.3));
    
    for (let i = 0; i < actualCount; i++) {
      const angle = (Math.PI * 2 * i) / actualCount + Math.random() * 0.5;
      const velocity = speed * (0.5 + Math.random() * 0.5);
      const vx = Math.cos(angle) * velocity;
      const vy = Math.sin(angle) * velocity - 2;
      
      const particle = this.spawn(x, y, vx, vy, color, size, type);
      if (particle) particles.push(particle);
    }
    
    return particles;
  }

  // Crear efecto de chispas
  createSparks(x: number, y: number, color: string = '#FFD700', count: number = 8) {
    return this.createExplosion(x, y, color, count, 6, 3, 'spark');
  }

  // Crear efecto de estrellas
  createStars(x: number, y: number, count: number = 6) {
    return this.createExplosion(x, y, '#FFD700', count, 4, 5, 'star');
  }

  // Limpiar todas las partículas
  clear() {
    for (const particle of this.pool) {
      particle.active = false;
    }
    this.activeCount = 0;
  }

  // Obtener estadísticas
  getStats() {
    return {
      active: this.activeCount,
      poolSize: this.pool.length,
      maxAllowed: this.quality.maxParticles,
    };
  }
}

// Singleton para usar en toda la app
export const particlePool = new ParticlePool(30);

// Detectar nivel de batería (si está disponible)
export async function detectBatteryLevel(): Promise<number | null> {
  try {
    if ('getBattery' in navigator) {
      const battery = await (navigator as any).getBattery();
      return battery.level * 100;
    }
  } catch (e) {
    console.log('Battery API not available');
  }
  return null;
}

// Auto-ajustar calidad según batería
export async function autoAdjustQuality(): Promise<QualitySettings> {
  const batteryLevel = await detectBatteryLevel();
  
  if (batteryLevel !== null) {
    if (batteryLevel < 20) return QUALITY_PRESETS['battery-saver'];
    if (batteryLevel < 50) return QUALITY_PRESETS.low;
    if (batteryLevel < 80) return QUALITY_PRESETS.medium;
  }
  
  return QUALITY_PRESETS.high;
}
