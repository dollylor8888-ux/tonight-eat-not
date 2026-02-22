"use client";

import { useParams, useRouter } from "next/navigation";
import { use, useEffect, useState } from "react";
import Link from "next/link";

type InviteData = {
  code: string;
  familyName: string;
  invitedBy: string;
  valid: boolean;
  expired: boolean;
};

// Mock data - 實際會從 DB 查詢
const mockInvites: Record<string, InviteData> = {
  ABCD: {
    code: "ABCD",
    familyName: "陳家",
    invitedBy: "媽媽",
    valid: true,
    expired: false,
  },
  EFGH: {
    code: "EFGH",
    familyName: "李家",
    invitedBy: "爸爸",
    valid: true,
    expired: false,
  },
  EXPIRED: {
    code: "EXPIRED",
    familyName: "王家",
    invitedBy: "阿女",
    valid: false,
    expired: true,
  },
};

// Mock: 模擬當前登入用戶
const currentUser = {
  loggedIn: true,
  hasFamily: false,
  familyId: null,
};

export default function JoinPage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = use(params);
  const router = useRouter();
  
  const [invite, setInvite] = useState<InviteData | null>(null);
  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState<"confirm" | "form">("confirm");
  const [displayName, setDisplayName] = useState("");
  const [error, setError] = useState("");
  const [joining, setJoining] = useState(false);

  useEffect(() => {
    const data = mockInvites[code.toUpperCase()];
    if (data) {
      setInvite(data);
    }
    setLoading(false);
  }, [code]);

  // 未登入 → 導去登入
  useEffect(() => {
    if (!currentUser.loggedIn) {
      router.push(`/login?next=/j/${code}`);
    }
  }, [router, code]);

  const alreadyHasFamily = currentUser.hasFamily;

  function handleConfirm() {
    setStep("form");
  }

  async function handleJoin() {
    if (!displayName.trim()) {
      setError("請輸入你既名稱");
      return;
    }

    setJoining(true);
    
    // Mock: 調用 API 加入家庭
    // POST /api/family/join
    // { code, displayName }
    await new Promise((r) => setTimeout(r, 500));
    
    console.log("加入家庭:", { code, displayName });
    
    router.push("/app/today");
  }

  if (loading) {
    return (
      <main className="mx-auto min-h-screen w-full max-w-md bg-[#fafafa] px-4 py-10">
        <p className="text-center text-[#666]">載入中...</p>
      </main>
    );
  }

  // 邀請碼無效
  if (!invite || !invite.valid) {
    return (
      <main className="mx-auto min-h-screen w-full max-w-md bg-[#fafafa] px-4 py-10">
        <h1 className="text-[22px] font-bold">邀請已失效</h1>
        
        <section className="mt-6 card p-6 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#fdedec] text-3xl">
            ❌
          </div>
          <p className="text-[#666]">
            呢個邀請連結已經失效或者唔存在。
          </p>
          <p className="mt-3 text-sm text-[#888]">
            請聯絡屋企人重新發送邀請。
          </p>
          
          <Link href="/" className="tap-feedback mt-6 inline-block h-12 w-full rounded-[14px] bg-[#f5b041] text-base font-bold text-white leading-12">
            返回首頁
          </Link>
        </section>
      </main>
    );
  }

  // 邀請碼已過期
  if (invite.expired) {
    return (
      <main className="mx-auto min-h-screen w-full max-w-md bg-[#fafafa] px-4 py-10">
        <h1 className="text-[22px] font-bold">邀請已過期</h1>
        
        <section className="mt-6 card p-6 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#fdedec] text-3xl">
            ⏰
          </div>
          <p className="text-[#666]">
            呢個邀請已經過期。
          </p>
          <p className="mt-3 text-sm text-[#888]">
            請聯絡屋企人重新發送新既邀請。
          </p>
          
          <Link href="/" className="tap-feedback mt-6 inline-block h-12 w-full rounded-[14px] bg-[#f5b041] text-base font-bold text-white leading-12">
            返回首頁
          </Link>
        </section>
      </main>
    );
  }

  // 已經加入過呢個家庭
  if (alreadyHasFamily) {
    return (
      <main className="mx-auto min-h-screen w-full max-w-md bg-[#fafafa] px-4 py-10">
        <h1 className="text-[22px] font-bold">你已經係 {invite.familyName} 既成員</h1>
        
        <section className="mt-6 card p-6 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#e8f8f5] text-3xl">
            ✅
          </div>
          <p className="text-[#666]">
            你已經加入咗呢個家庭喇！
          </p>
          
          <Link href="/app/today" className="tap-feedback mt-6 inline-block h-12 w-full rounded-[14px] bg-[#f5b041] text-base font-bold text-white leading-12">
            去今日
          </Link>
        </section>
      </main>
    );
  }

  // 確認畫面
  if (step === "confirm") {
    return (
      <main className="mx-auto min-h-screen w-full max-w-md bg-[#fafafa] px-4 py-10">
        <h1 className="text-[22px] font-bold">加入家庭</h1>

        <section className="mt-6 card p-6">
          <div className="text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#fff3df] text-3xl">
              👨‍👩‍👧‍👦
            </div>
            <p className="text-lg font-semibold">
              你想加入 <span className="text-[#f5b041]">{invite.familyName}</span>
            </p>
            <p className="mt-2 text-sm text-[#666]">
              由 {invite.invitedBy} 邀請你
            </p>
          </div>

          <button
            onClick={handleConfirm}
            className="tap-feedback mt-6 h-12 w-full rounded-[14px] bg-[#f5b041] text-base font-bold text-white"
          >
            確認加入
          </button>

          <Link href="/login" className="tap-feedback mt-3 block text-center text-sm text-[#666]">
            先登入先
          </Link>
        </section>

        <p className="mt-6 text-center text-xs text-[#666]">
          加入後，你可以收到每日晚餐提醒
        </p>
      </main>
    );
  }

  // 填寫資料畫面（無角色選擇）
  return (
    <main className="mx-auto min-h-screen w-full max-w-md bg-[#fafafa] px-4 py-10">
      <button onClick={() => setStep("confirm")} className="tap-feedback mb-2 text-sm text-[#666]">
        ← 返回
      </button>
      
      <h1 className="text-[22px] font-bold">加入 {invite.familyName}</h1>
      <p className="mt-2 text-base text-[#444]">你既名稱</p>

      <section className="mt-4 card p-5 space-y-5">
        <div>
          <input
            className="h-12 w-full rounded-xl border border-[#ddd] bg-white px-4 text-base text-[#212121]"
            placeholder="你想其他人點称呼你？"
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
          disabled={joining}
          className="tap-feedback h-12 w-full rounded-[14px] bg-[#f5b041] text-base font-bold text-white disabled:opacity-60"
        >
          {joining ? "加入中..." : "確認加入"}
        </button>
      </section>
    </main>
  );
}
