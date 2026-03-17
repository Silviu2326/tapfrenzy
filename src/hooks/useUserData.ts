import { useState, useEffect } from 'react';
import { UserData } from '../lib/supabase';

/**
 * Hook para obtener los datos del usuario desde la app React Native
 * o desde localStorage si está en la web
 */
export function useUserData(): UserData {
  const [userData, setUserData] = useState<UserData>({
    userId: '',
    email: '',
    name: '',
    source: 'web',
    isLoggedIn: false,
  });

  useEffect(() => {
    // Función para extraer datos de la URL
    const getDataFromURL = (): Partial<UserData> => {
      const params = new URLSearchParams(window.location.search);
      const userId = params.get('userId');
      const email = params.get('email');
      const name = params.get('name');
      const source = params.get('source') as 'app' | 'web' | null;

      if (userId) {
        return {
          userId,
          email: email || '',
          name: name || email?.split('@')[0] || 'Jugador',
          source: source || 'app',
          isLoggedIn: true,
        };
      }

      return {};
    };

    // Función para extraer datos de window.userData (inyectado por React Native)
    const getDataFromWindow = (): Partial<UserData> => {
      if (typeof window !== 'undefined' && (window as any).userData) {
        const data = (window as any).userData;
        return {
          userId: data.userId || '',
          email: data.email || '',
          name: data.name || data.email?.split('@')[0] || 'Jugador',
          source: data.source || 'app',
          isLoggedIn: data.isLoggedIn || false,
        };
      }
      return {};
    };

    // Función para extraer datos de localStorage (para usuarios web)
    const getDataFromStorage = (): Partial<UserData> => {
      try {
        const stored = localStorage.getItem('tapfrenzy_user');
        if (stored) {
          const data = JSON.parse(stored);
          return {
            userId: data.userId || `web-user-${Date.now()}`,
            email: data.email || '',
            name: data.name || data.nickname || 'Invitado',
            source: 'web',
            isLoggedIn: !!data.userId,
          };
        }
      } catch (e) {
        console.error('Error reading localStorage:', e);
      }
      return {};
    };

    // Combinar todas las fuentes de datos
    const urlData = getDataFromURL();
    const windowData = getDataFromWindow();
    const storageData = getDataFromStorage();

    // Prioridad: URL > window > localStorage > default
    const finalData: UserData = {
      userId: urlData.userId || windowData.userId || storageData.userId || `guest-${Date.now()}`,
      email: urlData.email || windowData.email || storageData.email || '',
      name: urlData.name || windowData.name || storageData.name || 'Invitado',
      source: urlData.source || windowData.source || storageData.source || 'web',
      isLoggedIn: urlData.isLoggedIn || windowData.isLoggedIn || storageData.isLoggedIn || false,
    };

    setUserData(finalData);

    // Guardar en localStorage para persistencia
    if (finalData.isLoggedIn) {
      localStorage.setItem('tapfrenzy_user', JSON.stringify({
        userId: finalData.userId,
        email: finalData.email,
        name: finalData.name,
      }));
    }

    // Escuchar evento de userDataLoaded (para compatibilidad con React Native)
    const handleUserDataLoaded = (event: CustomEvent) => {
      if (event.detail) {
        setUserData({
          userId: event.detail.userId || finalData.userId,
          email: event.detail.email || finalData.email,
          name: event.detail.name || event.detail.email?.split('@')[0] || finalData.name,
          source: event.detail.source || 'app',
          isLoggedIn: event.detail.isLoggedIn || false,
        });
      }
    };

    document.addEventListener('userDataLoaded', handleUserDataLoaded as EventListener);

    return () => {
      document.removeEventListener('userDataLoaded', handleUserDataLoaded as EventListener);
    };
  }, []);

  return userData;
}

/**
 * Guarda los datos del usuario en localStorage
 */
export function saveUserData(userData: Partial<UserData>): void {
  try {
    localStorage.setItem('tapfrenzy_user', JSON.stringify(userData));
  } catch (e) {
    console.error('Error saving user data:', e);
  }
}

/**
 * Genera un ID único para usuarios invitados
 */
export function generateGuestId(): string {
  return `guest-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}
