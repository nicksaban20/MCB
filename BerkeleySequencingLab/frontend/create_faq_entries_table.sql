-- Create faq_entries table
CREATE TABLE IF NOT EXISTS public.faq_entries (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    question TEXT NOT NULL,
    answer TEXT NOT NULL,
    category TEXT NOT NULL DEFAULT 'General',
    sort_order INTEGER DEFAULT 0,
    is_published BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS faq_entries_category_idx ON public.faq_entries(category);
CREATE INDEX IF NOT EXISTS faq_entries_sort_order_idx ON public.faq_entries(sort_order);

-- Enable Row Level Security
ALTER TABLE public.faq_entries ENABLE ROW LEVEL SECURITY;

-- Public can read published entries
CREATE POLICY "Anyone can view published FAQ entries"
    ON public.faq_entries
    FOR SELECT
    USING (is_published = true);

-- Admins can view all entries
CREATE POLICY "Admins can view all FAQ entries"
    ON public.faq_entries
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM auth.users
            WHERE auth.users.id = auth.uid()
            AND (auth.users.raw_user_meta_data->>'is_admin')::boolean = true
        )
    );

-- Admins can insert
CREATE POLICY "Admins can insert FAQ entries"
    ON public.faq_entries
    FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM auth.users
            WHERE auth.users.id = auth.uid()
            AND (auth.users.raw_user_meta_data->>'is_admin')::boolean = true
        )
    );

-- Admins can update
CREATE POLICY "Admins can update FAQ entries"
    ON public.faq_entries
    FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM auth.users
            WHERE auth.users.id = auth.uid()
            AND (auth.users.raw_user_meta_data->>'is_admin')::boolean = true
        )
    );

-- Admins can delete
CREATE POLICY "Admins can delete FAQ entries"
    ON public.faq_entries
    FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM auth.users
            WHERE auth.users.id = auth.uid()
            AND (auth.users.raw_user_meta_data->>'is_admin')::boolean = true
        )
    );

-- Auto-update updated_at
CREATE TRIGGER update_faq_entries_updated_at
    BEFORE UPDATE ON public.faq_entries
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
