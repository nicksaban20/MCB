-- ============================================================
-- USER PROFILE ACTIVATION / DEACTIVATION
-- Run this after 005_admin_audit_logs.sql
-- ============================================================

ALTER TABLE public.user_profiles
  ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT TRUE,
  ADD COLUMN IF NOT EXISTS deactivated_at TIMESTAMPTZ;

UPDATE public.user_profiles
SET is_active = TRUE
WHERE is_active IS NULL;

CREATE OR REPLACE FUNCTION public.is_staff()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_profiles
    WHERE id = auth.uid()
      AND COALESCE(is_active, TRUE)
      AND role IN ('staff', 'superadmin')
  );
$$;

CREATE OR REPLACE FUNCTION public.is_superadmin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_profiles
    WHERE id = auth.uid()
      AND COALESCE(is_active, TRUE)
      AND role = 'superadmin'
  );
$$;
