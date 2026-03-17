import { useState, useEffect } from 'react';
import { DailyTip } from '../Tutorial';
import { TIERS, BOTTLE_IMAGES } from '../config';
import WeeklyRanking from '../components/WeeklyRanking';

interface HomeProps {
  onStartGame: () => void;
}

export default function Home({ onStartGame }: HomeProps) {
  const [bestScore, setBestScore] = useState(0);
  const [showDailyTip, setShowDailyTip] = useState(false);
  const [showRanking, setShowRanking] = useState(false);
  const [time, setTime] = useState(0);

  useEffect(() => {
    // Cargar mejor puntuación
    const saved = localStorage.getItem('mcc_best');
    if (saved) setBestScore(parseInt(saved));

    // Mostrar consejo después de 1 segundo
    const timer = setTimeout(() => {
      setShowDailyTip(true);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setTime(Date.now() / 1000);
    }, 50);
    return () => clearInterval(interval);
  }, []);

  const bottleNames = ['CERVEZA_MORENA', 'CERVEZA_GUAJIRA', 'CERVEZA_SIFRINA', 'CERVEZA_CANDELA', 'CERVEZA_CATIRA', 'CERVEZA_MEDUSA'];

  return (
    <div className="game-wrapper">
      <div className="game-container">
        <div className="main-menu" onClick={onStartGame}>
          {/* Título */}
          <h1 className="game-title">MR. COOL CAT</h1>
          <h2 className="game-subtitle">CRAFT BEER</h2>
          <p className="game-tagline">TAP FRENZY</p>
          <p className="game-slogan">Drink. Play. Compete.</p>
          
          {/* Botellas animadas */}
          <div className="animated-bottles">
            {bottleNames.map((name, i) => {
              const img = BOTTLE_IMAGES[name as keyof typeof BOTTLE_IMAGES];
              const offset = Math.sin(time + i * 0.8) * 8 + Math.abs(i - 2.5) * 4;
              const rotation = (i - 2.5) * 3.5;
              
              return (
                <div
                  key={name}
                  className="animated-bottle"
                  style={{
                    transform: `translateY(${offset}px) rotate(${rotation}deg)`,
                  }}
                >
                  {img && <img src={img} alt={name} />}
                </div>
              );
            })}
          </div>
          
          {/* Instrucciones */}
          <p className="instructions">Suelta cervezas desde abajo</p>
          <p className="instructions">Combina iguales para evolucionar</p>
          
          {/* Cadena de evolución */}
          <div className="evolution-chain">
            {TIERS.map((tier, i) => (
              <div key={tier.name} className="evolution-item">
                <img src={tier.img} alt={tier.name} />
                {i < TIERS.length - 1 && <span className="arrow">›</span>}
              </div>
            ))}
          </div>
          
          {/* Botón JUGAR */}
          <button className="play-button" onClick={onStartGame}>
            JUGAR
          </button>
          
          {/* Botón RANKING */}
          <button 
            className="ranking-button" 
            onClick={(e) => {
              e.stopPropagation();
              setShowRanking(true);
            }}
          >
            🏆 RANKING
          </button>
          
          {/* Botón CANDY CRUSH - Oculto temporalmente
          <button className="candy-crush-button" onClick={handleCandyCrush}>
            CANDY CRUSH
          </button>
          */}
          
          {bestScore > 0 && (
            <p className="best-score-text">
              Mejor puntuación: {bestScore.toLocaleString()}
            </p>
          )}
        </div>
      </div>
      
      {/* Daily Tip */}
      <DailyTip 
        visible={showDailyTip} 
        onClose={() => setShowDailyTip(false)}
      />
      
      {/* Ranking */}
      {showRanking && (
        <WeeklyRanking
          onClose={() => setShowRanking(false)}
          onPlayAgain={onStartGame}
        />
      )}
    </div>
  );
}
