import { useState, createContext, useContext, useCallback, useEffect } from 'react';
import Intro from './pages/Intro';
import Home from './pages/Home';
import Game from './pages/Game';
import { useUserData } from './hooks/useUserData';
import { UserData } from './lib/supabase';
import { preloadAllImages, markImagesAsPreloaded, areImagesCached } from './utils/preload';
import './App.css';

type View = 'intro' | 'menu' | 'loading' | 'game';

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
  const [loadingProgress, setLoadingProgress] = useState(0);
  const userData = useUserData();

  const goToMenu = () => setCurrentView('menu');
  
  const goToGame = useCallback(async () => {
    // Verificar si las imágenes ya están en caché
    if (areImagesCached()) {
      // Si ya están en caché, ir directamente al juego
      setCurrentView('game');
      return;
    }
    
    // Mostrar pantalla de carga
    setLoadingProgress(0);
    setCurrentView('loading');
    
    // Precargar todas las imágenes
    try {
      await preloadAllImages((progress) => {
        setLoadingProgress(progress);
      });
      
      // Marcar como precargadas
      markImagesAsPreloaded();
      
      // Ir al juego
      setCurrentView('game');
    } catch (error) {
      console.error('Error al precargar imágenes:', error);
      // En caso de error, ir al juego de todos modos
      setCurrentView('game');
    }
  }, []);
  
  // Precargar imágenes en segundo plano cuando estamos en el menú
  useEffect(() => {
    if (currentView === 'menu' && !areImagesCached()) {
      // Precargar silenciosamente en segundo plano
      preloadAllImages().then(() => {
        markImagesAsPreloaded();
      }).catch(console.error);
    }
  }, [currentView]);

  return (
    <UserContext.Provider value={{ userData, isLoggedIn: userData.isLoggedIn }}>
      <div className="app-container">
        {currentView === 'intro' && (
          <Intro onComplete={goToMenu} onSkip={goToMenu} />
        )}
        {currentView === 'menu' && (
          <Home onStartGame={goToGame} />
        )}
        {currentView === 'loading' && (
          <LoadingScreen progress={loadingProgress} />
        )}
        {currentView === 'game' && (
          <Game onBackToMenu={goToMenu} userData={userData} />
        )}
      </div>
    </UserContext.Provider>
  );
}

// Componente de pantalla de carga
function LoadingScreen({ progress }: { progress: number }) {
  return (
    <div className="loading-screen">
      <div className="loading-spinner">
        <div className="spinner-ring"></div>
        <div className="spinner-ring"></div>
        <div className="spinner-ring"></div>
      </div>
      <div className="loading-text">CARGANDO...</div>
      <div className="loading-progress">{progress}%</div>
      <div className="loading-bar-container">
        <div 
          className="loading-bar" 
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}

export default App;