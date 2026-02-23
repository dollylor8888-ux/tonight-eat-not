"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { loadAppState, clearAppState } from "@/lib/store";
import { signOut as signOutSupabase } from "@/lib/auth";
import AddToHomeScreen from "@/components/add-to-homescreen";

// 成員類型
type FamilyMember = {
  id: string;
  displayName: string;
  role: string;
  isOwner: boolean;
  joinedAt: string;
};

export default function SettingsPage() {
  const router = useRouter();
  const [time, setTime] = useState("17:00");
  const [members, setMembers] = useState<FamilyMember[]>([]);
  const [isOwner, setIsOwner] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showRemoveModal, setShowRemoveModal] = useState(false);
  const [memberToRemove, setMemberToRemove] = useState<FamilyMember | null>(null);
  const [phone, setPhone] = useState("");

  // 加載設置
  useEffect(() => {
    const state = loadAppState();
    setIsOwner(state.isOwner || false);
    setPhone(state.phone || "");
    
    // 從 localStorage 讀取通知時間
    if (state.familyId) {
      const timeKey = `dinner_notification_time_${state.familyId}`;
      const storedTime = localStorage.getItem(timeKey);
      if (storedTime) {
        setTime(storedTime);
      }
      
      // 從 localStorage 讀取成員列表
      const membersKey = `dinner_members_${state.familyId}`;
      const storedMembers = localStorage.getItem(membersKey);
      if (storedMembers) {
        try {
          const membersData = JSON.parse(storedMembers);
          setMembers(membersData);
        } catch (e) {
          console.error("Failed to parse members:", e);
        }
      }
    }
    
    setLoading(false);
  }, []);

  // 保存通知時間
  const handleTimeChange = (newTime: string) => {
    setTime(newTime);
    const state = loadAppState();
    if (state.familyId) {
      const timeKey = `dinner_notification_time_${state.familyId}`;
      localStorage.setItem(timeKey, newTime);
    }
  };

  // 踢除成員
  const handleRemoveMember = () => {
    if (!memberToRemove) return;
    
    const state = loadAppState();
    if (state.familyId) {
      const membersKey = `dinner_members_${state.familyId}`;
      const storedMembers = localStorage.getItem(membersKey);
      
      if (storedMembers) {
        try {
          const membersData: FamilyMember[] = JSON.parse(storedMembers);
          const updatedMembers = membersData.filter(m => m.id !== memberToRemove.id);
          localStorage.setItem(membersKey, JSON.stringify(updatedMembers));
          setMembers(updatedMembers);
        } catch (e) {
          console.error("Failed to remove member:", e);
        }
      }
    }
    
    setShowRemoveModal(false);
    setMemberToRemove(null);
  };

  // 離開家庭（非管理員）
  const handleLeaveFamily = () => {
    if (confirm("你確定要離開呢個家庭嗎？")) {
      clearAppState();
      router.push("/");
    }
  };

  // 登出
  const handleLogout = async () => {
    if (confirm("你確定要登出嗎？")) {
      try {
        await signOutSupabase();
      } catch (e) {
        // 忽略 Supabase 錯誤
      }
      clearAppState();
      router.push("/");
    }
  };

  if (loading) {
    return (
      <div className="space-y-4 pb-4">
        <h1 className="text-[22px] font-bold">設定</h1>
        <p className="text-center text-[#888]">載入中...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 pb-4">
      <h1 className="text-[22px] font-bold">設定</h1>

      {/* 通知時間 - 只有管理員可以改 */}
      <section className="card p-4">
        <h2 className="text-base font-semibold">通知時間</h2>
        
        {isOwner ? (
          <>
            <select
              value={time}
              onChange={(e) => handleTimeChange(e.target.value)}
              className="mt-3 h-12 w-full rounded-xl border border-[#ddd] bg-white px-4 text-base"
            >
              <option value="15:00">15:00</option>
              <option value="16:00">16:00</option>
              <option value="17:00">17:00</option>
              <option value="18:00">18:00</option>
              <option value="19:00">19:00</option>
              <option value="20:00">20:00</option>
            </select>
            <p className="mt-2 text-[13px] text-[#888]">
              每日提醒時間（只有你可以更改）
            </p>
          </>
        ) : (
          <>
            <p className="mt-3 text-base text-[#666]">{time}</p>
            <p className="mt-2 text-[13px] text-[#888]">
              只有管理員可以更改提醒時間
            </p>
          </>
        )}
        
        <AddToHomeScreen variant="button" />
        <p className="mt-2 text-[13px] text-[#888]">加到主畫面後可以收到通知</p>
      </section>

      {/* 家庭成員 - 只有管理員可以管理 */}
      <section className="card p-4">
        <h2 className="text-base font-semibold">家庭成員</h2>
        
        <div className="mt-3 space-y-2">
          {members.map((member) => (
            <div 
              key={member.id} 
              className="flex items-center justify-between rounded-lg bg-[#f5f5f5] p-3"
            >
              <div className="flex items-center gap-2">
                <span className="text-xl">{member.isOwner ? "👑" : "👤"}</span>
                <div>
                  <p className="text-base font-medium">
                    {member.displayName}
                    {member.isOwner && <span className="ml-2 text-xs text-[#f5b041]">管理員</span>}
                  </p>
                  <p className="text-xs text-[#888]">{member.role}</p>
                </div>
              </div>
              
              {/* 管理員先可以踢人，但唔可以踢自己 */}
              {isOwner && !member.isOwner && (
                <button
                  onClick={() => {
                    setMemberToRemove(member);
                    setShowRemoveModal(true);
                  }}
                  className="tap-feedback rounded-lg bg-[#fee2e2] px-3 py-1 text-sm text-[#EF4444]"
                >
                  踢出
                </button>
              )}
            </div>
          ))}
          
          {members.length === 0 && (
            <p className="text-sm text-[#888]">暫時未有其他成員</p>
          )}
        </div>
      </section>

      {/* 帳戶資訊 */}
      <section className="card p-4">
        <h2 className="text-base font-semibold">帳戶</h2>
        <p className="mt-2 text-sm text-[#444]">電話: {phone || "未設定"}</p>
      </section>

      {/* 離開家庭 - 非管理員先可以 */}
      {!isOwner && (
        <button 
          onClick={handleLeaveFamily}
          className="tap-feedback h-12 w-full rounded-[14px] border border-[#EF4444] text-base font-bold text-[#EF4444]"
        >
          離開家庭
        </button>
      )}

      {/* 登出按鈕 */}
      <button 
        onClick={handleLogout}
        className="tap-feedback h-12 w-full rounded-[14px] bg-[#212121] text-base font-bold text-white"
      >
        登出
      </button>

      {/* 踢除成員確認彈窗 */}
      {showRemoveModal && memberToRemove && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="mx-4 w-full max-w-sm rounded-2xl bg-white p-6">
            <h3 className="text-lg font-bold">踢除成員</h3>
            <p className="mt-2 text-[#666]">
              你確定要踢除「{memberToRemove.displayName}」嗎？
            </p>
            <p className="mt-1 text-sm text-[#888]">
              佢將會被移除出呢個家庭。
            </p>
            
            <div className="mt-6 flex gap-3">
              <button
                onClick={() => {
                  setShowRemoveModal(false);
                  setMemberToRemove(null);
                }}
                className="tap-feedback flex-1 h-12 rounded-xl border border-[#ddd] text-base font-medium"
              >
                取消
              </button>
              <button
                onClick={handleRemoveMember}
                className="tap-feedback flex-1 h-12 rounded-xl bg-[#EF4444] text-base font-bold text-white"
              >
                踢除
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
