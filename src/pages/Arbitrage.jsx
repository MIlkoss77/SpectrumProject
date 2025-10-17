import React, { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { ArbitrageAPI } from "../services/api";

function OpportunityRow({ item }) {
  const buy = item.buy || {};
  const sell = item.sell || {};
  return (
    <div className="arb-row">
      <div className="arb-symbol">
        <div style={{ fontWeight: 700 }}>{item.symbol}</div>
        <div className="muted">spread {(item.gross ?? 0).toFixed(2)}%</div>
      </div>
      <div className="arb-leg">
        <div className="muted">Buy</div>
        <div>{buy.exchange}</div>
        <div>${buy.ask?.toFixed?.(2) ?? "—"}</div>
      </div>
      <div className="arb-leg">
        <div className="muted">Sell</div>
        <div>{sell.exchange}</div>
        <div>${sell.bid?.toFixed?.(2) ?? "—"}</div>
      </div>
      <div className="arb-metrics">
        <div>Fees {(item.fees ?? 0).toFixed(2)}%</div>
        <div>Latency {(item.latency ?? 0).toFixed(2)}%</div>
      </div>
      <div className="arb-net">
        <div style={{ fontSize: 20, fontWeight: 700 }}>{(item.net ?? 0).toFixed(2)}%</div>
        <div className="muted">Updated {item.ts ? new Date(item.ts).toLocaleTimeString() : "—"}</div>
      </div>
    </div>
  );
}

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
      const list = Array.isArray(data) ? data : data.items || [];
      setRows(list);
    } catch (e) { setErr(e); }
    finally { setLoading(false); }
  }

  useEffect(() => { load(); const id = setInterval(load, 20000); return () => clearInterval(id); }, []);

  const filtered = useMemo(() => rows.filter(r => (r.net || 0) >= minNet), [rows, minNet]);

  return (
    <section className="page">
      <h1 className="page-title">{t("pages.arbitrage.title")}</h1>

      <div className="card" style={{display:"flex",gap:12,alignItems:"center",marginBottom:12}}>
        <span className="muted">Min net %</span>
        <input type="number" step="0.1" value={minNet} onChange={e=>setMinNet(parseFloat(e.target.value||0))} style={{width:90}}/>
        <button className="btn" onClick={load}>Refresh</button>
        <div style={{marginLeft:"auto", fontSize:12, color:"var(--muted)"}}>Pairs monitored: {rows.length}</div>
      </div>

      {err && <div className="card"><strong>API error</strong><pre>{JSON.stringify(err,null,2)}</pre></div>}
      <div className="card arb-grid">
        {loading ? "Loading…" : filtered.length===0 ? "No opportunities" :
          
          filtered.map((o) => (
            <OpportunityRow key={o.id} item={o} />
          ))
        }
      </div>
    </section>
  );
}