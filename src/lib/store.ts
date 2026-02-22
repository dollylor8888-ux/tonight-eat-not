// ==========================================
// App Store - localStorage 狀態管理
// 用於：建立家庭、登入狀態、currentFamily
// ==========================================

export type AppState = {
  // 用戶狀態
  loggedIn: boolean;
  phone: string | null;
  
  // 家庭狀態
  familyId: string | null;
  familyName: string | null;
  
  // 成員狀態
  memberId: string | null;
  displayName: string | null;
  isOwner: boolean;
};

const STORAGE_KEY = "dinner_app_state_v1";
const STATE_CHANGED_EVENT = "dinner_state_changed";

const defaultState: AppState = {
  loggedIn: false,
  phone: null,
  familyId: null,
  familyName: null,
  memberId: null,
  displayName: null,
  isOwner: false,
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
  });
}

// 模擬建立家庭（修正：P0 保留 loggedIn/phone，P2 用 crypto.randomUUID）
export function mockCreateFamily(familyName: string, displayName: string): AppState {
  const cur = loadAppState();
  const familyId = "fam_" + crypto.randomUUID();
  const memberId = "mem_" + crypto.randomUUID();
  
  return saveAppState({
    loggedIn: true,           // P0: 確保登入狀態
    phone: cur.phone,          // P0: 保留電話
    familyId,
    familyName,
    memberId,
    displayName,
    isOwner: true,
  });
}

// 模擬加入家庭（P2 用 crypto.randomUUID）
export function mockJoinFamily(familyId: string, familyName: string, displayName: string): AppState {
  const memberId = "mem_" + crypto.randomUUID();
  
  return saveAppState({
    loggedIn: true,           // P0: 確保登入狀態
    familyId,
    familyName,
    memberId,
    displayName,
    isOwner: false,
  });
}
