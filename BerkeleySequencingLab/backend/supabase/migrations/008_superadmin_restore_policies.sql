-- ============================================================
-- SUPERADMIN RESTORE DELETE POLICIES
-- Run this after 007_site_settings.sql
-- ============================================================

DROP POLICY IF EXISTS "user_profiles_delete_superadmin" ON public.user_profiles;
CREATE POLICY "user_profiles_delete_superadmin"
  ON public.user_profiles
  FOR DELETE
  TO authenticated
  USING (public.is_superadmin());

DROP POLICY IF EXISTS "site_settings_superadmin_delete" ON public.site_settings;
CREATE POLICY "site_settings_superadmin_delete"
  ON public.site_settings
  FOR DELETE
  TO authenticated
  USING (public.is_superadmin());
