"use client";

import { useMemo, useState, useEffect } from "react";
import Toast from "@/components/toast";
import UpsellModal from "@/components/upsell-modal";
import InviteModal from "@/components/invite-modal";
import { 
  initial, 
  members as initialMembers, 
  todayResponses,
  getMembersWithStatus,
  statusLabel, 
  statusToken, 
  type MemberStatus 
} from "@/lib/mock-data";
import { loadAppState } from "@/lib/store";

function statusClasses(status: MemberStatus) {
  if (status === "yes") {
    return "bg-[#e8f8f5] text-[#2ecc71]";
  }
  if (status === "no") {
    return "bg-[#fdedec] text-[#e74c3c]";
  }
  return "bg-[#f2f3f4] text-[#555]";
}

export default function TodayPage() {
  // 從 store 讀取用戶狀態
  const [appState, setAppState] = useState<{
    displayName: string | null;
    isOwner: boolean;
    familyId: string | null;
  } | null>(null);
  
  const [toast, setToast] = useState("");
  const [showUpsell, setShowUpsell] = useState(false);
  const [showInvite, setShowInvite] = useState(false);
  
  // 合併成員 + 今日回覆
  const [localResponses, setLocalResponses] = useState(todayResponses);
  
  const membersWithStatus = useMemo(() => {
    return getMembersWithStatus(initialMembers, localResponses);
  }, [localResponses]);

  // 用 store 度既 displayName 覆蓋
  useEffect(() => {
    const state = loadAppState();
    if (state.displayName) {
      // 更新 member 既 displayName
      initialMembers[0].displayName = state.displayName;
      initialMembers[0].isOwner = state.isOwner;
    }
    setAppState(state);
  }, []);

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

  function reply(status: MemberStatus) {
    setLocalResponses(prev => ({
      ...prev,
      u1: status,
    }));
    setToast(`已更新：${statusToken[status]} ${statusLabel[status]}`);
  }

  return (
    <>
      {/* Header with Badge */}
      <div className="flex items-center justify-between">
        <p className="text-lg font-bold">今晚（2 月 21 日｜五）</p>
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
          <button onClick={() => reply("no")} className="tap-feedback h-[52px] rounded-[14px] bg-[#e74c3c] text-base font-bold text-white">❌ 唔會</button>
          <button onClick={() => reply("unknown")} className="tap-feedback h-[52px] rounded-[14px] bg-[#7f8c8d] text-base font-bold text-white">⏰ 未知</button>
        </div>
      </div>

      {/* Modals */}
      <Toast message={toast} visible={Boolean(toast)} onClose={() => setToast("")} />
      <UpsellModal open={showUpsell} onClose={() => setShowUpsell(false)} />
      <InviteModal open={showInvite} onClose={() => setShowInvite(false)} onMemberJoined={(name) => {
        setToast(`${name} 已加入家庭`);
      }} />
    </>
  );
}
