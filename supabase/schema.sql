-- ==========================================
-- TABLA DE RANKINGS PARA TAP FRENZY (CON MODOS DE JUEGO)
-- Ejecutar esto en el SQL Editor de Supabase
-- ==========================================

-- Eliminar tabla si existe (para recrear con nueva estructura)
DROP TABLE IF EXISTS rankings;

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

-- ==========================================
-- DATOS DE EJEMPLO (Opcional)
-- ==========================================

-- Obtener semana actual
-- INSERT INTO rankings (user_id, nickname, score, max_tier, game_mode, week_id) VALUES
--   ('user-1', 'DJKeyla', 12540, 8, 'classic', TO_CHAR(NOW(), 'YYYY') || '-W' || EXTRACT(WEEK FROM NOW())::TEXT),
--   ('user-2', 'FunkMaster', 11800, 7, 'classic', TO_CHAR(NOW(), 'YYYY') || '-W' || EXTRACT(WEEK FROM NOW())::TEXT),
--   ('user-3', 'CatiraKing', 11200, 8, 'quick', TO_CHAR(NOW(), 'YYYY') || '-W' || EXTRACT(WEEK FROM NOW())::TEXT),
--   ('user-4', 'BeerLover', 9850, 6, 'zen', TO_CHAR(NOW(), 'YYYY') || '-W' || EXTRACT(WEEK FROM NOW())::TEXT);
