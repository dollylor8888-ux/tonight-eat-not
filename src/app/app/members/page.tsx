"use client";

import { useState, useEffect } from "react";
import { loadAppState, getFamilyMembers as getFamilyMembersLocal, getInviteCode } from "@/lib/store";
import { getFamilyMembers as getFamilyMembersSupabase, getInviteCodeSupabase } from "@/lib/auth";
import { getInviteLink } from "@/lib/utils";
import Toast from "@/components/toast";

type FamilyMember = {
  id: string;
  displayName: string;
  role: string;
  isOwner: boolean;
  joinedAt: string;
};

export default function MembersPage() {
  const [toast, setToast] = useState("");
  const [members, setMembers] = useState<FamilyMember[]>([]);
  const [inviteCode, setInviteCode] = useState("");
  const [loading, setLoading] = useState(true);

  // 讀取成員列表同邀請碼
  useEffect(() => {
    const state = loadAppState();
    
    async function loadData() {
      if (state.familyId) {
        // 嘗試使用 Supabase
        if (state.userId) {
          try {
            const [supabaseMembers, supabaseCode] = await Promise.all([
              getFamilyMembersSupabase(state.familyId),
              getInviteCodeSupabase(state.familyId),
            ]);
            
            if (supabaseMembers.length > 0) {
              setMembers(supabaseMembers);
              setInviteCode(supabaseCode || "");
              setLoading(false);
              return;
            }
          } catch (err) {
            console.log("Supabase not available, using localStorage");
          }
        }
        
        // Fallback: 使用 localStorage
        const familyMembers = getFamilyMembersLocal(state.familyId);
        setMembers(familyMembers);
        
        // 獲取邀請碼
        const code = getInviteCode(state.familyId);
        setInviteCode(code || "");
      }
      
      setLoading(false);
    }
    
    loadData();
  }, []);

  const link = inviteCode ? getInviteLink(inviteCode) : "";
  const shareText = link ? `加入我哋既家庭，一齊今晚食唔食！🍚 ${link}` : "";

  // Web Share API
  async function onShare() {
    try {
      if (navigator.share && shareText) {
        await navigator.share({
          title: "今晚食唔食",
          text: shareText,
          url: link,
        });
        setToast("已分享到 WhatsApp");
      } else {
        await navigator.clipboard.writeText(shareText);
        setToast("已複製連結");
      }
    } catch (err) {
      await navigator.clipboard.writeText(link);
      setToast("已複製連結");
    }
  }

  async function onCopy() {
    await navigator.clipboard.writeText(link);
    setToast("已複製連結");
  }

  if (loading) {
    return (
      <div>
        <h1 className="text-[22px] font-bold">家庭成員</h1>
        <p className="text-center text-[#888] mt-4">載入中...</p>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-[22px] font-bold">家庭成員</h1>

      {/* 成員列表 */}
      <section className="mt-4 card overflow-hidden">
        {members.map((member, index) => (
          <div 
            key={member.id} 
            className="flex items-center justify-between border-b border-[#f0f0f0] px-4 py-3 last:border-b-0"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#fff3df] text-base font-semibold text-[#b66d00]">
                {member.displayName?.slice(0, 1) || "?"}
              </div>
              <div>
                <p className="text-base font-medium">
                  {member.displayName}
                  {member.isOwner && <span className="ml-1 text-xs text-[#f5b041]">👑</span>}
                </p>
                <p className="text-xs text-[#888]">{member.role}</p>
              </div>
            </div>
            <span className="text-sm text-[#888]">#{index + 1}</span>
          </div>
        ))}
        
        {members.length === 0 && (
          <div className="px-4 py-8 text-center text-[#888]">
            暫時未有成員
          </div>
        )}
      </section>

      {/* 邀請連結 */}
      <section className="mt-4 card p-4">
        <h2 className="text-base font-semibold">邀請屋企人</h2>
        
        {inviteCode ? (
          <>
            <div className="mt-3">
              <p className="text-[13px] text-[#444]">邀請連結</p>
              <p className="mt-1 rounded-lg bg-[#f7f7f7] px-3 py-2 text-sm text-[#666] break-all">
                {link}
              </p>
            </div>

            <div className="mt-3 space-y-2">
              <button
                onClick={onShare}
                className="tap-feedback flex h-11 w-full items-center justify-center gap-2 rounded-[14px] bg-[#25D366] text-base font-semibold text-white"
              >
                📤 分享到 WhatsApp
              </button>

              <button
                onClick={onCopy}
                className="tap-feedback flex h-11 w-full items-center justify-center gap-2 rounded-[14px] border border-[#ddd] bg-white text-base font-semibold text-[#333]"
              >
                📋 複製連結
              </button>
            </div>
          </>
        ) : (
          <p className="mt-2 text-sm text-[#888]">載入中...</p>
        )}
      </section>

      <Toast message={toast} visible={Boolean(toast)} onClose={() => setToast("")} />
    </div>
  );
}
