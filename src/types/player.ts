// ==========================================
// TIPOS PARA PERFIL Y ESTADÍSTICAS DEL JUGADOR
// ==========================================

export interface PlayerProfile {
  userId: string;
  nickname: string;
  avatar: string;
  level: number;
  xp: number;
  title: string;
}

export interface PlayerStats {
  totalGames: number;
  totalScore: number;
  bestScore: number;
  barrelsCreated: number;
  totalMerges: number;
  maxCombo: number;
  timePlayed: number; // en segundos
  lastPlayed: number; // timestamp
  gamesToday: number;
  currentStreak: number; // días seguidos jugando
}

export interface GameSession {
  score: number;
  maxTier: number;
  maxCombo: number;
  merges: number;
  duration: number; // segundos
  timestamp: number;
  gameMode: string;
}

export const LEVELS = [
  { level: 1, title: 'Novato Cervecero', xpRequired: 0 },
  { level: 2, title: 'Aprendiz de Malta', xpRequired: 500 },
  { level: 3, title: 'Lupulizador', xpRequired: 1500 },
  { level: 4, title: 'Maestro Fermentador', xpRequired: 3000 },
  { level: 5, title: 'Catador Experto', xpRequired: 5500 },
  { level: 6, title: 'Alquimista Cervecero', xpRequired: 9000 },
  { level: 7, title: 'Leyenda del Barril', xpRequired: 15000 },
  { level: 8, title: 'Dios de la Cerveza', xpRequired: 25000 },
];

export const AVATARS = ['🍺', '🍻', '🥂', '🍷', '🥃', '🍸', '🍹', '🧉', '🫗', '🍾'];

export function calculateLevel(xp: number): { level: number; title: string; progress: number } {
  for (let i = LEVELS.length - 1; i >= 0; i--) {
    if (xp >= LEVELS[i].xpRequired) {
      const nextLevel = LEVELS[i + 1];
      const progress = nextLevel 
        ? (xp - LEVELS[i].xpRequired) / (nextLevel.xpRequired - LEVELS[i].xpRequired)
        : 1;
      return { 
        level: LEVELS[i].level, 
        title: LEVELS[i].title, 
        progress: Math.min(progress, 1) 
      };
    }
  }
  return { level: 1, title: LEVELS[0].title, progress: 0 };
}

export function formatTimePlayed(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  
  if (hours > 0) {
    return `${hours}h ${mins}m`;
  }
  return `${mins}m`;
}

export function formatNumber(num: number): string {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  }
  return num.toString();
}
