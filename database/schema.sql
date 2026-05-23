-- ============================================================
-- SCHEMA PARA SUPABASE — AnimeApp
-- ============================================================
-- Ejecutar esto en el SQL Editor de Supabase
-- ============================================================

-- 1. TABLA: users (perfiles vinculados a auth.users de Supabase)
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. TABLA: user_characters (personajes creados por usuarios)
CREATE TABLE IF NOT EXISTS user_characters (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  age VARCHAR(100) DEFAULT '',
  power VARCHAR(255) DEFAULT '',
  category VARCHAR(255) NOT NULL,
  notes TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. TABLA: character_images (URLs de imágenes por personaje)
CREATE TABLE IF NOT EXISTS character_images (
  id SERIAL PRIMARY KEY,
  character_id INTEGER NOT NULL REFERENCES user_characters(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- STORAGE: Bucket para imágenes de personajes
-- ============================================================
-- Después de crear las tablas, crear un bucket llamado
-- "character-images" en Supabase Storage (desde el dashboard).
-- Política sugerida:
--   - INSERT: autenticados (dueños del personaje)
--   - SELECT: autenticados (dueños del personaje)
--   - DELETE: autenticados (dueños del personaje)

-- ============================================================
-- TRIGGER: crear perfil automáticamente al registrarse
-- ============================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, name)
  VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'name', ''));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================
-- ÍNDICES
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_user_characters_user_id ON user_characters(user_id);
CREATE INDEX IF NOT EXISTS idx_character_images_character_id ON character_images(character_id);
