import Link from "next/link";

const faqs = [
  {
    q: "會唔會收費？",
    a: "Web 版免費，想用 WhatsApp 自動提醒先至升級 Pro。",
  },
  {
    q: "要唔要下載 App？",
    a: "唔使下載，直接用網頁；你亦可以加到主畫面好似 App 咁用。",
  },
  {
    q: "點樣邀請家人？",
    a: "建立家庭後複製邀請連結，WhatsApp 一貼就得。",
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#fafafa] text-[#212121]">
      <header className="border-b border-[#ececec] bg-white">
        <div className="mx-auto flex h-14 w-full max-w-md items-center justify-between px-4">
          <div className="text-lg font-bold">🍚 今晚食唔食</div>
          <Link href="/login" className="tap-feedback rounded-xl bg-[#fff3df] px-4 py-2 text-sm font-semibold text-[#b66d00]">
            登入
          </Link>
        </div>
      </header>

      <main className="mx-auto w-full max-w-md space-y-6 px-4 py-6">
        <section className="card px-6 py-8">
          <h1 className="text-[22px] font-bold leading-[1.3]">🍚 今晚食唔食</h1>
          <p className="mt-3 text-base text-[#333]">1 秒回覆 · 媽媽一眼知煮幾多</p>
          <Link href="/login" className="tap-feedback mt-6 flex h-[52px] w-full items-center justify-center rounded-[14px] bg-[#f5b041] text-base font-bold text-white">
            立即開始（免費）
          </Link>
          <p className="mt-3 text-center text-[13px] text-[#444]">無需下載 App（可加到主畫面）</p>
        </section>

        <section className="card p-6">
          <h2 className="text-xl font-semibold">How it works</h2>
          <ol className="mt-4 space-y-3 text-base">
            <li>① 建家庭</li>
            <li>② 邀家人</li>
            <li>③ 每日 4PM 一按回覆</li>
          </ol>
        </section>

        <section className="card p-6">
          <h2 className="text-xl font-semibold">Social proof</h2>
          <p className="mt-3 text-base text-[#333]">已幫 XX 個香港家庭減少 WhatsApp 追問。</p>
        </section>

        <section className="card p-6">
          <h2 className="text-xl font-semibold">FAQ</h2>
          <div className="mt-4 space-y-4">
            {faqs.map((faq) => (
              <div key={faq.q}>
                <p className="text-base font-semibold">{faq.q}</p>
                <p className="mt-1 text-sm text-[#444]">{faq.a}</p>
              </div>
            ))}
          </div>
        </section>
      </main>

      <footer className="border-t border-[#ececec] bg-white py-4 text-center text-sm text-[#444]">
        私隱政策 · 條款 · 聯絡
      </footer>
    </div>
  );
}
