import { useState, createContext, useContext } from 'react';
import Intro from './pages/Intro';
import Home from './pages/Home';
import Game from './pages/Game';
import { useUserData } from './hooks/useUserData';
import { UserData } from './lib/supabase';
import './App.css';

type View = 'intro' | 'menu' | 'game';

// Crear contexto para los datos del usuario
interface UserContextType {
  userData: UserData;
  isLoggedIn: boolean;
}

const UserContext = createContext<UserContextType | null>(null);

// Hook para usar el contexto
export function useUser() {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within UserProvider');
  }
  return context;
}

function App() {
  const [currentView, setCurrentView] = useState<View>('intro');
  const userData = useUserData();

  const goToMenu = () => setCurrentView('menu');
  const goToGame = () => setCurrentView('game');

  return (
    <UserContext.Provider value={{ userData, isLoggedIn: userData.isLoggedIn }}>
      <div className="app-container">
        {currentView === 'intro' && (
          <Intro onComplete={goToMenu} onSkip={goToMenu} />
        )}
        {currentView === 'menu' && (
          <Home onStartGame={goToGame} />
        )}
        {currentView === 'game' && (
          <Game onBackToMenu={goToMenu} userData={userData} />
        )}
      </div>
    </UserContext.Provider>
  );
}

export default App;
