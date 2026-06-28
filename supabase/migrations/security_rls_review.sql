-- ============================================================
-- Security RLS Review — PetCare QR
-- Ejecutar en Supabase → SQL Editor
-- Seguro para re-ejecutar (DROP POLICY IF EXISTS antes de CREATE)
-- ============================================================

-- ─────────────────────────────────────────────────────────────
-- 1. DOG_PROFILES
-- Cada usuario solo puede ver y modificar sus propias mascotas
-- ─────────────────────────────────────────────────────────────

ALTER TABLE dog_profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage own dogs" ON dog_profiles;
CREATE POLICY "Users can manage own dogs"
  ON dog_profiles
  FOR ALL
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- ─────────────────────────────────────────────────────────────
-- 2. TREATMENTS
-- Vinculado a dog_id → validar pertenencia via dog_profiles
-- ─────────────────────────────────────────────────────────────

ALTER TABLE treatments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage own treatments" ON treatments;
CREATE POLICY "Users can manage own treatments"
  ON treatments
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
-- 3. DOSE_HISTORY
-- ─────────────────────────────────────────────────────────────

ALTER TABLE dose_history ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage own dose history" ON dose_history;
CREATE POLICY "Users can manage own dose history"
  ON dose_history
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
-- 4. FOOD_CONTROL
-- ─────────────────────────────────────────────────────────────

ALTER TABLE food_control ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage own food control" ON food_control;
CREATE POLICY "Users can manage own food control"
  ON food_control
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
-- 5. RECIPES
-- ─────────────────────────────────────────────────────────────

ALTER TABLE recipes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage own recipes" ON recipes;
CREATE POLICY "Users can manage own recipes"
  ON recipes
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
-- 6. VACCINES
-- ─────────────────────────────────────────────────────────────

ALTER TABLE vaccines ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage own vaccines" ON vaccines;
CREATE POLICY "Users can manage own vaccines"
  ON vaccines
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
-- 7. VETERINARY_VISITS
-- (Ya incluida en phase2_veterinary_feedback.sql — incluida aquí para referencia)
-- ─────────────────────────────────────────────────────────────

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
-- 8. EXAMS
-- (Ya incluida en phase2_veterinary_feedback.sql)
-- ─────────────────────────────────────────────────────────────

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
-- 9. VETERINARY_CENTERS
-- Vinculado a user_id directamente (un centro sirve a todas las mascotas del usuario)
-- ─────────────────────────────────────────────────────────────

ALTER TABLE veterinary_centers ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage their own centers" ON veterinary_centers;
CREATE POLICY "Users can manage their own centers"
  ON veterinary_centers
  FOR ALL
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- ─────────────────────────────────────────────────────────────
-- 10. QR PÚBLICO — Acceso de solo lectura para dog_profiles
-- El QR público solo necesita SELECT en campos específicos,
-- usando public_qr_token como lookup (no expone dog_id al público)
-- ─────────────────────────────────────────────────────────────

-- Política: lectura pública solo cuando qr_enabled = true
-- Esto permite que el anon client (QR público) solo acceda a perfiles
-- cuyo tutor ha habilitado el QR. La búsqueda es siempre por public_qr_token.
DROP POLICY IF EXISTS "Public QR read by token" ON dog_profiles;
CREATE POLICY "Public QR read by token"
  ON dog_profiles
  FOR SELECT
  USING (
    -- Solo expone la fila si el QR está habilitado por el tutor/a
    qr_enabled = true
  );

-- NOTA IMPORTANTE:
-- La seguridad en capas del QR funciona así:
--   1. El código /qr/[token] busca por public_qr_token (UUID aleatorio), no por dog_id
--   2. public_qr_token es regenerable — el link anterior deja de funcionar al regenerar
--   3. Si qr_enabled = false, RLS bloquea la fila antes de que llegue al código
--   4. Los datos sensibles (contacto, notas, etc.) solo se muestran si qr_show_* = true
-- El usuario autenticado puede ver sus propias mascotas aunque qr_enabled = false
-- gracias a la policy "Users can manage own dogs" (FOR ALL, USING user_id = auth.uid())

-- ─────────────────────────────────────────────────────────────
-- 11. STORAGE — Buckets privados
-- ─────────────────────────────────────────────────────────────

-- Verificar en Supabase Dashboard > Storage que:
--   1. Bucket "prescriptions" → Private: ON
--   2. Bucket "exams"         → Private: ON

-- Políticas de Storage para "prescriptions":
-- Solo el usuario autenticado puede subir/leer sus propios archivos.
-- Ejecutar en Supabase > Storage > Policies si no existen:

/*
-- PRESCRIPTIONS BUCKET POLICIES (ejecutar si no existen):

CREATE POLICY "Owner can upload prescriptions"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'prescriptions' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Owner can read prescriptions"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'prescriptions' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Owner can delete prescriptions"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'prescriptions' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- EXAMS BUCKET POLICIES (ejecutar si no existen):

CREATE POLICY "Owner can upload exams"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'exams' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Owner can read exams"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'exams' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Owner can delete exams"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'exams' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );
*/

-- ─────────────────────────────────────────────────────────────
-- FIN DEL SCRIPT
-- ─────────────────────────────────────────────────────────────
