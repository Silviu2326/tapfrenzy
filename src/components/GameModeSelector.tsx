import { GameMode, GAME_MODES } from '../types/gameModes';

interface GameModeSelectorProps {
  onSelectMode: (mode: GameMode) => void;
  currentMode?: GameMode;
}

export default function GameModeSelector({ onSelectMode, currentMode }: GameModeSelectorProps) {
  const modes: GameMode[] = ['classic', 'quick', 'zen'];

  return (
    <div className="game-mode-overlay">
      <div className="game-mode-card">
        <h2 className="game-mode-title">🎮 SELECCIONA MODO</h2>
        
        <div className="game-mode-list">
          {modes.map((modeKey) => {
            const mode = GAME_MODES[modeKey];
            const isSelected = currentMode === modeKey;
            
            return (
              <button
                key={modeKey}
                className={`game-mode-option ${isSelected ? 'selected' : ''}`}
                onClick={() => onSelectMode(modeKey)}
              >
                {mode.iconImage ? (
                  <img
                    src={mode.iconImage}
                    alt={mode.name}
                    className="game-mode-icon-image"
                    style={{ width: '48px', height: '48px', objectFit: 'contain' }}
                  />
                ) : (
                  <span className="game-mode-icon">{mode.icon}</span>
                )}
                <div className="game-mode-info">
                  <span className="game-mode-name">{mode.name}</span>
                  <span className="game-mode-desc">{mode.description}</span>
                </div>
                {isSelected && <span className="game-mode-check">✓</span>}
              </button>
            );
          })}
        </div>
        
        <p className="game-mode-tip">
          💡 Tip: Modo Rápido es perfecto para partidas cortas
        </p>
      </div>
    </div>
  );
}
