-- Fix infinite recursion - Simple permissive policies
-- Run in Supabase SQL Editor

-- Drop the problematic policies
DROP POLICY IF EXISTS "allow_authenticated_members" ON public.family_members;
DROP POLICY IF EXISTS "allow_authenticated_families" ON public.families;
DROP POLICY IF EXISTS "allow_authenticated_responses" ON public.daily_responses;

-- Use simpler policies without self-reference
ALTER TABLE public.families ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.family_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Allow all authenticated operations (for now)
CREATE POLICY "auth_all_families" ON public.families
  FOR ALL TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "auth_all_members" ON public.family_members
  FOR ALL TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "auth_all_responses" ON public.daily_responses
  FOR ALL TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "auth_all_users" ON public.users
  FOR ALL TO authenticated
  USING (true)
  WITH CHECK (true);

-- Public read for invites
DROP POLICY IF EXISTS "anyone_read_invites" ON public.invites;
CREATE POLICY "public_read_invites" ON public.invites FOR SELECT TO public USING (true);
