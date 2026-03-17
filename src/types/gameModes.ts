// ==========================================
// TIPOS PARA MODOS DE JUEGO
// ==========================================

export type GameMode = 'classic' | 'quick' | 'zen';

export interface GameModeConfig {
  mode: GameMode;
  name: string;
  description: string;
  icon: string;
  iconImage?: string; // Ruta a imagen del icono
  timeLimit?: number; // en segundos, undefined = sin límite
  dangerZone: boolean;
  scoring: 'normal' | 'time_bonus';
}

export const GAME_MODES: Record<GameMode, GameModeConfig> = {
  classic: {
    mode: 'classic',
    name: 'Clásico',
    description: 'El modo original. Sin límite de tiempo.',
    icon: '🍺',
    iconImage: '/assets/modes/clasico.png',
    dangerZone: true,
    scoring: 'normal',
  },
  quick: {
    mode: 'quick',
    name: 'Rápido',
    description: '90 segundos. +5s por fusión, +10s por tier 6+.',
    icon: '⚡',
    iconImage: '/assets/modes/rapido.png',
    timeLimit: 90,
    dangerZone: true,
    scoring: 'time_bonus',
  },
  zen: {
    mode: 'zen',
    name: 'Zen',
    description: 'Relajado. Sin peligro, sin límite de tiempo.',
    icon: '🧘',
    iconImage: '/assets/modes/zen.png',
    dangerZone: false,
    scoring: 'normal',
  },
};

export interface QuickModeState {
  timeRemaining: number;
  isActive: boolean;
}

// Helper para formatear tiempo
export function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

// Helper para calcular bonus de tiempo
export function calculateTimeBonus(tier: number): number {
  if (tier >= 6) return 10; // Tier alto = 10 segundos
  return 5; // Fusión normal = 5 segundos
}
