import React, { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { SignalsAPI } from "../services/api";

function Sparkline({ points = [] }) {
  if (!points.length) return <span style={{ color: "var(--muted)" }}>—</span>;
  const min = Math.min(...points);
  const max = Math.max(...points);
  const span = max - min || 1;
  const width = Math.max(80, points.length * 6);
  const height = 48;
  const path = points
    .map((p, i) => {
      const x = (i / (points.length - 1 || 1)) * width;
      const y = height - ((p - min) / span) * height;
      return `${i === 0 ? "M" : "L"}${x.toFixed(2)} ${y.toFixed(2)}`;
    })
    .join(" ");
  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} style={{ overflow: "visible" }}>
      <path d={path} fill="none" stroke="var(--accent)" strokeWidth="2" />
    </svg>
  );
}

function ConfidencePill({ value }) {
  if (value == null) return <span>—</span>;
  const pct = Math.round(value * 100);
  const tone = pct >= 70 ? "var(--good)" : pct >= 40 ? "var(--warn)" : "var(--muted)";
  return (
    <span style={{ color: tone, fontWeight: 600 }}>{pct}%</span>
  );
}

function SignalRow({ row, onApply }) {
  return (
    <div className="signal-row">
      <div className="signal-symbol">
        <div style={{ fontWeight: 700 }}>{row.symbol}</div>
        <div className="muted">{row.timeframe}</div>
      </div>
      <div className="signal-price">
        <div>${row.price?.toFixed?.(2) ?? "—"}</div>
        <div className={row.change24h >= 0 ? "positive" : "negative"}>
          {row.change24h >= 0 ? "+" : ""}{row.change24h?.toFixed?.(2) ?? "0"}%
        </div>
      </div>
      <div className="signal-indicators">
        <div>RSI {row.rsi?.toFixed?.(1) ?? "—"}</div>
        <div>EMA21/55 {row.emaFast?.toFixed?.(0) ?? "—"} / {row.emaSlow?.toFixed?.(0) ?? "—"}</div>
        <div>MACD {row.macd?.toFixed?.(3) ?? "—"} · Hist {row.macdHist?.toFixed?.(3) ?? "—"}</div>
      </div>
      <div className="signal-action">
        <div style={{ fontWeight: 700 }}>{row.signal}</div>
        <ConfidencePill value={row.confidence} />
        <button className="btn" style={{ marginTop: 6 }} onClick={() => onApply(row)}>Apply to Chart</button>
      </div>
      <div className="signal-chart">
        <Sparkline points={row.sparkline} />
      </div>
      <div className="signal-factors">
        {row.factors?.map((f, i) => <span key={i} className="pill">{f}</span>)}
      </div>
    </div>
  );
}

export default function Signals() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [selectedTf, setSelectedTf] = useState("all");

  const filteredRows = useMemo(() => {
    if (selectedTf === "all") return rows;
    return rows.filter(r => r.timeframe === selectedTf);
  }, [rows, selectedTf]);

  async function load() {
    try {
      setErr(null);
      setLoading(true);
      const data = await SignalsAPI.list({ limit: 20 });
      setRows(Array.isArray(data) ? data : data.items || []);
      const data = await SignalsAPI.list();
      const list = Array.isArray(data) ? data : data.items || [];
      setRows(list);
      setLastUpdated(Date.now());
    } catch (e) { setErr(e); }
    finally { setLoading(false); }
  }

  useEffect(() => {
    load();
    const id = setInterval(load, 30000); // авто-обновление каждые 30с
    return () => clearInterval(id);
  }, []);

  function handleApply(row) {
    localStorage.setItem("spectr.applyToChart", JSON.stringify({ symbol: row.symbol, timeframe: row.timeframe }));
    navigate(`/ta?symbol=${row.symbol}&tf=${row.timeframe}`);
  }

  const timeframes = useMemo(() => Array.from(new Set(rows.map(r => r.timeframe))), [rows]);

  return (
    <section className="page">
      <h1 className="page-title">{t("pages.signals.title")}</h1>

      <div className="card" style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 12 }}>
        <span className="muted">Timeframe</span>
        <button className={"pill" + (selectedTf === "all" ? " selected" : "")} onClick={() => setSelectedTf("all")}>All</button>
        {timeframes.map(tf => (
          <button key={tf} className={"pill" + (selectedTf === tf ? " selected" : "")} onClick={() => setSelectedTf(tf)}>{tf}</button>
        ))}
        <div style={{ marginLeft: "auto", fontSize: 12, color: "var(--muted)" }}>
          {lastUpdated ? `Updated ${new Date(lastUpdated).toLocaleTimeString()}` : ""}
        </div>
        <button className="btn" onClick={load}>Refresh</button>
      </div>

      {err && <div className="card"><strong>API error:</strong><pre>{JSON.stringify(err,null,2)}</pre></div>}
      
      <div className="card signals-grid">
        {loading ? "Loading…" : filteredRows.length===0 ? "No signals yet" :
          filteredRows.map((row) => (
            <SignalRow key={row.id} row={row} onApply={handleApply} />
          ))
        }
      </div>
    </section>
  );
}