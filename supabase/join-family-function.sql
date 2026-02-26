-- Join Family RPC Function (Simple version - no invite update to avoid FK issues)
CREATE OR REPLACE FUNCTION public.join_family(
  p_code TEXT,
  p_display_name TEXT,
  p_role TEXT DEFAULT '成員'
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
    AND (used_at IS NULL OR used_at IS NULL);

  IF NOT FOUND THEN
    RETURN JSONB_BUILD_OBJECT('success', false, 'error', 'Invalid or expired invite code');
  END IF;

  v_family_id := v_invite.family_id;

  -- Check if already a member
  IF EXISTS (
    SELECT 1 FROM public.family_members
    WHERE family_id = v_family_id AND display_name = p_display_name
  ) THEN
    RETURN JSONB_BUILD_OBJECT('success', false, 'error', 'Already a member');
  END IF;

  -- Insert member
  INSERT INTO public.family_members (family_id, display_name, role, is_owner, user_id)
  VALUES (v_family_id, p_display_name, p_role, false, v_user_id);

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
