"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { mockJoinFamily } from "@/lib/store";

// Mock: 模擬 invite 查詢
type InviteInfo = {
  code: string;
  familyId: string;
  familyName: string;
  invitedBy: string;
};

const mockInviteCheck = (code: string): InviteInfo | null => {
  const invites: Record<string, InviteInfo> = {
    "ABCD": { code: "ABCD", familyId: "fam_abc123", familyName: "陳家", invitedBy: "Aaron" },
    "EFGH": { code: "EFGH", familyId: "fam_def456", familyName: "李家", invitedBy: "爸爸" },
  };
  return invites[code.toUpperCase()] || null;
};

export default function JoinFamilyPage() {
  const router = useRouter();
  const [step, setStep] = useState<"input" | "confirm" | "fill">("input");
  const [inviteCode, setInviteCode] = useState("");
  const [inviteInfo, setInviteInfo] = useState<InviteInfo | null>(null);
  const [displayName, setDisplayName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Step 1: 輸入邀請碼 → 查詢
  async function handleCheckInvite() {
    if (!inviteCode.trim()) {
      setError("請輸入邀請碼");
      return;
    }

    setLoading(true);
    await new Promise((r) => setTimeout(r, 300));
    
    const info = mockInviteCheck(inviteCode);
    if (!info) {
      setError("邀請碼無效，請確認後再輸入");
      setLoading(false);
      return;
    }

    setInviteInfo(info);
    setStep("confirm");
    setLoading(false);
  }

  // Step 2: 確認加入 → 填寫資料
  function handleConfirm() {
    setStep("fill");
  }

  // Step 3: 填寫顯示名稱 → 加入
  async function handleJoin() {
    if (!displayName.trim()) {
      setError("請輸入你既名稱");
      return;
    }

    setLoading(true);
    await new Promise((r) => setTimeout(r, 500));
    
    // ✅ 保存到 localStorage（傳入真正既 familyId）
    mockJoinFamily(inviteInfo!.familyId, inviteInfo!.familyName, displayName.trim());
    
    // P1: 用 useRouter 而非 window.location
    router.push("/app/today");
  }

  // ============ Step 1: 輸入邀請碼 ============
  if (step === "input") {
    return (
      <main className="mx-auto min-h-screen w-full max-w-md bg-[#fafafa] px-4 py-8">
        <Link href="/onboarding" className="text-sm text-[#666]">
          ← 返回
        </Link>
        
        <h1 className="mt-2 text-[22px] font-bold">加入家庭</h1>
        <p className="mt-2 text-base text-[#444]">輸入屋企人既邀請碼</p>

        <section className="mt-6 card p-5 space-y-5">
          <div>
            <label className="text-[13px] text-[#444]">邀請碼</label>
            <input
              className="mt-2 h-12 w-full rounded-xl border border-[#ddd] bg-white px-4 text-center text-xl text-[#212121] tracking-widest uppercase"
              placeholder="ABCD"
              value={inviteCode}
              onChange={(e) => {
                setInviteCode(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 6));
                setError("");
              }}
              maxLength={6}
            />
          </div>

          {error && (
            <p className="text-[13px] text-[#e74c3c]">{error}</p>
          )}

          <button
            onClick={handleCheckInvite}
            disabled={loading}
            className="tap-feedback h-12 w-full rounded-[14px] bg-[#f5b041] text-base font-bold text-white disabled:opacity-60"
          >
            {loading ? "檢查中..." : "下一步"}
          </button>
        </section>
      </main>
    );
  }

  // ============ Step 2: 確認加入 ============
  if (step === "confirm" && inviteInfo) {
    return (
      <main className="mx-auto min-h-screen w-full max-w-md bg-[#fafafa] px-4 py-8">
        <button onClick={() => setStep("input")} className="text-sm text-[#666]">
          ← 返回
        </button>
        
        <h1 className="mt-2 text-[22px] font-bold">確認加入</h1>

        <section className="mt-6 card p-6 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#fff3df] text-3xl">
            👨‍👩‍👧‍👦
          </div>
          <p className="text-lg font-semibold">
            你想加入 <span className="text-[#f5b041]">{inviteInfo.familyName}</span>
          </p>
          <p className="mt-2 text-sm text-[#666]">
            由 {inviteInfo.invitedBy} 邀請你
          </p>

          <button
            onClick={handleConfirm}
            className="tap-feedback mt-6 h-12 w-full rounded-[14px] bg-[#f5b041] text-base font-bold text-white"
          >
            確認加入
          </button>
        </section>
      </main>
    );
  }

  // ============ Step 3: 填寫顯示名稱 ============
  return (
    <main className="mx-auto min-h-screen w-full max-w-md bg-[#fafafa] px-4 py-8">
      <button onClick={() => setStep("confirm")} className="text-sm text-[#666]">
        ← 返回
      </button>
      
      <h1 className="mt-2 text-[22px] font-bold">加入 {inviteInfo?.familyName}</h1>
      <p className="mt-2 text-base text-[#444]">你既名稱</p>

      <section className="mt-6 card p-5 space-y-5">
        <div>
          <input
            className="h-12 w-full rounded-xl border border-[#ddd] bg-white px-4 text-base text-[#212121]"
            placeholder="你想其他人點稱呼你？"
            value={displayName}
            onChange={(e) => {
              setDisplayName(e.target.value);
              setError("");
            }}
          />
          <p className="mt-1 text-xs text-[#888]">呢個名會顯示俾其他家庭成員睇</p>
        </div>

        {error && (
          <p className="text-[13px] text-[#e74c3c]">{error}</p>
        )}

        <button
          onClick={handleJoin}
          disabled={loading}
          className="tap-feedback h-12 w-full rounded-[14px] bg-[#f5b041] text-base font-bold text-white disabled:opacity-60"
        >
          {loading ? "加入中..." : "確認加入"}
        </button>
      </section>
    </main>
  );
}
