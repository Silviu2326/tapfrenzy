import { Power, PowerType, canUsePower, getCooldownProgress, getCooldownRemaining } from '../types/powers';
import { GameMode } from '../types/gameModes';

interface PowerBarProps {
  powers: Record<PowerType, Power>;
  lastUsed: Record<PowerType, number>;
  activePower: PowerType | null;
  onActivatePower: (type: PowerType) => void;
  isSelectingTarget: boolean;
  gameMode: GameMode;
}

export default function PowerBar({ 
  powers, 
  lastUsed, 
  activePower, 
  onActivatePower,
  isSelectingTarget,
  gameMode
}: PowerBarProps) {
  // El poder de tiempo solo aparece en modo rápido
  const powerOrder: PowerType[] = gameMode === 'quick' 
    ? ['swap', 'slowmo', 'bomb']
    : ['swap', 'bomb'];

  const getPowerStatus = (power: Power, lastUsedTime: number) => {
    const isAvailable = canUsePower(power, lastUsedTime);
    const progress = getCooldownProgress(power, lastUsedTime);
    const remaining = getCooldownRemaining(power, lastUsedTime);
    const isActive = activePower === power.type;
    
    return { isAvailable, progress, remaining, isActive };
  };

  return (
    <div className="power-bar">
      {powerOrder.map((type) => {
        const power = powers[type];
        const lastUsedTime = lastUsed[type] || 0;
        const { isAvailable, progress, remaining, isActive } = getPowerStatus(power, lastUsedTime);
        
        if (!power.unlocked) {
          return (
          <button
            key={type}
            className="power-button locked"
            disabled
            onClick={(e) => e.stopPropagation()}
            title={`Desbloquea a ${power.unlockScore} pts`}
          >
              <span className="power-icon">🔒</span>
              <span className="power-count">{power.unlockScore}</span>
            </button>
          );
        }

        return (
          <button
            key={type}
            className={`power-button ${isActive ? 'active' : ''} ${!isAvailable ? 'cooldown' : ''}`}
            onClick={(e) => {
              e.stopPropagation();
              onActivatePower(type);
            }}
            disabled={!isAvailable || isSelectingTarget}
            title={`${power.name}: ${power.description}`}
          >
            <img 
              src={power.iconImage} 
              alt={power.name}
              className="power-icon-image"
              style={{ width: '24px', height: '24px', objectFit: 'contain' }}
            />
            <span className="power-count">
              {power.uses > 0 ? power.uses : remaining > 0 ? `${remaining}s` : '0'}
            </span>
            {progress < 1 && (
              <div 
                className="power-cooldown-overlay"
                style={{ 
                  background: `conic-gradient(transparent ${progress * 360}deg, rgba(0,0,0,0.7) ${progress * 360}deg)` 
                }}
              />
            )}
            {isActive && <div className="power-active-indicator" />}
          </button>
        );
      })}
    </div>
  );
}
