// ============================================
// Auth Service - Email/Password 登錄 + Supabase
// ============================================

import { supabase } from './supabase';
import { saveAppState, loadAppState, AppState } from './store';

export type AuthUser = {
  id: string;
  email: string | null;
  phone: string | null;
  displayName: string | null;
};

// Email 登錄 (使用 Supabase Auth)
export async function signInWithEmail(email: string, password: string): Promise<{ user: AuthUser | null; error: string | null }> {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return { user: null, error: error.message };
    }

    if (data.user) {
      // 獲取用戶資料
      const user = await getUserProfile(data.user.id);
      return { user, error: null };
    }

    return { user: null, error: 'Unknown error' };
  } catch (err: any) {
    return { user: null, error: err.message };
  }
}

// Email 註冊 (使用 Supabase Auth)
export async function signUpWithEmail(
  email: string, 
  password: string, 
  displayName?: string
): Promise<{ user: AuthUser | null; error: string | null }> {
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          display_name: displayName || email.split('@')[0],
        },
      },
    });

    if (error) {
      return { user: null, error: error.message };
    }

    if (data.user) {
      // 在 users 表創建記錄
      const profileCreated = await createUserProfile(data.user.id, email, null, displayName || email.split('@')[0]);
      
      if (!profileCreated) {
        // Profile creation failed but auth succeeded - still return user
        console.warn('User created but profile creation failed');
      }
      
      const user: AuthUser = {
        id: data.user.id,
        email,
        phone: null,
        displayName: displayName || email.split('@')[0],
      };
      
      return { user, error: null };
    }

    return { user: null, error: 'Unknown error' };
  } catch (err: any) {
    return { user: null, error: err.message };
  }
}

// 獲取用戶資料 (從 users 表)
async function getUserProfile(userId: string): Promise<AuthUser | null> {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (error || !data) {
      // 用戶資料不存在，返回基本資料
      return {
        id: userId,
        email: null,
        phone: null,
        displayName: null,
      };
    }

    return {
      id: data.id,
      email: data.email,
      phone: data.phone,
      displayName: data.display_name,
    };
  } catch (err) {
    // Supabase 不可用，返回 null
    return null;
  }
}

// 創建用戶資料 (到 users 表)
async function createUserProfile(
  userId: string, 
  email: string | null, 
  phone: string | null,
  displayName: string
): Promise<boolean> {
  const { error } = await supabase
    .from('users')
    .insert({
      id: userId,
      email,
      phone,
      display_name: displayName,
    });

  return !error;
}

// 檢查是否已登入
export async function getCurrentUser(): Promise<AuthUser | null> {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return null;
  }

  return getUserProfile(user.id);
}

// 登出
export async function signOut(): Promise<void> {
  await supabase.auth.signOut();
  // Clear localStorage
  if (typeof window !== 'undefined') {
    localStorage.removeItem('dinner_app_state_v1');
  }
}

// ============================================
// Family 相關函數
// ============================================

export type Family = {
  id: string;
  name: string;
  inviteCode: string;
  createdBy: string;
  createdAt: string;
};

export type FamilyMember = {
  id: string;
  familyId: string;
  userId: string;
  displayName: string;
  role: string;
  isOwner: boolean;
  joinedAt: string;
};

// 創建家庭
export async function createFamily(
  userId: string, 
  familyName: string, 
  displayName: string, 
  role: string
): Promise<{ family: Family | null; member: FamilyMember | null; error: string | null }> {
  try {
    // 生成邀請碼
    const inviteCode = await generateInviteCodeWithRetry();
    
    // 創建家庭
    const { data: family, error: familyError } = await supabase
      .from('families')
      .insert({
        name: familyName,
        invite_code: inviteCode,
        created_by: userId,
      })
      .select()
      .single();

    if (familyError) {
      return { family: null, member: null, error: familyError.message };
    }

    // 添加創建者為成員 (owner)
    const { data: member, error: memberError } = await supabase
      .from('family_members')
      .insert({
        family_id: family.id,
        user_id: userId,
        display_name: displayName,
        role: role,
        is_owner: true,
      })
      .select()
      .single();

    if (memberError) {
      return { family: null, member: null, error: memberError.message };
    }

    return {
      family: {
        id: family.id,
        name: family.name,
        inviteCode: family.invite_code,
        createdBy: family.created_by,
        createdAt: family.created_at,
      },
      member: {
        id: member.id,
        familyId: member.family_id,
        userId: member.user_id,
        displayName: member.display_name,
        role: member.role,
        isOwner: member.is_owner,
        joinedAt: member.joined_at,
      },
      error: null,
    };
  } catch (err: any) {
    return { family: null, member: null, error: err.message };
  }
}

// 透過邀請碼加入家庭
export async function joinFamilyByCode(
  userId: string,
  inviteCode: string,
  displayName: string,
  role: string
): Promise<{ family: Family | null; member: FamilyMember | null; error: string | null }> {
  try {
    // 查找家庭
    const { data: family, error: familyError } = await supabase
      .from('families')
      .select('*')
      .eq('invite_code', inviteCode.toUpperCase())
      .single();

    if (familyError || !family) {
      return { family: null, member: null, error: '邀請碼無效' };
    }

    // 檢查是否已經是成員
    const { data: existingMember } = await supabase
      .from('family_members')
      .select('*')
      .eq('family_id', family.id)
      .eq('user_id', userId)
      .single();

    if (existingMember) {
      return { 
        family: null, 
        member: null, 
        error: '你已經是這個家庭的成員' 
      };
    }

    // 加入家庭
    const { data: member, error: memberError } = await supabase
      .from('family_members')
      .insert({
        family_id: family.id,
        user_id: userId,
        display_name: displayName,
        role: role,
        is_owner: false,
      })
      .select()
      .single();

    if (memberError) {
      return { family: null, member: null, error: memberError.message };
    }

    return {
      family: {
        id: family.id,
        name: family.name,
        inviteCode: family.invite_code,
        createdBy: family.created_by,
        createdAt: family.created_at,
      },
      member: {
        id: member.id,
        familyId: member.family_id,
        userId: member.user_id,
        displayName: member.display_name,
        role: member.role,
        isOwner: member.is_owner,
        joinedAt: member.joined_at,
      },
      error: null,
    };
  } catch (err: any) {
    return { family: null, member: null, error: err.message };
  }
}

// 獲取用戶的家庭
export async function getUserFamily(userId: string): Promise<{ family: Family | null; member: FamilyMember | null }> {
  // 獲取成員資料
  const { data: member } = await supabase
    .from('family_members')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (!member) {
    return { family: null, member: null };
  }

  // 獲取家庭資料
  const { data: family } = await supabase
    .from('families')
    .select('*')
    .eq('id', member.family_id)
    .single();

  if (!family) {
    return { family: null, member: null };
  }

  return {
    family: {
      id: family.id,
      name: family.name,
      inviteCode: family.invite_code,
      createdBy: family.created_by,
      createdAt: family.created_at,
    },
    member: {
      id: member.id,
      familyId: member.family_id,
      userId: member.user_id,
      displayName: member.display_name,
      role: member.role,
      isOwner: member.is_owner,
      joinedAt: member.joined_at,
    },
  };
}

// 獲取家庭成員列表
export async function getFamilyMembers(familyId: string): Promise<FamilyMember[]> {
  const { data, error } = await supabase
    .from('family_members')
    .select('*')
    .eq('family_id', familyId)
    .order('is_owner', { ascending: false })
    .order('joined_at', { ascending: true });

  if (error) {
    console.error('Error fetching members:', error);
    return [];
  }

  return data?.map(m => ({
    id: m.id,
    familyId: m.family_id,
    userId: m.user_id,
    displayName: m.display_name,
    role: m.role,
    isOwner: m.is_owner,
    joinedAt: m.joined_at,
  })) || [];
}

// 獲取今日回覆 (使用 memberId 作為 key)
export async function getTodayResponses(familyId: string): Promise<Record<string, string>> {
  const today = new Date().toISOString().split('T')[0];
  
  // Join with family_members to get memberId
  const { data, error } = await supabase
    .from('daily_responses')
    .select(`
      status,
      family_members!inner(id)
    `)
    .eq('family_id', familyId)
    .eq('date', today);

  if (error) {
    console.error('Error fetching responses:', error);
    return {};
  }

  const responses: Record<string, string> = {};
  data?.forEach(r => {
    // Use member.id as the key
    const memberId = (r.family_members as any)?.id;
    if (memberId) {
      responses[memberId] = r.status;
    }
  });

  return responses;
}

// 提交回覆 (使用 memberId)
export async function submitResponse(
  familyId: string,
  memberId: string,
  status: 'yes' | 'no' | 'unknown'
): Promise<{ success: boolean; error: string | null }> {
  const today = new Date().toISOString().split('T')[0];
  
  // First get the user_id from the member
  const { data: member, error: memberError } = await supabase
    .from('family_members')
    .select('user_id')
    .eq('id', memberId)
    .single();
    
  if (memberError || !member) {
    return { success: false, error: 'Member not found' };
  }
  
  const { error } = await supabase
    .from('daily_responses')
    .upsert({
      family_id: familyId,
      user_id: member.user_id,
      date: today,
      status: status,
      updated_at: new Date().toISOString(),
    }, {
      onConflict: 'family_id,user_id,date',
    });

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true, error: null };
}

// 生成邀請碼 (with collision retry)
async function generateInviteCodeWithRetry(maxRetries = 3): Promise<string> {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    let code = '';
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    
    // Check if code already exists
    const { data, error } = await supabase
      .from('families')
      .select('id')
      .eq('invite_code', code)
      .single();
    
    if (error || !data) {
      // Code is unique, return it
      return code;
    }
    
    // Code exists, try again
    console.warn(`Invite code collision, retrying (${attempt + 1}/${maxRetries})`);
  }
  
  // Fallback: use timestamp-based code
  return `INV${Date.now().toString(36).toUpperCase()}`;
}

// 驗證邀請碼
export async function verifyInviteCode(code: string): Promise<{ valid: boolean; familyId?: string; familyName?: string }> {
  const { data, error } = await supabase
    .from('families')
    .select('id, name')
    .eq('invite_code', code.toUpperCase())
    .single();

  if (error || !data) {
    return { valid: false };
  }

  return { 
    valid: true, 
    familyId: data.id, 
    familyName: data.name 
  };
}

// 獲取邀請碼 (Supabase)
export async function getInviteCodeSupabase(familyId: string): Promise<string | null> {
  const { data, error } = await supabase
    .from('families')
    .select('invite_code')
    .eq('id', familyId)
    .single();

  if (error || !data) {
    return null;
  }

  return data.invite_code;
}

// 同步到 localStorage (作為 fallback)
export function syncToLocalStorage(appState: AppState): void {
  saveAppState(appState);
}
