interface EnhancedHUDProps {
  score: number;
  bestScore: number;
  combo: number;
  comboTime: number;
  onPause: () => void;
  soundOn: boolean;
  onToggleSound: () => void;
}

export default function EnhancedHUD({
  score,
  bestScore,
  combo,
  comboTime,
  onPause,
  soundOn,
  onToggleSound,
}: EnhancedHUDProps) {
  return (
    <>
      {/* Score Principal */}
      <div className="hud-score-main">
        <div className="score-wrapper">
          <div className="score-coin-large">
            <span>🍺</span>
          </div>
          <div className="score-info">
            <span className="score-value-large">{score.toLocaleString()}</span>
            <span className="score-best">Best: {bestScore.toLocaleString()}</span>
          </div>
        </div>

        {/* Combo */}
        {combo > 1 && (
          <div 
            className="hud-combo"
            style={{ opacity: Math.min(1, comboTime / 500) }}
          >
            <span className="combo-multiplier">x{combo}</span>
            <span className="combo-label">COMBO!</span>
          </div>
        )}

        {/* Botones de control */}
        <div className="hud-controls">
          <button className="hud-sound-btn" onClick={onToggleSound}>
            {soundOn ? '🔊' : '🔇'}
          </button>
          <button className="hud-pause-btn" onClick={onPause}>
            ⏸️
          </button>
        </div>
      </div>


    </>
  );
}
