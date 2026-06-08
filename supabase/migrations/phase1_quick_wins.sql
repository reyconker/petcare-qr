-- ============================================================
-- Phase 1 — Quick Wins Migration
-- PetCare QR
-- Safe to run multiple times (all statements are idempotent)
-- ============================================================

-- ── Bloque B: Tratamientos ──────────────────────────────────
-- Adds is_permanent flag for treatments without end date
ALTER TABLE treatments
ADD COLUMN IF NOT EXISTS is_permanent BOOLEAN DEFAULT false;

-- ── Bloque D: Perfil de mascota ─────────────────────────────
-- Species (perro, gato, otro)
ALTER TABLE dog_profiles
ADD COLUMN IF NOT EXISTS species TEXT DEFAULT 'Perro';

-- Neutered / spayed
ALTER TABLE dog_profiles
ADD COLUMN IF NOT EXISTS is_neutered BOOLEAN DEFAULT false;

ALTER TABLE dog_profiles
ADD COLUMN IF NOT EXISTS neuter_date DATE;

-- Surgeries as JSONB array
-- Each entry: { name, reason, date, notes }
ALTER TABLE dog_profiles
ADD COLUMN IF NOT EXISTS surgeries JSONB DEFAULT '[]'::jsonb;

-- Emergency notes — only add if not already present
-- (emergency_notes already exists in the current schema,
-- but this is safe to run regardless)
ALTER TABLE dog_profiles
ADD COLUMN IF NOT EXISTS emergency_notes TEXT DEFAULT '';

-- ── Bloque E: QR Settings — Mostrar alimento ────────────────
ALTER TABLE dog_profiles
ADD COLUMN IF NOT EXISTS qr_show_food BOOLEAN DEFAULT false;
