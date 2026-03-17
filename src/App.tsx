import { useState } from 'react';
import Intro from './pages/Intro';
import Home from './pages/Home';
import Game from './pages/Game';
import './App.css';

type View = 'intro' | 'menu' | 'game';

function App() {
  const [currentView, setCurrentView] = useState<View>('intro');

  const goToMenu = () => setCurrentView('menu');
  const goToGame = () => setCurrentView('game');

  return (
    <div className="app-container">
      {currentView === 'intro' && (
        <Intro onComplete={goToMenu} onSkip={goToMenu} />
      )}
      {currentView === 'menu' && (
        <Home onStartGame={goToGame} />
      )}
      {currentView === 'game' && (
        <Game onBackToMenu={goToMenu} />
      )}
    </div>
  );
}

export default App;
