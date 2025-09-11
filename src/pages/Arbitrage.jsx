import React, { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { ArbitrageAPI } from "../services/api";

export default function Arbitrage() {
  const { t } = useTranslation();
  const [rows, setRows] = useState([]);
  const [minNet, setMinNet] = useState(0.3);   // как в PRD: net ≥ 0.3%
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);

  async function load() {
    try {
      setErr(null); setLoading(true);
      const data = await ArbitrageAPI.list({ limit: 50 });
      setRows(Array.isArray(data) ? data : data.items || []);
    } catch (e) { setErr(e); }
    finally { setLoading(false); }
  }

  useEffect(() => { load(); const id = setInterval(load, 15000); return () => clearInterval(id); }, []);

  const filtered = useMemo(() => rows.filter(r => (r.net || 0) >= minNet), [rows, minNet]);

  return (
    <section className="page">
      <h1 className="page-title">{t("pages.arbitrage.title")}</h1>

      <div className="card" style={{display:"flex",gap:8,alignItems:"center",marginBottom:12}}>
        <span style={{color:"var(--muted)"}}>Min net %</span>
        <input type="number" step="0.1" value={minNet} onChange={e=>setMinNet(parseFloat(e.target.value||0))} style={{width:90}}/>
        <button className="btn" onClick={load}>Refresh</button>
      </div>

      {err && <div className="card"><strong>API error:</strong><pre>{JSON.stringify(err,null,2)}</pre></div>}
      <div className="card">
        {loading ? "Loading…" : filtered.length===0 ? "No opportunities" :
          filtered.map((o, i) => (
            <div key={o.id || i} style={{display:"grid",gridTemplateColumns:"100px 1fr 1fr 90px 90px",gap:12,padding:"8px 0",borderBottom:"1px solid var(--line)"}}>
              <div>{o.symbol}</div>
              <div>{o.buy?.exchange} → {o.sell?.exchange}</div>
              <div>fees: {o.fees?.total?.toFixed?.(2) ?? o.fees}%</div>
              <div style={{fontWeight:600}}>{(o.net ?? 0).toFixed(2)}%</div>
              <div style={{color:"#94a3b8"}}>{o.ts ? new Date(o.ts).toLocaleTimeString() : ""}</div>
            </div>
          ))
        }
      </div>
    </section>
  );
}
