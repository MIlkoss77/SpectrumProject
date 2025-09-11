import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { SignalsAPI } from "../services/api";

export default function Signals() {
  const { t } = useTranslation();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);

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
    const id = setInterval(load, 30000);
    return () => clearInterval(id);
  }, []);

  return (
    <section className="page">
      <h1 className="page-title">{t("pages.signals.title")}</h1>
      {err && <div className="card"><strong>API error</strong><pre>{JSON.stringify(err,null,2)}</pre></div>}
      <div className="card">
        {loading ? "Loading…" : rows.length===0 ? "No signals yet" :
          rows.map((r, i) => (
            <div key={r.id || i} style={{display:"grid", gridTemplateColumns:"120px 1fr 80px 120px", gap:12, padding:"8px 0", borderBottom:"1px solid var(--line)"}}>
              <div>{r.symbol}</div>
              <div>{r.signal} {r.timeframe ? `(${r.timeframe})` : ""}</div>
              <div style={{color:"#94a3b8"}}>{r.confidence != null ? (r.confidence*100).toFixed(0)+"%" : "-"}</div>
              <div style={{color:"#94a3b8"}}>{r.ts ? new Date(r.ts).toLocaleString() : ""}</div>
            </div>
          ))
        }
      </div>
    </section>
  );
}
