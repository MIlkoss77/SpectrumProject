import React, { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { CopySimAPI, SignalsAPI } from "../services/api";

/** Простая SVG-линия без внешних либ */
function LineChart({ points, height=220, padding=12 }) {
  if (!points?.length) return <div style={{color:"var(--muted)"}}>No data</div>;
  const w = Math.max(360, points.length * 12 + padding*2);
  const min = Math.min(...points.map(p => p.equity));
  const max = Math.max(...points.map(p => p.equity));
  const span = max - min || 1;
  const x = (i) => padding + (i/(points.length-1))*(w-padding*2);
  const y = (v) => padding + (1 - (v-min)/span) * (height - padding*2);
  const d = points.map((p,i)=> `${i?"L":"M"} ${x(i)} ${y(p.equity)}`).join(" ");
  return (
    <div style={{overflowX:"auto"}}>
      <svg width={w} height={height} style={{display:"block"}}>
        <rect x="0" y="0" width={w} height={height} fill="none" />
        <path d={d} fill="none" stroke="currentColor" strokeWidth="2" />
      </svg>
    </div>
  );
}

export default function CopySim() {
  const { t } = useTranslation();
  const [deposit, setDeposit] = useState(1000);
  const [multiplier, setMultiplier] = useState(1);
  const [sl, setSl] = useState(-15);
  const [traderId, setTraderId] = useState("tr_demo");
  const [loading, setLoading] = useState(false);
  const [res, setRes] = useState(null);
  const [err, setErr] = useState(null);
  const [lastSignals, setLastSignals] = useState([]);

  async function run() {
    try {
      setErr(null); setLoading(true);
      const data = await CopySimAPI.simulate({ traderId, deposit, multiplier, sl });
      setRes(data);
    } catch (e) { setErr(e); }
    finally { setLoading(false); }
  }

  useEffect(() => { run(); }, []);

  useEffect(() => {
    // для красоты подтянем 5 сигналов
    SignalsAPI.list({ limit: 5 }).then(setLastSignals).catch(()=>{});
  }, []);

  const pnlStr = useMemo(() => res ? `${res.pnlPct > 0 ? "+" : ""}${res.pnlPct}%` : "—", [res]);

  return (
    <section className="page">
      <h1 className="page-title">{t("pages.copysim.title")}</h1>

      <div className="card" style={{display:"grid",gridTemplateColumns:"repeat(4, minmax(160px,1fr))",gap:12,marginBottom:12}}>
        <label>Deposit ($)
          <input type="number" min="50" value={deposit} onChange={e=>setDeposit(+e.target.value||0)} />
        </label>
        <label>Multiplier
          <input type="number" step="0.1" min="0.5" value={multiplier} onChange={e=>setMultiplier(+e.target.value||1)} />
        </label>
        <label>Stop Loss (%)
          <input type="number" step="1" value={sl} onChange={e=>setSl(+e.target.value||0)} />
        </label>
        <label>Trader ID
          <input value={traderId} onChange={e=>setTraderId(e.target.value)} />
        </label>
        <div style={{gridColumn:"1/-1"}}>
          <button className="btn" onClick={run} disabled={loading}>{loading ? "Running…" : "Simulate"}</button>
        </div>
      </div>

      {err && <div className="card"><strong>API error</strong><pre>{JSON.stringify(err,null,2)}</pre></div>}

      <div className="card" style={{marginBottom:12}}>
        <div style={{display:"flex",gap:16,alignItems:"baseline"}}>
          <div style={{fontSize:22,fontWeight:700}}>PnL: {pnlStr}</div>
          <div style={{color:"var(--muted)"}}>Trader: <code>{traderId}</code></div>
        </div>
        <div style={{marginTop:12}}>
          <LineChart points={res?.equity || []} />
        </div>
      </div>

      {!!lastSignals.length && (
        <div className="card">
          <div style={{fontWeight:600, marginBottom:8}}>Last signals</div>
          {lastSignals.map((s,i)=>(
            <div key={s.id || i} style={{display:"grid",gridTemplateColumns:"110px 1fr 90px 140px",gap:12,padding:"6px 0",borderBottom:"1px solid var(--line)"}}>
              <div>{s.symbol}</div>
              <div>{s.signal} {s.timeframe?`(${s.timeframe})`:""}</div>
              <div style={{color:"var(--muted)"}}>{s.confidence!=null?(s.confidence*100).toFixed(0)+"%":"-"}</div>
              <div style={{color:"var(--muted)"}}>{s.ts?new Date(s.ts).toLocaleString():""}</div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
