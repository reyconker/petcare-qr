-- ============================================================
-- Phase 2 — Veterinary Feedback Migration
-- PetCare QR
-- Safe to run multiple times (all statements are idempotent)
-- ============================================================

-- ─────────────────────────────────────────────────────────────
-- FASE 2: Columnas nuevas en food_control
-- ─────────────────────────────────────────────────────────────

ALTER TABLE food_control
  ADD COLUMN IF NOT EXISTS food_name TEXT DEFAULT '';

ALTER TABLE food_control
  ADD COLUMN IF NOT EXISTS open_date DATE;

ALTER TABLE food_control
  ADD COLUMN IF NOT EXISTS purchase_place TEXT DEFAULT '';

ALTER TABLE food_control
  ADD COLUMN IF NOT EXISTS price NUMERIC(10, 2);

ALTER TABLE food_control
  ADD COLUMN IF NOT EXISTS unit TEXT DEFAULT 'kg';

ALTER TABLE food_control
  ADD COLUMN IF NOT EXISTS meal_times JSONB DEFAULT '[]'::jsonb;

ALTER TABLE food_control
  ADD COLUMN IF NOT EXISTS reminder_minutes INT DEFAULT 15;

ALTER TABLE food_control
  ADD COLUMN IF NOT EXISTS reminder_active BOOLEAN DEFAULT false;

ALTER TABLE food_control
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- ─────────────────────────────────────────────────────────────
-- FASE 3: Tabla veterinary_visits
-- ─────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS veterinary_visits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dog_id UUID NOT NULL REFERENCES dog_profiles(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  clinic TEXT DEFAULT '',
  clinic_phone TEXT DEFAULT '',
  visit_type TEXT NOT NULL DEFAULT 'medicina general',
  specialty_name TEXT DEFAULT '',
  vet_name TEXT DEFAULT '',
  tasks TEXT DEFAULT '',
  observations TEXT DEFAULT '',
  next_control DATE,
  treatment_ids UUID[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_veterinary_visits_dog_id
  ON veterinary_visits(dog_id);

CREATE INDEX IF NOT EXISTS idx_veterinary_visits_date
  ON veterinary_visits(date DESC);

-- RLS para veterinary_visits
ALTER TABLE veterinary_visits ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage their own visits" ON veterinary_visits;
CREATE POLICY "Users can manage their own visits"
  ON veterinary_visits
  FOR ALL
  USING (
    dog_id IN (
      SELECT id FROM dog_profiles WHERE user_id = auth.uid()
    )
  )
  WITH CHECK (
    dog_id IN (
      SELECT id FROM dog_profiles WHERE user_id = auth.uid()
    )
  );

-- ─────────────────────────────────────────────────────────────
-- FASE 4: Tabla exams
-- ─────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS exams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dog_id UUID NOT NULL REFERENCES dog_profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  exam_date DATE NOT NULL,
  reason TEXT DEFAULT 'otro',
  clinic TEXT DEFAULT '',
  file_url TEXT DEFAULT '',
  observations TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_exams_dog_id
  ON exams(dog_id);

CREATE INDEX IF NOT EXISTS idx_exams_date
  ON exams(exam_date DESC);

-- RLS para exams
ALTER TABLE exams ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage their own exams" ON exams;
CREATE POLICY "Users can manage their own exams"
  ON exams
  FOR ALL
  USING (
    dog_id IN (
      SELECT id FROM dog_profiles WHERE user_id = auth.uid()
    )
  )
  WITH CHECK (
    dog_id IN (
      SELECT id FROM dog_profiles WHERE user_id = auth.uid()
    )
  );

-- ─────────────────────────────────────────────────────────────
-- FASE 5: Tabla veterinary_centers
-- ─────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS veterinary_centers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  address TEXT DEFAULT '',
  phone TEXT DEFAULT '',
  vet_name TEXT DEFAULT '',
  specialty TEXT DEFAULT '',
  observations TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_veterinary_centers_user_id
  ON veterinary_centers(user_id);

-- RLS para veterinary_centers
ALTER TABLE veterinary_centers ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage their own centers" ON veterinary_centers;
CREATE POLICY "Users can manage their own centers"
  ON veterinary_centers
  FOR ALL
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- ─────────────────────────────────────────────────────────────
-- NOTA: Supabase Storage
-- ─────────────────────────────────────────────────────────────
-- Crear manualmente el bucket privado "exams" en:
-- Supabase Dashboard → Storage → New Bucket
--   Nombre: exams
--   Tipo: Private
--
-- El bucket "prescriptions" de la Fase 1 ya debe existir.
-- ─────────────────────────────────────────────────────────────

-- ─────────────────────────────────────────────────────────────
-- PENDIENTE FUTURO (Fase 6 — NO implementado todavía):
-- Alimentación compartida entre varias mascotas
-- Ver: supabase/migrations/phase3_shared_food.sql (a crear)
-- ─────────────────────────────────────────────────────────────
