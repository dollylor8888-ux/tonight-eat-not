import { historyRows } from "@/lib/mock-data";

export default function HistoryPage() {
  return (
    <div>
      <h1 className="text-[22px] font-bold">記錄（近 7 日）</h1>
      <section className="mt-4 card overflow-hidden">
        {historyRows.map((row) => (
          <div key={row.id} className="flex h-14 items-center justify-between border-b border-[#f0f0f0] px-4 last:border-b-0">
            <p className="text-base">{row.label}</p>
            <p className="text-sm text-[#444]">
              ✅{row.yes} ❌{row.no} ⏰{row.unknown}
            </p>
          </div>
        ))}
      </section>
    </div>
  );
}
