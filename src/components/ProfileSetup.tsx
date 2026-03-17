import { useState } from 'react';
import { AVATARS } from '../types/player';

interface ProfileSetupProps {
  currentNickname: string;
  currentAvatar: string;
  onSave: (nickname: string, avatar: string) => void;
  onSkip: () => void;
}

export default function ProfileSetup({ 
  currentNickname, 
  currentAvatar, 
  onSave, 
  onSkip 
}: ProfileSetupProps) {
  const [nickname, setNickname] = useState(currentNickname || '');
  const [selectedAvatar, setSelectedAvatar] = useState(currentAvatar || AVATARS[0]);
  const [error, setError] = useState('');

  const handleSave = () => {
    if (nickname.trim().length < 2) {
      setError('El nombre debe tener al menos 2 caracteres');
      return;
    }
    if (nickname.trim().length > 15) {
      setError('El nombre debe tener máximo 15 caracteres');
      return;
    }
    onSave(nickname.trim(), selectedAvatar);
  };

  return (
    <div className="profile-setup-overlay">
      <div className="profile-setup-card">
        <div className="profile-setup-header">
          <span className="profile-icon">👤</span>
          <h2>Crea tu Perfil</h2>
          <p>Personaliza tu experiencia</p>
        </div>

        {/* Avatar Selector */}
        <div className="avatar-section">
          <label>Elige tu avatar</label>
          <div className="avatar-grid">
            {AVATARS.map((avatar) => (
              <button
                key={avatar}
                className={`avatar-btn ${selectedAvatar === avatar ? 'selected' : ''}`}
                onClick={() => setSelectedAvatar(avatar)}
              >
                <span className="avatar-emoji">{avatar}</span>
                {selectedAvatar === avatar && <span className="avatar-check">✓</span>}
              </button>
            ))}
          </div>
        </div>

        {/* Nickname Input */}
        <div className="nickname-section">
          <label htmlFor="nickname">Tu nombre</label>
          <input
            id="nickname"
            type="text"
            value={nickname}
            onChange={(e) => {
              setNickname(e.target.value);
              setError('');
            }}
            placeholder="Ej: CerveceroPro"
            maxLength={15}
            className={error ? 'error' : ''}
          />
          {error && <span className="nickname-error">{error}</span>}
          <span className="nickname-hint">{nickname.length}/15 caracteres</span>
        </div>

        {/* Preview */}
        <div className="profile-preview">
          <span className="preview-label">Vista previa:</span>
          <div className="preview-card">
            <span className="preview-avatar">{selectedAvatar}</span>
            <span className="preview-name">{nickname || 'Tu Nombre'}</span>
          </div>
        </div>

        {/* Buttons */}
        <div className="profile-setup-buttons">
          <button className="btn-save" onClick={handleSave}>
            Guardar Perfil
          </button>
          
          <button className="btn-skip" onClick={onSkip}>
            Omitir
          </button>
        </div>
      </div>
    </div>
  );
}
