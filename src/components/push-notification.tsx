"use client";

import { useState, useEffect } from "react";

export default function PushNotificationManager() {
  const [permission, setPermission] = useState<NotificationPermission>("default");
  const [subscribed, setSubscribed] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    
    // Check current permission
    if ("Notification" in window) {
      setPermission(Notification.permission);
    }
    
    // Check if already subscribed
    if (localStorage.getItem("push_subscribed") === "true") {
      setSubscribed(true);
    }
  }, []);

  async function requestPermission() {
    if (!("Notification" in window)) {
      alert("呢個瀏覽器唔支援通知");
      return;
    }

    try {
      const result = await Notification.requestPermission();
      setPermission(result);
      
      if (result === "granted") {
        // Subscribe to push (in real app would send to server)
        localStorage.setItem("push_subscribed", "true");
        setSubscribed(true);
        alert("通知已開啟！每日 6:30pm 會提醒你");
      }
    } catch (error) {
      console.error("Notification permission error:", error);
    }
  }

  // Don't show if already granted
  if (permission === "granted") {
    return null;
  }

  return (
    <div className="fixed bottom-20 left-4 right-4 p-4 bg-white rounded-xl shadow-lg border border-[#ddd]">
      <div className="flex items-center justify-between">
        <div>
          <p className="font-semibold text-sm">開啟通知</p>
          <p className="text-xs text-[#666]">每日提醒你今日食唔食</p>
        </div>
        <button
          onClick={requestPermission}
          className="px-4 py-2 bg-[#f5b041] text-white text-sm font-bold rounded-lg"
        >
          {permission === "denied" ? "已封鎖" : "開啟"}
        </button>
      </div>
    </div>
  );
}
