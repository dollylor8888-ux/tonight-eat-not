"use client";

import { useState, useEffect } from "react";
import { loadAppState } from "@/lib/store";

type InviteModalProps = {
  open: boolean;
  onClose: () => void;
  onMemberJoined?: (name: string) => void;
};

export default function InviteModal({ open, onClose, onMemberJoined }: InviteModalProps) {
  const [copied, setCopied] = useState(false);
  const [shared, setShared] = useState(false);
  const [familyName, setFamilyName] = useState("");
  
  const inviteCode = "ABCD";
  const link = `https://dinner.hk/j/${inviteCode}`;
  const shareText = `加入我哋既家庭「${familyName}」，一齊今晚食唔食！🍚`;

  // 從 store 讀取家庭名稱
  useEffect(() => {
    if (open) {
      const state = loadAppState();
      setFamilyName(state.familyName || "屋企人");
    }
  }, [open]);

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
        await navigator.clipboard.writeText(`${shareText} ${link}`);
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

  // Mock: 模擬有人加入（測試用）
  function simulateJoin() {
    onMemberJoined?.("阿仔");
    onClose();
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
            {link}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="mt-4 space-y-3">
          {/* Primary: Share */}
          <button
            onClick={onShare}
            className="tap-feedback flex h-12 w-full items-center justify-center gap-2 rounded-[14px] bg-[#25D366] text-base font-bold text-white"
          >
            {shared ? "✅ 已分享" : "📤 一鍵分享到 WhatsApp"}
          </button>

          {/* Secondary: Copy */}
          <button
            onClick={onCopy}
            className="tap-feedback flex h-11 w-full items-center justify-center gap-2 rounded-[14px] border border-[#ddd] bg-white text-base font-semibold text-[#333]"
          >
            {copied ? "✅ 已複製" : "📋 複製連結"}
          </button>
        </div>

        {/* Dev: Simulate Join (remove in production) */}
        <button
          onClick={simulateJoin}
          className="tap-feedback mt-4 w-full text-center text-xs text-[#999]"
        >
          [開發者測試] 模擬有人加入
        </button>
      </div>
    </div>
  );
}
