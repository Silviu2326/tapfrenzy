// ==========================================
// TIPOS PARA EL SISTEMA DE RANKING SEMANAL
// ==========================================

export type RankingLocation = 'alicante' | 'el-gato-cool' | 'global';

export interface RankedPlayer {
  userId: string;
  nickname: string;
  avatar?: string;
  score: number;
  timestamp: number;
  location?: RankingLocation;
}

export interface WeeklyRanking {
  weekId: string;        // Formato: YYYY-WXX (ej: 2026-W11)
  startDate: number;     // Timestamp
  endDate: number;       // Timestamp
  players: RankedPlayer[];
}

export interface RankingState {
  currentWeekId: string;
  rankings: Record<string, WeeklyRanking>;
  currentUser?: {
    userId: string;
    nickname: string;
    avatar?: string;
  };
}

// Helper para obtener la semana actual en formato YYYY-WXX
export function getCurrentWeekId(): string {
  const now = new Date();
  const year = now.getFullYear();
  
  // Calcular número de semana (ISO 8601)
  const startOfYear = new Date(year, 0, 1);
  const days = Math.floor((now.getTime() - startOfYear.getTime()) / (24 * 60 * 60 * 1000));
  const weekNumber = Math.ceil(days / 7);
  
  return `${year}-W${weekNumber.toString().padStart(2, '0')}`;
}

// Helper para obtener las fechas de inicio y fin de una semana
export function getWeekDates(weekId: string): { startDate: number; endDate: number } {
  const [year, weekStr] = weekId.split('-W');
  const weekNumber = parseInt(weekStr);
  
  const startOfYear = new Date(parseInt(year), 0, 1);
  const startDate = new Date(startOfYear.getTime() + (weekNumber - 1) * 7 * 24 * 60 * 60 * 1000);
  const endDate = new Date(startDate.getTime() + 7 * 24 * 60 * 60 * 1000 - 1);
  
  return {
    startDate: startDate.getTime(),
    endDate: endDate.getTime()
  };
}
