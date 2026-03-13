# Plan: Convertir Candy Crush a React

## TL;DR

> **Quick Summary**: Convertir el juego Candy Crush de vanilla JavaScript a React y añadirlo como una ruta separada `/candy-crush` en la aplicación Tap Frenzy.
> 
> **Deliverables**:
> - `src/pages/CandyCrush.tsx` - Componente principal del juego
> - `src/pages/CandyCrush.css` - Estilos con animaciones
> - Ruta `/candy-crush` en App.tsx
> - Botón de navegación en el menú principal
> 
> **Estimated Effort**: Medium
> **Parallel Execution**: YES - 2 waves
> **Critical Path**: Task 1 → Task 2 → Task 3 → Task 4

---

## Context

### Original Request
El usuario quiere convertir el juego Candy Crush que existe en la carpeta `/candy-crush/` (implementado en vanilla JavaScript) a React y hacerlo disponible como una ruta diferente en la aplicación Tap Frenzy.

### Características del Juego Original
- Tablero 8x8 (64 celdas)
- 6 tipos de cervezas como "caramelos"
- Drag & drop para desktop
- Swipe/touch para móvil
- Detección de matches de 3 y 4 en línea (horizontal/vertical)
- Sistema de puntuación
- Animaciones CSS (swap, match, drop, appear, shake)
- Diseño glassmorphism con borde animado
- Responsive para mobile y desktop

### Metis Review
**Identified Gaps** (auto-resolved):
- **Gap 1**: Rutas de imágenes - Las imágenes están en `/public/assets/` y se referencian correctamente
- **Gap 2**: Estilos - Usar CSS modules o archivo separado (decidido: archivo separado)
- **Gap 3**: Navegación - Añadir botón "Volver al Menú" en el juego

---

## Work Objectives

### Core Objective
Convertir el juego Candy Crush de vanilla JS a React manteniendo todas las funcionalidades y animaciones, e integrarlo como una ruta separada en la aplicación.

### Concrete Deliverables
1. Componente `CandyCrush.tsx` con lógica completa del juego
2. Archivo `CandyCrush.css` con todos los estilos y animaciones
3. Ruta `/candy-crush` configurada en el router
4. Enlace desde el menú principal

### Definition of Done
- [ ] El juego funciona igual que el original (drag, touch, matches, score)
- [ ] Todas las animaciones funcionan correctamente
- [ ] Es responsive (mobile y desktop)
- [ ] Se puede navegar desde el menú principal
- [ ] Hay botón para volver al menú
- [ ] El build compila sin errores

### Must Have
- Tablero 8x8 funcional
- Detección de matches 3 y 4
- Drag & drop (desktop)
- Touch/swipe (mobile)
- Sistema de puntuación
- Todas las animaciones CSS
- Diseño responsive

### Must NOT Have (Guardrails)
- No modificar el juego original en `/candy-crush/`
- No añadir funcionalidades nuevas no presentes en el original
- No cambiar la estructura de carpetas existente

---

## Verification Strategy

### Test Decision
- **Infrastructure exists**: NO (no hay tests en este proyecto)
- **Automated tests**: NO
- **Framework**: None
- **Agent-Executed QA**: YES - Sisyphus verificará manualmente

### QA Policy
Cada tarea incluirá escenarios de verificación ejecutados por el agente:
- **Frontend**: Navegación entre páginas, interacciones del juego, responsive
- **Build**: Compilación sin errores
- **Visual**: Screenshots para verificar diseño

---

## Execution Strategy

### Parallel Execution Waves

```
Wave 1 (Start Immediately - Core Components):
├── Task 1: Crear CandyCrush.tsx con lógica del juego
├── Task 2: Crear CandyCrush.css con estilos y animaciones
└── Task 3: Añadir ruta /candy-crush en App.tsx

Wave 2 (After Wave 1 - Integration):
├── Task 4: Añadir botón de navegación en Home.tsx
└── Task 5: Verificación final y build

Critical Path: Task 1 → Task 2 → Task 3 → Task 4 → Task 5
Parallel Speedup: 40% faster than sequential
```

### Dependency Matrix
- **Task 1**: None → Blocks Task 2, 3
- **Task 2**: Task 1 → Blocks Task 5
- **Task 3**: Task 1 → Blocks Task 4
- **Task 4**: Task 3 → Blocks Task 5
- **Task 5**: Tasks 2, 4 → None

### Agent Dispatch Summary
- **Wave 1**: Task 1, 2, 3 → `unspecified-high` (complejidad media-alta)
- **Wave 2**: Task 4, 5 → `quick` (tareas simples)

---

## TODOs

- [ ] 1. Crear componente CandyCrush.tsx con lógica del juego

  **What to do**:
  - Crear archivo `src/pages/CandyCrush.tsx`
  - Implementar estado del tablero 8x8 con useState
  - Convertir la lógica de vanilla JS a React hooks:
    - createBoard() - Inicializar tablero
    - checkRowForFour() - Verificar filas de 4
    - checkColumnForFour() - Verificar columnas de 4
    - checkRowForThree() - Verificar filas de 3
    - checkColumnForThree() - Verificar columnas de 3
    - moveIntoSquareBelow() - Caída de caramelos
    - swapCells() - Intercambio de celdas
  - Implementar event handlers:
    - Drag & drop para desktop
    - Touch/swipe para móvil
    - Click para selección
  - Añadir useEffect para verificación automática de matches
  - Implementar navegación con useNavigate para volver al menú

  **Must NOT do**:
  - No modificar archivos fuera de src/pages/
  - No cambiar la lógica de matches (mantener igual que original)

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
    - Reason: Conversión compleja de vanilla JS a React con múltiples estados y efectos
  - **Skills**: [`frontend-ui-ux`]
    - `frontend-ui-ux`: Necesario para manejar eventos de drag/touch y animaciones

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Parallel Group**: Wave 1 (blocks other tasks)
  - **Blocks**: Task 2, Task 3
  - **Blocked By**: None

  **References** (CRITICAL):
  **Pattern References**:
  - `candy-crush/app.js:1-564` - Lógica completa del juego original (referencia principal)
  - `src/pages/Game.tsx:1-800` - Patrón de componente de juego en React
  
  **API/Type References**:
  - React hooks: useState, useEffect, useCallback, useRef
  - react-router-dom: useNavigate
  
  **External References**:
  - React docs: Hooks API

  **WHY Each Reference Matters**:
  - `candy-crush/app.js` - Contiene toda la lógica de juego a convertir
  - `Game.tsx` - Patrón de cómo estructurar un juego en React en este proyecto

  **Acceptance Criteria**:
  - [ ] Archivo creado: src/pages/CandyCrush.tsx
  - [ ] Componente exportado como default
  - [ ] Estado del tablero implementado con useState
  - [ ] Funciones de check matches implementadas
  - [ ] Event handlers de drag/drop/touch implementados
  - [ ] Botón "Volver al Menú" funcional

  **QA Scenarios**:
  ```
  Scenario: Componente se renderiza correctamente
    Tool: Playwright (skill_mcp con playwright)
    Preconditions: App corriendo en dev mode
    Steps:
      1. Navegar a /candy-crush
      2. Esperar a que cargue el componente
      3. Verificar que el grid de 8x8 está presente
    Expected Result: Grid visible con 64 celdas
    Evidence: .sisyphus/evidence/task-1-render.png

  Scenario: Botón de navegación funciona
    Tool: Playwright
    Preconditions: En página /candy-crush
    Steps:
      1. Click en botón "Volver al Menú"
      2. Verificar navegación
    Expected Result: URL cambia a /menu
    Evidence: .sisyphus/evidence/task-1-navigate.png
  ```

  **Commit**: YES
  - Message: `feat: add CandyCrush game component with full logic`
  - Files: `src/pages/CandyCrush.tsx`

---

- [ ] 2. Crear archivo CandyCrush.css con estilos y animaciones

  **What to do**:
  - Crear archivo `src/pages/CandyCrush.css`
  - Copiar y adaptar estilos de `candy-crush/style.css`
  - Asegurar que todas las animaciones funcionen:
    - @keyframes swapRight, swapLeft, swapUp, swapDown
    - @keyframes matchExplosion
    - @keyframes dropBounce
    - @keyframes popIn
    - @keyframes jellyShake
    - @keyframes selectedPulse
    - @keyframes shimmer (para score board)
    - @keyframes borderGradient (para el grid)
  - Adaptar selectores para React (usar clases como .candy-cell, .candy-grid)
  - Mantener responsive design (media queries)
  - Asegurar que los colores y fondos sean consistentes

  **Must NOT do**:
  - No modificar App.css existente
  - No cambiar los nombres de las animaciones (mantener compatibilidad)

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
    - Reason: CSS complejo con múltiples animaciones y responsive design
  - **Skills**: [`frontend-ui-ux`]
    - `frontend-ui-ux`: Necesario para CSS avanzado y animaciones

  **Parallelization**:
  - **Can Run In Parallel**: NO (necesita Task 1 para saber las clases CSS)
  - **Parallel Group**: Wave 1
  - **Blocks**: Task 5
  - **Blocked By**: Task 1

  **References**:
  **Pattern References**:
  - `candy-crush/style.css:1-617` - Estilos completos originales
  - `src/App.css:1-1271` - Patrón de estilos del proyecto
  
  **WHY Each Reference Matters**:
  - `candy-crush/style.css` - Fuente de todos los estilos a convertir
  - `App.css` - Patrón de naming y estructura del proyecto

  **Acceptance Criteria**:
  - [ ] Archivo creado: src/pages/CandyCrush.css
  - [ ] Todas las animaciones @keyframes presentes
  - [ ] Clases .candy-grid y .candy-cell definidas
  - [ ] Score board estilizado
  - [ ] Media queries para responsive presentes

  **QA Scenarios**:
  ```
  Scenario: Estilos se aplican correctamente
    Tool: Playwright
    Preconditions: CandyCrush.tsx creado
    Steps:
      1. Navegar a /candy-crush
      2. Verificar estilos visuales:
         - Grid tiene borde animado
         - Score board tiene glassmorphism
         - Celdas tienen hover effects
    Expected Result: Diseño visual idéntico al original
    Evidence: .sisyphus/evidence/task-2-styles.png
  ```

  **Commit**: YES
  - Message: `style: add CandyCrush CSS with animations`
  - Files: `src/pages/CandyCrush.css`

---

- [ ] 3. Añadir ruta /candy-crush en App.tsx

  **What to do**:
  - Importar componente CandyCrush en `src/App.tsx`
  - Añadir ruta `<Route path="/candy-crush" element={<CandyCrush />} />`
  - Asegurar que esté dentro del BrowserRouter existente

  **Must NOT do**:
  - No modificar otras rutas existentes
  - No cambiar la estructura del Router

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Cambio simple de una línea
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: NO (necesita Task 1)
  - **Parallel Group**: Wave 1
  - **Blocks**: Task 4
  - **Blocked By**: Task 1

  **References**:
  **Pattern References**:
  - `src/App.tsx:1-20` - Estructura actual del router

  **Acceptance Criteria**:
  - [ ] Import añadido: `import CandyCrush from './pages/CandyCrush'`
  - [ ] Ruta añadida: `<Route path="/candy-crush" element={<CandyCrush />} />`
  - [ ] Build compila sin errores

  **QA Scenarios**:
  ```
  Scenario: Ruta funciona correctamente
    Tool: Playwright
    Preconditions: App corriendo
    Steps:
      1. Navegar directamente a /candy-crush
      2. Verificar que el componente se renderiza
    Expected Result: Página de Candy Crush visible
    Evidence: .sisyphus/evidence/task-3-route.png
  ```

  **Commit**: YES
  - Message: `feat: add /candy-crush route`
  - Files: `src/App.tsx`

---

- [ ] 4. Añadir botón de navegación en Home.tsx

  **What to do**:
  - Modificar `src/pages/Home.tsx`
  - Añadir botón "Candy Crush" que navegue a `/candy-crush`
  - Colocarlo debajo del botón "JUGAR" con estilo similar pero diferente color
  - Usar useNavigate para la navegación

  **Must NOT do**:
  - No eliminar el botón JUGAR existente
  - No modificar la funcionalidad del menú actual

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Cambio simple de UI
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: NO (necesita Task 3)
  - **Parallel Group**: Wave 2
  - **Blocks**: Task 5
  - **Blocked By**: Task 3

  **References**:
  **Pattern References**:
  - `src/pages/Home.tsx:1-100` - Estructura del menú
  - `src/App.css:581-598` - Estilos del botón play-button

  **Acceptance Criteria**:
  - [ ] Botón "Candy Crush" añadido al menú
  - [ ] Navegación a /candy-crush funciona
  - [ ] Estilo consistente con el diseño

  **QA Scenarios**:
  ```
  Scenario: Botón de navegación visible y funcional
    Tool: Playwright
    Preconditions: En /menu
    Steps:
      1. Verificar que botón "Candy Crush" está visible
      2. Click en el botón
      3. Verificar navegación
    Expected Result: Navega a /candy-crush
    Evidence: .sisyphus/evidence/task-4-button.png
  ```

  **Commit**: YES
  - Message: `feat: add Candy Crush button to main menu`
  - Files: `src/pages/Home.tsx`

---

- [ ] 5. Verificación final y build

  **What to do**:
  - Ejecutar `npm run build` para verificar que compila sin errores
  - Verificar todas las funcionalidades:
    - Drag & drop en desktop
    - Touch/swipe en mobile (o simularlo)
    - Matches de 3 y 4
    - Animaciones
    - Navegación entre páginas
  - Capturar screenshots de evidencia

  **Must NOT do**:
  - No ignorar errores de build

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Verificación final
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Parallel Group**: Wave 2
  - **Blocks**: None
  - **Blocked By**: Tasks 2, 4

  **References**:
  **Pattern References**:
  - `package.json:8` - Comando de build

  **Acceptance Criteria**:
  - [ ] Build completa sin errores
  - [ ] No hay errores de TypeScript
  - [ ] Ruta /candy-crush accesible
  - [ ] Navegación funciona en ambas direcciones

  **QA Scenarios**:
  ```
  Scenario: Build exitoso
    Tool: Bash
    Preconditions: Todos los archivos creados
    Steps:
      1. Ejecutar: npm run build
      2. Verificar output
    Expected Result: Build completa sin errores
    Evidence: .sisyphus/evidence/task-5-build.log

  Scenario: Flujo completo de navegación
    Tool: Playwright
    Preconditions: App corriendo
    Steps:
      1. Ir a /menu
      2. Click en "Candy Crush"
      3. Verificar juego cargado
      4. Click en "Volver al Menú"
      5. Verificar regreso a /menu
    Expected Result: Flujo completo funciona
    Evidence: .sisyphus/evidence/task-5-flow.png
  ```

  **Commit**: NO (solo verificación)

---

## Final Verification Wave (MANDATORY)

> 1 review agent runs after ALL implementation tasks

- [ ] F1. **Plan Compliance Audit** — `quick`
  Verificar que:
  - Todos los archivos fueron creados
  - La ruta /candy-crush funciona
  - El botón en el menú existe
  - El build compila
  Output: `Must Have [4/4] | VERDICT: APPROVE/REJECT`

---

## Commit Strategy

- **1**: `feat: add CandyCrush game component with full logic` — src/pages/CandyCrush.tsx
- **2**: `style: add CandyCrush CSS with animations` — src/pages/CandyCrush.css
- **3**: `feat: add /candy-crush route` — src/App.tsx
- **4**: `feat: add Candy Crush button to main menu` — src/pages/Home.tsx

---

## Success Criteria

### Verification Commands
```bash
npm run build  # Expected: Build completa sin errores
```

### Final Checklist
- [ ] CandyCrush.tsx creado con lógica completa
- [ ] CandyCrush.css creado con todos los estilos
- [ ] Ruta /candy-crush añadida en App.tsx
- [ ] Botón de navegación en Home.tsx
- [ ] Build compila sin errores
- [ ] Juego funciona (drag, touch, matches)
- [ ] Animaciones funcionan
- [ ] Responsive design funciona
