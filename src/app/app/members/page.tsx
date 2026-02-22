"use client";

import { useState } from "react";
import { members } from "@/lib/mock-data";
import Toast from "@/components/toast";

export default function MembersPage() {
  const [toast, setToast] = useState("");
  const [shared, setShared] = useState(false);
  
  const inviteCode = "ABCD";
  const link = `https://dinner.hk/j/${inviteCode}`;
  const shareText = "加入我哋家庭，一齊今晚食唔食！🍚";

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
        window.setTimeout(() => setShared(false), 2000);
      } else {
        // Desktop fallback
        await navigator.clipboard.writeText(`${shareText} ${link}`);
        setToast("已複製邀請連結");
        window.setTimeout(() => setToast(""), 2000);
      }
    } catch (err) {
      // Fallback to copy
      await navigator.clipboard.writeText(link);
      setToast("已複製邀請連結");
    }
  }

  async function copyInvite() {
    await navigator.clipboard.writeText(link);
    setToast("已複製邀請連結");
  }

  return (
    <div>
      <h1 className="text-[22px] font-bold">成員</h1>

      <section className="mt-4 card overflow-hidden">
        {members.map((item) => (
          <div key={item.id} className="flex h-[60px] items-center justify-between border-b border-[#f0f0f0] px-4 last:border-b-0">
            <div>
              <p className="text-base font-medium">{item.displayName}</p>
              <p className="text-[13px] text-[#444]">{item.isOwner ? "👑 屋主" : "成員"}</p>
            </div>
            <button className="tap-feedback text-xl text-[#555]">⋯</button>
          </div>
        ))}
      </section>

      {/* 主 CTA: 一鍵分享 */}
      <button
        onClick={onShare}
        className="tap-feedback mt-4 flex h-12 w-full items-center justify-center gap-2 rounded-[14px] bg-[#25D366] text-base font-bold text-white"
      >
        📤 一鍵分享
      </button>

      {/* 次 CTA: 複製連結 */}
      <button
        onClick={copyInvite}
        className="tap-feedback mt-3 h-11 w-full rounded-[14px] border border-[#ddd] bg-white text-base font-semibold text-[#333]"
      >
        📋 複製連結
      </button>

      <Toast message={toast} visible={Boolean(toast)} onClose={() => setToast("")} />
    </div>
  );
}
