"use client";

import { useState, useEffect } from "react";
import { loadAppState, getInviteCode } from "@/lib/store";

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
  
  // 從 store 讀取家庭資料
  useEffect(() => {
    if (open) {
      const state = loadAppState();
      setFamilyName(state.familyName || "屋企人");
      
      // 獲取邀請碼
      if (state.familyId) {
        const code = getInviteCode(state.familyId);
        setInviteCode(code || "");
      }
    }
  }, [open]);

  // 邀請連結
  const link = inviteCode ? `https://dinner.hk/j/${inviteCode}` : "";
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
        await navigator.clipboard.writeText(shareText);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    } catch (err) {
      await navigator.clipboard.writeText(link);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  async function onCopy() {
    await navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/45" 
        onClick={onClose}
      />
      
      {/* Modal Content */}
      <div className="relative w-full max-w-md rounded-t-[20px] bg-white p-6 sm:rounded-[20px] animate-slide-up">
        {/* Handle Bar (mobile only) */}
        <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-[#ddd] sm:hidden" />
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold">邀請屋企人</h2>
          <button 
            onClick={onClose}
            className="tap-feedback text-2xl text-[#999] leading-none"
          >
            ×
          </button>
        </div>

        <p className="mt-1 text-sm text-[#666]">
          加入「{familyName}」一齊用
        </p>

        {/* Invite Link */}
        <div className="mt-4">
          <p className="text-[13px] text-[#444]">邀請連結</p>
          <p className="mt-1 rounded-lg bg-[#f7f7f7] px-3 py-3 text-sm text-[#666] break-all">
            {link || "載入中..."}
          </p>
          {inviteCode && (
            <p className="mt-1 text-xs text-[#888]">邀請碼: {inviteCode}</p>
          )}
        </div>

        {/* Action Buttons */}
        <div className="mt-4 space-y-3">
          {/* Primary: Share */}
          <button
            onClick={onShare}
            disabled={!inviteCode}
            className="tap-feedback flex h-12 w-full items-center justify-center gap-2 rounded-[14px] bg-[#25D366] text-base font-bold text-white disabled:opacity-50"
          >
            {shared ? "✅ 已分享" : "📤 一鍵分享到 WhatsApp"}
          </button>

          {/* Secondary: Copy */}
          <button
            onClick={onCopy}
            disabled={!inviteCode}
            className="tap-feedback flex h-11 w-full items-center justify-center gap-2 rounded-[14px] border border-[#ddd] bg-white text-base font-semibold text-[#333] disabled:opacity-50"
          >
            {copied ? "✅ 已複製" : "📋 複製連結"}
          </button>
        </div>
      </div>
    </div>
  );
}
