import React, { useState, useMemo } from "react";
import {
  PieChart, ClipboardList, ChevronRight, TrendingUp,
  AlertTriangle, Ban, UserCircle2, X
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

// Anchor prices define the story; interpolatePriceHistory expands them into a denser,
// deterministic market-like series so the portfolio chart has natural pullbacks and rebounds.
const PRICE_ANCHORS = [
  { date: "2026-04-10", BBCA: 9700, BBRI: 4750, TLKM: 2800, ASII: 5200, ADRO: 2300, WBSA: 770 },
  { date: "2026-04-24", BBCA: 9925, BBRI: 4830, TLKM: 2890, ASII: 5340, ADRO: 2440, WBSA: 940 },
  { date: "2026-05-08", BBCA: 10075, BBRI: 4890, TLKM: 2950, ASII: 5430, ADRO: 2530, WBSA: 1420 },
  { date: "2026-05-20", BBCA: 9975, BBRI: 4660, TLKM: 2810, ASII: 5190, ADRO: 2320, WBSA: 2450 },
  { date: "2026-05-29", BBCA: 9550, BBRI: 4310, TLKM: 2580, ASII: 4880, ADRO: 1950, WBSA: 1580 },
  { date: "2026-06-05", BBCA: 9825, BBRI: 4520, TLKM: 2720, ASII: 5070, ADRO: 2110, WBSA: 1840 },
  { date: "2026-06-12", BBCA: 9360, BBRI: 4120, TLKM: 2460, ASII: 4740, ADRO: 1710, WBSA: 990 },
  { date: "2026-06-18", BBCA: 9640, BBRI: 4380, TLKM: 2610, ASII: 4960, ADRO: 1880, WBSA: 1210 },
  { date: "2026-06-24", BBCA: 9140, BBRI: 4020, TLKM: 2390, ASII: 4660, ADRO: 1510, WBSA: 510 },
  { date: "2026-06-27", BBCA: 9320, BBRI: 4160, TLKM: 2480, ASII: 4780, ADRO: 1580, WBSA: 620 },
  { date: "2026-07-02", BBCA: 8900, BBRI: 4000, TLKM: 2400, ASII: 4850, ADRO: 1450, WBSA: 290 },
];

const STOCK_CODES = ["BBCA", "BBRI", "TLKM", "ASII", "ADRO", "WBSA"];
const VOLATILITY = { BBCA: 0.006, BBRI: 0.009, TLKM: 0.008, ASII: 0.008, ADRO: 0.012, WBSA: 0.035 };

function interpolatePriceHistory() {
  const points = [];
  const stepsPerSegment = 6;

  for (let s = 0; s < PRICE_ANCHORS.length - 1; s++) {
    const a = PRICE_ANCHORS[s];
    const b = PRICE_ANCHORS[s + 1];

    for (let i = 0; i < stepsPerSegment; i++) {
      const t = i / stepsPerSegment;
      const point = { date: i === 0 ? a.date : "" };

      STOCK_CODES.forEach((code, codeIndex) => {
        const base = a[code] + (b[code] - a[code]) * t;
        // Multiple sine waves create repeatable market noise without random values changing on refresh.
        const turbulence = s >= 4 ? 1.65 : 1;
        const wave =
          Math.sin((s * stepsPerSegment + i) * 1.73 + codeIndex * 0.91) * VOLATILITY[code] * turbulence +
          Math.sin((s * stepsPerSegment + i) * 0.61 + codeIndex * 1.37) * VOLATILITY[code] * 0.55 * turbulence;
        point[code] = Math.round(base * (1 + wave));
      });

      points.push(point);
    }
  }

  points.push({ ...PRICE_ANCHORS[PRICE_ANCHORS.length - 1] });
  return points;
}

const PRICE_HISTORY = interpolatePriceHistory();

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
  { id: 17, type: "suspend", label: "ADRO dihentikan sementara (suspensi) oleh BEI — volatilitas ekstrem", date: "2026-07-01 10:00" },
  { id: 16, type: "alert", label: "Keputusan: trading dihentikan sementara, fokus menjaga likuiditas", date: "2026-06-27 15:45" },
  { id: 15, type: "alert", label: "Gelombang risk-off ketiga setelah eskalasi geopolitik", date: "2026-06-24 08:15" },
  { id: 14, type: "alert", label: "Relief rally: bargain hunting mendorong rebound sementara", date: "2026-06-18 14:20" },
  { id: 13, type: "alert", label: "Risk-off kedua: investor mengurangi eksposur aset berisiko", date: "2026-06-12 09:10" },
  { id: 12, type: "alert", label: "Pasar rebound sementara setelah tekanan jual tajam", date: "2026-06-05 15:10" },
  { id: 11, type: "alert", label: "Shock geopolitik pertama memicu sell-off lintas sektor", date: "2026-05-29 09:05" },
  { id: 10, type: "alert", label: "WBSA melonjak tajam ditopang spekulasi ekspansi bisnis", date: "2026-05-20 08:00" },
  { id: 7, type: "buy", label: "Beli WBSA", code: "WBSA", lots: 3000, price: 770, amount: 231000000, date: "2026-04-13 14:00" },
  { id: 6, type: "buy", label: "Beli ADRO", code: "ADRO", lots: 1450, price: 2300, amount: 333500000, date: "2026-04-11 13:20" },
  { id: 5, type: "buy", label: "Beli ASII", code: "ASII", lots: 650, price: 5200, amount: 338000000, date: "2026-04-10 11:05" },
  { id: 4, type: "buy", label: "Beli TLKM", code: "TLKM", lots: 1350, price: 2800, amount: 378000000, date: "2026-04-10 10:20" },
  { id: 3, type: "buy", label: "Beli BBRI", code: "BBRI", lots: 800, price: 4750, amount: 380000000, date: "2026-04-10 09:55" },
  { id: 2, type: "buy", label: "Beli BBCA", code: "BBCA", lots: 350, price: 9700, amount: 339500000, date: "2026-04-10 09:30" },
  { id: 1, type: "alert", label: "Saldo awal simulasi trading ditetapkan Rp450.000.000", date: "2026-04-10 09:00" },
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

function TickerRibbon({ holdings }) {
  const latestPrices = Object.fromEntries(holdings.map((h) => [h.code, h.currentPrice]));
  const liveUniverse = STOCK_UNIVERSE.map((s) => ({
    ...s,
    price: latestPrices[s.code] ?? s.price,
  }));
  const items = liveUniverse.concat(liveUniverse);
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

function TradingPauseNotice() {
  return (
    <div className="rounded-xl border px-4 py-3 mb-4 flex items-start gap-3"
      style={{ background: "#17130B", borderColor: "#4A3713" }}>
      <Ban size={18} color="#F5C244" className="mt-0.5 shrink-0" />
      <div>
        <div className="flex items-center gap-2 flex-wrap">
          <p className="text-sm font-semibold" style={{ color: "#F5C244" }}>Trading Paused</p>
          <span className="text-[9px] px-1.5 py-0.5 rounded" style={{ background: "#3A2A0A", color: "#F5C244" }}>sejak 27 Jun 2026</span>
        </div>
        <p className="text-[11px] mt-1 leading-relaxed" style={{ color: MUTED }}>
          Tidak ada transaksi baru sementara waktu karena volatilitas geopolitik dan risiko pasar yang tinggi.
        </p>
      </div>
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
      <p className="text-[13px] sm:text-sm font-semibold leading-tight break-words tabular-nums" style={{ color: color || TEXT }}>{value}</p>
      <p className="text-[11px] mt-0.5" style={{ color: MUTED }}>{label}</p>
    </div>
  );
}

export default function App() {
  const [tab, setTab] = useState("portfolio");
  const [cash, setCash] = useState(450000000);
  const [holdings, setHoldings] = useState(INITIAL_HOLDINGS);
  const [history, setHistory] = useState(INITIAL_HISTORY);
  const [historyFilter, setHistoryFilter] = useState("all");

  const computed = useMemo(() => holdings.map(computeHolding), [holdings]);
  const invested = computed.reduce((a, h) => a + h.invested, 0);
  const marketValue = computed.reduce((a, h) => a + h.marketValue, 0);
  const totalPnl = marketValue - invested;
  const totalPnlPct = invested ? (totalPnl / invested) * 100 : 0;
  const totalEquity = cash + marketValue;
  const openPositions = computed.filter((h) => h.lots > 0).length;

  const equityTrend = useMemo(() => {
    return PRICE_HISTORY.map((point) => {
      const stockValue = holdings.reduce((sum, h) => {
        const historicalPrice = point[h.code] ?? h.currentPrice;
        return sum + h.lots * 100 * historicalPrice;
      }, 0);
      const equity = cash + stockValue;
      return {
        date: point.date,
        equity,
        returnPct: invested ? ((stockValue - invested) / invested) * 100 : 0,
      };
    });
  }, [holdings, cash, invested]);

  const firstEquity = equityTrend[0]?.equity || totalEquity;
  const lastEquity = equityTrend[equityTrend.length - 1]?.equity || totalEquity;
  const chartChangePct = firstEquity ? ((lastEquity - firstEquity) / firstEquity) * 100 : 0;

  function pushHistory(entry) {
    setHistory((h) => [{ id: Date.now(), date: "2026-07-07 " + new Date().toLocaleTimeString("id-ID").slice(0, 5), ...entry }, ...h]);
  }



  const filteredHistory = history.filter((h) => historyFilter === "all" || h.type === historyFilter);


  const iconFor = (type) => {
    if (type === "suspend") return <Ban size={20} color={RED} />;
    return <AlertTriangle size={20} color="#F5A524" />;
  };

  return (
    <div className="min-h-screen flex flex-col" style={{ background: BG, fontFamily: "Inter, system-ui, sans-serif" }}>
      <SimBanner />
      <TickerRibbon holdings={holdings} />

      <div className="flex items-center gap-2 px-5 pt-4 pb-2">
        <UserCircle2 size={22} color={MUTED} />
        <span className="text-sm font-medium" style={{ color: TEXT }}>{DEMO_PROFILE_NAME}</span>
      </div>

      <div className="flex-1 overflow-y-auto pb-24">
        {tab === "portfolio" && (
          <div className="px-4">
            <TradingPauseNotice />
            <div className="rounded-xl border px-4 py-4 mb-4" style={{ background: CARD, borderColor: BORDER }}>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-4">
                <StatCell label="Saldo Tunai" value={num2(cash)} />
                <StatCell label="Invested" value={num2(invested)} />
                <StatCell label="Open" value={openPositions} />
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-4 mt-4">
                <StatCell label="P&L" value={(totalPnl >= 0 ? "+" : "") + num2(totalPnl)} color={totalPnl >= 0 ? GREEN : RED} />
                <StatCell label={totalPnlPct >= 0 ? "P&L Saham" : "P&L Saham"} value={totalPnlPct.toFixed(2) + "%"} color={totalPnl >= 0 ? GREEN : RED} />
                <StatCell label="Total Equity" value={num2(totalEquity)} />
              </div>
              <div className="flex items-end justify-between mt-4 mb-1">
                <div>
                  <p className="text-[10px]" style={{ color: MUTED }}>Total Equity Return · sejak 10 Apr 2026</p>
                  <p className="text-xs font-semibold tabular-nums" style={{ color: chartChangePct >= 0 ? GREEN : RED }}>
                    {chartChangePct >= 0 ? "+" : ""}{chartChangePct.toFixed(2)}%
                  </p>
                </div>
                <div className="flex gap-1">
                  {["1M", "3M", "ALL"].map((p) => (
                    <span key={p} className="text-[9px] px-1.5 py-0.5 rounded"
                      style={{ background: p === "ALL" ? "#24262A" : "transparent", color: p === "ALL" ? TEXT : MUTED }}>
                      {p}
                    </span>
                  ))}
                </div>
              </div>
              <div className="h-24 -mx-1">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={equityTrend} margin={{ top: 5, right: 2, bottom: 2, left: 2 }}>
                    <defs>
                      <linearGradient id="eq" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={chartChangePct >= 0 ? GREEN : RED} stopOpacity={0.35} />
                        <stop offset="100%" stopColor={chartChangePct >= 0 ? GREEN : RED} stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <YAxis hide domain={["dataMin - 30000000", "dataMax + 30000000"]} />
                    <Area
                      type="linear"
                      dataKey="equity"
                      stroke={chartChangePct >= 0 ? GREEN : RED}
                      strokeWidth={2}
                      fill="url(#eq)"
                      isAnimationActive={false}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
              <div className="flex justify-between -mt-1 mb-1">
                <span className="text-[9px]" style={{ color: MUTED }}>10 Apr</span>
                <span className="text-[9px]" style={{ color: MUTED }}>18 Jun</span>
                <span className="text-[9px]" style={{ color: MUTED }}>2 Jul</span>
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
            </div>

            <div className="rounded-xl border overflow-hidden divide-y" style={{ background: CARD, borderColor: BORDER, borderColorDivide: BORDER }}>
              {computed.map((h) => (
                <div key={h.code} className="px-4 py-3.5" style={{ borderColor: BORDER }}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <p className="font-semibold text-sm" style={{ color: TEXT }}>{h.code}</p>
                      {h.suspended && (
                        <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded" style={{ background: "#3A1414", color: RED }}>
                          SUSPENSI BEI
                        </span>
                      )}
                    </div>
                    {h.suspended && (
                      <span className="px-2.5 py-1 rounded-md text-xs font-medium" style={{ color: MUTED, background: "#1C1D20" }}>
                        Diberhentikan
                      </span>
                    )}
                  </div>
                  <div className="grid grid-cols-[1fr_auto] gap-4 mt-2 items-end">
                    <div className="min-w-0">
                      <p className="text-sm tabular-nums" style={{ color: TEXT }}>{num2(h.marketValue)}</p>
                      <p className="text-[10px]" style={{ color: MUTED }}>
                        Nilai pasar · {h.lots} lot · avg {num(h.avgPrice)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium tabular-nums" style={{ color: h.pnl >= 0 ? GREEN : RED }}>
                        {(h.pnl >= 0 ? "+" : "") + num2(h.pnl)}
                      </p>
                      <p className="text-xs font-semibold tabular-nums" style={{ color: h.pnl >= 0 ? GREEN : RED }}>
                        {h.pnlPct >= 0 ? "+" : ""}{h.pnlPct.toFixed(2)}%
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === "history" && (
          <div className="px-4">
            <div className="flex items-center mb-3">
              <h2 className="font-semibold text-base" style={{ color: TEXT }}>Riwayat Transaksi</h2>
            </div>
            <div className="flex gap-2 mb-3 overflow-x-auto">
              {[
                { k: "all", l: "Semua" }, { k: "buy", l: "Beli" }, { k: "sell", l: "Jual" },
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
                    <p className="text-sm font-semibold" style={{ color: h.type === "sell" ? GREEN : TEXT }}>
                      {h.type === "sell" ? "+" : "-"}{num(h.amount)}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

      </div>

      <div className="fixed bottom-0 left-0 right-0 border-t flex justify-around pt-2 pb-[max(0.5rem,env(safe-area-inset-bottom))]" style={{ background: CARD, borderColor: BORDER }}>
        {[
          { k: "portfolio", l: "Portofolio", icon: PieChart },
          { k: "history", l: "Riwayat", icon: ClipboardList },
        ].map((t) => (
          <button key={t.k} onClick={() => setTab(t.k)} className="flex flex-col items-center gap-0.5 px-4">
            <t.icon size={20} color={tab === t.k ? GREEN : MUTED} />
            <span className="text-[11px] font-medium" style={{ color: tab === t.k ? GREEN : MUTED }}>{t.l}</span>
          </button>
        ))}
      </div>


    </div>
  );
}
