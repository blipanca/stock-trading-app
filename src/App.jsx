import React, { useState, useMemo } from "react";
import {
  PieChart, ClipboardList, Wallet, X, Plus, Minus, Search,
  ArrowUpCircle, ArrowDownCircle, ChevronRight, TrendingUp, TrendingDown,
  AlertTriangle, Ban, UserCircle2, Mail
} from "lucide-react";
import { AreaChart, Area, ResponsiveContainer, YAxis } from "recharts";

const BG = "#0B0B0D";
const CARD = "#0F1012";
const BORDER = "#2A2B2E";
const TEXT = "#F2F2F3";
const MUTED = "#8B8D91";
const GREEN = "#00D26A";
const RED = "#FF5C5C";

const rupiah = (n) =>
  "Rp " + Math.round(n).toLocaleString("id-ID");

const num = (n) => Math.round(n).toLocaleString("id-ID");
const num2 = (n) => (Math.round(n * 100) / 100).toLocaleString("id-ID", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const DEMO_PROFILE_NAME = "Sukmono_82";

// Fictional illustrative trend: capital deployed 8 Apr 2026, a speculative bump
// around late May (WBSA spike), then a political-risk-driven drawdown into a
// trading suspension by 2 Jul 2026.
const EQUITY_TREND = [
  { v: 2000000000 }, { v: 2060000000 }, { v: 2260000000 }, { v: 2180000000 },
  { v: 1980000000 }, { v: 1800000000 }, { v: 1650000000 }, { v: 1568000000 },
];

const STOCK_UNIVERSE = [
  { code: "TLKM", name: "Telekomunikasi Indonesia", price: 3000, sector: "Telco" },
  { code: "BBRI", name: "Bank Rakyat Indonesia", price: 4550, sector: "Bank" },
  { code: "BBCA", name: "Bank Central Asia", price: 9825, sector: "Bank" },
  { code: "ASII", name: "Astra International", price: 5100, sector: "Otomotif" },
  { code: "ADRO", name: "Alamtri Resources", price: 2350, sector: "Energi" },
  { code: "WSKT", name: "Waskita Karya", price: 202, sector: "Konstruksi" },
  { code: "KAEF", name: "Kimia Farma", price: 985, sector: "Farmasi" },
  { code: "TRIO", name: "Trisula Textile Industries", price: 4650, sector: "Tekstil" },
  { code: "PGAS", name: "Perusahaan Gas Negara", price: 1620, sector: "Energi" },
  { code: "UNVR", name: "Unilever Indonesia", price: 3200, sector: "Konsumer" },
  { code: "WBSA", name: "Wahana Bumi Sukses Abadi (fiktif)", price: 290, sector: "Tambang" },
];

// Illustrative demo holdings: ~Rp 2 miliar deployed across 8-13 Apr 2026.
// Prices marked down by ~2 Jul 2026 to reflect a fictional political-risk selloff.
// WBSA illustrates a stock that spiked on speculation, then crashed drastically.
// ADRO is flagged "suspended" (frozen at last traded price) as part of the illustration.
const INITIAL_HOLDINGS = [
  { code: "BBCA", name: "Bank Central Asia", lots: 350, avgPrice: 9700, currentPrice: 8900 },
  { code: "BBRI", name: "Bank Rakyat Indonesia", lots: 800, avgPrice: 4750, currentPrice: 4000 },
  { code: "TLKM", name: "Telekomunikasi Indonesia", lots: 1350, avgPrice: 2800, currentPrice: 2400 },
  { code: "ASII", name: "Astra International", lots: 650, avgPrice: 5200, currentPrice: 4850 },
  { code: "ADRO", name: "Alamtri Resources", lots: 1450, avgPrice: 2300, currentPrice: 1450, suspended: true },
  { code: "WBSA", name: "Wahana Bumi Sukses Abadi (fiktif)", lots: 3000, avgPrice: 770, currentPrice: 290 },
];

// Ordered newest-first, matching how new transactions are prepended.
const INITIAL_HISTORY = [
  { id: 12, type: "suspend", label: "ADRO dihentikan sementara (suspensi) oleh BEI — volatilitas ekstrem", date: "2026-07-01 10:00" },
  { id: 11, type: "alert", label: "WBSA anjlok drastis setelah rencana ekspansi batal terwujud", date: "2026-06-27 08:00" },
  { id: 10, type: "alert", label: "Tekanan jual berlanjut di sektor perbankan & energi", date: "2026-06-24 08:00" },
  { id: 9, type: "alert", label: "Sentimen politik menekan pasar — IHSG melemah signifikan", date: "2026-06-16 08:00" },
  { id: 8, type: "alert", label: "WBSA melonjak tajam ditopang spekulasi ekspansi bisnis", date: "2026-05-20 08:00" },
  { id: 7, type: "buy", label: "Beli WBSA", code: "WBSA", lots: 3000, price: 770, amount: 231000000, date: "2026-04-13 14:00" },
  { id: 6, type: "buy", label: "Beli ADRO", code: "ADRO", lots: 1450, price: 2300, amount: 333500000, date: "2026-04-11 13:20" },
  { id: 5, type: "buy", label: "Beli ASII", code: "ASII", lots: 650, price: 5200, amount: 338000000, date: "2026-04-09 11:05" },
  { id: 4, type: "buy", label: "Beli TLKM", code: "TLKM", lots: 1350, price: 2800, amount: 378000000, date: "2026-04-09 09:50" },
  { id: 3, type: "buy", label: "Beli BBRI", code: "BBRI", lots: 800, price: 4750, amount: 380000000, date: "2026-04-08 10:42" },
  { id: 2, type: "buy", label: "Beli BBCA", code: "BBCA", lots: 350, price: 9700, amount: 339500000, date: "2026-04-08 10:30" },
  { id: 1, type: "deposit", label: "Setor Dana Awal", amount: 2000000000, date: "2026-04-08 09:15" },
];

function computeHolding(h) {
  const invested = h.lots * 100 * h.avgPrice;
  const marketValue = h.lots * 100 * h.currentPrice;
  const pnl = marketValue - invested;
  const pnlPct = invested ? (pnl / invested) * 100 : 0;
  return { ...h, invested, marketValue, pnl, pnlPct };
}

function SimBanner() {
  return (
    <div className="flex items-center justify-center gap-2 py-1.5 text-[11px] font-semibold tracking-wide"
      style={{ background: "#3A2A0A", color: "#F5C244" }}>
      <AlertTriangle size={13} /> Safe Mode — 
    </div>
  );
}

function TickerRibbon() {
  const items = STOCK_UNIVERSE.concat(STOCK_UNIVERSE);
  return (
    <div className="overflow-hidden border-b" style={{ background: CARD, borderColor: BORDER }}>
      <div className="flex gap-6 py-1.5 px-4 whitespace-nowrap animate-[ticker_28s_linear_infinite]">
        {items.map((s, i) => {
          const up = i % 3 !== 0;
          return (
            <span key={i} className="text-xs font-medium flex items-center gap-1" style={{ color: MUTED }}>
              {s.code}
              <span style={{ color: up ? GREEN : RED }}>
                {rupiah(s.price)} {up ? "▲" : "▼"}
              </span>
            </span>
          );
        })}
      </div>
      <style>{`@keyframes ticker { from { transform: translateX(0); } to { transform: translateX(-50%); } }`}</style>
    </div>
  );
}

function Modal({ title, onClose, children }) {
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60">
      <div className="w-full sm:max-w-sm sm:rounded-2xl rounded-t-2xl max-h-[90vh] overflow-y-auto border"
        style={{ background: CARD, borderColor: BORDER }}>
        <div className="flex items-center justify-between px-5 py-4 border-b sticky top-0" style={{ borderColor: BORDER, background: CARD }}>
          <h3 className="font-semibold text-base" style={{ color: TEXT }}>{title}</h3>
          <button onClick={onClose} className="p-1 rounded-full" style={{ background: "#1C1D20" }}>
            <X size={18} color={MUTED} />
          </button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
}

function StatCell({ label, value, color }) {
  return (
    <div>
      <p className="text-sm font-semibold" style={{ color: color || TEXT }}>{value}</p>
      <p className="text-[11px] mt-0.5" style={{ color: MUTED }}>{label}</p>
    </div>
  );
}

export default function App() {
  const [tab, setTab] = useState("portfolio");
  const [cash, setCash] = useState(0);
  const [holdings, setHoldings] = useState(INITIAL_HOLDINGS);
  const [history, setHistory] = useState(INITIAL_HISTORY);
  const [modal, setModal] = useState(null); // 'buy' | 'sell' | 'deposit' | 'withdraw' | 'browse'
  const [activeStock, setActiveStock] = useState(null);
  const [lots, setLots] = useState(1);
  const [nominal, setNominal] = useState(5000000);
  const [buySearch, setBuySearch] = useState("");
  const [historyFilter, setHistoryFilter] = useState("all");

  const computed = useMemo(() => holdings.map(computeHolding), [holdings]);
  const invested = computed.reduce((a, h) => a + h.invested, 0);
  const marketValue = computed.reduce((a, h) => a + h.marketValue, 0);
  const totalPnl = marketValue - invested;
  const totalPnlPct = invested ? (totalPnl / invested) * 100 : 0;
  const totalEquity = cash + marketValue;
  const openPositions = computed.filter((h) => h.lots > 0).length;

  function pushHistory(entry) {
    setHistory((h) => [{ id: Date.now(), date: "2026-07-07 " + new Date().toLocaleTimeString("id-ID").slice(0, 5), ...entry }, ...h]);
  }

  function openBuy(stock) {
    setActiveStock(stock);
    setLots(1);
    setModal("buy");
  }
  function openSell(holding) {
    setActiveStock(holding);
    setLots(1);
    setModal("sell");
  }

  function confirmBuy() {
    const total = lots * 100 * activeStock.price;
    if (total > cash) return;
    setCash((c) => c - total);
    setHoldings((prev) => {
      const existing = prev.find((h) => h.code === activeStock.code);
      if (existing) {
        const newLots = existing.lots + lots;
        const newAvg = (existing.lots * existing.avgPrice + lots * activeStock.price) / newLots;
        return prev.map((h) => h.code === activeStock.code ? { ...h, lots: newLots, avgPrice: newAvg, currentPrice: activeStock.price } : h);
      }
      return [...prev, { code: activeStock.code, name: activeStock.name, lots, avgPrice: activeStock.price, currentPrice: activeStock.price }];
    });
    pushHistory({ type: "buy", label: `Beli ${activeStock.code}`, code: activeStock.code, lots, price: activeStock.price, amount: total });
    setModal(null);
  }

  function confirmSell() {
    const total = lots * 100 * activeStock.currentPrice;
    setCash((c) => c + total);
    setHoldings((prev) => prev
      .map((h) => h.code === activeStock.code ? { ...h, lots: h.lots - lots } : h)
      .filter((h) => h.lots > 0));
    pushHistory({ type: "sell", label: `Jual ${activeStock.code}`, code: activeStock.code, lots, price: activeStock.currentPrice, amount: total });
    setModal(null);
  }

  function confirmDeposit() {
    setCash((c) => c + nominal);
    pushHistory({ type: "deposit", label: "Setor Dana", amount: nominal });
    setModal(null);
  }

  function confirmWithdraw() {
    if (nominal > cash) return;
    setCash((c) => c - nominal);
    pushHistory({ type: "withdraw", label: "Tarik Dana", amount: nominal });
    setModal(null);
  }

  const filteredHistory = history.filter((h) => historyFilter === "all" || h.type === historyFilter);
  const filteredUniverse = STOCK_UNIVERSE.filter((s) =>
    (s.code + s.name).toLowerCase().includes(buySearch.toLowerCase())
  );

  function buildLogMailto() {
    const lines = [];
    lines.push("=== Safe Mode —  ===");
    lines.push(`Akun: ${DEMO_PROFILE_NAME}`);
    lines.push("Diekspor pada: 7 Juli 2026");
    lines.push("");
    lines.push("Riwayat Transaksi (kronologis):");
    [...history].reverse().forEach((h) => {
      let line = `${h.date} — ${h.label}`;
      if (h.lots) line += ` (${h.lots} lot @ ${num(h.price)})`;
      if (h.amount != null) line += ` : ${h.type === "withdraw" ? "-" : "+"}${num(h.amount)}`;
      lines.push(line);
    });
    lines.push("");
    lines.push("Catatan: Dokumen ini adalah ilustrasi/simulasi, bukan catatan transaksi riil.");
    const subject = encodeURIComponent(`[SIMULASI/FIKTIF] Log Transaksi — ${DEMO_PROFILE_NAME}`);
    const body = encodeURIComponent(lines.join("\n"));
    return `mailto:?subject=${subject}&body=${body}`;
  }

  const iconFor = (type) => {
    if (type === "buy") return <ArrowUpCircle size={20} color={GREEN} />;
    if (type === "sell") return <ArrowDownCircle size={20} color={RED} />;
    if (type === "deposit") return <TrendingUp size={20} color="#4EA1FF" />;
    if (type === "withdraw") return <TrendingDown size={20} color="#F5A524" />;
    if (type === "suspend") return <Ban size={20} color={RED} />;
    return <AlertTriangle size={20} color="#F5A524" />;
  };

  return (
    <div className="min-h-screen flex flex-col" style={{ background: BG, fontFamily: "Inter, system-ui, sans-serif" }}>
      <SimBanner />
      <TickerRibbon />

      <div className="flex items-center gap-2 px-5 pt-4 pb-2">
        <UserCircle2 size={22} color={MUTED} />
        <span className="text-sm font-medium" style={{ color: TEXT }}>{DEMO_PROFILE_NAME}</span>
      </div>

      <div className="flex-1 overflow-y-auto pb-20">
        {tab === "portfolio" && (
          <div className="px-4">
            <div className="rounded-xl border px-4 py-4 mb-4" style={{ background: CARD, borderColor: BORDER }}>
              <div className="grid grid-cols-3 gap-2">
                <StatCell label="Saldo Tunai" value={num2(cash)} />
                <StatCell label="Invested" value={num2(invested)} />
                <StatCell label="Open" value={openPositions} />
              </div>
              <div className="grid grid-cols-3 gap-2 mt-4">
                <StatCell label="P&L" value={(totalPnl >= 0 ? "+" : "") + num2(totalPnl)} color={totalPnl >= 0 ? GREEN : RED} />
                <StatCell label={totalPnlPct >= 0 ? "Gain" : "Loss"} value={totalPnlPct.toFixed(2) + "%"} color={totalPnl >= 0 ? GREEN : RED} />
                <StatCell label="Total Equity" value={num2(totalEquity)} />
              </div>
              <div className="h-14 mt-3 -mx-1">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={EQUITY_TREND}>
                    <defs>
                      <linearGradient id="eq" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={totalPnl >= 0 ? GREEN : RED} stopOpacity={0.45} />
                        <stop offset="100%" stopColor={totalPnl >= 0 ? GREEN : RED} stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <YAxis hide domain={["dataMin - 2000000", "dataMax + 2000000"]} />
                    <Area type="monotone" dataKey="v" stroke={totalPnl >= 0 ? GREEN : RED} strokeWidth={2} fill="url(#eq)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
              <button className="w-full flex items-center justify-between pt-3 mt-2 border-t" style={{ borderColor: BORDER }}>
                <span className="flex items-center gap-2 text-sm" style={{ color: TEXT }}>
                  <TrendingUp size={15} color={MUTED} /> Lihat Performa
                </span>
                <ChevronRight size={16} color={MUTED} />
              </button>
            </div>

            <div className="flex items-center justify-between mb-2">
              <h2 className="font-semibold text-sm" style={{ color: TEXT }}>Saham Dimiliki</h2>
              <button
                onClick={() => setModal("browse")}
                className="text-xs font-semibold px-3 py-1.5 rounded-full"
                style={{ background: GREEN, color: "#052E17" }}
              >
                + Beli Saham
              </button>
            </div>

            <div className="rounded-xl border overflow-hidden divide-y" style={{ background: CARD, borderColor: BORDER, borderColorDivide: BORDER }}>
              {computed.map((h) => (
                <div key={h.code} className="px-4 py-3" style={{ borderColor: BORDER }}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <p className="font-semibold text-sm" style={{ color: TEXT }}>{h.code}</p>
                      {h.suspended && (
                        <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded" style={{ background: "#3A1414", color: RED }}>
                          SUSPENSI BEI
                        </span>
                      )}
                    </div>
                    <div className="flex gap-1.5">
                      {h.suspended ? (
                        <span className="px-2.5 py-1 rounded-md text-xs font-medium" style={{ color: MUTED, background: "#1C1D20" }}>
                          Diberhentikan
                        </span>
                      ) : (
                        <>
                          <button onClick={() => openBuy({ code: h.code, name: h.name, price: h.currentPrice })}
                            className="px-2.5 py-1 rounded-md text-xs font-semibold" style={{ background: GREEN, color: "#052E17" }}>
                            Beli
                          </button>
                          <button onClick={() => openSell(h)}
                            className="px-2.5 py-1 rounded-md text-xs font-semibold text-white" style={{ background: RED }}>
                            Jual
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-2 mt-2">
                    <div>
                      <p className="text-sm" style={{ color: TEXT }}>{num2(h.invested)}</p>
                      <p className="text-[11px]" style={{ color: MUTED }}>Invested</p>
                    </div>
                    <div>
                      <p className="text-sm" style={{ color: h.pnl >= 0 ? GREEN : RED }}>{(h.pnl >= 0 ? "+" : "") + num2(h.pnl)}</p>
                      <p className="text-[11px]" style={{ color: MUTED }}>P&amp;L</p>
                    </div>
                    <div>
                      <p className="text-sm" style={{ color: h.pnl >= 0 ? GREEN : RED }}>{h.pnlPct.toFixed(2)}%</p>
                      <p className="text-[11px]" style={{ color: MUTED }}>{h.pnl >= 0 ? "Gain" : "Loss"}</p>
                    </div>
                  </div>
                  <p className="text-[11px] mt-1" style={{ color: MUTED }}>{h.lots} lot · avg {num(h.avgPrice)}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === "history" && (
          <div className="px-4">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-semibold text-base" style={{ color: TEXT }}>Riwayat Transaksi</h2>
              <a
                href={buildLogMailto()}
                className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full"
                style={{ background: "#1C1D20", color: TEXT, border: `1px solid ${BORDER}` }}
              >
                <Mail size={13} /> Kirim ke Email
              </a>
            </div>
            <p className="text-[11px] mb-3" style={{ color: MUTED }}>
              Email akan menyertakan label "SIMULASI / DATA FIKTIF" di judul dan isi pesan.
            </p>
            <div className="flex gap-2 mb-3 overflow-x-auto">
              {[
                { k: "all", l: "Semua" }, { k: "buy", l: "Beli" }, { k: "sell", l: "Jual" },
                { k: "deposit", l: "Setor" }, { k: "withdraw", l: "Tarik" },
                { k: "alert", l: "Info Pasar" }, { k: "suspend", l: "Suspensi" },
              ].map((f) => (
                <button
                  key={f.k}
                  onClick={() => setHistoryFilter(f.k)}
                  className="px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap"
                  style={historyFilter === f.k
                    ? { background: GREEN, color: "#052E17" }
                    : { background: CARD, color: MUTED, border: `1px solid ${BORDER}` }}
                >
                  {f.l}
                </button>
              ))}
            </div>
            <div className="rounded-xl border divide-y" style={{ background: CARD, borderColor: BORDER }}>
              {filteredHistory.length === 0 && (
                <p className="text-sm text-center py-8" style={{ color: MUTED }}>Belum ada transaksi.</p>
              )}
              {filteredHistory.map((h) => (
                <div key={h.id} className="flex items-center gap-3 px-4 py-3" style={{ borderColor: BORDER }}>
                  {iconFor(h.type)}
                  <div className="flex-1">
                    <p className="text-sm font-medium" style={{ color: TEXT }}>{h.label}</p>
                    <p className="text-[11px]" style={{ color: MUTED }}>
                      {h.lots ? `${h.lots} lot @ ${num(h.price)} · ` : ""}{h.date}
                    </p>
                  </div>
                  {h.amount != null && (
                    <p className="text-sm font-semibold" style={{ color: h.type === "sell" || h.type === "deposit" ? GREEN : (h.type === "withdraw" ? RED : TEXT) }}>
                      {h.type === "withdraw" ? "-" : "+"}{num(h.amount)}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === "wallet" && (
          <div className="px-4">
            <div className="rounded-xl border p-5" style={{ background: CARD, borderColor: BORDER }}>
              <p className="text-xs" style={{ color: MUTED }}>Saldo Tunai</p>
              <p className="text-2xl font-bold mt-1" style={{ color: TEXT }}>{rupiah(cash)}</p>
              <div className="flex gap-3 mt-4">
                <button onClick={() => { setNominal(5000000); setModal("deposit"); }}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-sm font-semibold"
                  style={{ background: GREEN, color: "#052E17" }}>
                  <ArrowUpCircle size={16} /> Setor
                </button>
                <button onClick={() => { setNominal(1000000); setModal("withdraw"); }}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-sm font-semibold"
                  style={{ background: "#1C1D20", color: TEXT, border: `1px solid ${BORDER}` }}>
                  <ArrowDownCircle size={16} /> Tarik
                </button>
              </div>
            </div>
            <h3 className="font-semibold text-sm mt-5 mb-2" style={{ color: TEXT }}>Aktivitas Dompet Terbaru</h3>
            <div className="rounded-xl border divide-y" style={{ background: CARD, borderColor: BORDER }}>
              {history.filter((h) => h.type === "deposit" || h.type === "withdraw").slice(0, 5).map((h) => (
                <div key={h.id} className="flex items-center gap-3 px-4 py-3" style={{ borderColor: BORDER }}>
                  {iconFor(h.type)}
                  <div className="flex-1">
                    <p className="text-sm font-medium" style={{ color: TEXT }}>{h.label}</p>
                    <p className="text-[11px]" style={{ color: MUTED }}>{h.date}</p>
                  </div>
                  <p className="text-sm font-semibold" style={{ color: h.type === "deposit" ? GREEN : RED }}>
                    {h.type === "withdraw" ? "-" : "+"}{num(h.amount)}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="fixed bottom-0 left-0 right-0 border-t flex justify-around py-2" style={{ background: CARD, borderColor: BORDER }}>
        {[
          { k: "portfolio", l: "Portofolio", icon: PieChart },
          { k: "history", l: "Riwayat", icon: ClipboardList },
          { k: "wallet", l: "Dompet", icon: Wallet },
        ].map((t) => (
          <button key={t.k} onClick={() => setTab(t.k)} className="flex flex-col items-center gap-0.5 px-4">
            <t.icon size={20} color={tab === t.k ? GREEN : MUTED} />
            <span className="text-[11px] font-medium" style={{ color: tab === t.k ? GREEN : MUTED }}>{t.l}</span>
          </button>
        ))}
      </div>

      {modal === "browse" && (
        <Modal title="Beli Saham" onClose={() => setModal(null)}>
          <div className="flex items-center gap-2 rounded-lg px-3 py-2 mb-3 border" style={{ background: "#1C1D20", borderColor: BORDER }}>
            <Search size={16} color={MUTED} />
            <input
              value={buySearch}
              onChange={(e) => setBuySearch(e.target.value)}
              placeholder="Cari kode saham..."
              className="bg-transparent text-sm outline-none flex-1"
              style={{ color: TEXT }}
            />
          </div>
          <div className="divide-y max-h-80 overflow-y-auto" style={{ borderColor: BORDER }}>
            {filteredUniverse.map((s) => (
              <button key={s.code} onClick={() => { setModal(null); openBuy(s); }}
                className="w-full flex items-center justify-between py-3 text-left" style={{ borderColor: BORDER }}>
                <div>
                  <p className="text-sm font-semibold" style={{ color: TEXT }}>{s.code}</p>
                  <p className="text-[11px]" style={{ color: MUTED }}>{s.name}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium" style={{ color: TEXT }}>{num(s.price)}</span>
                  <ChevronRight size={16} color={MUTED} />
                </div>
              </button>
            ))}
          </div>
        </Modal>
      )}

      {modal === "buy" && activeStock && (
        <Modal title={`Beli ${activeStock.code}`} onClose={() => setModal(null)}>
          <p className="text-sm mb-1" style={{ color: MUTED }}>{activeStock.name}</p>
          <p className="text-xl font-bold mb-4" style={{ color: TEXT }}>{rupiah(activeStock.price)}<span className="text-xs font-normal" style={{ color: MUTED }}> / lembar</span></p>
          <div className="flex items-center justify-between border rounded-lg px-3 py-2 mb-4" style={{ borderColor: BORDER }}>
            <span className="text-sm" style={{ color: MUTED }}>Jumlah Lot</span>
            <div className="flex items-center gap-3">
              <button onClick={() => setLots((l) => Math.max(1, l - 1))} className="p-1 rounded-full" style={{ background: "#1C1D20" }}><Minus size={14} color={TEXT} /></button>
              <span className="font-semibold w-8 text-center" style={{ color: TEXT }}>{lots}</span>
              <button onClick={() => setLots((l) => l + 1)} className="p-1 rounded-full" style={{ background: "#1C1D20" }}><Plus size={14} color={TEXT} /></button>
            </div>
          </div>
          <div className="flex justify-between text-sm mb-1">
            <span style={{ color: MUTED }}>Total Pembelian</span>
            <span className="font-semibold" style={{ color: TEXT }}>{rupiah(lots * 100 * activeStock.price)}</span>
          </div>
          <div className="flex justify-between text-sm mb-4">
            <span style={{ color: MUTED }}>Saldo Tunai Tersedia</span>
            <span className="font-semibold" style={{ color: TEXT }}>{rupiah(cash)}</span>
          </div>
          {lots * 100 * activeStock.price > cash && (
            <p className="text-xs mb-3" style={{ color: RED }}>Saldo tidak mencukupi untuk transaksi ini.</p>
          )}
          <button
            onClick={confirmBuy}
            disabled={lots * 100 * activeStock.price > cash}
            className="w-full py-3 rounded-lg font-semibold disabled:opacity-40"
            style={{ background: GREEN, color: "#052E17" }}
          >
            Konfirmasi Beli
          </button>
        </Modal>
      )}

      {modal === "sell" && activeStock && (
        <Modal title={`Jual ${activeStock.code}`} onClose={() => setModal(null)}>
          <p className="text-sm mb-1" style={{ color: MUTED }}>Lot tersedia: {activeStock.lots}</p>
          <div className="flex items-center justify-between border rounded-lg px-3 py-2 mb-4" style={{ borderColor: BORDER }}>
            <span className="text-sm" style={{ color: MUTED }}>Jumlah Lot</span>
            <div className="flex items-center gap-3">
              <button onClick={() => setLots((l) => Math.max(1, l - 1))} className="p-1 rounded-full" style={{ background: "#1C1D20" }}><Minus size={14} color={TEXT} /></button>
              <span className="font-semibold w-8 text-center" style={{ color: TEXT }}>{lots}</span>
              <button onClick={() => setLots((l) => Math.min(activeStock.lots, l + 1))} className="p-1 rounded-full" style={{ background: "#1C1D20" }}><Plus size={14} color={TEXT} /></button>
            </div>
          </div>
          <div className="flex justify-between text-sm mb-1">
            <span style={{ color: MUTED }}>Harga Jual</span>
            <span className="font-semibold" style={{ color: TEXT }}>{num(activeStock.currentPrice)}</span>
          </div>
          <div className="flex justify-between text-sm mb-4">
            <span style={{ color: MUTED }}>Total Hasil Penjualan</span>
            <span className="font-semibold" style={{ color: TEXT }}>{rupiah(lots * 100 * activeStock.currentPrice)}</span>
          </div>
          <button onClick={confirmSell} className="w-full py-3 rounded-lg text-white font-semibold" style={{ background: RED }}>
            Konfirmasi Jual
          </button>
        </Modal>
      )}

      {modal === "deposit" && (
        <Modal title="Setor Dana" onClose={() => setModal(null)}>
          <label className="text-sm block mb-1" style={{ color: MUTED }}>Nominal Setoran</label>
          <input
            type="number"
            value={nominal}
            onChange={(e) => setNominal(Number(e.target.value))}
            className="w-full border rounded-lg px-3 py-2.5 text-sm font-medium mb-5 bg-transparent"
            style={{ borderColor: BORDER, color: TEXT }}
          />
          <button onClick={confirmDeposit} disabled={nominal <= 0} className="w-full py-3 rounded-lg font-semibold disabled:opacity-40" style={{ background: GREEN, color: "#052E17" }}>
            Konfirmasi Setor
          </button>
        </Modal>
      )}

      {modal === "withdraw" && (
        <Modal title="Tarik Dana" onClose={() => setModal(null)}>
          <p className="text-xs mb-1" style={{ color: MUTED }}>Saldo yang dapat ditarik</p>
          <p className="text-lg font-bold mb-4" style={{ color: GREEN }}>{rupiah(cash)}</p>
          <label className="text-sm block mb-1" style={{ color: MUTED }}>Nominal Penarikan</label>
          <input
            type="number"
            value={nominal}
            onChange={(e) => setNominal(Number(e.target.value))}
            className="w-full border rounded-lg px-3 py-2.5 text-sm font-medium mb-4 bg-transparent"
            style={{ borderColor: BORDER, color: TEXT }}
          />
          <div className="border rounded-lg px-3 py-2.5 mb-1" style={{ borderColor: BORDER }}>
            <p className="text-xs mb-1" style={{ color: MUTED }}>Transfer ke</p>
            <p className="text-sm font-semibold" style={{ color: TEXT }}>MANDIRI · 724515846215</p>
            <p className="text-xs" style={{ color: MUTED }}>Zainul Arifin Sinulingga</p>
          </div>
          {nominal > cash && <p className="text-xs my-2" style={{ color: RED }}>Nominal melebihi saldo tersedia.</p>}
          <p className="text-xs my-3" style={{ color: MUTED }}>Dana akan ditransfer maksimal dalam 2 hari kerja.</p>
          <button onClick={confirmWithdraw} disabled={nominal <= 0 || nominal > cash} className="w-full py-3 rounded-lg font-semibold disabled:opacity-40" style={{ background: GREEN, color: "#052E17" }}>
            Submit
          </button>
        </Modal>
      )}
    </div>
  );
}
