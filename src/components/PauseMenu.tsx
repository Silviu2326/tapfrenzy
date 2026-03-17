import { GameMode, GAME_MODES } from '../types/gameModes';

interface PauseMenuProps {
  score: number;
  gameTime: number;
  gameMode: GameMode;
  onResume: () => void;
  onRestart: () => void;
  onMainMenu: () => void;
  onSaveAndExit?: () => void;
  userData?: { isLoggedIn: boolean };
}

export default function PauseMenu({
  score,
  gameTime,
  gameMode,
  onResume,
  onRestart,
  onMainMenu,
  onSaveAndExit,
  userData,
}: PauseMenuProps) {
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="pause-overlay">
      <div className="pause-card">
        <div className="pause-header">
          <h2>⏸️ PAUSA</h2>
        </div>

        <div className="pause-stats">
          <div className="pause-stat-row">
            <span className="pause-stat-label">Puntuación</span>
            <span className="pause-stat-value">{score.toLocaleString()}</span>
          </div>
          
          <div className="pause-stat-row">
            <span className="pause-stat-label">Tiempo</span>
            <span className="pause-stat-value">{formatTime(gameTime)}</span>
          </div>
          
          <div className="pause-stat-row">
            <span className="pause-stat-label">Modo</span>
            <span className="pause-stat-value mode">
              {GAME_MODES[gameMode].iconImage ? (
                <img
                  src={GAME_MODES[gameMode].iconImage}
                  alt={GAME_MODES[gameMode].name}
                  style={{ width: '20px', height: '20px', objectFit: 'contain', marginRight: '6px', verticalAlign: 'middle' }}
                />
              ) : (
                <span>{GAME_MODES[gameMode].icon}</span>
              )}
              {GAME_MODES[gameMode].name}
            </span>
          </div>
        </div>

        <div className="pause-buttons">
          <button className="pause-btn resume" onClick={onResume}>
            <span className="btn-icon">▶️</span>
            <span className="btn-text">Continuar</span>
          </button>

          <button className="pause-btn restart" onClick={onRestart}>
            <span className="btn-icon">🔄</span>
            <span className="btn-text">Reiniciar</span>
          </button>

          {userData?.isLoggedIn && onSaveAndExit && (
            <button className="pause-btn save-exit" onClick={onSaveAndExit}>
              <span className="btn-icon">💾</span>
              <span className="btn-text">Guardar y Salir</span>
            </button>
          )}

          <button className="pause-btn menu" onClick={onMainMenu}>
            <span className="btn-icon">🏠</span>
            <span className="btn-text">Menú Principal</span>
          </button>
        </div>

        <p className="pause-tip">
          💡 Tip: {GAME_MODES[gameMode].description}
        </p>
      </div>
    </div>
  );
}
