-- ============================================================
-- SUPERADMIN SITE SETTINGS
-- Run this after 006_user_profile_activation.sql
-- ============================================================

CREATE TABLE IF NOT EXISTS public.site_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT NOT NULL UNIQUE,
  value JSONB NOT NULL DEFAULT '{}'::jsonb,
  updated_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

DROP TRIGGER IF EXISTS update_site_settings_updated_at ON public.site_settings;
CREATE TRIGGER update_site_settings_updated_at
  BEFORE UPDATE ON public.site_settings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

DROP POLICY IF EXISTS "site_settings_superadmin_read" ON public.site_settings;
CREATE POLICY "site_settings_superadmin_read"
  ON public.site_settings
  FOR SELECT
  TO authenticated
  USING (public.is_superadmin());

DROP POLICY IF EXISTS "site_settings_superadmin_insert" ON public.site_settings;
CREATE POLICY "site_settings_superadmin_insert"
  ON public.site_settings
  FOR INSERT
  TO authenticated
  WITH CHECK (public.is_superadmin());

DROP POLICY IF EXISTS "site_settings_superadmin_update" ON public.site_settings;
CREATE POLICY "site_settings_superadmin_update"
  ON public.site_settings
  FOR UPDATE
  TO authenticated
  USING (public.is_superadmin())
  WITH CHECK (public.is_superadmin());

INSERT INTO public.site_settings (key, value)
VALUES (
  'general',
  jsonb_build_object(
    'siteName', 'Berkeley Sequencing Lab',
    'supportEmail', 'berkeleysequencinglab@gmail.com',
    'maintenanceMode', false,
    'announcementText', ''
  )
)
ON CONFLICT (key) DO NOTHING;
