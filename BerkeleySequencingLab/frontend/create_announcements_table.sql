-- Create announcements table
CREATE TABLE IF NOT EXISTS public.announcements (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    type TEXT NOT NULL DEFAULT 'general' CHECK (type IN ('deadline', 'event', 'closure', 'general')),
    start_date TIMESTAMPTZ DEFAULT NOW(),
    end_date TIMESTAMPTZ,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS announcements_is_active_idx ON public.announcements(is_active);
CREATE INDEX IF NOT EXISTS announcements_type_idx ON public.announcements(type);
CREATE INDEX IF NOT EXISTS announcements_dates_idx ON public.announcements(start_date, end_date);

-- Enable Row Level Security
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;

-- Public can read active announcements
CREATE POLICY "Anyone can view active announcements"
    ON public.announcements
    FOR SELECT
    USING (is_active = true AND start_date <= NOW() AND (end_date IS NULL OR end_date >= NOW()));

-- Admins can view all announcements
CREATE POLICY "Admins can view all announcements"
    ON public.announcements
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM auth.users
            WHERE auth.users.id = auth.uid()
            AND (auth.users.raw_user_meta_data->>'is_admin')::boolean = true
        )
    );

-- Admins can insert
CREATE POLICY "Admins can insert announcements"
    ON public.announcements
    FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM auth.users
            WHERE auth.users.id = auth.uid()
            AND (auth.users.raw_user_meta_data->>'is_admin')::boolean = true
        )
    );

-- Admins can update
CREATE POLICY "Admins can update announcements"
    ON public.announcements
    FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM auth.users
            WHERE auth.users.id = auth.uid()
            AND (auth.users.raw_user_meta_data->>'is_admin')::boolean = true
        )
    );

-- Admins can delete
CREATE POLICY "Admins can delete announcements"
    ON public.announcements
    FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM auth.users
            WHERE auth.users.id = auth.uid()
            AND (auth.users.raw_user_meta_data->>'is_admin')::boolean = true
        )
    );

-- Auto-update updated_at
CREATE TRIGGER update_announcements_updated_at
    BEFORE UPDATE ON public.announcements
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
