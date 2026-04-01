-- ============================================================
-- EXPAND ORGANIZATIONS TABLE FOR PROFILE EDITOR
-- Run this after 002_auth_and_rls.sql
-- ============================================================

ALTER TABLE public.organizations
  ADD COLUMN IF NOT EXISTS street_address TEXT,
  ADD COLUMN IF NOT EXISTS city TEXT,
  ADD COLUMN IF NOT EXISTS state TEXT,
  ADD COLUMN IF NOT EXISTS zip_code TEXT,
  ADD COLUMN IF NOT EXISTS department TEXT;
