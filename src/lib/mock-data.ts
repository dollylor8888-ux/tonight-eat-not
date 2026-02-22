// ==========================================
// 數據結構優化 v4
// 最小結構：無 role 欄位
// ==========================================

export type MemberStatus = "yes" | "no" | "unknown";

// 用戶表
export type User = {
  id: string;
  phone: string;
  createdAt: string;
};

// 家庭表
export type Family = {
  id: string;
  name: string;
  createdBy: string;
  createdAt: string;
};

// 成員表（已簡化，無 role）
export type FamilyMember = {
  id: string;
  familyId: string;
  userId: string;
  displayName: string;
  isOwner: boolean;
  joinedAt: string;
};

// 每日回覆表（從 member 分離）
export type DailyResponse = {
  id: string;
  familyId: string;
  userId: string;
  date: string;
  status: MemberStatus;
  updatedAt: string;
};

// 邀請表
export type Invite = {
  code: string;
  familyId: string;
  createdBy: string;
  expiresAt: string;
  createdAt: string;
  usedBy: string | null;
};

// 歷史記錄
export type HistoryRow = {
  id: string;
  date: string;
  label: string;
  yes: number;
  no: number;
  unknown: number;
};

// ==========================================
// Mock 數據（單人家庭一致）
// ==========================================

// 成員列表：只有 1 個 owner
// 顯示名稱會由 store 動態提供，呢度係 fallback
export const members: FamilyMember[] = [
  { id: "m1", familyId: "f1", userId: "u1", displayName: "你自己", isOwner: true, joinedAt: "2026-01-01" },
];

// 今日回覆
export const todayResponses: Record<string, MemberStatus> = {
  u1: "unknown",
};

// ==========================================
// History 數據（與單人家庭一致）
// ==========================================
export const historyRows: HistoryRow[] = [
  // 單人家庭：每日只有 1 人unknown（自己未回覆）
  { id: "1", date: "2026-02-21", label: "2/21（五）", yes: 0, no: 0, unknown: 1 },
  { id: "2", date: "2026-02-20", label: "2/20（四）", yes: 1, no: 0, unknown: 0 },
  { id: "3", date: "2026-02-19", label: "2/19（三）", yes: 0, no: 0, unknown: 1 },
  { id: "4", date: "2026-02-18", label: "2/18（二）", yes: 1, no: 0, unknown: 0 },
  { id: "5", date: "2026-02-17", label: "2/17（一）", yes: 0, no: 1, unknown: 0 },
  { id: "6", date: "2026-02-16", label: "2/16（日）", yes: 1, no: 0, unknown: 0 },
  { id: "7", date: "2026-02-15", label: "2/15（六）", yes: 0, no: 0, unknown: 1 },
];

export const statusLabel: Record<MemberStatus, string> = {
  yes: "會",
  no: "唔會",
  unknown: "未知",
};

export const statusToken: Record<MemberStatus, string> = {
  yes: "✅",
  no: "❌",
  unknown: "⏰",
};

export function initial(name: string) {
  return name.slice(0, 1);
}

// 輔助函數：合併成員 + 今日回覆
export function getMembersWithStatus(
  members: FamilyMember[], 
  responses: Record<string, MemberStatus>
) {
  return members.map(m => ({
    ...m,
    status: responses[m.userId] || "unknown",
  }));
}
