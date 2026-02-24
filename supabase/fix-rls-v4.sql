-- Simple RLS Fix - Run each statement separately if needed

-- 1. Drop problematic policies
DROP POLICY IF EXISTS "allow_authenticated_members" ON public.family_members;
DROP POLICY IF EXISTS "allow_authenticated_families" ON public.families;
DROP POLICY IF EXISTS "allow_authenticated_responses" ON public.daily_responses;
DROP POLICY IF EXISTS "auth_all_families" ON public.families;
DROP POLICY IF EXISTS "auth_all_members" ON public.family_members;
DROP POLICY IF EXISTS "auth_all_responses" ON public.daily_responses;
DROP POLICY IF EXISTS "auth_all_users" ON public.users;

-- 2. Enable RLS
ALTER TABLE public.families ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.family_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- 3. Create simple permissive policies
CREATE POLICY "public_families" ON public.families FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "public_members" ON public.family_members FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "public_responses" ON public.daily_responses FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "public_users" ON public.users FOR ALL TO authenticated USING (true) WITH CHECK (true);
