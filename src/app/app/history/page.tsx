"use client";

import { useState, useEffect } from "react";
import { loadAppState } from "@/lib/store";

// 歷史記錄類型
type HistoryRow = {
  id: string;
  date: string;
  label: string;
  yes: number;
  no: number;
  unknown: number;
};

export default function HistoryPage() {
  const [historyRows, setHistoryRows] = useState<HistoryRow[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 從 localStorage 讀取歷史記錄
    const state = loadAppState();
    const storageKey = `dinner_history_${state.familyId}`;
    
    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem(storageKey);
        if (stored) {
          const data = JSON.parse(stored);
          // 按日期排序（最新的係前面）
          data.sort((a: HistoryRow, b: HistoryRow) => new Date(b.date).getTime() - new Date(a.date).getTime());
          // 只顯示最近30日
          const thirtyDaysAgo = new Date();
          thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
          const filtered = data.filter((row: HistoryRow) => new Date(row.date) >= thirtyDaysAgo);
          setHistoryRows(filtered);
        }
        // 如果冇數據，historyRows 保持空陣列（顯示 empty state）
      } catch (e) {
        console.error("Failed to load history:", e);
      }
    }
    
    setLoading(false);
  }, []);

  // Loading 狀態
  if (loading) {
    return (
      <div>
        <h1 className="text-[22px] font-bold">記錄（近 30 日）</h1>
        <div className="mt-4 flex justify-center py-10">
          <p className="text-[#888]">載入中...</p>
        </div>
      </div>
    );
  }

  // 空狀態 - 新用戶
  if (historyRows.length === 0) {
    return (
      <div>
        <h1 className="text-[22px] font-bold">記錄（近 30 日）</h1>
        
        <section className="mt-8 card p-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#f5f5f5] text-3xl">
            📋
          </div>
          <p className="text-base font-medium text-[#666]">
            暫時未有記錄
          </p>
          <p className="mt-2 text-sm text-[#888]">
            當你和屋企人開始回覆晚餐，就會顯示呢度
          </p>
        </section>
      </div>
    );
  }

  // 有數據既狀態
  return (
    <div>
      <h1 className="text-[22px] font-bold">記錄（近 30 日）</h1>
      
      <section className="mt-4 card overflow-hidden">
        {historyRows.map((row) => (
          <div key={row.id}>
            <div 
              className="flex h-14 items-center justify-between border-b border-[#f0f0f0] px-4 last:border-b-0 tap-feedback"
              onClick={() => setExpandedId(expandedId === row.id ? null : row.id)}
            >
              <p className="text-base">{row.label}</p>
              <div className="flex items-center gap-3">
                <p className="text-sm text-[#444]">
                  ✅{row.yes} ❌{row.no} ⏰{row.unknown}
                </p>
                <span className="text-[#888]">{expandedId === row.id ? "▲" : "▼"}</span>
              </div>
            </div>
            
            {/* 展開既詳細內容 */}
            {expandedId === row.id && (
              <div className="bg-[#fafafa] px-4 py-3 border-b border-[#f0f0f0]">
                <p className="text-sm text-[#666]">
                  總人數: {row.yes + row.no + row.unknown}
                </p>
                <p className="text-sm text-[#22C55E]">會食: {row.yes}人</p>
                <p className="text-sm text-[#EF4444]">晤會食: {row.no}人</p>
                <p className="text-sm text-[#F59E0B]">未決定: {row.unknown}人</p>
              </div>
            )}
          </div>
        ))}
      </section>
    </div>
  );
}
