# 🎮 Mejoras de Gameplay para Tap Frenzy - Mobile First

Mejoras enfocadas exclusivamente en la experiencia de juego **móvil táctil**. Diseñado para smartphones en orientación portrait con controles optimizados para pulgar.

---

## 📱 Consideraciones Mobile

### Principios de Diseño:
- **Orientación:** Portrait (vertical) exclusiva
- **Controles:** Táctiles únicamente (sin teclado/ratón)
- **Touch targets:** Mínimo 44x44px según Human Interface Guidelines
- **Thumb zones:** Elementos importantes en zona inferior/medium
- **One-handed:** Jugable con una sola mano
- **Batería:** Efectos visuales optimizados para no drenar
- **Vibración:** Haptic feedback contextual
- **Safe areas:** Respetar notch y barras de sistema

---

## 🎯 1. Mecánicas de Juego Mobile

### 1.1 Sistema de Poderes/Especiales (Touch)
Poderes activables mediante **gestos táctiles** o **botones grandes** en zona inferior:

#### Tipos de Poderes:
| Poder | Efecto | Cómo Activar | Cooldown Visual |
|-------|--------|--------------|-----------------|
| 🔨 Martillo | Elimina una botella (toca para seleccionar, toca botella) | Botón en barra inferior | Círculo de progreso |
| 🔄 Swap | Cambia la botella actual | Swipe up rápido | Icono gris hasta listo |
| ⏱️ Tiempo Lento | Ralentiza física 3s | Doble tap en pantalla | Contador animado |
| 💥 Bomba | Explota tier específico | Mantener presionado 1s + soltar | Barra de carga |

#### Barra de Poderes (Zona Inferior - Thumb Zone):
```
┌─────────────────────────────────────┐
│                                     │
│           [ÁREA DE JUEGO]           │
│                                     │
├─────────────────────────────────────┤
│  🔨    🔄    ⏱️    💥    [SCORE]   │
│  (1)   (0)   (✓)   (⌛)   6,420    │
│                                     │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━   │
│         Barra de Progreso           │
│         Siguiente Poder             │
└─────────────────────────────────────┘
```

**Diseño táctil:**
- Botones de poder: 56x56px mínimo
- Espaciado entre botones: 16px
- Feedback táctil al tocar (vibración ligera 50ms)
- Animación de escala 0.9 al presionar

### 1.2 Controles Táctiles Mejorados

#### Sistema de Arrastre (Drag) Optimizado:
```typescript
// Comportamiento táctil actual mejorado
interface TouchControls {
  // Zona de control amplia (mitad inferior de pantalla)
  controlZone: 'bottom 60%';
  
  // Dead zone para evitar taps accidentales
  deadZone: 10px;
  
  // Sensibilidad ajustable en settings
  sensitivity: 'low' | 'medium' | 'high';
  
  // Guía visual al arrastrar
  dragGuide: 'línea vertical punteada';
  
  // Drop automático al soltar
  dropOnRelease: true;
  
  // Cancelar si se arrastra fuera de zona
  cancelOnExit: true;
}
```

#### Gestos Soportados:
| Gesto | Acción | Zona Válida |
|-------|--------|-------------|
| Tap | Lanzar botella | Área de juego |
| Drag horizontal | Mover posición | Mitad inferior pantalla |
| Drag vertical | Ajustar fino | Zona de aim |
| Swipe up | Activar Swap | Cualquier parte |
| Doble tap | Poder especial | Área de juego |
| Mantener 1s | Preparar Bomba | Sobre botella existente |
| Pinch | Zoom in/out (opcional) | Área de juego |

### 1.3 Modos de Juego Mobile

#### Modo Rápido (Quick Play)
- **Duración:** 2-3 minutos máximo
- **Objetivo:** Puntuación máxima sin complicaciones
- **Ideal para:** Partidas cortas en transporte

#### Modo Zen (Relajado)
- Sin línea de peligro
- Sin límite de tiempo
- Música ambiental suave
- **Perfecto para:** Jugar en el sofá/relajado

#### Modo Desafío Diario
- Mismo tablero para todos los jugadores
- Una oportunidad al día
- Puntuación se comparte (screenshot)

---

## 🎨 2. Efectos Visuales Mobile-Optimized

### 2.1 Partículas Optimizadas para Batería

#### Sistema de Partículas Eficiente:
```typescript
// Máximo 30 partículas simultáneas en móvil
const MOBILE_PARTICLE_LIMIT = 30;

// Reducir calidad en batería baja
const QUALITY_SETTINGS = {
  high: { particles: 30, shadows: true,  glow: true },
  medium: { particles: 20, shadows: false, glow: true },
  low: { particles: 10, shadows: false, glow: false },
  batterySaver: { particles: 5, simple: true }
};
```

#### Explosiones por Tier (Optimizado):
| Tier | Efecto | Partículas | Duración |
|------|--------|------------|----------|
| 0-2 | Simple pop | 5-8 | 300ms |
| 3-4 | Chispas + flash | 10-15 | 500ms |
| 5-6 | Explosión + vibración | 15-20 | 700ms |
| 7+ | Épico + screen shake | 20-30 | 1000ms |

### 2.2 Feedback Háptico (Vibración)
Usar `navigator.vibrate()` con patrones sutiles:

| Evento | Patrón de Vibración | Intensidad |
|--------|---------------------|------------|
| Botella soltada | [20] | Ligera |
| Fusión simple | [30] | Media |
| Fusión cadena | [20, 50, 20] | Media |
| Tier alto (6+) | [50, 30, 50] | Fuerte |
| Barril creado | [100, 50, 100, 50, 200] | Celebración |
| Peligro | [100, 100, 100] | Alerta |
| Game Over | [500] | Larga |
| Nuevo Record | [50, 50, 50, 50, 200] | Éxito |

### 2.3 Background Dinámico (Batería-friendly)
- **Normal:** Fondo estático (sin animación)
- **Combo x3+:** Subtle glow pulse (CSS animation, no JS)
- **Peligro:** Border pulse rojo (solo CSS)
- **Nuevo Record:** Confeti limitado a 20 piezas

**Optimización:** Usar `prefers-reduced-motion` y detectar batería baja.

---

## 🔊 3. Audio Mobile

### 3.1 Gestión de Audio Context
```typescript
// Audio debe respetar modo silencio del teléfono
// y no autoplay hasta interacción del usuario
const audioConfig = {
  respectSilentMode: true,
  ducking: true, // Bajar volumen durante llamadas
  backgroundAudio: false, // No sonar en background
  headsetDetection: true, // Ajustar cuando conectan auriculares
};
```

### 3.2 Sonidos Adaptados
- **Efectos cortos:** Máximo 1 segundo
- **Formato:** MP3 para compatibilidad iOS/Android
- **Tamaño:** Total de audio < 2MB
- **Precarga:** Solo sonidos esenciales

### 3.3 Música Adaptativa (Stream-friendly)
- Peso total < 5MB
- Loop perfecto
- Transiciones suaves
- Opción "Modo silencioso" sin música

---

## 🏆 4. Progresión Mobile

### 4.1 Sistema de Niveles (Sesiones cortas)
XP ganada en sesiones de 2-3 minutos:

| Acción | XP | Tiempo Estimado |
|--------|----|------------------|
| Partida completada | +50 | 2-3 min |
| Superar record | +100 | Variable |
| Crear Barril | +200 | 5-8 min |
| Combo x10 | +150 | 3-5 min |
| Jugar 3 días seguidos | +500 | 3 días |

### 4.2 Logros (Diseñados para móvil)

| Logro | Condición | Recompensa |
|-------|-----------|------------|
| 🍼 Principiante | Primera partida completada | Badge perfil |
| 🍺 Maestro | 10,000 pts en una partida | Skin dorada |
| 🏆 Leyenda | 50,000 pts en una partida | Skin épica |
| 🔥 Veloz | Partida en < 90 segundos | Título "Flash" |
| 👑 Precisión | 15 drops en centro ±10% | Badge sniper |
| 📱 Adicto | Jugar 7 días seguidos | Skin especial |
| 🎯 Consistente | 5 partidas > 8,000 pts | Badge pro |

### 4.3 Estadísticas (Vista Mobile)
```
┌─────────────────────────────────────┐
│ 📊 PERFIL                          │
├─────────────────────────────────────┤
│                                     │
│  [AVATAR]  Nivel 12                │
│            "Maestro Cervecero"     │
│                                     │
├─────────────────────────────────────┤
│  📈 ESTADÍSTICAS                   │
│                                     │
│  Partidas      Mejor Punt.         │
│  47            12,540              │
│                                     │
│  Barriles      Combo Máx.          │
│  3             x12                 │
│                                     │
│  Tiempo Total: 3h 24m              │
│                                     │
├─────────────────────────────────────┤
│  🥇 MEJORES PARTIDAS               │
│                                     │
│  1. 12,540  ⭐ Record               │
│  2. 11,200                         │
│  3. 9,850                          │
│  4. 8,420                          │
│  5. 7,650                          │
│                                     │
│  [Ver todas]                       │
└─────────────────────────────────────┘
```

---

## 🎮 5. UX/UI Mobile

### 5.1 Layout Portrait Optimizado

#### Estructura de Pantalla:
```
┌─────────────────────────────────────┐ ← Safe Area Top
│ [Score]              [Settings] ⚙️ │ ← Header 48px
├─────────────────────────────────────┤
│                                     │
│                                     │
│         ÁREA DE JUEGO               │
│         (60% de pantalla)           │
│                                     │
│                                     │
├─────────────────────────────────────┤
│  ━━━━━  ━━━━━  ━━━━━  ━━━━━        │ ← Zona de peligro
├─────────────────────────────────────┤
│  [NEXT]  [PODERES]  [PAUSA] ⏸️     │ ← Barra de control
│   48px    56px      48px           │   (Thumb Zone)
├─────────────────────────────────────┤ ← Safe Area Bottom
└─────────────────────────────────────┘
```

#### Zonas de Toque (Thumb Zones):
- **Verde (Cómodo):** Barra inferior (poderes, pausa, next)
- **Amarillo (Alcanzable):** Centro de pantalla (arrastre)
- **Rojo (Difícil):** Esquinas superiores (evitar botones importantes)

### 5.2 HUD Mobile

#### Elementos Rediseñados:

**Score (Esquina superior izquierda):**
- Tamaño: 32px mínimo
- Contraste alto
- Actualización suave (no brusca)

**Combo (Flotante cerca del score):**
- Aparece solo cuando combo > 1
- Animación: Scale up + fade out
- Tamaño: 24px
- Color: Naranja brillante

**Barra de Poderes (Fija abajo):**
```
┌─────────────────────────────────────┐
│  🔄     🔨     💥     ⏱️            │
│  Swap  Martillo Bomba Tiempo        │
│  ━━━   ━━━━   ═══   ░░░            │
│  Listo  1/3   2/3   Cargando        │
└─────────────────────────────────────┘
```

**Indicador NEXT:**
- Posición: Esquina inferior derecha (zona de pulgar)
- Tamaño: 64x64px
- Preview clara de siguiente botella

### 5.3 Controles Táctiles Visuales

#### Guía Visual al Arrastrar:
```
┌─────────────────────────────────────┐
│                  │                  │
│                  │                  │
│                  │ ← Línea guía     │
│                  │    vertical      │
│    [BOTELLA]     │    punteada      │
│                  │                  │
│                  │                  │
│         ▼                          │
│      (Ghost preview)               │
└─────────────────────────────────────┘
```

#### Zona de Control Ampliada:
- Toda la mitad inferior de pantalla es zona de control
- Arrastrar en cualquier parte mueve la botella
- Visual feedback: Botella sigue el dedo

### 5.4 Pantalla de Pausa (Full Screen)
```
┌─────────────────────────────────────┐
│ ⏸️ PAUSA                           │
├─────────────────────────────────────┤
│                                     │
│     Puntuación: 6,420               │
│     Tiempo: 2:34                    │
│                                     │
│  ┌─────────────────────────────┐   │
│  │      [CONTINUAR]            │   │
│  └─────────────────────────────┘   │
│                                     │
│  ┌─────────────────────────────┐   │
│  │      [REINICIAR]            │   │
│  └─────────────────────────────┘   │
│                                     │
│  ┌─────────────────────────────┐   │
│  │      [MENÚ]                 │   │
│  └─────────────────────────────┘   │
│                                     │
│   🔊 ON  🎵 OFF                     │
│                                     │
└─────────────────────────────────────┘
```

**Botones:** 60px de alto mínimo, fáciles de tocar

---

## 🎨 6. Personalización Mobile

### 6.1 Skins de Botellas (Preview táctil)
Galería tipo grid con scroll:
```
┌─────────────────────────────────────┐
│ 🎨 SKINS                           │
├─────────────────────────────────────┤
│                                     │
│  [🔒]    [✓]     [✓]     [🔒]     │
│ Dorada  Clásica  Neón   Pixel      │
│                                     │
│  [🔒]    [✓]     [🔒]               │
│ Cristal Arcadia  Oro                 │
│                                     │
│  Desliza para ver más →            │
│                                     │
├─────────────────────────────────────┤
│  [APLICAR SELECCIONADA]            │
└─────────────────────────────────────┘
```

### 6.2 Ajustes de Accesibilidad Mobile

#### Menú de Accesibilidad:
```
┌─────────────────────────────────────┐
│ ⚙️ AJUSTES                         │
├─────────────────────────────────────┤
│                                     │
│  Sensibilidad Táctil               │
│  [Baja] [Media] [Alta]             │
│                                     │
│  Vibración [ON ● OFF]              │
│                                     │
│  Reducir Movimiento [ON / OFF]     │
│                                     │
│  Modo Daltonismo [OFF / ON]        │
│                                     │
│  Tamaño UI [100% ████████░░]       │
│                                     │
│  Batería Baja Auto [ON / OFF]      │
│                                     │
└─────────────────────────────────────┘
```

---

## 📱 7. Optimizaciones Mobile Específicas

### 7.1 Performance Mobile

#### Optimizaciones Críticas:
```typescript
const MOBILE_OPTIMIZATIONS = {
  // Limitar FPS a 60 máximo
  targetFPS: 60,
  
  // Reducir cálculos en background
  pauseWhenHidden: true,
  
  // Bajar calidad si batería < 20%
  batteryAware: true,
  
  // Desactivar efectos si temperatura alta
  thermalThrottling: true,
  
  // Usar requestAnimationFrame eficientemente
  rafOptimized: true,
  
  // Object pooling para partículas
  particlePool: 30,
};
```

#### Gestión de Batería:
- Detectar nivel de batería con Battery API
- Modo "Ahorro" automático < 20%
- Reducir partículas a 50%
- Quitar sombras y glows
- Menos vibración

### 7.2 Responsive a Diferentes Pantallas

#### Breakpoints Mobile:
| Tamaño | Ejemplo | Ajustes |
|--------|---------|---------|
| Pequeño | iPhone SE | UI más compacta, botones 44px |
| Medio | iPhone 12/13 | Layout estándar |
| Grande | iPhone Pro Max | Botones más grandes, 56px |
| Tablet | iPad Mini | Botones 64px, área juego más grande |

#### Safe Areas:
```css
/* Respetar notch y barras del sistema */
.game-container {
  padding-top: env(safe-area-inset-top);
  padding-bottom: env(safe-area-inset-bottom);
  padding-left: env(safe-area-inset-left);
  padding-right: env(safe-area-inset-right);
}
```

### 7.3 Touch Gestures Avanzados

#### Implementación de Gestos:
```typescript
interface TouchGestures {
  // Prevenir zoom accidental
  preventZoom: true;
  
  // Prevenir scroll en área de juego
  preventScroll: true;
  
  // Soporte para toques múltiples (evitar)
  maxTouches: 1;
  
  // Touch delay para clicks accidentales
  touchDelay: 0;
  
  // Área de gestos
  gestureZone: 'fullscreen';
}
```

---

## ✅ Roadmap Mobile

### Fase 1: Core Mobile (Semana 1-2)
- [ ] Optimizar layout para portrait
- [ ] Mejorar touch controls
- [ ] Implementar haptic feedback
- [ ] Añadir safe areas
- [ ] Test en diferentes tamaños de pantalla

### Fase 2: UX Mobile (Semana 3-4)
- [ ] Rediseñar HUD para mobile
- [ ] Pantalla de pausa full-screen
- [ ] Menú de ajustes táctil
- [ ] Optimizar partículas para batería
- [ ] Mejorar responsividad

### Fase 3: Features Mobile (Semana 5-6)
- [ ] Sistema de poderes táctil
- [ ] Barra de poderes inferior
- [ ] Gestos avanzados (swipe, double tap)
- [ ] Modo rápido (sesiones cortas)
- [ ] Perfil con estadísticas

### Fase 4: Polish Mobile (Semana 7-8)
- [ ] Testing en dispositivos reales
- [ ] Optimización de batería
- [ ] Accesibilidad mobile
- [ ] Reducir bundle size
- [ ] Performance tuning

---

## 📝 Notas Mobile

### DO's ✅
- ✅ Botones grandes (mínimo 44px)
- ✅ Zona de control amplia (pulgar)
- ✅ Feedback táctil inmediato
- ✅ Optimizar para batería
- ✅ Respetar safe areas
- ✅ Diseñar para portrait
- ✅ Testing en dispositivos reales
- ✅ Usar prefers-reduced-motion

### DON'Ts ❌
- ❌ Elementos pequeños difíciles de tocar
- ❌ Hover states (no existen en táctil)
- ❌ Texto muy pequeño (< 16px)
- ❌ Controles complejos con múltiples dedos
- ❌ Autoplay de audio
- ❌ Ignorar modo silencioso
- ❌ Landscape obligatorio
- ❌ Efectos que drenan batería

---

*Documento Mobile-First para Tap Frenzy*
*Optimizado para smartphones en portrait*
*El Gato Cool Pub - "Drink. Play. Compete."*
