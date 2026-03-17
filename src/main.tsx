import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'

// Exponer función para recibir datos desde React Native
// Esta función será llamada por el WebView desde la app
(window as any).onUserDataReceived = (data: any) => {
  console.log('Datos de usuario recibidos:', data);
  
  // Guardar en window.userData
  (window as any).userData = data;
  
  // Disparar evento para que los componentes lo detecten
  const event = new CustomEvent('userDataLoaded', { detail: data });
  document.dispatchEvent(event);
};

// También exponer postMessage para React Native
(window as any).ReactNativeWebView = {
  postMessage: (message: string) => {
    console.log('Mensaje a React Native:', message);
    // En una implementación real, esto enviaría el mensaje a la app
  }
};

// Detectar si estamos en un WebView de React Native
const isReactNativeWebView = () => {
  return typeof (window as any).ReactNativeWebView !== 'undefined' ||
         navigator.userAgent.includes('ReactNative');
};

// Guardar en window para que los componentes puedan detectarlo
(window as any).isReactNative = isReactNativeWebView();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
