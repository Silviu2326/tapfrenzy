// ==========================================
// UTILIDAD DE PRECARGA DE IMÁGENES
// ==========================================

import { TIERS, BG_IMAGE, BOTTLE_IMAGES } from '../config';

/**
 * Precarga una sola imagen y devuelve una promesa
 */
function preloadImage(src: string): Promise<void> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve();
    img.onerror = () => {
      console.warn(`Error al cargar imagen: ${src}`);
      // No rechazamos para no bloquear el juego si una imagen falla
      resolve();
    };
    img.src = src;
  });
}

/**
 * Precarga todas las imágenes necesarias para el juego
 * Devuelve el progreso de carga (0-100)
 */
export async function preloadAllImages(
  onProgress?: (progress: number) => void
): Promise<void> {
  // Obtener todas las URLs únicas de imágenes
  const imageUrls = new Set<string>();
  
  // Imágenes de los tiers (botellas)
  TIERS.forEach(tier => {
    imageUrls.add(tier.img);
  });
  
  // Imágenes de botellas individuales
  Object.values(BOTTLE_IMAGES).forEach(url => {
    imageUrls.add(url);
  });
  
  // Imagen de fondo
  imageUrls.add(BG_IMAGE);
  
  const urls = Array.from(imageUrls);
  const total = urls.length;
  let loaded = 0;
  
  // Precargar todas las imágenes en paralelo con límite
  const BATCH_SIZE = 6; // Precargar 6 imágenes a la vez para no saturar
  
  for (let i = 0; i < urls.length; i += BATCH_SIZE) {
    const batch = urls.slice(i, i + BATCH_SIZE);
    
    await Promise.all(
      batch.map(async (url) => {
        await preloadImage(url);
        loaded++;
        const progress = Math.round((loaded / total) * 100);
        onProgress?.(progress);
      })
    );
  }
}

/**
 * Verifica si las imágenes ya están en caché del navegador
 */
export function areImagesCached(): boolean {
  // Verificar si las imágenes principales están en caché
  // Esto es una aproximación - el navegador no expone directamente el caché
  try {
    const cached = sessionStorage.getItem('images_preloaded');
    return cached === 'true';
  } catch {
    return false;
  }
}

/**
 * Marca las imágenes como precargadas en la sesión
 */
export function markImagesAsPreloaded(): void {
  try {
    sessionStorage.setItem('images_preloaded', 'true');
  } catch {
    // Ignorar errores de sessionStorage
  }
}

/**
 * Limpia el estado de precarga (útil para debugging)
 */
export function clearPreloadCache(): void {
  try {
    sessionStorage.removeItem('images_preloaded');
  } catch {
    // Ignorar errores
  }
}