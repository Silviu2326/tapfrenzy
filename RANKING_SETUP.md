# 🏆 Sistema de Ranking - Tap Frenzy

Este documento explica cómo configurar y usar el sistema de ranking con Supabase.

## 📋 Requisitos

✅ **Ya configurado**: Este proyecto usa el mismo proyecto de Supabase que MiAppExpo

## 🚀 Configuración

### ✅ Credenciales ya configuradas

Las credenciales de Supabase ya están en el archivo `.env`:
- **URL**: `https://uxcuxmyvnkdsmvgqrkrs.supabase.co`
- **Proyecto**: MiAppExpo (misma base de datos)

### 1. Crear tabla en Supabase

Ve al **SQL Editor** de Supabase y ejecuta el archivo `supabase/schema.sql`:

```sql
-- Crear tabla de rankings con soporte para modos de juego
CREATE TABLE rankings (
  id SERIAL PRIMARY KEY,
  user_id TEXT NOT NULL,
  email TEXT,
  nickname TEXT NOT NULL,
  score INTEGER NOT NULL DEFAULT 0,
  max_tier INTEGER NOT NULL DEFAULT 0,
  game_mode TEXT NOT NULL DEFAULT 'classic',
  week_id TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Constraint para validar modos permitidos
  CONSTRAINT valid_game_mode CHECK (game_mode IN ('classic', 'quick', 'zen'))
);

-- Índices para mejorar rendimiento
CREATE INDEX idx_rankings_week_id ON rankings(week_id);
CREATE INDEX idx_rankings_user_id ON rankings(user_id);
CREATE INDEX idx_rankings_game_mode ON rankings(game_mode);
CREATE INDEX idx_rankings_score ON rankings(score DESC);
-- Índice compuesto para consultas más comunes
CREATE INDEX idx_rankings_week_mode_score ON rankings(week_id, game_mode, score DESC);
CREATE INDEX idx_rankings_user_week_mode ON rankings(user_id, week_id, game_mode);

-- Política RLS (Row Level Security) - Permitir lectura pública
ALTER TABLE rankings ENABLE ROW LEVEL SECURITY;

-- Política: Cualquiera puede leer el ranking
CREATE POLICY "Allow public read access" ON rankings
  FOR SELECT USING (true);

-- Política: Permitir insert/upsert (para simplificar desde la app)
CREATE POLICY "Allow public insert" ON rankings
  FOR INSERT WITH CHECK (true);

-- Política: Permitir actualizar (para simplificar desde la app)
CREATE POLICY "Allow public update" ON rankings
  FOR UPDATE USING (true);
```

### 2. Instalar dependencias

```bash
npm install
```

### 3. Desplegar

```bash
npm run build
# o para desarrollo
npm run dev
```

## 🎮 Modos de Juego

El ranking funciona por separado para cada modo de juego:

| Modo | Icono | Descripción |
|------|-------|-------------|
| **Classic** | 🎯 | Modo clásico con game over por peligro |
| **Quick** | ⚡ | Modo contrarreloj (90 segundos) |
| **Zen** | 🧘 | Modo relajado sin game over |

Cada jugador puede tener una puntuación diferente en cada modo, y cada modo tiene su propio ranking independiente.

## 📱 Integración con la App React Native

La app React Native ya está configurada para pasar los datos del usuario al WebView. Cuando el usuario juega desde la app:

1. Los datos del usuario se pasan vía URL: `?userId=xxx&email=xxx&name=xxx&source=app`
2. También se inyectan vía JavaScript en `window.userData`
3. El juego detecta automáticamente estos datos y los usa para el ranking
4. La puntuación se guarda con el modo de juego actual

### Datos que se pasan desde la app:

- `userId`: ID único del usuario en Supabase
- `email`: Email del usuario
- `name`: Nombre del usuario
- `source`: 'app' para indicar que viene de React Native

## 🎮 Funcionamiento del Ranking

### Flujo de guardado:

1. El jugador termina una partida en un modo específico
2. El sistema verifica si el usuario está logueado
3. Si está logueado, guarda/actualiza la puntuación en Supabase para ese modo
4. Solo se guarda si la nueva puntuación es mayor que la anterior de esa semana en ese modo

### Semanas:

El ranking se resetea cada semana. El formato de `week_id` es: `YYYY-WXX`
Ejemplo: `2026-W11` (semana 11 del año 2026)

### Top 10 por modo:

Se muestran las 10 mejores puntuaciones de la semana actual para el modo seleccionado.

### Tabs de modo:

En la pantalla de ranking hay tabs para cambiar entre modos:
- 🎯 **Clásico**
- ⚡ **Contrarreloj**  
- 🧘 **Zen**

El modo actual del jugador se marca con una etiqueta "Actual".

## 🔒 Seguridad

**Nota importante**: La configuración actual usa políticas RLS públicas para simplificar la integración con apps móviles. En producción, considera:

1. Usar autenticación de Supabase
2. Implementar Row Level Security más restrictivo
3. Agregar validación de tokens

## 🐛 Debug

Si el ranking no funciona:

1. Verifica la consola del navegador (F12)
2. Comprueba que las variables de entorno estén configuradas
3. Verifica que la tabla `rankings` exista en Supabase
4. Comprueba los logs de Supabase en el dashboard
5. Verifica que el campo `game_mode` exista en la tabla

## 📊 Estructura de la tabla

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | SERIAL | ID único autoincremental |
| user_id | TEXT | ID del usuario (de Supabase Auth) |
| email | TEXT | Email del usuario (opcional) |
| nickname | TEXT | Nombre mostrado en el ranking |
| score | INTEGER | Puntuación máxima de la semana |
| max_tier | INTEGER | Nivel máximo alcanzado (0-8) |
| **game_mode** | TEXT | Modo de juego: 'classic', 'quick', 'zen' |
| week_id | TEXT | Identificador de semana (YYYY-WXX) |
| created_at | TIMESTAMP | Fecha de creación |
| updated_at | TIMESTAMP | Fecha de última actualización |

## 📝 Notas

- Cada usuario puede tener **una entrada por semana y por modo** (hasta 3 entradas por semana)
- Si el usuario mejora su puntuación en un modo, se actualiza solo ese registro
- Las puntuaciones menores no se guardan (para no sobrescribir récords)
- Los usuarios no logueados (invitados) no aparecen en el ranking global
- Los rankings de diferentes modos son completamente independientes
