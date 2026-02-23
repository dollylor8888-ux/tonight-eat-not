// ==========================================
// App Store - localStorage 狀態管理
// 用於：建立家庭、登入狀態、currentFamily
// ==========================================

export type AppState = {
  // 用戶狀態
  loggedIn: boolean;
  phone: string | null;
  email: string | null;
  userId: string | null;  // Supabase user ID
  
  // 家庭狀態
  familyId: string | null;
  familyName: string | null;
  
  // 成員狀態
  memberId: string | null;
  displayName: string | null;
  isOwner: boolean;
  role: string | null;
};

// 成員類型
export type FamilyMember = {
  id: string;
  displayName: string;
  role: string;
  isOwner: boolean;
  joinedAt: string;
};

const STORAGE_KEY = "dinner_app_state_v1";
const STATE_CHANGED_EVENT = "dinner_state_changed";

const defaultState: AppState = {
  loggedIn: false,
  phone: null,
  email: null,
  userId: null,
  familyId: null,
  familyName: null,
  memberId: null,
  displayName: null,
  isOwner: false,
  role: null,
};

export function loadAppState(): AppState {
  if (typeof window === "undefined") {
    return defaultState;
  }
  
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return { ...defaultState, ...JSON.parse(stored) };
    }
  } catch (e) {
    console.error("Failed to load app state:", e);
  }
  
  return defaultState;
}

export function saveAppState(patch: Partial<AppState>): AppState {
  const current = loadAppState();
  const next = { ...current, ...patch };
  
  if (typeof window !== "undefined") {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    // P1: dispatch 自定 event，等 TopBar 等元件即時更新
    window.dispatchEvent(new Event(STATE_CHANGED_EVENT));
  }
  
  return next;
}

export function clearAppState() {
  if (typeof window !== "undefined") {
    localStorage.removeItem(STORAGE_KEY);
    window.dispatchEvent(new Event(STATE_CHANGED_EVENT));
  }
}

// 模擬登入（mock）
export function mockLogin(phone: string): AppState {
  const existing = loadAppState();
  if (existing.familyId) {
    return saveAppState({ loggedIn: true, phone });
  }
  
  return saveAppState({
    loggedIn: true,
    phone,
    familyId: null,
    familyName: null,
    memberId: null,
    displayName: null,
    isOwner: false,
    role: null,
  });
}

// 模擬建立家庭
export function mockCreateFamily(familyName: string, displayName: string, role: string): AppState {
  const cur = loadAppState();
  const familyId = "fam_" + crypto.randomUUID().slice(0, 8);
  const memberId = "mem_" + crypto.randomUUID().slice(0, 8);
  
  // 建立家庭成員列表（自己）
  const members: FamilyMember[] = [
    {
      id: memberId,
      displayName: displayName,
      role: role,
      isOwner: true,
      joinedAt: new Date().toISOString(),
    }
  ];
  
  // 保存成員到 localStorage
  if (typeof window !== "undefined") {
    const membersKey = `dinner_members_${familyId}`;
    localStorage.setItem(membersKey, JSON.stringify(members));
    
    // 生成邀請碼
    const inviteCode = generateInviteCode();
    const inviteKey = `dinner_invite_${familyId}`;
    localStorage.setItem(inviteKey, JSON.stringify({
      code: inviteCode,
      familyId,
      familyName,
      createdBy: memberId,
      createdAt: new Date().toISOString(),
    }));
  }
  
  return saveAppState({
    loggedIn: true,
    phone: cur.phone,
    familyId,
    familyName,
    memberId,
    displayName,
    isOwner: true,
    role,
  });
}

// 模擬加入家庭
export function mockJoinFamily(familyId: string, familyName: string, displayName: string, role: string): AppState {
  const cur = loadAppState();
  const memberId = "mem_" + crypto.randomUUID().slice(0, 8);
  
  // 加入成員到 localStorage
  if (typeof window !== "undefined") {
    const membersKey = `dinner_members_${familyId}`;
    const existingMembers = localStorage.getItem(membersKey);
    
    let members: FamilyMember[] = [];
    if (existingMembers) {
      try {
        members = JSON.parse(existingMembers);
      } catch (e) {
        members = [];
      }
    }
    
    // 新增新成員
    members.push({
      id: memberId,
      displayName: displayName,
      role: role,
      isOwner: false,
      joinedAt: new Date().toISOString(),
    });
    
    localStorage.setItem(membersKey, JSON.stringify(members));
  }
  
  return saveAppState({
    loggedIn: true,
    phone: cur.phone,
    familyId,
    familyName,
    memberId,
    displayName,
    isOwner: false,
    role,
  });
}

// 生成邀請碼
function generateInviteCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

// 獲取邀請碼
export function getInviteCode(familyId: string): string | null {
  if (typeof window === "undefined") return null;
  
  const inviteKey = `dinner_invite_${familyId}`;
  const stored = localStorage.getItem(inviteKey);
  
  if (stored) {
    try {
      const data = JSON.parse(stored);
      return data.code;
    } catch (e) {
      return null;
    }
  }
  return null;
}

// 驗證邀請碼
export function verifyInviteCode(code: string): { valid: boolean; familyId?: string; familyName?: string } {
  if (typeof window === "undefined") {
    return { valid: false };
  }
  
  // 搵所有invite key
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith("dinner_invite_")) {
      try {
        const data = JSON.parse(localStorage.getItem(key)!);
        if (data.code === code.toUpperCase()) {
          return { valid: true, familyId: data.familyId, familyName: data.familyName };
        }
      } catch (e) {
        continue;
      }
    }
  }
  
  return { valid: false };
}

// 獲取家庭成員
export function getFamilyMembers(familyId: string): FamilyMember[] {
  if (typeof window === "undefined") return [];
  
  const membersKey = `dinner_members_${familyId}`;
  const stored = localStorage.getItem(membersKey);
  
  if (stored) {
    try {
      return JSON.parse(stored) as FamilyMember[];
    } catch (e) {
      return [];
    }
  }
  return [];
}

// 初始化演示數據（如果冇家庭既話）
export function initDemoData() {
  if (typeof window === "undefined") return;
  
  // 如果已經有家庭數據，就唔好初始化
  const state = loadAppState();
  if (state.familyId) return;
  
  // 檢查係咪已經初始化過
  const initKey = "dinner_demo_initialized";
  if (localStorage.getItem(initKey)) return;
  
  // 創建演示家庭
  const demoFamilyId = "fam_demo123";
  const demoMembers: FamilyMember[] = [
    {
      id: "mem_mom",
      displayName: "媽媽",
      role: "媽媽",
      isOwner: true,
      joinedAt: new Date().toISOString(),
    },
    {
      id: "mem_dad",
      displayName: "爸爸",
      role: "爸爸",
      isOwner: false,
      joinedAt: new Date().toISOString(),
    },
    {
      id: "mem_kid",
      displayName: "阿仔",
      role: "子女",
      isOwner: false,
      joinedAt: new Date().toISOString(),
    },
  ];
  
  // 保存成員
  localStorage.setItem(`dinner_members_${demoFamilyId}`, JSON.stringify(demoMembers));
  
  // 保存邀請碼
  const demoInvite = {
    code: "DEMO1",
    familyId: demoFamilyId,
    familyName: "陳家",
    createdBy: "mem_mom",
    createdAt: new Date().toISOString(),
  };
  localStorage.setItem(`dinner_invite_${demoFamilyId}`, JSON.stringify(demoInvite));
  
  // 設置今日回覆（部分人已回覆）
  const today = new Date().toISOString().split("T")[0];
  const demoResponses = {
    "mem_mom": "yes",
    "mem_dad": "unknown",
    "mem_kid": "yes",
  };
  localStorage.setItem(`dinner_responses_${demoFamilyId}_${today}`, JSON.stringify(demoResponses));
  
  // 記錄已初始化
  localStorage.setItem(initKey, "true");
  
  console.log("Demo data initialized!");
}
