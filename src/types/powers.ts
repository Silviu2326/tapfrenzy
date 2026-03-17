// ==========================================
// SISTEMA DE PODERES PARA MÓVIL
// ==========================================

export type PowerType = 'swap' | 'slowmo' | 'bomb';

export interface Power {
  type: PowerType;
  icon: string;
  iconImage?: string; // Ruta a imagen del icono
  name: string;
  description: string;
  cooldown: number; // en ms
  uses: number;
  maxUses: number;
  unlocked: boolean;
  unlockScore: number; // puntuación necesaria para desbloquear
}

export interface PowerState {
  powers: Record<PowerType, Power>;
  activePower: PowerType | null;
  lastUsed: Record<PowerType, number>; // timestamp del último uso
}

export const INITIAL_POWERS: Record<PowerType, Power> = {
  swap: {
    type: 'swap',
    icon: '🔄',
    iconImage: '/assets/poderes/swap.png',
    name: 'Swap',
    description: 'Cambia la botella actual por otra aleatoria',
    cooldown: 5000, // 5 segundos
    uses: 5,
    maxUses: 5,
    unlocked: true,
    unlockScore: 0,
  },
  slowmo: {
    type: 'slowmo',
    icon: '⏱️',
    iconImage: '/assets/poderes/tiempo.png',
    name: 'Tiempo Lento',
    description: 'Ralentiza la física por 3 segundos',
    cooldown: 15000, // 15 segundos
    uses: 2,
    maxUses: 2,
    unlocked: true,
    unlockScore: 0,
  },
  bomb: {
    type: 'bomb',
    icon: '💥',
    iconImage: '/assets/poderes/bomba.png',
    name: 'Bomba',
    description: 'Lanza una botella bomba que explota al tocar el fondo eliminando las cercanas',
    cooldown: 30000, // 30 segundos
    uses: 1,
    maxUses: 1,
    unlocked: true,
    unlockScore: 0,
  },
};

// Helpers para gestión de poderes
export function canUsePower(power: Power, lastUsed: number): boolean {
  if (!power.unlocked) return false;
  if (power.uses <= 0) return false;
  
  const now = Date.now();
  const timeSinceLastUse = now - lastUsed;
  
  return timeSinceLastUse >= power.cooldown;
}

export function getCooldownProgress(power: Power, lastUsed: number): number {
  if (power.uses > 0) return 1;
  if (lastUsed === 0) return 1;
  
  const now = Date.now();
  const elapsed = now - lastUsed;
  const progress = Math.min(elapsed / power.cooldown, 1);
  
  return progress;
}

export function getCooldownRemaining(power: Power, lastUsed: number): number {
  if (power.uses > 0) return 0;
  if (lastUsed === 0) return 0;
  
  const now = Date.now();
  const elapsed = now - lastUsed;
  const remaining = Math.max(power.cooldown - elapsed, 0);
  
  return Math.ceil(remaining / 1000); // en segundos
}
