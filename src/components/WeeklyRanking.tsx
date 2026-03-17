import { useState, useEffect } from 'react';
import { RankedPlayer, getCurrentWeekId } from '../types/ranking';

interface WeeklyRankingProps {
  currentScore?: number;
  onClose: () => void;
  onPlayAgain?: () => void;
}

// Datos de ejemplo para mostrar la estructura
const MOCK_PLAYERS: RankedPlayer[] = [
  { userId: '1', nickname: 'DJKeyla', score: 12540, timestamp: Date.now() },
  { userId: '2', nickname: 'FunkMaster', score: 11800, timestamp: Date.now() },
  { userId: '3', nickname: 'CatiraKing', score: 11200, timestamp: Date.now() },
  { userId: '4', nickname: 'BeerLover', score: 9850, timestamp: Date.now() },
  { userId: '5', nickname: 'MedusaPro', score: 9200, timestamp: Date.now() },
  { userId: '6', nickname: 'TapMaster', score: 8750, timestamp: Date.now() },
  { userId: '7', nickname: 'CoolCat99', score: 8100, timestamp: Date.now() },
  { userId: '8', nickname: 'GatoLoco', score: 7600, timestamp: Date.now() },
  { userId: '9', nickname: 'CervezaReal', score: 7200, timestamp: Date.now() },
  { userId: '10', nickname: 'FrenzyKing', score: 6800, timestamp: Date.now() },
];

const MEDALS = ['🥇', '🥈', '🥉'];

export default function WeeklyRanking({ currentScore, onClose, onPlayAgain }: WeeklyRankingProps) {
  const [players, setPlayers] = useState<RankedPlayer[]>(MOCK_PLAYERS);
  const [currentUserPosition, setCurrentUserPosition] = useState<number | null>(null);
  const currentWeekId = getCurrentWeekId();

  useEffect(() => {
    // Ordenar por puntuación
    const sorted = [...MOCK_PLAYERS].sort((a, b) => b.score - a.score);
    
    // Si hay puntuación actual, insertar en la posición correcta
    if (currentScore && currentScore > 0) {
      const userPlayer: RankedPlayer = {
        userId: 'current-user',
        nickname: 'Tú',
        score: currentScore,
        timestamp: Date.now(),
      };
      
      // Encontrar posición
      let position = sorted.findIndex(p => p.score < currentScore);
      if (position === -1) position = sorted.length;
      
      // Insertar usuario
      sorted.splice(position, 0, userPlayer);
      setCurrentUserPosition(position + 1);
    }
    
    setPlayers(sorted.slice(0, 10));
  }, [currentScore]);

  const formatScore = (score: number): string => {
    return score.toLocaleString('es-ES');
  };

  return (
    <div className="ranking-overlay">
      <div className="ranking-card">
        {/* Header */}
        <div className="ranking-header">
          <h2 className="ranking-title">🏆 RANKING SEMANAL</h2>
          <span className="ranking-week">{currentWeekId}</span>
        </div>

        {/* Lista de rankings */}
        <div className="ranking-list">
          {players.map((player, index) => {
            const isCurrentUser = player.userId === 'current-user';
            const position = index + 1;
            const medal = position <= 3 ? MEDALS[position - 1] : `${position}.`;
            
            return (
              <div 
                key={player.userId} 
                className={`ranking-item ${isCurrentUser ? 'current-user' : ''} ${position <= 3 ? 'top-three' : ''}`}
              >
                <span className="ranking-position">{medal}</span>
                <span className="ranking-nickname">{player.nickname}</span>
                <span className="ranking-score">{formatScore(player.score)} pts</span>
              </div>
            );
          })}
        </div>

        {/* Posición del usuario */}
        {currentUserPosition && currentUserPosition > 10 && (
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
