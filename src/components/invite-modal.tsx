"use client";

import { useState, useEffect } from "react";
import { loadAppState, getInviteCode } from "@/lib/store";
import { getInviteLink } from "@/lib/utils";
import { supabase } from "@/lib/supabase";

type InviteModalProps = {
  open: boolean;
  onClose: () => void;
  onMemberJoined?: (name: string) => void;
};

export default function InviteModal({ open, onClose, onMemberJoined }: InviteModalProps) {
  const [copied, setCopied] = useState(false);
  const [shared, setShared] = useState(false);
  const [familyName, setFamilyName] = useState("");
  const [inviteCode, setInviteCode] = useState("");
  const [loading, setLoading] = useState(true);

  // 從 Supabase 讀取邀請碼
  useEffect(() => {
    async function fetchInviteCode() {
      if (open) {
        setLoading(true);
        const state = loadAppState();
        setFamilyName(state.familyName || "屋企人");
        
        if (state.familyId) {
          // 從 Supabase 獲取邀請碼
          const { data } = await supabase
            .from('invites')
            .select('code')
            .eq('family_id', state.familyId)
            .limit(1)
            .single();
          
          if (data?.code) {
            setInviteCode(data.code);
          } else {
            // Fallback to localStorage
            const code = getInviteCode(state.familyId);
            setInviteCode(code || "");
          }
        }
        setLoading(false);
      }
    }
    
    fetchInviteCode();
  }, [open]);

  // 邀請連結
  const link = inviteCode ? getInviteLink(inviteCode) : "";
  const shareText = inviteCode ? `加入我哋既家庭「${familyName}」，一齊今晚食唔食！🍚 ${link}` : "";

  if (!open) return null;

  // Web Share API
  async function onShare() {
    try {
      if (navigator.share) {
        await navigator.share({
          title: "今晚食唔食",
          text: shareText,
          url: link,
        });
        setShared(true);
        setTimeout(() => setShared(false), 2000);
      } else {
        // Fallback to clipboard
        copyToClipboard(link);
      }
    } catch (err) {
      console.error("Share error:", err);
    }
  }

  function copyToClipboard(text: string) {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={onClose}>
      <div className="w-full max-w-sm rounded-2xl bg-white p-6 mx-4" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">邀請屋企人</h2>
          <button onClick={onClose} className="text-2xl text-[#999]">×</button>
        </div>

        <p className="text-[#666] mb-4">加入「{familyName}」一齊用</p>

        <div className="mb-4">
          <p className="text-sm text-[#666] mb-2">邀請連結</p>
          {loading ? (
            <p className="text-[#999]">載入中...</p>
          ) : link ? (
            <p className="text-[#f5b041] font-medium break-all">{link}</p>
          ) : (
            <p className="text-[#999]">無法獲取邀請連結</p>
          )}
        </div>

        <div className="flex gap-3">
          <button
            onClick={onShare}
            disabled={!inviteCode}
            className="flex-1 h-12 rounded-xl bg-[#f5b041] text-white font-bold disabled:opacity-50"
          >
            {shared ? "已分享！" : "📤 一鍵分享到 WhatsApp"}
          </button>
          <button
            onClick={() => copyToClipboard(link)}
            disabled={!inviteCode}
            className="flex-1 h-12 rounded-xl border-2 border-[#f5b041] text-[#f5b041] font-bold disabled:opacity-50"
          >
            {copied ? "已複製！" : "📋 複製連結"}
          </button>
        </div>
      </div>
    </div>
  );
}
