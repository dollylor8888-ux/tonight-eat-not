"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { loadAppState } from "@/lib/store";

const STATE_CHANGED_EVENT = "dinner_state_changed";

export default function AppTopBar() {
  const [familyName, setFamilyName] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // P1: 定義 sync 函數
    const syncState = () => {
      const state = loadAppState();
      setFamilyName(state.familyName);
      setLoading(false);
    };

    // 初始同步
    syncState();

    // P1: 監聽 storage 事件（跨 tab 更新）
    window.addEventListener("storage", syncState);
    
    // P1: 監聽自定事件（同一 tab 內更新）
    window.addEventListener(STATE_CHANGED_EVENT, syncState);

    return () => {
      window.removeEventListener("storage", syncState);
      window.removeEventListener(STATE_CHANGED_EVENT, syncState);
    };
  }, []);

  return (
    <header className="sticky top-0 z-20 border-b border-[#ececec] bg-[#fafafa]/95 backdrop-blur">
      <div className="mx-auto flex h-14 w-full max-w-md items-center justify-between px-4">
        <button className="tap-feedback rounded-full bg-white px-3 py-1 text-sm font-semibold shadow-sm">
          {loading ? "載入中..." : (familyName || "你的家庭")}
        </button>
        <Link
          href="/app/settings"
          className="tap-feedback flex h-10 w-10 items-center justify-center rounded-full bg-white text-lg shadow-sm"
          aria-label="設定"
        >
          ⚙️
        </Link>
      </div>
    </header>
  );
}
