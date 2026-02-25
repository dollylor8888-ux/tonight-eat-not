"use client";

import { useRouter } from "next/navigation";
import { use, useEffect, useState } from "react";
import Link from "next/link";
import { loadAppState, saveAppState } from "@/lib/store";
import { verifyInviteCode as verifyInviteCodeSupabase, joinFamilyByCode } from "@/lib/auth";
import { supabase } from "@/lib/supabase";

type InviteData = {
  code: string;
  familyName: string;
  familyId: string;
  valid: boolean;
};

export default function JoinPage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = use(params);
  const router = useRouter();
  
  const [invite, setInvite] = useState<InviteData | null>(null);
  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState<"confirm" | "form">("confirm");
  const [displayName, setDisplayName] = useState("");
  const [role, setRole] = useState("子女");
  const [error, setError] = useState("");
  const [joining, setJoining] = useState(false);

  // 檢查登入狀態
  const state = loadAppState();
  const isLoggedIn = state.loggedIn;
  const hasFamily = !!state.familyId;

  useEffect(() => {
    // 嘗試使用 Supabase 驗證邀請碼
    async function checkInvite() {
      try {
        const result = await verifyInviteCodeSupabase(code);
        
        if (result.valid && result.familyId && result.familyName) {
          setInvite({
            code: code.toUpperCase(),
            familyName: result.familyName!,
            familyId: result.familyId!,
            valid: true,
          });
        } else {
          // Fallback to localStorage
          const localResult = verifyInviteCodeLocal(code);
          if (localResult.valid) {
            setInvite({
              code: code.toUpperCase(),
              familyName: localResult.familyName!,
              familyId: localResult.familyId!,
              valid: true,
            });
          } else {
            setInvite(null);
          }
        }
      } catch (err) {
        // Fallback to localStorage
        const localResult = verifyInviteCodeLocal(code);
        if (localResult.valid) {
          setInvite({
            code: code.toUpperCase(),
            familyName: localResult.familyName!,
            familyId: localResult.familyId!,
            valid: true,
          });
        } else {
          setInvite(null);
        }
      }
      
      setLoading(false);
    }
    
    checkInvite();
  }, [code]);

  // Fallback: localStorage 驗證
  function verifyInviteCodeLocal(code: string): { valid: boolean; familyId?: string; familyName?: string } {
    if (typeof window === "undefined") return { valid: false };
    
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith("dinner_invite_")) {
        try {
          const data = JSON.parse(localStorage.getItem(key)!);
          if (data.code === code.toUpperCase()) {
            return { valid: true, familyId: data.familyId, familyName: data.familyName };
          }
        } catch (e) {
          continue;
        }
      }
    }
    return { valid: false };
  }

  // 未登入 → 導去登入
  useEffect(() => {
    if (!loading && !isLoggedIn) {
      const timer = setTimeout(() => {
        router.push(`/login?next=/j/${code}`);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [router, code, isLoggedIn, loading]);

  function handleConfirm() {
    setStep("form");
  }

  async function handleJoin() {
    if (!displayName.trim()) {
      setError("請輸入你既名稱");
      return;
    }

    if (!invite) {
      setError("邀請無效");
      return;
    }

    setJoining(true);
    setError("");

    try {
      // 從 Supabase Auth 獲取 userId
      const { data: { user } } = await supabase.auth.getUser();
      const userId = user?.id;
      
      if (!userId) {
        setError("請先登入");
        setJoining(false);
        return;
      }

      // 使用 Supabase RPC 加入家庭
      const { family, member, error: joinError } = await joinFamilyByCode(
        userId,
        invite.code,
        displayName.trim(),
        role
      );
      
      if (joinError) {
        setError(joinError);
        setJoining(false);
        return;
      }
      
      // 保存到 localStorage
      saveAppState({
        familyId: family!.id,
        familyName: family!.name,
        memberId: member!.id,
        displayName: member!.displayName,
        isOwner: member!.isOwner,
        role: member!.role,
      });
      
      router.push("/app/today");
    } catch (err: any) {
      // Fallback: 使用 localStorage
      await joinFamilyLocal(invite.familyId, invite.familyName, displayName.trim(), role);
      router.push("/app/today");
    }
    
    setJoining(false);
  }

  // Mock join (localStorage fallback)
  async function joinFamilyLocal(familyId: string, familyName: string, displayName: string, role: string) {
    const { mockJoinFamily } = await import("@/lib/store");
    mockJoinFamily(familyId, familyName, displayName, role);
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

  // 已經加入過呢個家庭 (檢查是否已加入這個特定的家庭)
  const isAlreadyMember = hasFamily && invite?.familyId === state.familyId;
  
  if (isAlreadyMember) {
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
              邀請碼: {invite.code}
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

  // 填寫資料畫面
  return (
    <main className="mx-auto min-h-screen w-full max-w-md bg-[#fafafa] px-4 py-10">
      <button onClick={() => setStep("confirm")} className="tap-feedback mb-2 text-sm text-[#666]">
        ← 返回
      </button>
      
      <h1 className="text-[22px] font-bold">加入 {invite.familyName}</h1>
      
      <section className="mt-4 card p-5 space-y-5">
        {/* 名稱輸入 */}
        <div>
          <label className="text-base text-[#444]">你既名稱</label>
          <input
            className="mt-2 h-12 w-full rounded-xl border border-[#ddd] bg-white px-4 text-base text-[#212121]"
            placeholder="你想其他人點稱呼你？"
            value={displayName}
            onChange={(e) => {
              setDisplayName(e.target.value);
              setError("");
            }}
          />
          <p className="mt-1 text-xs text-[#888]">呢個名會顯示俾其他家庭成員睇</p>
        </div>

        {/* 角色選擇 */}
        <div>
          <label className="text-base text-[#444]">你既角色</label>
          <div className="mt-2 grid grid-cols-4 gap-2">
            {["媽媽", "爸爸", "子女", "其他"].map((r) => (
              <button
                key={r}
                onClick={() => setRole(r)}
                className={`tap-feedback h-10 rounded-lg border text-sm font-medium ${
                  role === r
                    ? "border-[#f5b041] bg-[#fff3df] text-[#f5b041]"
                    : "border-[#ddd] text-[#666]"
                }`}
              >
                {r}
              </button>
            ))}
          </div>
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
