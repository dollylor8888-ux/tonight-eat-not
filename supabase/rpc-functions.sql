-- ============================================
-- Family Creation + Join RPC Functions
-- ============================================

-- ============================================
-- 1. Special Insert Policy for Family Owner
-- ============================================
-- 家庭創建者可以插入第一個成員（自己）
DROP POLICY IF EXISTS "family_members_insert_owner" ON public.family_members;
CREATE POLICY "family_members_insert_owner" ON public.family_members
  FOR INSERT TO authenticated
  WITH CHECK (
    user_id = auth.uid()
    AND is_owner = true
    AND EXISTS (
      SELECT 1 FROM public.families f
      WHERE f.id = family_id
        AND f.created_by = auth.uid()
    )
  );

-- ============================================
-- 2. Join Family RPC (Security Definer)
-- ============================================
-- 用邀請碼加入家庭
CREATE OR REPLACE FUNCTION public.join_family(
  p_code TEXT,
  p_display_name TEXT,
  p_role TEXT DEFAULT '子女'
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_invite RECORD;
  v_user_id UUID;
  v_family_id UUID;
  v_result JSONB;
BEGIN
  -- Get current user
  v_user_id := auth.uid();
  
  IF v_user_id IS NULL THEN
    RETURN JSONB_BUILD_OBJECT('success', false, 'error', 'Not authenticated');
  END IF;

  -- Find valid invite
  SELECT * INTO v_invite
  FROM public.invites
  WHERE code = UPPER(p_code)
    AND (expires_at IS NULL OR expires_at > NOW())
    AND used_at IS NULL;

  IF NOT FOUND THEN
    RETURN JSONB_BUILD_OBJECT('success', false, 'error', 'Invalid or expired invite code');
  END IF;

  v_family_id := v_invite.family_id;

  -- Check if already a member
  IF EXISTS (
    SELECT 1 FROM public.family_members
    WHERE family_id = v_family_id AND user_id = v_user_id
  ) THEN
    RETURN JSONB_BUILD_OBJECT('success', false, 'error', 'Already a member');
  END IF;

  -- Insert member
  INSERT INTO public.family_members (family_id, user_id, display_name, role, is_owner)
  VALUES (v_family_id, v_user_id, p_display_name, p_role, false);

  -- Mark invite as used
  UPDATE public.invites
  SET used_by = v_user_id, used_at = NOW()
  WHERE id = v_invite.id;

  -- Return success
  SELECT JSONB_BUILD_OBJECT(
    'success', true,
    'family_id', v_family_id,
    'message', 'Joined successfully'
  ) INTO v_result;

  RETURN v_result;
EXCEPTION WHEN OTHERS THEN
  RETURN JSONB_BUILD_OBJECT('success', false, 'error', SQLERRM);
END;
$$;

ALTER FUNCTION public.join_family(TEXT, TEXT, TEXT) OWNER TO postgres;
GRANT EXECUTE ON FUNCTION public.join_family(TEXT, TEXT, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.join_family(TEXT, TEXT, TEXT) TO anon;

-- ============================================
-- 3. Get User's Family Info RPC
-- ============================================
CREATE OR REPLACE FUNCTION public.get_my_family()
RETURNS JSONB
LANGUAGE SQL
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT JSONB_BUILD_OBJECT(
    'family', (
      SELECT JSONB_BUILD_OBJECT(
        'id', f.id,
        'name', f.name,
        'created_at', f.created_at
      )
      FROM public.families f
      JOIN public.family_members fm ON fm.family_id = f.id
      WHERE fm.user_id = auth.uid()
      LIMIT 1
    ),
    'member', (
      SELECT JSONB_BUILD_OBJECT(
        'id', fm.id,
        'display_name', fm.display_name,
        'role', fm.role,
        'is_owner', fm.is_owner,
        'joined_at', fm.joined_at
      )
      FROM public.family_members fm
      WHERE fm.user_id = auth.uid()
      LIMIT 1
    )
  );
$$;

ALTER FUNCTION public.get_my_family() OWNER TO postgres;
GRANT EXECUTE ON FUNCTION public.get_my_family() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_my_family() TO anon;

-- ============================================
-- 4. Get Family Members RPC
-- ============================================
CREATE OR REPLACE FUNCTION public.get_family_members(p_family_id UUID)
RETURNS JSONB
LANGUAGE SQL
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(
    JSONB_AGG(
      JSONB_BUILD_OBJECT(
        'id', fm.id,
        'display_name', fm.display_name,
        'role', fm.role,
        'is_owner', fm.is_owner,
        'joined_at', fm.joined_at
      )
    ),
    '[]'::JSONB
  )
  FROM public.family_members fm
  WHERE fm.family_id = p_family_id;
$$;

ALTER FUNCTION public.get_family_members(UUID) OWNER TO postgres;
GRANT EXECUTE ON FUNCTION public.get_family_members(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_family_members(UUID) TO anon;
