-- Berkeley Sequencing Lab — Admin portal schema (run in Supabase SQL Editor)
-- Prereq: dna_orders, organizations, update_updated_at_column() from existing migrations

-- ---------------------------------------------------------------------------
-- dna_orders extensions
-- ---------------------------------------------------------------------------
ALTER TABLE public.dna_orders
  ADD COLUMN IF NOT EXISTS internal_notes TEXT,
  ADD COLUMN IF NOT EXISTS completed_at TIMESTAMPTZ;

-- ---------------------------------------------------------------------------
-- plates
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.plates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'preparing',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS plates_status_idx ON public.plates(status);
CREATE INDEX IF NOT EXISTS plates_created_at_idx ON public.plates(created_at DESC);

ALTER TABLE public.plates ENABLE ROW LEVEL SECURITY;

-- ---------------------------------------------------------------------------
-- dna_samples (create if missing — aligns with form-review-order inserts)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.dna_samples (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dna_order_id UUID NOT NULL REFERENCES public.dna_orders(id) ON DELETE CASCADE,
  sample_no TEXT,
  name TEXT,
  notes TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  flag_for_review BOOLEAN NOT NULL DEFAULT false,
  plate_id UUID REFERENCES public.plates(id) ON DELETE SET NULL,
  well_index INT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT dna_samples_well_range CHECK (well_index IS NULL OR (well_index >= 0 AND well_index < 96))
);

CREATE INDEX IF NOT EXISTS dna_samples_order_idx ON public.dna_samples(dna_order_id);
CREATE INDEX IF NOT EXISTS dna_samples_plate_idx ON public.dna_samples(plate_id);
CREATE INDEX IF NOT EXISTS dna_samples_status_idx ON public.dna_samples(status);

-- Idempotent column adds if table pre-existed without new fields
ALTER TABLE public.dna_samples
  ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'pending';
ALTER TABLE public.dna_samples
  ADD COLUMN IF NOT EXISTS flag_for_review BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE public.dna_samples
  ADD COLUMN IF NOT EXISTS plate_id UUID REFERENCES public.plates(id) ON DELETE SET NULL;
ALTER TABLE public.dna_samples
  ADD COLUMN IF NOT EXISTS well_index INT;

DROP INDEX IF EXISTS dna_samples_plate_well_unique;
CREATE UNIQUE INDEX IF NOT EXISTS dna_samples_plate_well_unique
  ON public.dna_samples(plate_id, well_index)
  WHERE plate_id IS NOT NULL AND well_index IS NOT NULL;

ALTER TABLE public.dna_samples ENABLE ROW LEVEL SECURITY;

-- ---------------------------------------------------------------------------
-- Audit / notifications log
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.order_status_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dna_order_id UUID NOT NULL REFERENCES public.dna_orders(id) ON DELETE CASCADE,
  old_status TEXT,
  new_status TEXT NOT NULL,
  note TEXT,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS order_status_events_order_idx ON public.order_status_events(dna_order_id);
ALTER TABLE public.order_status_events ENABLE ROW LEVEL SECURITY;

-- ---------------------------------------------------------------------------
-- Result files (Storage path in bucket sequence-results or sequencing-results)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.result_files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dna_order_id UUID NOT NULL REFERENCES public.dna_orders(id) ON DELETE CASCADE,
  dna_sample_id UUID REFERENCES public.dna_samples(id) ON DELETE SET NULL,
  storage_path TEXT NOT NULL,
  file_name TEXT NOT NULL,
  mime_type TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS result_files_order_idx ON public.result_files(dna_order_id);
ALTER TABLE public.result_files ENABLE ROW LEVEL SECURITY;

-- ---------------------------------------------------------------------------
-- Triggers updated_at
-- ---------------------------------------------------------------------------
DROP TRIGGER IF EXISTS update_plates_updated_at ON public.plates;
CREATE TRIGGER update_plates_updated_at
  BEFORE UPDATE ON public.plates
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_dna_samples_updated_at ON public.dna_samples;
CREATE TRIGGER update_dna_samples_updated_at
  BEFORE UPDATE ON public.dna_samples
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ---------------------------------------------------------------------------
-- Helper: admin check (inline in policies)
-- ---------------------------------------------------------------------------

-- organizations: admins read all (for customer labels on orders)
DROP POLICY IF EXISTS "Admins can view all organizations" ON public.organizations;
CREATE POLICY "Admins can view all organizations"
  ON public.organizations
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM auth.users u
      WHERE u.id = auth.uid()
        AND COALESCE((u.raw_user_meta_data->>'is_admin')::boolean, false) = true
    )
  );

-- plates: admin CRUD
DROP POLICY IF EXISTS "Admins plates select" ON public.plates;
DROP POLICY IF EXISTS "Admins plates insert" ON public.plates;
DROP POLICY IF EXISTS "Admins plates update" ON public.plates;
DROP POLICY IF EXISTS "Admins plates delete" ON public.plates;

CREATE POLICY "Admins plates select"
  ON public.plates FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM auth.users u WHERE u.id = auth.uid()
    AND COALESCE((u.raw_user_meta_data->>'is_admin')::boolean, false) = true));

CREATE POLICY "Admins plates insert"
  ON public.plates FOR INSERT TO authenticated
  WITH CHECK (EXISTS (
    SELECT 1 FROM auth.users u WHERE u.id = auth.uid()
    AND COALESCE((u.raw_user_meta_data->>'is_admin')::boolean, false) = true));

CREATE POLICY "Admins plates update"
  ON public.plates FOR UPDATE TO authenticated
  USING (EXISTS (
    SELECT 1 FROM auth.users u WHERE u.id = auth.uid()
    AND COALESCE((u.raw_user_meta_data->>'is_admin')::boolean, false) = true))
  WITH CHECK (EXISTS (
    SELECT 1 FROM auth.users u WHERE u.id = auth.uid()
    AND COALESCE((u.raw_user_meta_data->>'is_admin')::boolean, false) = true));

CREATE POLICY "Admins plates delete"
  ON public.plates FOR DELETE TO authenticated
  USING (EXISTS (
    SELECT 1 FROM auth.users u WHERE u.id = auth.uid()
    AND COALESCE((u.raw_user_meta_data->>'is_admin')::boolean, false) = true));

-- dna_samples policies
DROP POLICY IF EXISTS "Users can view samples for own orders" ON public.dna_samples;
DROP POLICY IF EXISTS "Users insert samples for own orders" ON public.dna_samples;
DROP POLICY IF EXISTS "Users update samples for own orders" ON public.dna_samples;
DROP POLICY IF EXISTS "Users delete samples for own orders" ON public.dna_samples;
DROP POLICY IF EXISTS "Admins full access dna_samples" ON public.dna_samples;

CREATE POLICY "Users can view samples for own orders"
  ON public.dna_samples FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.dna_orders o
      WHERE o.id = dna_samples.dna_order_id AND o.user_id = auth.uid()
    )
  );

CREATE POLICY "Users insert samples for own orders"
  ON public.dna_samples FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.dna_orders o
      WHERE o.id = dna_order_id AND o.user_id = auth.uid()
    )
  );

CREATE POLICY "Users update samples for own orders"
  ON public.dna_samples FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.dna_orders o
      WHERE o.id = dna_samples.dna_order_id AND o.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.dna_orders o
      WHERE o.id = dna_order_id AND o.user_id = auth.uid()
    )
  );

CREATE POLICY "Users delete samples for own orders"
  ON public.dna_samples FOR DELETE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.dna_orders o
      WHERE o.id = dna_samples.dna_order_id AND o.user_id = auth.uid()
    )
  );

CREATE POLICY "Admins full access dna_samples"
  ON public.dna_samples FOR ALL TO authenticated
  USING (EXISTS (
    SELECT 1 FROM auth.users u WHERE u.id = auth.uid()
    AND COALESCE((u.raw_user_meta_data->>'is_admin')::boolean, false) = true))
  WITH CHECK (EXISTS (
    SELECT 1 FROM auth.users u WHERE u.id = auth.uid()
    AND COALESCE((u.raw_user_meta_data->>'is_admin')::boolean, false) = true));

-- order_status_events: admins read/write; users read own order events (optional)
DROP POLICY IF EXISTS "Admins order_status_events all" ON public.order_status_events;
CREATE POLICY "Admins order_status_events all"
  ON public.order_status_events FOR ALL TO authenticated
  USING (EXISTS (
    SELECT 1 FROM auth.users u WHERE u.id = auth.uid()
    AND COALESCE((u.raw_user_meta_data->>'is_admin')::boolean, false) = true))
  WITH CHECK (EXISTS (
    SELECT 1 FROM auth.users u WHERE u.id = auth.uid()
    AND COALESCE((u.raw_user_meta_data->>'is_admin')::boolean, false) = true));

DROP POLICY IF EXISTS "Users view own order events" ON public.order_status_events;
CREATE POLICY "Users view own order events"
  ON public.order_status_events FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.dna_orders o
      WHERE o.id = order_status_events.dna_order_id AND o.user_id = auth.uid()
    )
  );

-- result_files
DROP POLICY IF EXISTS "Admins result_files all" ON public.result_files;
CREATE POLICY "Admins result_files all"
  ON public.result_files FOR ALL TO authenticated
  USING (EXISTS (
    SELECT 1 FROM auth.users u WHERE u.id = auth.uid()
    AND COALESCE((u.raw_user_meta_data->>'is_admin')::boolean, false) = true))
  WITH CHECK (EXISTS (
    SELECT 1 FROM auth.users u WHERE u.id = auth.uid()
    AND COALESCE((u.raw_user_meta_data->>'is_admin')::boolean, false) = true));

DROP POLICY IF EXISTS "Users view own result files" ON public.result_files;
CREATE POLICY "Users view own result files"
  ON public.result_files FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.dna_orders o
      WHERE o.id = result_files.dna_order_id AND o.user_id = auth.uid()
    )
  );

-- Storage: create bucket `sequencing-results` in Dashboard > Storage (private).
-- Policies example (adjust bucket name):
-- INSERT policy for authenticated admin uploads via Dashboard or SQL.

COMMENT ON TABLE public.plates IS '96-well plate tracking for lab workflow';
COMMENT ON TABLE public.result_files IS 'Metadata for customer sequencing files; binary in Storage sequencing-results bucket';
