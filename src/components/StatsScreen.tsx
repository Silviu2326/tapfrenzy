import { PlayerProfile, PlayerStats, calculateLevel, formatTimePlayed, formatNumber } from '../types/player';

interface StatsScreenProps {
  profile: PlayerProfile;
  stats: PlayerStats;
  onClose: () => void;
}

export default function StatsScreen({ profile, stats, onClose }: StatsScreenProps) {
  const levelInfo = calculateLevel(profile.xp);

  return (
    <div className="stats-overlay">
      <div className="stats-card">
        <div className="stats-header">
          <h2>📊 ESTADÍSTICAS</h2>
          <button className="stats-close" onClick={onClose}>✕</button>
        </div>

        {/* Perfil */}
        <div className="stats-profile">
          <div className="stats-avatar">{profile.avatar}</div>
          <div className="stats-profile-info">
            <span className="stats-nickname">{profile.nickname}</span>
            <span className="stats-title">{profile.title}</span>
            <div className="stats-level-bar">
              <div 
                className="stats-level-progress" 
                style={{ width: `${levelInfo.progress * 100}%` }}
              />
              <span className="stats-level-text">Nivel {profile.level} - {Math.floor(levelInfo.progress * 100)}%</span>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="stats-grid">
          <div className="stat-box">
            <span className="stat-box-icon">🎮</span>
            <span className="stat-box-value">{formatNumber(stats.totalGames)}</span>
            <span className="stat-box-label">Partidas</span>
          </div>

          <div className="stat-box">
            <span className="stat-box-icon">🏆</span>
            <span className="stat-box-value">{formatNumber(stats.bestScore)}</span>
            <span className="stat-box-label">Mejor Punt.</span>
          </div>

          <div className="stat-box">
            <span className="stat-box-icon">🛢️</span>
            <span className="stat-box-value">{stats.barrelsCreated}</span>
            <span className="stat-box-label">Barriles</span>
          </div>

          <div className="stat-box">
            <span className="stat-box-icon">🔄</span>
            <span className="stat-box-value">{formatNumber(stats.totalMerges)}</span>
            <span className="stat-box-label">Fusiones</span>
          </div>

          <div className="stat-box">
            <span className="stat-box-icon">⚡</span>
            <span className="stat-box-value">x{stats.maxCombo}</span>
            <span className="stat-box-label">Max Combo</span>
          </div>

          <div className="stat-box">
            <span className="stat-box-icon">⏱️</span>
            <span className="stat-box-value">{formatTimePlayed(stats.timePlayed)}</span>
            <span className="stat-box-label">Tiempo Jugado</span>
          </div>
        </div>

        {/* Racha */}
        {stats.currentStreak > 0 && (
          <div className="stats-streak">
            <span className="streak-icon">🔥</span>
            <span className="streak-text">¡Racha de {stats.currentStreak} días!</span>
          </div>
        )}

        <button className="stats-btn-close" onClick={onClose}>
          Cerrar
        </button>
      </div>
    </div>
  );
}
