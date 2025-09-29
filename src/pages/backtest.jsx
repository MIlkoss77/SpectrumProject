// src/pages/Backtest.jsx
import React, { useMemo, useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { BacktestAPI } from "../services/backtest";

function NumberInput({ label, value, onChange, step = 1, min, max }) {
  return (
    <label style={{ display: "grid", gap: 6 }}>
      <span style={{ color: "var(--muted)" }}>{label}</span>
      <input
        type="number"
        value={value}
        step={step}
        min={min}
        max={max}
        onChange={(e) => onChange(+e.target.value || 0)}
      />
    </label>
  );
}

function miniLine(points, height = 220) {
  if (!points?.length) return null;
  const w = Math.max(360, points.length * 4);
  const min = Math.min(...points);
  const max = Math.max(...points);
  const span = max - min || 1;
  const x = (i) => (i / (points.length - 1)) * w;
  const y = (v) => (1 - (v - min) / span) * height;
  const d = points.map((p, i) => `${i ? "L" : "M"} ${x(i)} ${y(p)}`).join(" ");
  return { w, h: height, d };
}

export default function Backtest() {
  const { t } = useTranslation();

  // Источник и данные
  const [source, setSource] = useState("binance"); // mock | binance
  const [symbol, setSymbol] = useState("BTCUSDT");
  const [tf, setTf] = useState("15m");
  const [limit, setLimit] = useState(400);

  // Правила и риск
  const [rule, setRule] = useState("RSI_MACD"); // or "EMA_CROSS"
  const [targetPct, setTargetPct] = useState(2);
  const [stopPct, setStopPct] = useState(1);
  const [feesPct, setFeesPct] = useState(0.1);
  const [bankroll, setBankroll] = useState(1000);
  const [stakePct, setStakePct] = useState(10);
  const [maxBars, setMaxBars] = useState(48);

  // Состояния
  const [res, setRes] = useState(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState(null);
  const [upgrade, setUpgrade] = useState(null);

  // Автозапуск после апгрейда
  useEffect(() => {
    if (localStorage.getItem("backtest.autorun") === "1") {
      localStorage.removeItem("backtest.autorun");
      run();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function run() {
    setLoading(true);
    setErr(null);
    setUpgrade(null);
    setRes(null);
    try {
      const data = await BacktestAPI.run({
        symbol,
        tf,
        limit,
        rule,
        params: { source, targetPct, stopPct, feesPct, bankroll, stakePct, maxBars },
      });
      setRes(data);
    } catch (e) {
      const payload = e?.response?.data || e;
      if (payload?.code === "UPGRADE_REQUIRED" || e?.response?.status === 402) {
        setUpgrade(payload?.message || "Feature requires Trader plan.");
      } else {
        setErr(payload);
      }
    } finally {
      setLoading(false);
    }
  }

  const eq = res?.equity || [];
  const eqLine = useMemo(() => miniLine(eq, 220), [eq]);

  function exportCSV() {
    if (!res) return;
    const head1 = "entry_time,entry_price,exit_time,exit_price,return_pct,reason\n";
    const rows1 = (res.trades || [])
      .map((t) =>
        [
          new Date(t.entry.t).toISOString(),
          t.entry.p,
          new Date(t.exit.t).toISOString(),
          t.exit.p,
          (t.r * 100).toFixed(4),
          t.reason,
        ].join(","),
      )
      .join("\n");

    const s = res.stats || {};
    const head2 = "\n\nmetric,value\n";
    const rows2 = [
      ["trades", s.trades],
      ["winRate", (s.winRate * 100).toFixed(2) + "%"],
      ["totalReturnPct", s.totalReturnPct.toFixed(2) + "%"],
      ["maxDD", (s.maxDD * 100).toFixed(2) + "%"],
      ["sharpe", s.sharpe.toFixed(2)],
      ["avgR", s.avgR?.toFixed(4)],
    ]
      .map((x) => x.join(","))
      .join("\n");

    const blob = new Blob([head1 + rows1 + head2 + rows2], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "backtest_report.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <section className="page">
      <h1 className="page-title">
        {t("pages.backtest?.title") || "Backtest (RSI/MACD, EMA) — MVP"}
      </h1>

      <div
        className="card"
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(7, minmax(160px, 1fr))",
          gap: 12,
          alignItems: "end",
        }}
      >
        <label>
          Source
          <select value={source} onChange={(e) => setSource(e.target.value)}>
            <option value="binance">Binance</option>
            <option value="mock">Mock</option>
          </select>
        </label>

        <label>
          Symbol
          <select value={symbol} onChange={(e) => setSymbol(e.target.value)}>
            {["BTCUSDT", "ETHUSDT", "TONUSDT", "SOLUSDT", "BNBUSDT"].map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </label>

        <label>
          TF
          <select value={tf} onChange={(e) => setTf(e.target.value)}>
            {["5m", "15m", "1h", "4h"].map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </label>

        <NumberInput label="Bars" value={limit} onChange={setLimit} min={100} max={1500} />

        <label>
          Rule
          <select value={rule} onChange={(e) => setRule(e.target.value)}>
            <option value="RSI_MACD">RSI + MACD (long-only)</option>
            <option value="EMA_CROSS">EMA50/200 Cross (long-only)</option>
          </select>
        </label>

        <button className="btn" onClick={run} disabled={loading}>
          {loading ? "Running…" : "Run"}
        </button>
        <button className="btn" onClick={exportCSV} disabled={!res}>
          Export CSV
        </button>

        <div />
        <NumberInput label="TP % (target)" value={targetPct} onChange={setTargetPct} step={0.1} />
        <NumberInput label="SL % (stop)" value={stopPct} onChange={setStopPct} step={0.1} />
        <NumberInput label="Fees % (rt)" value={feesPct} onChange={setFeesPct} step={0.01} />
        <NumberInput label="Bankroll $" value={bankroll} onChange={setBankroll} />
        <NumberInput label="Stake % per trade" value={stakePct} onChange={setStakePct} step={1} />
        <NumberInput label="Max bars in trade" value={maxBars} onChange={setMaxBars} />
      </div>

      {upgrade && (
        <div className="card" style={{ borderColor: "var(--warn)" }}>
          <div style={{ fontWeight: 700, marginBottom: 6 }}>Upgrade required</div>
          <div style={{ color: "var(--muted)", marginBottom: 8 }}>{upgrade}</div>
          <a
            className="btn"
            href="/pricing"
            onClick={() => localStorage.setItem("backtest.autorun", "1")}
          >
            Go to Pricing
          </a>
        </div>
      )}

      {err && (
        <div className="card">
          <strong>API error:</strong>
          <pre>{JSON.stringify(err, null, 2)}</pre>
        </div>
      )}

      {res?.degraded && (
        <div className="card" style={{ borderColor: "var(--warn)" }}>
          Binance temporarily unavailable, using synthetic data (degraded mode).
        </div>
      )}

      {res && (
        <>
          <div
            className="card"
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(4, minmax(160px, 1fr))",
              gap: 12,
            }}
          >
            <div>
              <div style={{ color: "var(--muted)" }}>Trades</div>
              <div style={{ fontSize: 22, fontWeight: 700 }}>{res.stats.trades}</div>
            </div>
            <div>
              <div style={{ color: "var(--muted)" }}>Win rate</div>
              <div style={{ fontSize: 22, fontWeight: 700 }}>
                {Math.round(res.stats.winRate * 100)}%
              </div>
            </div>
            <div>
              <div style={{ color: "var(--muted)" }}>Total return</div>
              <div style={{ fontSize: 22, fontWeight: 700 }}>
                {res.stats.totalReturnPct > 0 ? "+" : ""}
                {res.stats.totalReturnPct.toFixed(2)}%
              </div>
            </div>
            <div>
              <div style={{ color: "var(--muted)" }}>Max DD</div>
              <div style={{ fontSize: 22, fontWeight: 700 }}>
                {(res.stats.maxDD * 100).toFixed(2)}%
              </div>
            </div>
            <div>
              <div style={{ color: "var(--muted)" }}>Sharpe (naive)</div>
              <div style={{ fontSize: 22, fontWeight: 700 }}>{res.stats.sharpe.toFixed(2)}</div>
            </div>
            <div>
              <div style={{ color: "var(--muted)" }}>Avg R</div>
              <div style={{ fontSize: 22, fontWeight: 700 }}>{res.stats.avgR.toFixed(2)}</div>
            </div>
          </div>

          <div className="card" style={{ marginTop: 12 }}>
            {!eqLine ? (
              "No equity"
            ) : (
              <svg width={eqLine.w} height={eqLine.h} style={{ display: "block", overflow: "auto" }}>
                <path d={eqLine.d} fill="none" stroke="currentColor" strokeWidth="2" />
              </svg>
            )}
          </div>

          <div className="card">
            <div style={{ fontWeight: 700, marginBottom: 8 }}>Last trades</div>
            {res.trades
              .slice(-12)
              .reverse()
              .map((t, i) => (
                <div
                  key={i}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "160px 120px 120px 120px 1fr",
                    gap: 12,
                    padding: "6px 0",
                    borderBottom: "1px solid var(--line)",
                  }}
                >
                  <div>{new Date(t.entry.t).toLocaleString()}</div>
                  <div>entry {t.entry.p.toFixed(2)}</div>
                  <div>exit {t.exit.p.toFixed(2)}</div>
                  <div style={{ fontWeight: 700, color: t.r >= 0 ? "var(--good)" : "var(--bad)" }}>
                    {t.r >= 0 ? "+" : ""}
                    {(t.r * 100).toFixed(2)}%
                  </div>
                  <div style={{ color: "var(--muted)" }}>{t.reason}</div>
                </div>
              ))}
          </div>
        </>
      )}
    </section>
  );
}
