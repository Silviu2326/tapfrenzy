/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL: string
  readonly VITE_SUPABASE_ANON_KEY: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

// Extiende Window para React Native WebView
declare global {
  interface Window {
    userData?: {
      userId: string;
      email: string;
      name: string;
      source: 'app' | 'web';
      isLoggedIn: boolean;
    };
    ReactNativeWebView?: {
      postMessage: (message: string) => void;
    };
    onUserDataReceived?: (data: any) => void;
    isReactNative?: boolean;
  }
}

export {};
