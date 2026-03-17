import { useState, useEffect } from 'react';
import { getCurrentWeekId, RankedPlayer } from '../types/ranking';
import { 
  getWeeklyRanking, 
  getUserPosition, 
  RankingEntry, 
  UserData, 
  GameMode,
  getGameModeLabel,
  getGameModeIcon
} from '../lib/supabase';

interface WeeklyRankingProps {
  currentScore?: number;
  onClose: () => void;
  onPlayAgain?: () => void;
  userData?: UserData;
  maxTier?: number;
  currentGameMode?: GameMode;
}

const MEDALS = ['🥇', '🥈', '🥉'];

const MODES: GameMode[] = ['classic', 'quick', 'zen'];

export default function WeeklyRanking({ 
  currentScore, 
  onClose, 
  onPlayAgain,
  userData,
  maxTier = 0,
  currentGameMode = 'classic'
}: WeeklyRankingProps) {
  const [players, setPlayers] = useState<RankedPlayer[]>([]);
  const [currentUserPosition, setCurrentUserPosition] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedMode, setSelectedMode] = useState<GameMode>(currentGameMode);
  const currentWeekId = getCurrentWeekId();

  useEffect(() => {
    loadRanking();
  }, [selectedMode]);

  const loadRanking = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Obtener ranking de Supabase para el modo seleccionado
      const rankingData = await getWeeklyRanking(currentWeekId, selectedMode, 10);
      
      // Convertir a formato RankedPlayer
      let rankedPlayers: RankedPlayer[] = rankingData.map((entry: RankingEntry) => ({
        userId: entry.user_id,
        nickname: entry.nickname,
        score: entry.score,
        timestamp: new Date(entry.created_at || Date.now()).getTime(),
      }));

      // Si hay usuario logueado y puntuación actual, obtener su posición
      if (userData?.userId && currentScore && currentScore > 0 && selectedMode === currentGameMode) {
        const { position } = await getUserPosition(userData.userId, currentWeekId, selectedMode);
        
        if (position) {
          setCurrentUserPosition(position);
        }

        // Insertar usuario actual si no está en el top 10 o tiene mejor puntuación
        const existingIndex = rankedPlayers.findIndex(p => p.userId === userData.userId);
        
        if (existingIndex >= 0) {
          // Actualizar puntuación si es mejor
          if (currentScore > rankedPlayers[existingIndex].score) {
            rankedPlayers[existingIndex].score = currentScore;
            rankedPlayers[existingIndex].nickname = userData.name || 'Tú';
          }
        } else {
          // Agregar usuario al ranking
          const userPlayer: RankedPlayer = {
            userId: userData.userId,
            nickname: userData.name || 'Tú',
            score: currentScore,
            timestamp: Date.now(),
          };
          
          rankedPlayers.push(userPlayer);
        }
        
        // Reordenar
        rankedPlayers.sort((a, b) => b.score - a.score);
        
        // Guardar en Supabase si hay usuario
        if (userData.isLoggedIn) {
          const { saveScore } = await import('../lib/supabase');
          await saveScore(userData, currentScore, maxTier, currentWeekId, currentGameMode);
        }
      }
      
      setPlayers(rankedPlayers.slice(0, 10));
    } catch (err) {
      console.error('Error loading ranking:', err);
      setError('Error al cargar el ranking');
    } finally {
      setIsLoading(false);
    }
  };

  const formatScore = (score: number): string => {
    return score.toLocaleString('es-ES');
  };

  const isCurrentUser = (player: RankedPlayer): boolean => {
    if (!userData?.userId) return false;
    return player.userId === userData.userId || player.nickname === (userData.name || 'Tú');
  };

  if (isLoading) {
    return (
      <div className="ranking-overlay">
        <div className="ranking-card">
          <div className="ranking-loading">
            <div className="loading-spinner"></div>
            <p>Cargando ranking...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="ranking-overlay">
      <div className="ranking-card">
        {/* Header */}
        <div className="ranking-header">
          <h2 className="ranking-title">🏆 RANKING SEMANAL</h2>
          <span className="ranking-week">{currentWeekId}</span>
        </div>

        {/* Tabs de modo de juego */}
        <div className="ranking-mode-tabs">
          {MODES.map((mode) => (
            <button
              key={mode}
              className={`mode-tab ${selectedMode === mode ? 'active' : ''} ${mode === currentGameMode ? 'current' : ''}`}
              onClick={() => setSelectedMode(mode)}
            >
              <span className="mode-icon">{getGameModeIcon(mode)}</span>
              <span className="mode-label">{getGameModeLabel(mode)}</span>
              {mode === currentGameMode && <span className="mode-current-badge">Actual</span>}
            </button>
          ))}
        </div>

        {error && (
          <div className="ranking-error">
            {error}
          </div>
        )}

        {/* Lista de rankings */}
        <div className="ranking-list">
          {players.length === 0 ? (
            <div className="ranking-empty">
              <p>🎮 ¡Sé el primero en jugar {getGameModeLabel(selectedMode)}!</p>
              <p className="ranking-empty-sub">Aún no hay puntuaciones esta semana en este modo</p>
            </div>
          ) : (
            players.map((player, index) => {
              const isUser = isCurrentUser(player);
              const position = index + 1;
              const medal = position <= 3 ? MEDALS[position - 1] : `${position}.`;
              
              return (
                <div 
                  key={player.userId} 
                  className={`ranking-item ${isUser ? 'current-user' : ''} ${position <= 3 ? 'top-three' : ''}`}
                >
                  <span className="ranking-position">{medal}</span>
                  <span className="ranking-nickname">{player.nickname}</span>
                  <span className="ranking-score">{formatScore(player.score)} pts</span>
                </div>
              );
            })
          )}
        </div>

        {/* Posición del usuario */}
        {currentUserPosition && currentUserPosition > 10 && selectedMode === currentGameMode && (
          <div className="ranking-user-position">
            <span className="user-position-text">Tu posición: #{currentUserPosition}</span>
            {currentScore && (
              <span className="user-position-score">{formatScore(currentScore)} pts</span>
            )}
          </div>
        )}

        {/* Info */}
        <div className="ranking-info">
          <p>🎁 Top 3 ganan premios semanales</p>
          <p>🔄 Reset cada lunes a las 00:00</p>
          {!userData?.isLoggedIn && (
            <p className="ranking-login-hint">
              🔐 Inicia sesión para guardar tu puntuación
            </p>
          )}
        </div>

        {/* Botones */}
        <div className="ranking-buttons">
          {onPlayAgain && (
            <button className="ranking-btn-primary" onClick={onPlayAgain}>
              JUGAR DE NUEVO
            </button>
          )}
          <button className="ranking-btn-secondary" onClick={onClose}>
            CERRAR
          </button>
        </div>
      </div>
    </div>
  );
}
