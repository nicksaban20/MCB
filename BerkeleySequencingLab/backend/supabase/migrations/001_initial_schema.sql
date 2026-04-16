-- ============================================================
-- COMPLETE SCHEMA: All tables for Berkeley Sequencing Lab
-- Run this in a fresh Supabase project
-- ============================================================


-- ============================================================
-- EXISTING TABLES (from original codebase)
-- ============================================================

CREATE TABLE IF NOT EXISTS public.organizations (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name       TEXT,
  phone      TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.dna_orders (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  sample_type     TEXT,
  dna_type        TEXT,
  dna_quantity    TEXT,
  primer_details  TEXT,
  plate_name      TEXT,
  status          TEXT DEFAULT 'pending'
                    CHECK (status IN ('pending', 'in_progress', 'completed')),
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.dna_samples (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dna_order_id UUID REFERENCES public.dna_orders(id) ON DELETE CASCADE,
  sample_no    TEXT,
  name         TEXT,
  notes        TEXT,
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.sequencing_data (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  container_name   TEXT,
  plate_id         TEXT,
  description      TEXT,
  container_type   TEXT,
  app_type         TEXT,
  owner            TEXT,
  operator         TEXT,
  plate_sealing    TEXT,
  scheduling_pref  TEXT,
  created_at       TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.sequencing_samples (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sequencing_id       UUID REFERENCES public.sequencing_data(id) ON DELETE CASCADE,
  well                TEXT,
  sample_name         TEXT,
  comment             TEXT,
  results_group       TEXT,
  instrument_protocol TEXT,
  analysis_protocol   TEXT,
  created_at          TIMESTAMPTZ DEFAULT NOW()
);


-- ============================================================
-- NEW TABLES (your Member 3 additions)
-- ============================================================

CREATE TABLE IF NOT EXISTS public.user_profiles (
  id         UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role       TEXT NOT NULL DEFAULT 'customer'
               CHECK (role IN ('customer', 'staff', 'superadmin')),
  is_active  BOOLEAN NOT NULL DEFAULT TRUE,
  deactivated_at TIMESTAMPTZ,
  first_name TEXT,
  last_name  TEXT,
  phone      TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.plates (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name       TEXT NOT NULL,
  status     TEXT NOT NULL DEFAULT 'preparing'
               CHECK (status IN ('preparing', 'loaded', 'running', 'completed')),
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.plate_wells (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plate_id   UUID NOT NULL REFERENCES public.plates(id) ON DELETE CASCADE,
  well       TEXT NOT NULL,
  sample_id  UUID REFERENCES public.dna_samples(id),
  order_id   UUID REFERENCES public.dna_orders(id),
  notes      TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(plate_id, well)
);

CREATE TABLE IF NOT EXISTS public.notifications (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title      TEXT NOT NULL,
  message    TEXT NOT NULL,
  read       BOOLEAN DEFAULT FALSE,
  link       TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.support_tickets (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID NOT NULL REFERENCES auth.users(id),
  order_id   UUID REFERENCES public.dna_orders(id),
  subject    TEXT NOT NULL,
  status     TEXT NOT NULL DEFAULT 'open'
               CHECK (status IN ('open', 'in_progress', 'resolved')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.support_messages (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id  UUID NOT NULL REFERENCES public.support_tickets(id) ON DELETE CASCADE,
  sender_id  UUID NOT NULL REFERENCES auth.users(id),
  message    TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);


-- ============================================================
-- AUTO-CREATE USER PROFILE ON SIGNUP
-- ============================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (id, first_name, last_name)
  VALUES
