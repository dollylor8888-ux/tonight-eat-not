-- ============================================
-- RLS Fix: Security Definer Functions
-- 解決 RLS Recursion 問題
-- ============================================

-- Step A: 先停用舊 policy（如果你有）
-- DROP POLICY IF EXISTS "Members can view family members" ON public.family_members;

-- Step B: 建立 Security Definer Helper Functions

-- 檢查用戶是否家庭成員
CREATE OR REPLACE FUNCTION public.is_family_member(fid UUID)
RETURNS BOOLEAN
LANGUAGE SQL
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.family_members
    WHERE family_id = fid
      AND user_id = auth.uid()
  );
$$;

ALTER FUNCTION public.is_family_member(UUID) OWNER TO postgres;
GRANT EXECUTE ON FUNCTION public.is_family_member(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_family_member(UUID) TO anon;

-- 檢查用戶是否家庭 owner
CREATE OR REPLACE FUNCTION public.is_family_owner(fid UUID)
RETURNS BOOLEAN
LANGUAGE SQL
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.family_members
    WHERE family_id = fid
      AND user_id = auth.uid()
      AND is_owner = true
  );
$$;

ALTER FUNCTION public.is_family_owner(UUID) OWNER TO postgres;
GRANT EXECUTE ON FUNCTION public.is_family_owner(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_family_owner(UUID) TO anon;

-- 檢查用戶是否家庭成員（用於 families 表）
CREATE OR REPLACE FUNCTION public.is_in_family(fid UUID)
RETURNS BOOLEAN
LANGUAGE SQL
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.family_members
    WHERE family_id = fid
      AND user_id = auth.uid()
  );
$$;

ALTER FUNCTION public.is_in_family(UUID) OWNER TO postgres;
GRANT EXECUTE ON FUNCTION public.is_in_family(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_in_family(UUID) TO anon;

-- ============================================
-- Updated RLS Policies using Functions
-- ============================================

-- Families: 使用 function
DROP POLICY IF EXISTS "Family members can view families" ON public.families;
CREATE POLICY "Family members can view families" ON public.families
  FOR SELECT TO authenticated
  USING (
    public.is_in_family(id)
    OR created_by = auth.uid()
  );

-- Family Members: 使用 function（斬斷 recursion）
DROP POLICY IF EXISTS "Members can view family members" ON public.family_members;
CREATE POLICY "Members can view family members" ON public.family_members
  FOR SELECT TO authenticated
  USING (public.is_family_member(family_id));

-- Family Members: Insert
DROP POLICY IF EXISTS "Members can insert family members" ON public.family_members;
CREATE POLICY "Members can insert family members" ON public.family_members
  FOR INSERT TO authenticated
  WITH CHECK (public.is_family_member(family_id));

-- Daily Responses: 使用 function
DROP POLICY IF EXISTS "Members can view responses" ON public.daily_responses;
CREATE POLICY "Members can view responses" ON public.daily_responses
  FOR SELECT TO authenticated
  USING (public.is_in_family(family_id));

-- Invites: Owner only insert + expiry check
DROP POLICY IF EXISTS "Anyone can view valid invites" ON public.invites;
CREATE POLICY "Anyone can view valid invites" ON public.invites
  FOR SELECT USING (
    true
    AND (expires_at IS NULL OR expires_at > NOW())
    AND used_at IS NULL
  );

DROP POLICY IF EXISTS "Owners can create invites" ON public.invites;
CREATE POLICY "Owners can create invites" ON public.invites
  FOR INSERT TO authenticated
  WITH CHECK (public.is_family_owner(family_id));

-- ============================================
-- Realtime Setup
-- ============================================

-- 啟用 Realtime（需要喺 Supabase Dashboard 設定）
-- 呢個 SQL 幫唔到你，需要去 Supabase Dashboard → Database → Replication
-- 但可以 grant 權限俾 REPLICA IDENTITY

ALTER TABLE public.family_members REPLICA IDENTITY DEFAULT;
ALTER TABLE public.daily_responses REPLICA IDENTITY DEFAULT;
ALTER TABLE public.families REPLICA IDENTITY DEFAULT;
ALTER TABLE public.invites REPLICA IDENTITY DEFAULT;

-- Grant realtime permissions
GRANT USAGE ON SCHEMA _realtime TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA _realtime TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA _realtime TO authenticated;

-- Publication for realtime
DROP PUBLICATION IF EXISTS supabase_realtime;
CREATE PUBLICATION supabase_realtime FOR TABLE family_members, daily_responses, families, invites;
