-- ============================================================
-- AUTH + RLS SETUP
-- Run this after 001_initial_schema.sql
-- ============================================================

-- Keep updated_at available on tables the app may edit later.
ALTER TABLE public.organizations
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

ALTER TABLE public.dna_orders
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();


-- ============================================================
-- SHARED HELPERS
-- ============================================================

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

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


-- ============================================================
-- AUTO-CREATE USER PROFILE ON SIGNUP
-- ============================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.user_profiles (id, first_name, last_name, phone)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data ->> 'firstName',
    NEW.raw_user_meta_data ->> 'lastName',
    NEW.raw_user_meta_data ->> 'phone'
  )
  ON CONFLICT (id) DO UPDATE
  SET
    first_name = COALESCE(EXCLUDED.first_name, public.user_profiles.first_name),
    last_name = COALESCE(EXCLUDED.last_name, public.user_profiles.last_name),
    phone = COALESCE(EXCLUDED.phone, public.user_profiles.phone),
    updated_at = NOW();

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

INSERT INTO public.user_profiles (id, first_name, last_name, phone)
SELECT
  u.id,
  u.raw_user_meta_data ->> 'firstName',
  u.raw_user_meta_data ->> 'lastName',
  u.raw_user_meta_data ->> 'phone'
FROM auth.users AS u
ON CONFLICT (id) DO NOTHING;


-- ============================================================
-- UPDATED_AT TRIGGERS
-- ============================================================

DROP TRIGGER IF EXISTS update_organizations_updated_at ON public.organizations;
CREATE TRIGGER update_organizations_updated_at
  BEFORE UPDATE ON public.organizations
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_dna_orders_updated_at ON public.dna_orders;
CREATE TRIGGER update_dna_orders_updated_at
  BEFORE UPDATE ON public.dna_orders
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_user_profiles_updated_at ON public.user_profiles;
CREATE TRIGGER update_user_profiles_updated_at
  BEFORE UPDATE ON public.user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_plates_updated_at ON public.plates;
CREATE TRIGGER update_plates_updated_at
  BEFORE UPDATE ON public.plates
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_support_tickets_updated_at ON public.support_tickets;
CREATE TRIGGER update_support_tickets_updated_at
  BEFORE UPDATE ON public.support_tickets
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();


-- ============================================================
-- RLS POLICIES
-- ============================================================

ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dna_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dna_samples ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sequencing_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sequencing_samples ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.plates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.plate_wells ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.support_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.support_messages ENABLE ROW LEVEL SECURITY;


-- user_profiles
DROP POLICY IF EXISTS "user_profiles_select" ON public.user_profiles;
CREATE POLICY "user_profiles_select"
  ON public.user_profiles
  FOR SELECT
  USING (auth.uid() = id OR public.is_staff());

DROP POLICY IF EXISTS "user_profiles_insert" ON public.user_profiles;
CREATE POLICY "user_profiles_insert"
  ON public.user_profiles
  FOR INSERT
  WITH CHECK (auth.uid() = id OR public.is_staff());

DROP POLICY IF EXISTS "user_profiles_update" ON public.user_profiles;
CREATE POLICY "user_profiles_update"
  ON public.user_profiles
  FOR UPDATE
  USING (auth.uid() = id OR public.is_staff())
  WITH CHECK (auth.uid() = id OR public.is_staff());


-- organizations
DROP POLICY IF EXISTS "organizations_select" ON public.organizations;
CREATE POLICY "organizations_select"
  ON public.organizations
  FOR SELECT
  USING (auth.uid() = user_id OR public.is_staff());

DROP POLICY IF EXISTS "organizations_insert" ON public.organizations;
CREATE POLICY "organizations_insert"
  ON public.organizations
  FOR INSERT
  WITH CHECK (auth.uid() = user_id OR public.is_staff());

DROP POLICY IF EXISTS "organizations_update" ON public.organizations;
CREATE POLICY "organizations_update"
  ON public.organizations
  FOR UPDATE
  USING (auth.uid() = user_id OR public.is_staff())
  WITH CHECK (auth.uid() = user_id OR public.is_staff());

DROP POLICY IF EXISTS "organizations_delete" ON public.organizations;
CREATE POLICY "organizations_delete"
  ON public.organizations
  FOR DELETE
  USING (auth.uid() = user_id OR public.is_staff());


-- dna_orders
DROP POLICY IF EXISTS "dna_orders_select" ON public.dna_orders;
CREATE POLICY "dna_orders_select"
  ON public.dna_orders
  FOR SELECT
  USING (auth.uid() = user_id OR public.is_staff());

DROP POLICY IF EXISTS "dna_orders_insert" ON public.dna_orders;
CREATE POLICY "dna_orders_insert"
  ON public.dna_orders
  FOR INSERT
  WITH CHECK (auth.uid() = user_id OR public.is_staff());

DROP POLICY IF EXISTS "dna_orders_update" ON public.dna_orders;
CREATE POLICY "dna_orders_update"
  ON public.dna_orders
  FOR UPDATE
  USING (auth.uid() = user_id OR public.is_staff())
  WITH CHECK (auth.uid() = user_id OR public.is_staff());

DROP POLICY IF EXISTS "dna_orders_delete" ON public.dna_orders;
CREATE POLICY "dna_orders_delete"
  ON public.dna_orders
  FOR DELETE
  USING (auth.uid() = user_id OR public.is_staff());


-- dna_samples
DROP POLICY IF EXISTS "dna_samples_select" ON public.dna_samples;
CREATE POLICY "dna_samples_select"
  ON public.dna_samples
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1
      FROM public.dna_orders
      WHERE public.dna_orders.id = public.dna_samples.dna_order_id
        AND (public.dna_orders.user_id = auth.uid() OR public.is_staff())
    )
  );

DROP POLICY IF EXISTS "dna_samples_insert" ON public.dna_samples;
CREATE POLICY "dna_samples_insert"
  ON public.dna_samples
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.dna_orders
      WHERE public.dna_orders.id = public.dna_samples.dna_order_id
        AND (public.dna_orders.user_id = auth.uid() OR public.is_staff())
    )
  );

DROP POLICY IF EXISTS "dna_samples_update" ON public.dna_samples;
CREATE POLICY "dna_samples_update"
  ON public.dna_samples
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1
      FROM public.dna_orders
      WHERE public.dna_orders.id = public.dna_samples.dna_order_id
        AND (public.dna_orders.user_id = auth.uid() OR public.is_staff())
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.dna_orders
      WHERE public.dna_orders.id = public.dna_samples.dna_order_id
        AND (public.dna_orders.user_id = auth.uid() OR public.is_staff())
    )
  );

DROP POLICY IF EXISTS "dna_samples_delete" ON public.dna_samples;
CREATE POLICY "dna_samples_delete"
  ON public.dna_samples
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1
      FROM public.dna_orders
      WHERE public.dna_orders.id = public.dna_samples.dna_order_id
        AND (public.dna_orders.user_id = auth.uid() OR public.is_staff())
    )
  );


-- sequencing_data
DROP POLICY IF EXISTS "sequencing_data_select" ON public.sequencing_data;
CREATE POLICY "sequencing_data_select"
  ON public.sequencing_data
  FOR SELECT
  USING (auth.uid() = user_id OR public.is_staff());

DROP POLICY IF EXISTS "sequencing_data_insert" ON public.sequencing_data;
CREATE POLICY "sequencing_data_insert"
  ON public.sequencing_data
  FOR INSERT
  WITH CHECK (auth.uid() = user_id OR public.is_staff());

DROP POLICY IF EXISTS "sequencing_data_update" ON public.sequencing_data;
CREATE POLICY "sequencing_data_update"
  ON public.sequencing_data
  FOR UPDATE
  USING (auth.uid() = user_id OR public.is_staff())
  WITH CHECK (auth.uid() = user_id OR public.is_staff());

DROP POLICY IF EXISTS "sequencing_data_delete" ON public.sequencing_data;
CREATE POLICY "sequencing_data_delete"
  ON public.sequencing_data
  FOR DELETE
  USING (auth.uid() = user_id OR public.is_staff());


-- sequencing_samples
DROP POLICY IF EXISTS "sequencing_samples_select" ON public.sequencing_samples;
CREATE POLICY "sequencing_samples_select"
  ON public.sequencing_samples
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1
      FROM public.sequencing_data
      WHERE public.sequencing_data.id = public.sequencing_samples.sequencing_id
        AND (public.sequencing_data.user_id = auth.uid() OR public.is_staff())
    )
  );

DROP POLICY IF EXISTS "sequencing_samples_insert" ON public.sequencing_samples;
CREATE POLICY "sequencing_samples_insert"
  ON public.sequencing_samples
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.sequencing_data
      WHERE public.sequencing_data.id = public.sequencing_samples.sequencing_id
        AND (public.sequencing_data.user_id = auth.uid() OR public.is_staff())
    )
  );

DROP POLICY IF EXISTS "sequencing_samples_update" ON public.sequencing_samples;
CREATE POLICY "sequencing_samples_update"
  ON public.sequencing_samples
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1
      FROM public.sequencing_data
      WHERE public.sequencing_data.id = public.sequencing_samples.sequencing_id
        AND (public.sequencing_data.user_id = auth.uid() OR public.is_staff())
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.sequencing_data
      WHERE public.sequencing_data.id = public.sequencing_samples.sequencing_id
        AND (public.sequencing_data.user_id = auth.uid() OR public.is_staff())
    )
  );

DROP POLICY IF EXISTS "sequencing_samples_delete" ON public.sequencing_samples;
CREATE POLICY "sequencing_samples_delete"
  ON public.sequencing_samples
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1
      FROM public.sequencing_data
      WHERE public.sequencing_data.id = public.sequencing_samples.sequencing_id
        AND (public.sequencing_data.user_id = auth.uid() OR public.is_staff())
    )
  );


-- plates
DROP POLICY IF EXISTS "plates_staff_only" ON public.plates;
CREATE POLICY "plates_staff_only"
  ON public.plates
  FOR ALL
  USING (public.is_staff())
  WITH CHECK (public.is_staff());


-- plate_wells
DROP POLICY IF EXISTS "plate_wells_staff_only" ON public.plate_wells;
CREATE POLICY "plate_wells_staff_only"
  ON public.plate_wells
  FOR ALL
  USING (public.is_staff())
  WITH CHECK (public.is_staff());


-- notifications
DROP POLICY IF EXISTS "notifications_select" ON public.notifications;
CREATE POLICY "notifications_select"
  ON public.notifications
  FOR SELECT
  USING (auth.uid() = user_id OR public.is_staff());

DROP POLICY IF EXISTS "notifications_insert" ON public.notifications;
CREATE POLICY "notifications_insert"
  ON public.notifications
  FOR INSERT
  WITH CHECK (auth.uid() = user_id OR public.is_staff());

DROP POLICY IF EXISTS "notifications_update" ON public.notifications;
CREATE POLICY "notifications_update"
  ON public.notifications
  FOR UPDATE
  USING (auth.uid() = user_id OR public.is_staff())
  WITH CHECK (auth.uid() = user_id OR public.is_staff());

DROP POLICY IF EXISTS "notifications_delete" ON public.notifications;
CREATE POLICY "notifications_delete"
  ON public.notifications
  FOR DELETE
  USING (auth.uid() = user_id OR public.is_staff());


-- support_tickets
DROP POLICY IF EXISTS "support_tickets_select" ON public.support_tickets;
CREATE POLICY "support_tickets_select"
  ON public.support_tickets
  FOR SELECT
  USING (auth.uid() = user_id OR public.is_staff());

DROP POLICY IF EXISTS "support_tickets_insert" ON public.support_tickets;
CREATE POLICY "support_tickets_insert"
  ON public.support_tickets
  FOR INSERT
  WITH CHECK (auth.uid() = user_id OR public.is_staff());

DROP POLICY IF EXISTS "support_tickets_update" ON public.support_tickets;
CREATE POLICY "support_tickets_update"
  ON public.support_tickets
  FOR UPDATE
  USING (auth.uid() = user_id OR public.is_staff())
  WITH CHECK (auth.uid() = user_id OR public.is_staff());

DROP POLICY IF EXISTS "support_tickets_delete" ON public.support_tickets;
CREATE POLICY "support_tickets_delete"
  ON public.support_tickets
  FOR DELETE
  USING (auth.uid() = user_id OR public.is_staff());


-- support_messages
DROP POLICY IF EXISTS "support_messages_select" ON public.support_messages;
CREATE POLICY "support_messages_select"
  ON public.support_messages
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1
      FROM public.support_tickets
      WHERE public.support_tickets.id = public.support_messages.ticket_id
        AND (public.support_tickets.user_id = auth.uid() OR public.is_staff())
    )
  );

DROP POLICY IF EXISTS "support_messages_insert" ON public.support_messages;
CREATE POLICY "support_messages_insert"
  ON public.support_messages
  FOR INSERT
  WITH CHECK (
    sender_id = auth.uid()
    AND EXISTS (
      SELECT 1
      FROM public.support_tickets
      WHERE public.support_tickets.id = public.support_messages.ticket_id
        AND (public.support_tickets.user_id = auth.uid() OR public.is_staff())
    )
  );

DROP POLICY IF EXISTS "support_messages_update" ON public.support_messages;
CREATE POLICY "support_messages_update"
  ON public.support_messages
  FOR UPDATE
  USING (public.is_staff())
  WITH CHECK (public.is_staff());

DROP POLICY IF EXISTS "support_messages_delete" ON public.support_messages;
CREATE POLICY "support_messages_delete"
  ON public.support_messages
  FOR DELETE
  USING (public.is_staff());
