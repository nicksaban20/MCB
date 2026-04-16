-- LOGIN RATE LIMITING
-- Run this after 008_superadmin_restore_policies.sql

CREATE TABLE IF NOT EXISTS public.auth_rate_limits (
  identifier TEXT PRIMARY KEY,
  attempts INTEGER NOT NULL DEFAULT 0 CHECK (attempts >= 0),
  reset_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_auth_rate_limits_reset_at
  ON public.auth_rate_limits (reset_at);

ALTER TABLE public.auth_rate_limits ENABLE ROW LEVEL SECURITY;

DROP TRIGGER IF EXISTS update_auth_rate_limits_updated_at ON public.auth_rate_limits;
CREATE TRIGGER update_auth_rate_limits_updated_at
  BEFORE UPDATE ON public.auth_rate_limits
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- This table is intended for server-only access through the service role key.
-- Keep RLS enabled with no user-facing policies.
