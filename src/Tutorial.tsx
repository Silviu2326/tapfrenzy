// ==========================================
// SISTEMA DE TUTORIAL INTERACTIVO
// ==========================================

import { useState, useEffect, useRef } from 'react';
import { AREA, DROP_Y } from './config';

// Pasos del tutorial
const TUTORIAL_STEPS = [
  {
    id: 'welcome',
    title: '¡Bienvenido a Mr. Cool Cat Tap Frenzy!',
    message: 'Combina cervezas iguales para crear nuevas variedades. ¡Llega hasta el Barril!',
    position: 'center',
    highlight: null as string | null,
  },
  {
    id: 'aim',
    title: 'Apunta',
    message: 'Mueve el ratón horizontalmente para mover la botella.\n\nHaz clic para lanzarla hacia arriba.',
    position: 'bottom',
    highlight: 'aim',
  },
  {
    id: 'merge',
    title: 'Combina',
    message: 'Cuando dos botellas del mismo tipo chocan, ¡se fusionan en una mejor!\n\nMorena + Morena = Guajira',
    position: 'center',
    highlight: 'game',
  },
  {
    id: 'danger',
    title: 'Cuidado con la línea',
    message: 'Si una botella cruza la línea de peligro por mucho tiempo...\n\n¡GAME OVER!',
    position: 'top',
    highlight: 'danger',
  },
  {
    id: 'combo',
    title: 'Combos',
    message: 'Fusiones consecutivas = COMBOS\n\n¡Multiplican tus puntos!',
    position: 'center',
    highlight: null,
  },
  {
    id: 'ready',
    title: '¡Listo para jugar!',
    message: 'Alcanza el tier máximo (Barril) y consigue la mejor puntuación.\n\n¡Buena suerte, cervecero!',
    position: 'center',
    highlight: null,
  },
];

// Consejos del día (seleccionados aleatoriamente)
const DAILY_TIPS = [
  { icon: '🎯', text: 'Apunta al centro para mejor control' },
  { icon: '⚡', text: 'Los combos x5 dan el máximo de puntos' },
  { icon: '🧊', text: 'Deja que las botellas se asienten antes de lanzar' },
  { icon: '🎲', text: 'El tier máximo de drop es Catira' },
  { icon: '🏆', text: 'Cada Barril vale 3000 puntos base' },
  { icon: '💡', text: 'Fusión en cadena = mega combo' },
  { icon: '⏱️', text: 'No hay prisa, planifica tu siguiente movimiento' },
  { icon: '🍺', text: 'El Barril es el Santo Grial cervecero' },
  { icon: '📐', text: 'Apila estratégicamente para facilitar fusiones' },
  { icon: '🔄', text: 'Las botellas rebotan, úsalo a tu favor' },
  { icon: '🎪', text: 'Mantén el equilibrio en la torre' },
  { icon: '🔥', text: 'Combo rápido = más puntos multiplicados' },
  { icon: '💎', text: 'La Medusa es difícil de conseguir, valórala' },
  { icon: '🌊', text: 'La física es tu aliada... o tu enemiga' },
  { icon: '⚖️', text: 'Distribuye el peso uniformemente' },
  { icon: '🎨', text: 'Cada cerveza tiene su propia personalidad' },
  { icon: '🚀', text: 'Una buena apertura define tu partida' },
  { icon: '🔮', text: 'Observa el NEXT para planificar' },
  { icon: '💪', text: 'La práctica hace al maestro cervecero' },
  { icon: '🎯', text: 'Precisión sobre velocidad, siempre' },
  { icon: '🎰', text: 'A veces la suerte también cuenta' },
  { icon: '🏃', text: 'Las fusiones rápidas mantienen el ritmo' },
  { icon: '🧩', text: 'Encaja las piezas como un tetris maestro' },
  { icon: '📊', text: 'Más altura = más riesgo, más recompensa' },
];

// ==========================================
// COMPONENTE TUTORIAL
// ==========================================
interface TutorialProps {
  visible: boolean;
  onComplete: () => void;
  onSkip: () => void;
}

export const Tutorial = ({ visible, onComplete, onSkip }: TutorialProps) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (visible) {
      setTimeout(() => setIsVisible(true), 10);
    } else {
      setIsVisible(false);
    }
  }, [visible, currentStep]);

  const handleNext = () => {
    if (currentStep < TUTORIAL_STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const step = TUTORIAL_STEPS[currentStep];

  if (!visible) return null;

  return (
    <div className="tutorial-overlay">
      {/* Highlight areas */}
      {step.highlight === 'danger' && (
        <div className="tutorial-highlight" style={{ top: 180, left: 42, width: 336, height: 4 }} />
      )}
      {step.highlight === 'aim' && (
        <div className="tutorial-highlight" style={{ top: DROP_Y - 30, left: AREA.x, width: AREA.w, height: 60 }} />
      )}
      
      <div 
        className="tutorial-container"
        style={{
          opacity: isVisible ? 1 : 0,
          transform: isVisible ? 'translateY(0)' : 'translateY(50px)',
          transition: 'all 0.3s ease',
        }}
      >
        <div className="tutorial-card">
          {/* Progress dots */}
          <div className="tutorial-progress">
            {TUTORIAL_STEPS.map((_, index) => (
              <div
                key={index}
                className={`tutorial-dot ${
                  index === currentStep ? 'active' : ''
                } ${index < currentStep ? 'completed' : ''}`}
              />
            ))}
          </div>

          {/* Icon based on step */}
          <div className="tutorial-icon-container">
            <span className="tutorial-icon">
              {step.id === 'welcome' && '🍺'}
              {step.id === 'aim' && '🎯'}
              {step.id === 'merge' && '⚡'}
              {step.id === 'danger' && '⚠️'}
              {step.id === 'combo' && '🔥'}
              {step.id === 'ready' && '🏆'}
            </span>
          </div>

          <h3 className="tutorial-title">{step.title}</h3>
          <p className="tutorial-message">{step.message}</p>

          {/* Navigation buttons */}
          <div className="tutorial-buttons">
            {currentStep > 0 ? (
              <button className="tutorial-btn-secondary" onClick={handlePrev}>
                Anterior
              </button>
            ) : (
              <button className="tutorial-btn-secondary" onClick={onSkip}>
                Saltar
              </button>
            )}

            <button className="tutorial-btn-primary" onClick={handleNext}>
              {currentStep === TUTORIAL_STEPS.length - 1 ? '¡Jugar!' : 'Siguiente'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ==========================================
// CONSEJO DEL DÍA
// ==========================================
interface DailyTipProps {
  visible: boolean;
  onClose: () => void;
}

export const DailyTip = ({ visible, onClose }: DailyTipProps) => {
  const [tip, setTip] = useState<{ icon: string; text: string } | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const onCloseRef = useRef(onClose);
  
  // Actualizar la ref cuando cambia onClose
  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    // Seleccionar consejo aleatorio cada vez
    const randomIndex = Math.floor(Math.random() * DAILY_TIPS.length);
    setTip(DAILY_TIPS[randomIndex]);
  }, []);

  useEffect(() => {
    if (visible) {
      setTimeout(() => setIsVisible(true), 10);
      
      // Auto-cerrar después de 3 segundos
      const autoCloseTimer = setTimeout(() => {
        setIsVisible(false);
        setTimeout(() => onCloseRef.current(), 400); // Esperar a que termine el fade out
      }, 3000);
      
      return () => clearTimeout(autoCloseTimer);
    } else {
      setIsVisible(false);
    }
  }, [visible]); // Solo depende de visible, no de onClose

  if (!visible || !tip) return null;

  return (
    <div 
      className="tip-container"
      style={{
        opacity: isVisible ? 1 : 0,
        transition: 'opacity 0.4s ease',
      }}
    >
      <div className="tip-card">
        <span className="tip-label">💡 CONSEJO DEL DÍA</span>
        <span className="tip-icon">{tip.icon}</span>
        <p className="tip-text">{tip.text}</p>
        <button className="tip-button" onClick={onClose}>
          Entendido
        </button>
      </div>
    </div>
  );
};

// ==========================================
// DEMO AUTOMÁTICA
// ==========================================
interface DemoOverlayProps {
  visible: boolean;
  onStop: () => void;
}

export const DemoOverlay = ({ visible, onStop }: DemoOverlayProps) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (visible) {
      setTimeout(() => setIsVisible(true), 10);
    } else {
      setIsVisible(false);
    }
  }, [visible]);

  if (!visible) return null;

  return (
    <div 
      className="demo-overlay"
      style={{
        opacity: isVisible ? 1 : 0,
        transition: 'opacity 0.5s ease',
      }}
    >
      <div className="demo-card">
        <span className="demo-icon">🎮</span>
        <h3 className="demo-title">Modo Demo</h3>
        <p className="demo-text">
          Observa cómo se juega o toca para comenzar
        </p>
        <button className="demo-button" onClick={onStop}>
          Jugar Ahora
        </button>
      </div>
    </div>
  );
};

// ==========================================
// HOOK PARA CHECK PRIMERA VEZ
// ==========================================
interface FirstTimeCheck {
  isFirstTime: boolean;
  loading: boolean;
  markTutorialSeen: () => void;
}

const STORAGE_KEY = 'mcc_tutorial_seen';

export const useFirstTimeCheck = (): FirstTimeCheck => {
  const [isFirstTime, setIsFirstTime] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkFirstTime();
  }, []);

  const checkFirstTime = () => {
    try {
      const hasSeenTutorial = localStorage.getItem(STORAGE_KEY);
      setIsFirstTime(hasSeenTutorial !== 'true');
    } catch (e) {
      setIsFirstTime(true);
    }
    setLoading(false);
  };

  const markTutorialSeen = () => {
    try {
      localStorage.setItem(STORAGE_KEY, 'true');
      setIsFirstTime(false);
    } catch (e) {
      console.log('Error saving tutorial state:', e);
    }
  };

  return { isFirstTime, loading, markTutorialSeen };
};
