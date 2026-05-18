-- =============================================
-- PetCare QR — Schema v2 (Lanzamiento Público)
-- Ejecutar en Supabase SQL Editor
-- =============================================

-- Habilitar UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================
-- TABLA: dog_profiles
-- =============================================
CREATE TABLE IF NOT EXISTS dog_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL DEFAULT 'Mi Perro',
  photo_url TEXT,
  species TEXT DEFAULT 'Perro',
  breed TEXT DEFAULT '',
  gender TEXT DEFAULT 'Macho',
  birth_date TEXT,
  age_text TEXT DEFAULT '',
  weight NUMERIC DEFAULT 0,
  color TEXT DEFAULT '',
  microchip TEXT,
  allergies TEXT[] DEFAULT '{}',
  diseases TEXT[] DEFAULT '{}',
  emergency_notes TEXT DEFAULT '',
  owner_name TEXT DEFAULT '',
  owner_phone TEXT DEFAULT '',
  owner_email TEXT DEFAULT '',
  -- QR settings
  qr_enabled BOOLEAN DEFAULT true,
  qr_show_allergies BOOLEAN DEFAULT true,
  qr_show_conditions BOOLEAN DEFAULT true,
  qr_show_treatments BOOLEAN DEFAULT true,
  qr_show_vaccines BOOLEAN DEFAULT true,
  qr_show_owner_contact BOOLEAN DEFAULT true,
  qr_show_emergency_notes BOOLEAN DEFAULT true,
  -- Secure public token (replaces dog ID in public URL)
  public_qr_token TEXT UNIQUE DEFAULT encode(gen_random_bytes(16), 'hex'),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- TABLA: treatments
-- =============================================
CREATE TABLE IF NOT EXISTS treatments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  dog_id UUID NOT NULL REFERENCES dog_profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  reason TEXT DEFAULT '',
  start_date TEXT DEFAULT '',
  end_date TEXT DEFAULT '',
  frequency_hours INTEGER DEFAULT 12,
  dose_amount NUMERIC DEFAULT 1,
  unit TEXT DEFAULT 'ml',
  initial_quantity NUMERIC DEFAULT 0,
  remaining_quantity NUMERIC DEFAULT 0,
  state TEXT DEFAULT 'activo',
  notes TEXT DEFAULT '',
  recipe_id UUID,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- TABLA: dose_history
-- =============================================
CREATE TABLE IF NOT EXISTS dose_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  dog_id UUID NOT NULL REFERENCES dog_profiles(id) ON DELETE CASCADE,
  treatment_id UUID REFERENCES treatments(id) ON DELETE SET NULL,
  medicine_name TEXT NOT NULL,
  dose_amount NUMERIC NOT NULL,
  unit TEXT DEFAULT 'ml',
  given_at TIMESTAMPTZ DEFAULT NOW(),
  status TEXT DEFAULT 'dada',
  notes TEXT DEFAULT ''
);

-- =============================================
-- TABLA: vaccines
-- =============================================
CREATE TABLE IF NOT EXISTS vaccines (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  dog_id UUID NOT NULL REFERENCES dog_profiles(id) ON DELETE CASCADE,
  type TEXT DEFAULT 'vacuna',
  name TEXT NOT NULL,
  application_date TEXT DEFAULT '',
  next_date TEXT DEFAULT '',
  veterinarian TEXT DEFAULT '',
  notes TEXT DEFAULT '',
  state TEXT DEFAULT 'al día',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- TABLA: recipes
-- =============================================
CREATE TABLE IF NOT EXISTS recipes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  dog_id UUID NOT NULL REFERENCES dog_profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  date TEXT DEFAULT '',
  vet_name TEXT DEFAULT '',
  clinic TEXT DEFAULT '',
  diagnosis TEXT DEFAULT '',
  instructions TEXT DEFAULT '',
  image_url TEXT DEFAULT '',
  related_treatment_id UUID REFERENCES treatments(id) ON DELETE SET NULL,
  notes TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- TABLA: food_control
-- =============================================
CREATE TABLE IF NOT EXISTS food_control (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  dog_id UUID NOT NULL REFERENCES dog_profiles(id) ON DELETE CASCADE UNIQUE,
  brand TEXT DEFAULT '',
  food_type TEXT DEFAULT '',
  total_quantity_kg NUMERIC DEFAULT 0,
  remaining_quantity_kg NUMERIC DEFAULT 0,
  daily_ration_grams NUMERIC DEFAULT 200,
  times_per_day INTEGER DEFAULT 2,
  purchase_date TEXT DEFAULT '',
  alert_threshold_days INTEGER DEFAULT 7,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- ROW LEVEL SECURITY (RLS)
-- =============================================
ALTER TABLE dog_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE treatments ENABLE ROW LEVEL SECURITY;
ALTER TABLE dose_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE vaccines ENABLE ROW LEVEL SECURITY;
ALTER TABLE recipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE food_control ENABLE ROW LEVEL SECURITY;

-- Drop existing policies (safe re-run)
DROP POLICY IF EXISTS "Users can manage own dog" ON dog_profiles;
DROP POLICY IF EXISTS "Users can manage own treatments" ON treatments;
DROP POLICY IF EXISTS "Users can manage own dose history" ON dose_history;
DROP POLICY IF EXISTS "Users can manage own vaccines" ON vaccines;
DROP POLICY IF EXISTS "Users can manage own recipes" ON recipes;
DROP POLICY IF EXISTS "Users can manage own food" ON food_control;
DROP POLICY IF EXISTS "Public can read dog for QR" ON dog_profiles;
DROP POLICY IF EXISTS "Public can read treatments for QR" ON treatments;
DROP POLICY IF EXISTS "Public can read vaccines for QR" ON vaccines;

-- dog_profiles: authenticated user owns their dogs
CREATE POLICY "Users can manage own dog" ON dog_profiles
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- treatments
CREATE POLICY "Users can manage own treatments" ON treatments
  FOR ALL
  USING (dog_id IN (SELECT id FROM dog_profiles WHERE user_id = auth.uid()))
  WITH CHECK (dog_id IN (SELECT id FROM dog_profiles WHERE user_id = auth.uid()));

-- dose_history
CREATE POLICY "Users can manage own dose history" ON dose_history
  FOR ALL
  USING (dog_id IN (SELECT id FROM dog_profiles WHERE user_id = auth.uid()))
  WITH CHECK (dog_id IN (SELECT id FROM dog_profiles WHERE user_id = auth.uid()));

-- vaccines
CREATE POLICY "Users can manage own vaccines" ON vaccines
  FOR ALL
  USING (dog_id IN (SELECT id FROM dog_profiles WHERE user_id = auth.uid()))
  WITH CHECK (dog_id IN (SELECT id FROM dog_profiles WHERE user_id = auth.uid()));

-- recipes
CREATE POLICY "Users can manage own recipes" ON recipes
  FOR ALL
  USING (dog_id IN (SELECT id FROM dog_profiles WHERE user_id = auth.uid()))
  WITH CHECK (dog_id IN (SELECT id FROM dog_profiles WHERE user_id = auth.uid()));

-- food_control
CREATE POLICY "Users can manage own food" ON food_control
  FOR ALL
  USING (dog_id IN (SELECT id FROM dog_profiles WHERE user_id = auth.uid()))
  WITH CHECK (dog_id IN (SELECT id FROM dog_profiles WHERE user_id = auth.uid()));

-- Public read via QR token (no auth required) - restricted to only enabled profiles
CREATE POLICY "Public can read dog for QR" ON dog_profiles
  FOR SELECT USING (qr_enabled = true AND public_qr_token IS NOT NULL);

-- Public treatments/vaccines only when dog QR is enabled
CREATE POLICY "Public can read treatments for QR" ON treatments
  FOR SELECT USING (
    dog_id IN (SELECT id FROM dog_profiles WHERE qr_enabled = true)
  );

CREATE POLICY "Public can read vaccines for QR" ON vaccines
  FOR SELECT USING (
    dog_id IN (SELECT id FROM dog_profiles WHERE qr_enabled = true)
  );

-- =============================================
-- Backfill public_qr_token for existing rows
-- =============================================
UPDATE dog_profiles
SET public_qr_token = encode(gen_random_bytes(16), 'hex')
WHERE public_qr_token IS NULL;

-- =============================================
-- Storage Buckets
-- =============================================
-- Public bucket for dog photos
INSERT INTO storage.buckets (id, name, public)
VALUES ('petcare-public', 'petcare-public', true)
ON CONFLICT (id) DO NOTHING;

-- Private bucket for sensitive documents (recipes, medical records)
INSERT INTO storage.buckets (id, name, public)
VALUES ('petcare-private', 'petcare-private', false)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Authenticated users can upload" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can read images" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own images" ON storage.objects;
DROP POLICY IF EXISTS "Users can update own images" ON storage.objects;

-- Insert policies for PUBLIC bucket
CREATE POLICY "Public can read public bucket" ON storage.objects
  FOR SELECT USING (bucket_id = 'petcare-public');

CREATE POLICY "Users can manage own public images" ON storage.objects
  FOR ALL USING (bucket_id = 'petcare-public' AND auth.uid()::text = (storage.foldername(name))[1])
  WITH CHECK (bucket_id = 'petcare-public' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Insert policies for PRIVATE bucket
CREATE POLICY "Users can manage own private documents" ON storage.objects
  FOR ALL USING (bucket_id = 'petcare-private' AND auth.uid()::text = (storage.foldername(name))[1])
  WITH CHECK (bucket_id = 'petcare-private' AND auth.uid()::text = (storage.foldername(name))[1]);
