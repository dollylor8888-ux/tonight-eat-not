"use client";

import { useState, useEffect } from "react";

type AddToHomeScreenProps = {
  variant?: "banner" | "button" | "inline";
};

export default function AddToHomeScreen({ variant = "inline" }: AddToHomeScreenProps) {
  const [isInstalled, setIsInstalled] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);

  useEffect(() => {
    // Check if already installed as PWA
    const nav = window.navigator as any;
    const isStandalone = 
      nav.standalone === true ||
      window.matchMedia("(display-mode: standalone)").matches;
    
    if (isStandalone) {
      setIsInstalled(true);
    }
  }, []);

  // Already installed - don't show anything
  if (isInstalled) {
    return null;
  }

  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
  const isAndroid = /Android/.test(navigator.userAgent);

  // Banner variant - shows at top of screen
  if (variant === "banner") {
    return (
      <div className="fixed top-0 left-0 right-0 z-50 bg-[#fff3df] border-b border-[#f5b041] px-4 py-2">
        <div className="mx-auto max-w-md flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-lg">📱</span>
            <span className="text-sm text-[#b66d00]">緊係想唔使用 App 呀？</span>
          </div>
          <button 
            onClick={() => setShowInstructions(true)}
            className="text-xs font-semibold text-[#b66d00] underline"
          >
            教學
          </button>
        </div>
        
        {showInstructions && (
          <AddToHomeScreenInstructions 
            onClose={() => setShowInstructions(false)} 
            isIOS={isIOS}
            isAndroid={isAndroid}
          />
        )}
      </div>
    );
  }

  // Button variant - compact button
  if (variant === "button") {
    return (
      <button
        onClick={() => setShowInstructions(true)}
        className="tap-feedback inline-flex items-center gap-2 rounded-xl border border-[#f5b041] bg-[#fff3df] px-4 py-2 text-sm font-semibold text-[#b66d00]"
      >
        📱 加到主畫面
      </button>
    );
  }

  // Inline variant - default, shows full instructions
  return (
    <>
      <button
        onClick={() => setShowInstructions(true)}
        className="tap-feedback mt-3 inline-flex items-center gap-2 rounded-xl border border-[#f5b041] bg-[#fff3df] px-4 py-2 text-sm font-semibold text-[#b66d00]"
      >
        📱 加到主畫面更好用
      </button>
      
      {showInstructions && (
        <AddToHomeScreenInstructions 
          onClose={() => setShowInstructions(false)} 
          isIOS={isIOS}
          isAndroid={isAndroid}
        />
      )}
    </>
  );
}

function AddToHomeScreenInstructions({ 
  onClose, 
  isIOS, 
  isAndroid 
}: { 
  onClose: () => void; 
  isIOS: boolean; 
  isAndroid: boolean;
}) {
  const [copied, setCopied] = useState(false);

  const copyLink = async () => {
    await navigator.clipboard.writeText(window.location.origin);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 px-4">
      <div className="w-full max-w-sm rounded-2xl bg-white p-5">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold">📱 加到主畫面</h3>
          <button onClick={onClose} className="text-2xl text-[#999] leading-none">×</button>
        </div>

        <div className="mt-4 space-y-4">
          {isIOS ? (
            <>
              <div className="flex gap-3">
                <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-[#fff3df] text-sm font-bold text-[#b66d00]">1</div>
                <div>
                  <p className="font-medium">Safari 度按「分享」</p>
                  <p className="text-sm text-[#666]">Click the Share button in Safari</p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-[#fff3df] text-sm font-bold text-[#b66d00]">2</div>
                <div>
                  <p className="font-medium">碌到最底搵「加到主畫面」</p>
                  <p className="text-sm text-[#666]">Scroll down and tap "Add to Home Screen"</p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-[#fff3df] text-sm font-bold text-[#b66d00]">3</div>
                <div>
                  <p className="font-medium">按「新增」就搞定！</p>
                  <p className="text-sm text-[#666]">Tap "Add" and you're done!</p>
                </div>
              </div>
            </>
          ) : isAndroid ? (
            <>
              <div className="flex gap-3">
                <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-[#fff3df] text-sm font-bold text-[#b66d00]">1</div>
                <div>
                  <p className="font-medium">Chrome 度按三點「...」</p>
                  <p className="text-sm text-[#666]">Tap the three dots in Chrome</p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-[#fff3df] text-sm font-bold text-[#b66d00]">2</div>
                <div>
                  <p className="font-medium">選擇「加到主畫面」</p>
                  <p className="text-sm text-[#666]">Select "Add to Home Screen"</p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-[#fff3df] text-sm font-bold text-[#b66d00]">3</div>
                <div>
                  <p className="font-medium">按「新增」就搞定！</p>
                  <p className="text-sm text-[#666]">Tap "Add" and you're done!</p>
                </div>
              </div>
            </>
          ) : (
            <div className="text-center">
              <p className="text-[#666]">用緊桌面電腦？</p>
              <p className="mt-2 text-sm text-[#888]">
                可以 bookmark 或者 create shortcut
              </p>
            </div>
          )}
        </div>

        <div className="mt-5 rounded-lg bg-[#f7f7f7] p-3">
          <p className="text-xs text-[#888]">或者複製網址：</p>
          <div className="mt-2 flex gap-2">
            <input 
              readOnly 
              value={typeof window !== 'undefined' ? window.location.origin : ''}
              className="flex-1 rounded-lg border border-[#ddd] bg-white px-3 py-2 text-sm"
            />
            <button 
              onClick={copyLink}
              className="rounded-lg bg-[#f5b041] px-4 py-2 text-sm font-bold text-white"
            >
              {copied ? "✅" : "複製"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
