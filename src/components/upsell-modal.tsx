"use client";

type UpsellModalProps = {
  open: boolean;
  onClose: () => void;
};

export default function UpsellModal({ open, onClose }: UpsellModalProps) {
  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/45 px-4">
      <div className="w-full max-w-sm rounded-[20px] bg-white p-6">
        <h3 className="text-lg font-bold">升級 WhatsApp Pro 🔔</h3>
        <p className="mt-2 text-sm text-[#333]">直接喺 WhatsApp 收提醒，媽媽唔使逐個問。</p>
        <ul className="mt-4 space-y-2 text-sm text-[#444]">
          <li>每日 4PM 自動提醒</li>
          <li>未回覆會自動追一次</li>
          <li>家庭多人都啱用</li>
        </ul>
        <p className="mt-4 text-sm font-semibold">HK$18/月（試用 7 日）</p>
        <button className="tap-feedback mt-5 h-12 w-full rounded-[14px] bg-[#f5b041] text-base font-bold text-white">
          立即升級
        </button>
        <button onClick={onClose} className="tap-feedback mt-3 w-full text-sm text-[#555]">
          先不用
        </button>
      </div>
    </div>
  );
}
