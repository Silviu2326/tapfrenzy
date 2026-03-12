// ==========================================
// SISTEMA DE SONIDO CON WEB AUDIO API
// ==========================================

let soundEnabled = true;
let audioContext: AudioContext | null = null;
let bgMusic: HTMLAudioElement | null = null;
let bgMusicVolume = 0.3;

const getAudioContext = (): AudioContext => {
  if (!audioContext) {
    audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  return audioContext;
};

// Inicializar audio
export const initAudio = (): void => {
  // El audio context se crea bajo demanda para evitar problemas de autoplay
};

// Toggle sonido
export const toggleSound = (): boolean => {
  soundEnabled = !soundEnabled;
  
  // Controlar música de fondo
  if (soundEnabled) {
    resumeBackgroundMusic();
  } else {
    pauseBackgroundMusic();
  }
  
  return soundEnabled;
};

// Reproducir tono simple
const playTone = (frequency: number, duration: number, type: OscillatorType = 'sine', volume = 0.3): void => {
  if (!soundEnabled) return;
  
  try {
    const ctx = getAudioContext();
    
    // Resume context si está suspendido (política de autoplay)
    if (ctx.state === 'suspended') {
      ctx.resume();
    }
    
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();
    
    oscillator.type = type;
    oscillator.frequency.setValueAtTime(frequency, ctx.currentTime);
    
    gainNode.gain.setValueAtTime(volume, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);
    
    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);
    
    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + duration);
  } catch (e) {
    console.log('Sound error:', e);
  }
};

// Sonido al soltar botella
export const playDrop = (): void => {
  playTone(180, 0.1, 'sine', 0.2);
};

// Sonido al fusionar — más rico según el tier
export const playMerge = (tier: number): void => {
  const freq = 280 + tier * 90;
  const duration = 0.15 + tier * 0.025;
  const vol = 0.2 + Math.min(tier * 0.01, 0.08);
  const waveform = tier < 3 ? 'triangle' : 'sine';

  // Nota base
  playTone(freq, duration, waveform, vol);

  // Quinta perfecta (armónico) para tier >= 3
  if (tier >= 3) {
    setTimeout(() => {
      playTone(freq * 1.5, duration * 1.2, 'sine', vol * 0.55);
    }, 20);
  }

  // Acorde completo (tercera mayor + octava) para tier >= 6
  if (tier >= 6) {
    setTimeout(() => {
      playTone(freq * 1.26, duration * 1.3, 'sine', vol * 0.4);
    }, 35);
    setTimeout(() => {
      playTone(freq * 2, duration * 0.8, 'sine', vol * 0.25);
    }, 55);
  }
};

// Sonido de game over
export const playGameOver = (): void => {
  const notes = [400, 320, 260, 180];
  notes.forEach((freq, i) => {
    setTimeout(() => {
      playTone(freq, 0.2, 'square', 0.15);
    }, i * 130);
  });
};

// Sonido de chocar botellas (clink)
let lastClink = 0;
export const playClink = (force: number): void => {
  if (!soundEnabled) return;
  
  const now = Date.now();
  if (now - lastClink < 50) return;
  lastClink = now;
  
  const vol = Math.min(0.25, force * 0.02);
  if (vol < 0.01) return;
  
  // Frecuencias altas para sonido de vidrio
  const freqs = [
    3400 + Math.random() * 500,
    5200 + Math.random() * 700,
    2000 + Math.random() * 400
  ];
  
  freqs.forEach((freq, i) => {
    setTimeout(() => {
      playTone(freq, 0.08, 'sine', vol * (1 - i * 0.3));
    }, i * 10);
  });
};

// Sonido de inicio
export const playStart = (): void => {
  playTone(440, 0.15, 'sine', 0.2);
  setTimeout(() => playTone(554, 0.15, 'sine', 0.2), 100);
  setTimeout(() => playTone(659, 0.2, 'sine', 0.25), 200);
};

// Vibration API (alternativa a Haptics de Expo)
export const vibrate = (pattern: number | number[]): void => {
  if (navigator.vibrate) {
    navigator.vibrate(pattern);
  }
};

export const vibrateLight = (): void => vibrate(10);
export const vibrateMedium = (): void => vibrate(20);
export const vibrateHeavy = (): void => vibrate([30, 50, 30]);
export const vibrateError = (): void => vibrate([50, 100, 50, 100, 50]);

// ==========================================
// MÚSICA DE FONDO
// ==========================================

const MUSIC_PATH = '/assets/Funky-Universo-_Club-Extended-Version_.mp3';

// Iniciar música de fondo
export const playBackgroundMusic = (): void => {
  if (!soundEnabled || bgMusic) return;
  
  try {
    bgMusic = new Audio(MUSIC_PATH);
    bgMusic.loop = true;
    bgMusic.volume = bgMusicVolume;
    
    // Reproducir
    const playPromise = bgMusic.play();
    if (playPromise !== undefined) {
      playPromise.catch((error) => {
        console.log('Music autoplay blocked:', error);
      });
    }
  } catch (e) {
    console.log('Music error:', e);
  }
};

// Pausar música
export const pauseBackgroundMusic = (): void => {
  if (bgMusic) {
    bgMusic.pause();
  }
};

// Reanudar música
export const resumeBackgroundMusic = (): void => {
  if (bgMusic && soundEnabled) {
    bgMusic.play().catch((e) => console.log('Resume error:', e));
  }
};

// Detener y limpiar música
export const stopBackgroundMusic = (): void => {
  if (bgMusic) {
    bgMusic.pause();
    bgMusic.currentTime = 0;
    bgMusic = null;
  }
};
