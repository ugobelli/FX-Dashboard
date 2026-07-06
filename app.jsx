import { useState } from "react";

// ── Live data fetched by Claude on 2 Jul 2026 ───────────────────
// Sources: TradingEconomics, Wise, Bloomberg, Investing.com, FRED, ECB, NBU, CBE, NBK, BAM
const FX_DATA = [
  {
    pair: "USD/EGP",
    flag: "🇪🇬",
    name: "Egyptian Pound",
    spotRate: 49.08,
    change7d: "-1.2%",
    trend7d: "depreciation",
    change30d: "-6.1%",
    trend30d: "depreciation",
    outlook6m: "stable",
    asOf: "2 Jul 2026",
    inflationRate: "14.6%",
    inflationNote: "May 2026 (YoY, urban CPI) — Goldman Sachs forecasts peak ~17.5% in Aug",
    interestRate: "19.0%",
    interestNote: "CBE on hold since May; next MPC 9 Jul — possible 200bps hike signalled",
    realRate: "+4.4%",
    drivers: [
      "EGP up 6%+ in 30 days on IMF compliance & FX reserve confidence",
      "Inflation cooling but Goldman forecasts Aug reacceleration to ~17.5%",
      "CBE holds at 19%; potential rate hike in Q3 to maintain real rate buffer",
    ],
    outlookNote: "EGP to hold near 49–50 range; next MPC on 9 Jul is key near-term risk event.",
  },
  {
    pair: "USD/KZT",
    flag: "🇰🇿",
    name: "Kazakhstani Tenge",
    spotRate: 487.97,
    change7d: "+0.4%",
    trend7d: "appreciation",
    change30d: "+1.8%",
    trend30d: "appreciation",
    outlook6m: "appreciation",
    asOf: "2 Jul 2026",
    inflationRate: "10.4%",
    inflationNote: "May 2026 (YoY) — lowest since Mar 2025; NBK revised 2026 forecast to 9–11%",
    interestRate: "17.0%",
    interestNote: "NBK cut 100bps in Jun 2026 (first cut since mid-2024); further easing expected",
    realRate: "+6.6%",
    drivers: [
      "WTI crude near $68 today weighing on oil-linked tenge",
      "NBK surprised with 100bps cut in Jun — signals gradual easing cycle ahead",
      "USD/KZT range-bound but biased weaker on oil & Fed stance",
    ],
    outlookNote: "KZT faces continued mild pressure; oil prices and pace of NBK easing are key drivers.",
  },
  {
    pair: "USD/UAH",
    flag: "🇺🇦",
    name: "Ukrainian Hryvnia",
    spotRate: 44.84,
    change7d: "+0.2%",
    trend7d: "appreciation",
    change30d: "+1.5%",
    trend30d: "appreciation",
    outlook6m: "appreciation",
    asOf: "2 Jul 2026",
    inflationRate: "8.2%",
    inflationNote: "May 2026 (YoY) — above NBU trajectory; energy & wage cost pressures persist",
    interestRate: "15.0%",
    interestNote: "NBU on hold since Apr 30; easing cycle paused — rates to stay flat until Q2 2027",
    realRate: "+6.8%",
    drivers: [
      "UAH near 52-week high; war-driven USD demand persisting structurally",
      "NBU easing cycle ended in Apr; rate on hold until Q2 2027 per guidance",
      "EU €90bn unblocked in Apr provides key reserve buffer through 2026",
    ],
    outlookNote: "UAH expected to weaken toward 45–46 by year-end; forecasts range 44–45 under baseline.",
  },
  {
    pair: "USD/MAD",
    flag: "🇲🇦",
    name: "Moroccan Dirham",
    spotRate: 9.26,
    change7d: "-1.7%",
    trend7d: "depreciation",
    change30d: "+0.4%",
    trend30d: "stable",
    outlook6m: "depreciation",
    asOf: "2 Jul 2026",
    inflationRate: "1.5%",
    inflationNote: "2026 avg forecast (BAM Jun 2026) — one of the lowest in the monitored basket",
    interestRate: "2.25%",
    interestNote: "BAM on hold since Mar 2025; expected to hold through end-2026 per AGR forecast",
    realRate: "+0.75%",
    drivers: [
      "EUR/USD surge to 1.16 pulling USD/MAD lower via EUR/USD basket peg",
      "BAM on hold at 2.25%; inflation contained at 1.5% — no policy pressure",
      "52-week range 8.94–9.75; current 9.26 mid-range but tracking EUR lower",
    ],
    outlookNote: "USD/MAD to drift lower in line with EUR strength; 6m target near 8.85–9.05 per models.",
  },
  {
    pair: "USD/EUR",
    flag: "🇪🇺",
    name: "Euro",
    spotRate: 0.862,
    change7d: "-1.6%",
    trend7d: "depreciation",
    change30d: "-0.5%",
    trend30d: "depreciation",
    outlook6m: "depreciation",
    asOf: "2 Jul 2026",
    inflationRate: "3.0%",
    inflationNote: "2026 ECB baseline forecast; May HICP at 3.2% — above 2% target",
    interestRate: "2.25%",
    interestNote: "ECB hiked 25bps on 11 Jun 2026 (first hike since 2023); another hike priced in",
    realRate: "-0.75%",
    drivers: [
      "ECB surprise hike on 11 Jun pushing EUR higher; USD broadly softer today",
      "EUR/USD at 1.16 — top of recent range; consensus 6m target 1.13–1.15",
      "ECB inflation at 3.0% in 2026E; war-driven energy shock keeping rates elevated",
    ],
    outlookNote: "USD expected to remain soft vs EUR over 6 months; EUR/USD targeting 1.13–1.16 range.",
  },
];

// ── Components ──────────────────────────────────────────────────

function TrafficLight({ trend, change }) {
  const cfg = {
    appreciation: { bg: "#fee2e2", color: "#dc2626", dot: "#dc2626", arrow: "↑" },
    depreciation: { bg: "#dcfce7", color: "#16a34a", dot: "#16a34a", arrow: "↓" },
    stable:       { bg: "#fef9c3", color: "#ca8a04", dot: "#ca8a04", arrow: "→" },
  }[trend] || { bg: "#f3f4f6", color: "#6b7280", dot: "#9ca3af", arrow: "?" };

  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 5, background: cfg.bg, color: cfg.color, borderRadius: 20, padding: "3px 10px", fontSize: 11, fontWeight: 700, whiteSpace: "nowrap" }}>
      <span style={{ width: 7, height: 7, borderRadius: "50%", background: cfg.dot, flexShrink: 0 }} />
      USD {cfg.arrow}{change ? ` ${change}` : ""}
    </span>
  );
}

function OutlookBadge({ outlook }) {
  const cfg = {
    appreciation: { bg: "#fef2f2", border: "#fecaca", color: "#b91c1c", icon: "🔴", label: "USD Strengthening" },
    depreciation: { bg: "#f0fdf4", border: "#bbf7d0", color: "#15803d", icon: "🟢", label: "USD Weakening" },
    stable:       { bg: "#fefce8", border: "#fde68a", color: "#b45309", icon: "🟡", label: "Broadly Stable" },
  }[outlook] || { bg: "#f3f4f6", border: "#e5e7eb", color: "#6b7280", icon: "⚪", label: "Unclear" };

  return (
    <span style={{ background: cfg.bg, border: `1px solid ${cfg.border}`, borderRadius: 8, padding: "4px 10px", display: "inline-flex", alignItems: "center", gap: 5, flexShrink: 0 }}>
      <span>{cfg.icon}</span>
      <span style={{ fontSize: 11, fontWeight: 700, color: cfg.color }}>{cfg.label}</span>
    </span>
  );
}

function MacroRow({ label, value, note, accent }) {
  return (
    <div style={{ display: "flex", alignItems: "flex-start", gap: 10, padding: "8px 0", borderBottom: "1px solid #f1f5f9" }}>
      <div style={{ minWidth: 110 }}>
        <div style={{ fontSize: 10, fontWeight: 600, color: "#94a3b8", textTransform: "uppercase", letterSpacing: 0.4 }}>{label}</div>
        <div style={{ fontSize: 18, fontWeight: 800, color: accent, letterSpacing: -0.5, marginTop: 1 }}>{value}</div>
      </div>
      <div style={{ fontSize: 11, color: "#64748b", lineHeight: 1.5, paddingTop: 2 }}>{note}</div>
    </div>
  );
}

function PairCard({ data }) {
  return (
    <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 14, padding: "20px 22px", display: "flex", flexDirection: "column", gap: 14, boxShadow: "0 1px 4px rgba(0,0,0,0.05)" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontSize: 26 }}>{data.flag}</span>
          <div>
            <div style={{ fontSize: 16, fontWeight: 800, color: "#0f172a", letterSpacing: -0.3 }}>{data.pair}</div>
            <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 1 }}>{data.name}</div>
          </div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontSize: 22, fontWeight: 800, color: "#0f172a", fontVariantNumeric: "tabular-nums" }}>{data.spotRate}</div>
          <div style={{ fontSize: 11, color: "#94a3b8" }}>Spot · {data.asOf}</div>
        </div>
      </div>

      {/* Trend grid */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
        {[
          { label: "7-Day",      trend: data.trend7d,   change: data.change7d  },
          { label: "30-Day",     trend: data.trend30d,  change: data.change30d },
          { label: "6M Outlook", trend: data.outlook6m, change: null           },
        ].map(({ label, trend, change }) => (
          <div key={label} style={{ background: "#f8fafc", borderRadius: 10, padding: "10px 12px", display: "flex", flexDirection: "column", gap: 6 }}>
            <div style={{ fontSize: 10, fontWeight: 600, color: "#94a3b8", textTransform: "uppercase", letterSpacing: 0.4 }}>{label}</div>
            <TrafficLight trend={trend} change={change} />
          </div>
        ))}
      </div>

      {/* Macro: Inflation & Interest Rate */}
      <div style={{ background: "#f8fafc", borderRadius: 10, padding: "4px 12px 0" }}>
        <MacroRow label="Inflation Rate" value={data.inflationRate} note={data.inflationNote} accent="#7c3aed" />
        <MacroRow label="Interest Rate" value={data.interestRate} note={data.interestNote} accent="#0284c7" />
        <div style={{ display: "flex", justifyContent: "flex-end", alignItems: "center", gap: 6, padding: "6px 0 8px" }}>
          <span style={{ fontSize: 10, color: "#94a3b8", fontWeight: 600 }}>REAL RATE</span>
          <span style={{
            fontSize: 12, fontWeight: 800, padding: "2px 8px", borderRadius: 12,
            background: data.realRate.startsWith("-") ? "#fee2e2" : "#dcfce7",
            color: data.realRate.startsWith("-") ? "#b91c1c" : "#15803d",
          }}>{data.realRate}</span>
        </div>
      </div>

      {/* Drivers */}
      <div>
        <div style={{ fontSize: 10, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: 0.4, marginBottom: 7 }}>Key Drivers</div>
        {data.drivers.map((d, i) => (
          <div key={i} style={{ display: "flex", gap: 8, fontSize: 12, color: "#374151", lineHeight: 1.6, marginBottom: 4 }}>
            <span style={{ color: "#6366f1", fontWeight: 800, flexShrink: 0 }}>·</span>
            <span>{d}</span>
          </div>
        ))}
      </div>

      {/* Outlook */}
      <div style={{ borderTop: "1px solid #f1f5f9", paddingTop: 12, display: "flex", alignItems: "flex-start", gap: 10 }}>
        <OutlookBadge outlook={data.outlook6m} />
        <div style={{ fontSize: 12, color: "#475569", lineHeight: 1.5, paddingTop: 2 }}>{data.outlookNote}</div>
      </div>
    </div>
  );
}

// ── App ─────────────────────────────────────────────────────────

export default function FXDashboard() {
  const [filter, setFilter] = useState("all");

  const filtered = FX_DATA.filter(d =>
    filter === "all"    ? true :
    filter === "red"    ? d.outlook6m === "appreciation" :
    filter === "green"  ? d.outlook6m === "depreciation" :
    d.outlook6m === "stable"
  );

  return (
    <div style={{ minHeight: "100vh", background: "#f8fafc", fontFamily: "'Inter', -apple-system, sans-serif" }}>
      {/* Header */}
      <div style={{ background: "#0f172a", padding: "18px 24px 14px", position: "sticky", top: 0, zIndex: 10 }}>
        <div style={{ maxWidth: 980, margin: "0 auto" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10 }}>
            <div>
              <div style={{ fontSize: 18, fontWeight: 800, color: "#fff", letterSpacing: -0.4 }}>FX Rate Monitor</div>
              <div style={{ fontSize: 11, color: "#475569", marginTop: 2 }}>
                Data sourced by Claude · 2 Jul 2026 · TradingEconomics, ECB, NBU, CBE, NBK, BAM, Wise
              </div>
            </div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {[
                { key: "all",    label: "All pairs" },
                { key: "green",  label: "🟢 USD Weakening" },
                { key: "red",    label: "🔴 USD Strengthening" },
                { key: "stable", label: "🟡 Stable" },
              ].map(({ key, label }) => (
                <button key={key} onClick={() => setFilter(key)} style={{ background: filter === key ? "#6366f1" : "#1e293b", border: filter === key ? "1px solid #818cf8" : "1px solid #334155", borderRadius: 8, color: filter === key ? "#fff" : "#94a3b8", padding: "6px 12px", fontSize: 11, fontWeight: 600, cursor: "pointer", transition: "all .15s" }}>
                  {label}
                </button>
              ))}
            </div>
          </div>
          <div style={{ marginTop: 10, fontSize: 11, color: "#64748b" }}>
            🟢 USD falling · 🔴 USD rising · 🟡 Stable &nbsp;|&nbsp; Real Rate = Interest Rate − Inflation
          </div>
        </div>
      </div>

      {/* Grid */}
      <div style={{ maxWidth: 980, margin: "0 auto", padding: "24px 20px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(400px, 1fr))", gap: 16 }}>
          {filtered.map(d => <PairCard key={d.pair} data={d} />)}
        </div>
        <div style={{ marginTop: 20, background: "#fff", border: "1px solid #e5e7eb", borderRadius: 10, padding: "12px 16px", fontSize: 11, color: "#94a3b8", lineHeight: 1.6 }}>
          <strong style={{ color: "#64748b" }}>ℹ️ How to refresh:</strong> Say "refresh" or "refresh the dashboard" and Claude will re-search the web and rebuild with the latest data. Rates are indicative mid-market prices — verify with your treasury desk before trading.
        </div>
      </div>
    </div>
  );
}
