"use client";

import { useEffect } from "react";

type ToastProps = {
  message: string;
  visible: boolean;
  onClose: () => void;
};

export default function Toast({ message, visible, onClose }: ToastProps) {
  useEffect(() => {
    if (!visible) {
      return;
    }

    const timer = window.setTimeout(onClose, 1500);
    return () => window.clearTimeout(timer);
  }, [visible, onClose]);

  if (!visible) {
    return null;
  }

  return (
    <div className="fixed bottom-24 left-1/2 z-50 w-[calc(100%-32px)] max-w-sm -translate-x-1/2 rounded-xl bg-black/90 px-4 py-3 text-center text-sm text-white">
      {message}
    </div>
  );
}
