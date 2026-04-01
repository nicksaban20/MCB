-- Tighten role management so only superadmins can update user profile rows.
-- This keeps staff from changing roles or editing other users' profile records.

DROP POLICY IF EXISTS "user_profiles_update" ON public.user_profiles;

CREATE POLICY "user_profiles_update"
  ON public.user_profiles
  FOR UPDATE
  USING (public.is_superadmin())
  WITH CHECK (public.is_superadmin());
