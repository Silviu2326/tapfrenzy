// ==========================================
// CONFIGURACIÓN DEL JUEGO MR. COOL CAT TAP FRENZY
// ==========================================

// URLs de imágenes (desde public/assets)
const morenaImg = '/assets/CERVEZA_MORENA.png';
const guajiraImg = '/assets/CERVEZA_GUAJIRA.png';
const sifrinaImg = '/assets/CERVEZA_SIFRINA.png';
const candelaImg = '/assets/CERVEZA_CANDELA.png';
const catiraImg = '/assets/CERVEZA_CATIRA.png';
const medusaImg = '/assets/CERVEZA_MEDUSA.png';
const vasoImg = '/assets/vaso.png';
const jarraImg = '/assets/jarra.png';
const barrilImg = '/assets/barril.png';

// Dimensiones del área de juego
export const GAME_WIDTH = 420;
export const GAME_HEIGHT = 780;

// Área de juego ajustada - movida a la izquierda
export const AREA = { 
  x: 15,      // Más a la izquierda
  y: 190,     // Punto medio - alto pero sin tocar las botellas de la barra
  w: 340,     // Menos ancho para no salirse por la derecha
  h: 510      // Altura ajustada
};

// Línea de peligro abajo - game over si pasa mucho tiempo
export const DANGER_Y = 600;

// Línea de game over arriba - EXACTAMENTE donde está la línea roja
export const GAME_OVER_Y = 590;

// Posición Y desde donde se lanzan las botellas - en la línea blanca
export const DROP_Y = 590;

// Cooldown entre lanzamientos (ms)
export const DROP_CD = 420;

// Delay mínimo antes de que un body pueda fusionarse
export const MERGE_DELAY = 70;

// Tier máximo que puede salir como drop aleatorio
export const MAX_DROP = 4;

// Colores del tema
export const THEME_COLOR = '#FF6B00';
export const THEME_DARK = '#CC5500';
export const THEME_LIGHT = '#FF8C33';

// Video intro (comprimido)
export const INTRO_VIDEO = '/assets/cool cat freenzy compressed.mp4';

// Fondos
export const BG_IMAGE = '/assets/WhatsApp Image 2026-03-11 at 12.20.20.jpeg';
export const BG_IMAGE_OLD = '/assets/bg.jpg';

// Tipos de tier
export interface Tier {
  name: string;
  r: number;
  dw: number;
  dh: number;
  img: string;
  c: string;
  pts: number;
}

// Tiers de cervezas (colisión balanceada - estrecha pero sin superposición)
export const TIERS: Tier[] = [
  { name: 'Morena',  r: 18, dw: 32, dh: 75, img: morenaImg,  c: '#D4763A', pts: 10 },
  { name: 'Guajira', r: 21, dw: 37, dh: 83, img: guajiraImg, c: '#FF8C33', pts: 25 },
  { name: 'Sifrina', r: 25, dw: 43, dh: 92, img: sifrinaImg, c: '#8B6FBF', pts: 50 },
  { name: 'Candela', r: 28, dw: 48, dh: 104, img: candelaImg, c: '#C0392B', pts: 100 },
  { name: 'Catira',  r: 32, dw: 54, dh: 111, img: catiraImg,  c: '#2E86C1', pts: 200 },
  { name: 'Medusa',  r: 36, dw: 61, dh: 124, img: medusaImg,  c: '#27AE60', pts: 400 },
  { name: 'Vaso',    r: 45, dw: 81, dh: 110, img: vasoImg,    c: '#FF6B00', pts: 800 },
  { name: 'Jarra',   r: 58, dw: 104, dh: 121, img: jarraImg,   c: '#E67E22', pts: 1500 },
  { name: 'Barril',  r: 70, dw: 129, dh: 122, img: barrilImg,  c: '#8B4513', pts: 3000 }
];

// Mapa de imágenes por nombre
export const BOTTLE_IMAGES: Record<string, string> = {
  CERVEZA_MORENA: morenaImg,
  CERVEZA_GUAJIRA: guajiraImg,
  CERVEZA_SIFRINA: sifrinaImg,
  CERVEZA_CANDELA: candelaImg,
  CERVEZA_CATIRA: catiraImg,
  CERVEZA_MEDUSA: medusaImg,
};

// Tier aleatorio ponderado
export function getRandomTier(): number {
  const weights = [30, 25, 20, 15, 10];
  const total = weights.reduce((a, b) => a + b, 0);
  let r = Math.random() * total;
  for (let i = 0; i < weights.length && i <= MAX_DROP; i++) {
    r -= weights[i];
    if (r <= 0) return i;
  }
  return 0;
}
