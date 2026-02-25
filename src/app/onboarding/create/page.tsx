"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { loadAppState, saveAppState } from "@/lib/store";
import { createFamily, getFamilyMembers, getTodayResponses, Family, FamilyMember } from "@/lib/auth";
import { supabase } from "@/lib/supabase";

export default function CreateFamilyPage() {
  const router = useRouter();
  const [familyName, setFamilyName] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  // Check auth on page load (only once)
  useEffect(() => {
    async function checkAuth() {
      // Check localStorage first
      const state = loadAppState();
      
      if (!state.loggedIn) {
        router.push("/login");
        return;
      }
      
      // Load display name from user metadata
      const { data: { user } } = await supabase.auth.getUser();
      if (user?.user_metadata?.display_name) {
        setDisplayName(user.user_metadata.display_name);
      }
      
      setLoading(false);
    }
    
    checkAuth();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleCreate() {
    if (!familyName.trim()) {
      setError("請輸入家庭名稱");
      return;
    }
    if (!displayName.trim()) {
      setError("請輸入顯示名稱");
      return;
    }
    
    setLoading(true);
    setError("");
    
    try {
      // 從 Supabase Auth 獲取 userId
      const { data: { user } } = await supabase.auth.getUser();
      const userId = user?.id;
      
      if (!userId) {
        setError("請先登入");
        setLoading(false);
        return;
      }
      
      // 使用 Supabase 創建家庭
      const { family, member, error: createError } = await createFamily(
        userId,
        familyName.trim(),
        displayName.trim()
      );
      
      if (createError) {
        setError(createError);
        setLoading(false);
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
      console.error("Create family error:", err);
      // Fallback to mock
      await createFamilyMock(familyName.trim(), displayName.trim(), "成員");
      router.push("/app/today");
    }
    
    setLoading(false);
  }

  // Mock 版本 (當 Supabase 不可用時)
  async function createFamilyMock(familyName: string, displayName: string, role: string) {
    const state = loadAppState();
    const { mockCreateFamily } = await import("@/lib/store");
    mockCreateFamily(familyName, displayName, role);
  }

  return (
    <main className="mx-auto min-h-screen w-full max-w-md bg-[#fafafa] px-4 py-8">
      <Link href="/onboarding" className="text-sm text-[#666]">
        ← 返回
      </Link>
      
      <h1 className="mt-2 text-[22px] font-bold">建立家庭</h1>
      <p className="mt-2 text-base text-[#444]">幫你既家庭改名</p>

      <section className="mt-6 card p-5 space-y-5">
        {/* 家庭名稱 */}
        <div>
          <label className="text-[13px] text-[#444]">家庭名稱</label>
          <input
            className="mt-2 h-12 w-full rounded-xl border border-[#ddd] bg-white px-4 text-base text-[#212121]"
            placeholder="例：陳家，李屋"
            value={familyName}
            onChange={(e) => {
              setFamilyName(e.target.value);
              setError("");
            }}
          />
          <p className="mt-1 text-xs text-[#888]">屋企人會見到呢個名</p>
        </div>

        {/* 你既名稱 */}
        <div>
          <label className="text-[13px] text-[#444]">你既名稱</label>
          <input
            className="mt-2 h-12 w-full rounded-xl border border-[#ddd] bg-white px-4 text-base text-[#212121]"
            placeholder="例：媽媽、阿敏"
            value={displayName}
            onChange={(e) => {
              setDisplayName(e.target.value);
              setError("");
            }}
          />
          <p className="mt-1 text-xs text-[#888]">呢個名會顯示俾其他家庭成員睇</p>
        </div>

        {error && <p className="text-[13px] text-[#e74c3c]">{error}</p>}

        <button
          onClick={handleCreate}
          disabled={loading}
          className="tap-feedback h-12 w-full rounded-[14px] bg-[#f5b041] text-base font-bold text-white disabled:opacity-60"
        >
          {loading ? "建立中..." : "建立家庭"}
        </button>
      </section>
    </main>
  );
}
