"use client";

import { useMemo, useState, useEffect } from "react";
import Toast from "@/components/toast";
import UpsellModal from "@/components/upsell-modal";
import InviteModal from "@/components/invite-modal";
import { loadAppState, getFamilyMembers as getFamilyMembersLocal } from "@/lib/store";
import { getFamilyMembers as getFamilyMembersSupabase, getTodayResponses as getTodayResponsesSupabase, submitResponse as submitResponseSupabase } from "@/lib/auth";

type MemberStatus = "yes" | "no" | "unknown";

type FamilyMember = {
  id: string;
  displayName: string;
  role: string;
  isOwner: boolean;
  joinedAt: string;
};

function statusClasses(status: MemberStatus) {
  if (status === "yes") {
    return "bg-[#e8f8f5] text-[#2ecc71]";
  }
  if (status === "no") {
    return "bg-[#fdedec] text-[#e74c3c]";
  }
  return "bg-[#f2f3f4] text-[#555]";
}

function initial(name: string) {
  return name?.slice(0, 1) || "?";
}

const statusLabel: Record<MemberStatus, string> = {
  yes: "會",
  no: "晤會",
  unknown: "未知",
};

const statusToken: Record<MemberStatus, string> = {
  yes: "✅",
  no: "❌",
  unknown: "⏰",
};

export default function TodayPage() {
  // 從 store 讀取用戶狀態
  const [appState, setAppState] = useState<{
    displayName: string | null;
    isOwner: boolean;
    familyId: string | null;
    memberId: string | null;
    userId: string | null;
  } | null>(null);
  
  const [toast, setToast] = useState("");
  const [showUpsell, setShowUpsell] = useState(false);
  const [showInvite, setShowInvite] = useState(false);
  
  // 家庭成員列表
  const [members, setMembers] = useState<FamilyMember[]>([]);
  
  // 今日回覆（從 localStorage 讀取）
  const [responses, setResponses] = useState<Record<string, MemberStatus>>({});

  // 加載數據
  useEffect(() => {
    const state = loadAppState();
    setAppState(state);
    
    async function loadData() {
      if (state.familyId) {
        // 嘗試使用 Supabase
        if (state.userId) {
          try {
            const [supabaseMembers, supabaseResponses] = await Promise.all([
              getFamilyMembersSupabase(state.familyId),
              getTodayResponsesSupabase(state.familyId),
            ]);
            
            if (supabaseMembers.length > 0) {
              setMembers(supabaseMembers);
              setResponses(supabaseResponses as Record<string, MemberStatus>);
              return;
            }
          } catch (err) {
            console.log("Supabase not available, using localStorage");
          }
        }
        
        // Fallback: 使用 localStorage
        const familyMembers = getFamilyMembersLocal(state.familyId);
        setMembers(familyMembers);
        
        // 讀取今日回覆
        const responseKey = `dinner_responses_${state.familyId}_${getTodayDate()}`;
        const storedResponses = localStorage.getItem(responseKey);
        if (storedResponses) {
          try {
            setResponses(JSON.parse(storedResponses));
          } catch (e) {
            console.error("Failed to parse responses:", e);
          }
        }
      }
    }
    
    loadData();
  }, []);

  // 合併成員 + 回覆狀態
  const membersWithStatus = useMemo(() => {
    return members.map(m => ({
      ...m,
      status: responses[m.id] || "unknown",
    }));
  }, [members, responses]);

  // 統計
  const counts = useMemo(() => {
    return {
      yes: membersWithStatus.filter((item) => item.status === "yes").length,
      no: membersWithStatus.filter((item) => item.status === "no").length,
      unknown: membersWithStatus.filter((item) => item.status === "unknown").length,
    };
  }, [membersWithStatus]);

  // 只有自己一個成員？
  const onlySelf = membersWithStatus.length === 1;
  
  // Badge 顯示邏輯
  const badgeText = onlySelf 
    ? "1/1 人" 
    : `${counts.unknown}人未回覆`;

  // 保存回覆到 localStorage 同 history
  function saveResponseToHistory(date: string, memberId: string, status: MemberStatus) {
    if (!appState?.familyId) return;
    
    const historyKey = `dinner_history_${appState.familyId}`;
    let history: any[] = [];
    
    // 讀取現有 history
    const stored = localStorage.getItem(historyKey);
    if (stored) {
      try {
        history = JSON.parse(stored);
      } catch (e) {
        history = [];
      }
    }
    
    // 搵到今日既 record
    let todayRecord = history.find((r: any) => r.date === date);
    
    if (!todayRecord) {
      // Create new record for today
      const [year, month, day] = date.split("-");
      const weekDays = ["日", "一", "二", "三", "四", "五", "六"];
      const weekDay = weekDays[new Date(date).getDay()];
      
      todayRecord = {
        id: `hist_${date}`,
        date: date,
        label: `${parseInt(month)}/${parseInt(day)}（${weekDay}）`,
        yes: 0,
        no: 0,
        unknown: 0,
      };
      history.push(todayRecord);
    }
    
    // 讀取之前既 response status (如果有的話)
    const prevResponsesKey = `dinner_responses_${appState.familyId}_${date}`;
    let prevResponses: Record<string, MemberStatus> = {};
    try {
      const prevStored = localStorage.getItem(prevResponsesKey);
      if (prevStored) {
        prevResponses = JSON.parse(prevStored);
      }
    } catch (e) {}
    
    const prevStatus = prevResponses[memberId] || "unknown";
    
    // Update counts: 先減去之前既 status
    if (prevStatus === "yes") todayRecord.yes--;
    else if (prevStatus === "no") todayRecord.no--;
    else if (prevStatus === "unknown") todayRecord.unknown--;
    
    // 再加上新既 status
    if (status === "yes") todayRecord.yes++;
    else if (status === "no") todayRecord.no++;
    else if (status === "unknown") todayRecord.unknown++;
    
    // 確保數字唔會變負數
    todayRecord.yes = Math.max(0, todayRecord.yes);
    todayRecord.no = Math.max(0, todayRecord.no);
    todayRecord.unknown = Math.max(0, todayRecord.unknown);
    
    // 保存 history
    localStorage.setItem(historyKey, JSON.stringify(history));
  }

  // 回覆功能
  async function reply(status: MemberStatus) {
    if (!appState?.memberId) return;
    
    // 更新本地狀態
    const newResponses = { ...responses, [appState.memberId]: status };
    setResponses(newResponses);
    
    // 嘗試使用 Supabase (使用 memberId)
    if (appState.familyId && appState.memberId) {
      try {
        await submitResponseSupabase(appState.familyId, appState.memberId, status);
      } catch (err) {
        console.log("Supabase not available, using localStorage only");
      }
    }
    
    // 保存到 localStorage (fallback)
    if (appState.familyId) {
      const responseKey = `dinner_responses_${appState.familyId}_${getTodayDate()}`;
      localStorage.setItem(responseKey, JSON.stringify(newResponses));
      
      // 保存到 history
      saveResponseToHistory(getTodayDate(), appState.memberId, status);
    }
    
    setToast(`已更新：${statusToken[status]} ${statusLabel[status]}`);
  }

  // 處理成員加入
  async function handleMemberJoined(name: string) {
    // 重新加載成員列表
    if (appState?.familyId) {
      // 嘗試使用 Supabase
      if (appState.userId) {
        try {
          const familyMembers = await getFamilyMembersSupabase(appState.familyId);
          setMembers(familyMembers);
        } catch (err) {
          // Fallback to localStorage
          const familyMembers = getFamilyMembersLocal(appState.familyId);
          setMembers(familyMembers);
        }
      } else {
        const familyMembers = getFamilyMembersLocal(appState.familyId);
        setMembers(familyMembers);
      }
    }
    setToast(`${name} 已加入家庭`);
  }

  // 獲取今日日期
  function getTodayDate() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }

  return (
    <>
      {/* Header with Badge */}
      <div className="flex items-center justify-between">
        <p className="text-lg font-bold">今晚（{getTodayDisplay()}）</p>
        <span className={`rounded-full px-2 py-1 text-xs font-medium ${
          onlySelf 
            ? "bg-[#fff3df] text-[#b66d00]" 
            : counts.unknown > 0 
              ? "bg-[#fdedec] text-[#e74c3c]"
              : "bg-[#e8f8f5] text-[#2ecc71]"
        }`}>
          {badgeText}
        </span>
      </div>

      <p className="mt-1 text-sm text-[#666]">
        目前：{counts.yes} 人 ✅ ｜{counts.no} 人 ❌ ｜{counts.unknown} 人 ⏰
      </p>

      {/* 成員列表 - 核心內容 */}
      <section className="mt-4 card overflow-hidden">
        {membersWithStatus.map((item) => (
          <div key={item.id} className="flex h-[60px] items-center justify-between border-b border-[#f0f0f0] px-4 last:border-b-0">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#fff3df] text-base font-semibold text-[#b66d00]">
                {initial(item.displayName)}
              </div>
              <div>
                <p className="text-base font-medium">
                  {item.displayName}
                  {item.isOwner && <span className="ml-1 text-xs text-[#f5b041]">👑</span>}
                </p>
              </div>
            </div>
            <span className={`inline-flex h-7 items-center rounded-[20px] px-3 text-sm font-semibold ${statusClasses(item.status)}`}>
              {statusToken[item.status]} {statusLabel[item.status]}
            </span>
          </div>
        ))}
        
        {members.length === 0 && (
          <div className="flex h-[60px] items-center justify-center text-[#888]">
            載入中...
          </div>
        )}
      </section>

      {/* Single Member Empty State - 香港口吻 */}
      {onlySelf && (
        <section className="mt-4 card border-l-4 border-[#f5b041] bg-[#fffbf0] p-4">
          <div className="flex items-start gap-3">
            <span className="text-xl">👨‍👩‍👧‍👦</span>
            <div className="flex-1">
              <p className="font-semibold">目前得你一個人用緊</p>
              <p className="mt-1 text-sm text-[#666]">
                邀請屋企人加入，一齊一按回覆更方便
              </p>
              <button
                onClick={() => setShowInvite(true)}
                className="tap-feedback mt-3 inline-block h-11 rounded-[14px] bg-[#f5b041] px-6 text-base font-bold text-white"
              >
                邀請成員
              </button>
            </div>
          </div>
        </section>
      )}

      {/* Pro 功能 - 非核心 */}
      <button
        onClick={() => setShowUpsell(true)}
        className="tap-feedback mt-4 inline-flex items-center gap-2 rounded-xl border border-dashed border-[#bbb] bg-white px-4 py-2 text-sm text-[#555]"
      >
        🔒 提醒未回覆（Pro）
      </button>

      {/* Sticky Bottom Bar - 核心回覆功能 */}
      <div className="fixed bottom-[78px] left-0 right-0 z-20 border-t border-[#ececec] bg-white px-4 py-3 shadow-[0_-2px_10px_rgba(0,0,0,0.05)]">
        <div className="mx-auto grid w-full max-w-md grid-cols-3 gap-2">
          <button onClick={() => reply("yes")} className="tap-feedback h-[52px] rounded-[14px] bg-[#2ecc71] text-base font-bold text-white">✅ 會</button>
          <button onClick={() => reply("no")} className="tap-feedback h-[52px] rounded-[14px] bg-[#e74c3c] text-base font-bold text-white">❌ 晤會</button>
          <button onClick={() => reply("unknown")} className="tap-feedback h-[52px] rounded-[14px] bg-[#7f8c8d] text-base font-bold text-white">⏰ 未知</button>
        </div>
      </div>

      {/* Modals */}
      <Toast message={toast} visible={Boolean(toast)} onClose={() => setToast("")} />
      <UpsellModal open={showUpsell} onClose={() => setShowUpsell(false)} />
      <InviteModal open={showInvite} onClose={() => setShowInvite(false)} onMemberJoined={handleMemberJoined} />
    </>
  );
}

// 獲取今日顯示
function getTodayDisplay() {
  const now = new Date();
  const month = now.getMonth() + 1;
  const day = now.getDate();
  const weekDays = ["日", "一", "二", "三", "四", "五", "六"];
  const weekDay = weekDays[now.getDay()];
  return `${month}月 ${day}日（${weekDay}）`;
}
