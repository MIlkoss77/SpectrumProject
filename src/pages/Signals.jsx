import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useLocation } from "react-router-dom";
import { SignalsAPI } from "../services/api";

export default function Signals() {
  const { t } = useTranslation();
  const location = useLocation();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);
  const [applyContext, setApplyContext] = useState(null);

  async function load() {
    try {
      setErr(null);
      setLoading(true);
      const data = await SignalsAPI.list({ limit: 20 });
      setRows(Array.isArray(data) ? data : data.items || []);
    } catch (e) { setErr(e); }
    finally { setLoading(false); }
  }

  useEffect(() => {
    load();
    const id = setInterval(load, 30000); // авто-обновление каждые 30с
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    const stored = sessionStorage.getItem("spectr.academy.apply");
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setApplyContext(parsed);
      } catch {
        setApplyContext(null);
      } finally {
        sessionStorage.removeItem("spectr.academy.apply");
      }
    }
  }, [location.key]);

  return (
    <section className="page">
      <h1 className="page-title">{t("pages.signals.title")}</h1>

      {err && <div className="card"><strong>API error:</strong><pre>{JSON.stringify(err,null,2)}</pre></div>}
      {applyContext && (
        <div className="card" style={{ borderColor: "var(--brand)" }}>
          <div style={{ fontWeight: 600 }}>{t("pages.signals.appliedFromAcademy")}</div>
          <div style={{ color: "var(--muted)", fontSize: 12 }}>
            {applyContext.symbol} · {applyContext.indicator} · {applyContext.timeframe}
          </div>
        </div>
      )}

      <div className="card">
        {loading ? "Loading…" : rows.length===0 ? "No signals yet" :
          rows.map((r, i) => {
            const highlight = applyContext && (
              (applyContext.symbol ? applyContext.symbol === r.symbol : true) &&
              (applyContext.timeframe ? applyContext.timeframe === r.timeframe : true)
            );
            return (
              <div
                key={r.id || i}
                style={{
                  display:"grid",
                  gridTemplateColumns:"120px 1fr 80px 80px",
                  gap:12,
                  padding:"8px 0",
                  borderBottom:"1px solid var(--line)",
                  background: highlight ? "rgba(96,165,250,0.08)" : "transparent"
                }}
              >
                <div>{r.symbol}</div>
                <div>{r.signal} {r.timeframe ? `(${r.timeframe})` : ""}</div>
                <div style={{color:"#94a3b8"}}>{r.confidence != null ? (r.confidence*100).toFixed(0)+"%" : "-"}</div>
                <div style={{color:"#94a3b8"}}>{r.ts ? new Date(r.ts).toLocaleTimeString() : ""}</div>
              </div>
            );
          })
        }
      </div>
    </section>
  );
}
