-- =============================================
-- SMK Portal — Agents Table
-- =============================================
-- This table extends Supabase Auth users with
-- agent-specific profile data.
--
-- Auth flow: Agents are created as Supabase Auth
-- users with email = {kode_agent}@smk.internal.
-- This table links back to auth.users via the id.
-- =============================================

CREATE TABLE IF NOT EXISTS public.agents (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    kode_agent VARCHAR(50) UNIQUE NOT NULL,
    nama VARCHAR(255) NOT NULL DEFAULT '',
    jabatan VARCHAR(100),
    unit_kerja VARCHAR(100),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.agents ENABLE ROW LEVEL SECURITY;

-- Policy: Agents can read their own profile
CREATE POLICY "agents_select_own"
    ON public.agents
    FOR SELECT
    USING (auth.uid() = id);

-- Policy: Agents can update their own profile
CREATE POLICY "agents_update_own"
    ON public.agents
    FOR UPDATE
    USING (auth.uid() = id);

-- Index on kode_agent for login lookups
CREATE INDEX IF NOT EXISTS idx_agents_kode_agent ON public.agents(kode_agent);

-- Function to auto-update updated_at
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for updated_at
CREATE TRIGGER set_agents_updated_at
    BEFORE UPDATE ON public.agents
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- =============================================
-- Helper: Create a new agent (run in Supabase SQL Editor)
-- =============================================
-- To create a new agent, first create them in Supabase Auth
-- (Dashboard > Authentication > Add User), then insert here:
--
-- INSERT INTO public.agents (id, kode_agent, nama, jabatan, unit_kerja)
-- VALUES (
--     '<uuid-from-auth-users>',
--     'AG001',
--     'Nama Agent',
--     'Agent',
--     'Unit A'
-- );
