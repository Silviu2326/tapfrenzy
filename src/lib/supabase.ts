// ==========================================
// CONFIGURACIÓN DE SUPABASE
// ==========================================

import { createClient } from '@supabase/supabase-js';

// Credenciales de Supabase (mismo proyecto que MiAppExpo)
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://uxcuxmyvnkdsmvgqrkrs.supabase.co';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV4Y3V4bXl2bmtkc212Z3Fya3JzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM4MDY2MzYsImV4cCI6MjA3OTM4MjYzNn0.XnG4-YhYPio-tj2h0ejvDSc9_szGMVBxfZRWxypwYZw';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Tipos de modos de juego
export type GameMode = 'classic' | 'quick' | 'zen';

// ==========================================
// TIPOS PARA EL RANKING
// ==========================================

export interface RankingEntry {
  id?: number;
  user_id: string;
  email?: string;
  nickname: string;
  score: number;
  max_tier: number;
  game_mode: GameMode;
  week_id: string;
  created_at?: string;
  updated_at?: string;
}

export interface UserData {
  userId: string;
  email: string;
  name: string;
  source: 'app' | 'web';
  isLoggedIn: boolean;
}

// ==========================================
// FUNCIONES DEL RANKING
// ==========================================

/**
 * Guarda o actualiza la puntuación de un usuario para un modo específico
 */
export async function saveScore(
  userData: UserData,
  score: number,
  maxTier: number,
  weekId: string,
  gameMode: GameMode = 'classic'
): Promise<{ success: boolean; error?: string }> {
  try {
    // Verificar si ya existe un registro para este usuario, semana y modo
    const { data: existing } = await supabase
      .from('rankings')
      .select('id, score')
      .eq('user_id', userData.userId)
      .eq('week_id', weekId)
      .eq('game_mode', gameMode)
      .single();

    if (existing) {
      // Solo actualizar si la nueva puntuación es mayor
      if (score > existing.score) {
        const { error } = await supabase
          .from('rankings')
          .update({
            score,
            max_tier: maxTier,
            nickname: userData.name,
            updated_at: new Date().toISOString(),
          })
          .eq('id', existing.id);

        if (error) throw error;
        return { success: true };
      }
      return { success: true, error: 'Score not higher than existing' };
    } else {
      // Crear nuevo registro
      const { error } = await supabase
        .from('rankings')
        .insert({
          user_id: userData.userId,
          email: userData.email,
          nickname: userData.name || 'Anónimo',
          score,
          max_tier: maxTier,
          game_mode: gameMode,
          week_id: weekId,
        });

      if (error) throw error;
      return { success: true };
    }
  } catch (error) {
    console.error('Error saving score:', error);
    return { success: false, error: String(error) };
  }
}

/**
 * Obtiene el ranking de la semana actual para un modo específico
 */
export async function getWeeklyRanking(
  weekId: string,
  gameMode: GameMode = 'classic',
  limit: number = 10
): Promise<RankingEntry[]> {
  try {
    const { data, error } = await supabase
      .from('rankings')
      .select('*')
      .eq('week_id', weekId)
      .eq('game_mode', gameMode)
      .order('score', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error getting ranking:', error);
    return [];
  }
}

/**
 * Obtiene la posición del usuario en el ranking de un modo específico
 */
export async function getUserPosition(
  userId: string,
  weekId: string,
  gameMode: GameMode = 'classic'
): Promise<{ position: number | null; entry: RankingEntry | null }> {
  try {
    // Obtener todas las puntuaciones del modo ordenadas
    const { data, error } = await supabase
      .from('rankings')
      .select('*')
      .eq('week_id', weekId)
      .eq('game_mode', gameMode)
      .order('score', { ascending: false });

    if (error) throw error;
    if (!data) return { position: null, entry: null };

    const position = data.findIndex(entry => entry.user_id === userId);
    
    if (position === -1) {
      return { position: null, entry: null };
    }

    return { position: position + 1, entry: data[position] };
  } catch (error) {
    console.error('Error getting user position:', error);
    return { position: null, entry: null };
  }
}

/**
 * Obtiene el mejor puntaje del usuario en un modo específico
 */
export async function getUserBestScore(
  userId: string,
  gameMode: GameMode = 'classic'
): Promise<number> {
  try {
    const { data, error } = await supabase
      .from('rankings')
      .select('score')
      .eq('user_id', userId)
      .eq('game_mode', gameMode)
      .order('score', { ascending: false })
      .limit(1)
      .single();

    if (error || !data) return 0;
    return data.score;
  } catch (error) {
    return 0;
  }
}

/**
 * Obtiene las mejores puntuaciones del usuario en todos los modos
 */
export async function getUserBestScoresByMode(
  userId: string,
  weekId: string
): Promise<Record<GameMode, number>> {
  try {
    const { data, error } = await supabase
      .from('rankings')
      .select('game_mode, score')
      .eq('user_id', userId)
      .eq('week_id', weekId);

    if (error || !data) {
      return { classic: 0, quick: 0, zen: 0 };
    }

    const scores: Record<GameMode, number> = { classic: 0, quick: 0, zen: 0 };
    data.forEach((entry: { game_mode: GameMode; score: number }) => {
      scores[entry.game_mode] = entry.score;
    });

    return scores;
  } catch (error) {
    console.error('Error getting user scores by mode:', error);
    return { classic: 0, quick: 0, zen: 0 };
  }
}

/**
 * Obtiene el conteo de jugadores por modo
 */
export async function getRankingStats(
  weekId: string
): Promise<Record<GameMode, number>> {
  try {
    const { data, error } = await supabase
      .from('rankings')
      .select('game_mode, count')
      .eq('week_id', weekId)
      .group('game_mode');

    if (error || !data) {
      return { classic: 0, quick: 0, zen: 0 };
    }

    const stats: Record<GameMode, number> = { classic: 0, quick: 0, zen: 0 };
    data.forEach((entry: { game_mode: GameMode; count: number }) => {
      stats[entry.game_mode] = entry.count;
    });

    return stats;
  } catch (error) {
    console.error('Error getting ranking stats:', error);
    return { classic: 0, quick: 0, zen: 0 };
  }
}

/**
 * Helper para obtener el nombre legible del modo
 */
export function getGameModeLabel(mode: GameMode): string {
  const labels: Record<GameMode, string> = {
    classic: 'Clásico',
    quick: 'Contrarreloj',
    zen: 'Zen',
  };
  return labels[mode];
}

/**
 * Helper para obtener el icono del modo
 */
export function getGameModeIcon(mode: GameMode): string {
  const icons: Record<GameMode, string> = {
    classic: '🎯',
    quick: '⚡',
    zen: '🧘',
  };
  return icons[mode];
}
