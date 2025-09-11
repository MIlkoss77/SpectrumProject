import React, { useEffect, useState } from "react";
import { EventsAPI } from "../services/events";

function Field({ label, value, onChange, type="text" }) {
  return (
    <label style={{display:"grid", gap:6}}>
      <span style={{color:"var(--muted)"}}>{label}</span>
      <input type={type} value={value} onChange={e=>onChange(e.target.value)} />
    </label>
  );
}

export default function Events() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  // test forms
  const [symbol, setSymbol] = useState("BTC");
  const [confidence, setConfidence] = useState("0.85");
  const [userId, setUserId] = useState("usr_123");
  const [badge, setBadge] = useState("Candle Master");
  const [asset, setAsset] = useState("USDT");
  const [apy, setApy] = useState("8.5");
  const [plan, setPlan] = useState("Trader");

  async function load() {
    setLoading(true);
    try { setEvents(await EventsAPI.list()); }
    catch(e){ console.error(e); }
    finally { setLoading(false); }
  }
  useEffect(()=>{ load(); const id=setInterval(load, 5000); return ()=>clearInterval(id); }, []);

  async function triggerRebalance() {
    setSending(true);
    try {
      await EventsAPI.sendRebalance({ event:"news.bullish", symbol, confidence: Number(confidence), source:"UI" });
      await load();
    } catch(e){ console.error(e); } finally { setSending(false); }
  }
  async function triggerGamification() {
    setSending(true);
    try {
      await EventsAPI.sendGamification({ event:"course.completed", userId, courseId:"candlesticks_101", badge });
      await load();
    } catch(e){ console.error(e); } finally { setSending(false); }
  }
  async function triggerAlert() {
    setSending(true);
    try {
      await EventsAPI.sendAlert({ event:"staking.opportunity", asset, apy:Number(apy), platform:"OKX" });
      await load();
    } catch(e){ console.error(e); } finally { setSending(false); }
  }
  async function triggerCheckout() {
    setSending(true);
    try {
      await EventsAPI.mockCheckout(plan);
      await load();
    } catch(e){ console.error(e); } finally { setSending(false); }
  }

  return (
    <section className="page">
      <h1 className="page-title">n8n / Webhooks — Debug</h1>

      <div className="card" style={{display:"grid", gridTemplateColumns:"repeat(4,minmax(200px,1fr))", gap:12}}>
        <Field label="Symbol" value={symbol} onChange={setSymbol} />
        <Field label="Confidence" value={confidence} onChange={setConfidence} />
        <button className="btn" onClick={triggerRebalance} disabled={sending}>Send Rebalance</button>

        <Field label="User ID" value={userId} onChange={setUserId} />
        <Field label="Badge" value={badge} onChange={setBadge} />
        <button className="btn" onClick={triggerGamification} disabled={sending}>Send Gamification</button>

        <Field label="Asset" value={asset} onChange={setAsset} />
        <Field label="APY" value={apy} onChange={setApy} />
        <button className="btn" onClick={triggerAlert} disabled={sending}>Send Alert</button>

        <Field label="Plan" value={plan} onChange={setPlan} />
        <button className="btn" onClick={triggerCheckout} disabled={sending}>Mock Checkout</button>
        <button className="btn" onClick={async()=>{await EventsAPI.clear(); await load();}}>Clear Feed</button>
      </div>

      <div className="card" style={{marginTop:12}}>
        <div style={{fontWeight:700, marginBottom:8}}>Event Feed</div>
        {loading ? "Loading…" : events.length===0 ? "No events yet" :
          events.map((e,i)=>(
            <div key={e.id || i} style={{padding:"8px 0", borderBottom:"1px solid var(--line)"}}>
              <div style={{display:"flex", gap:8, alignItems:"baseline"}}>
                <span style={{fontWeight:600}}>{e.type}</span>
                <span style={{color:"var(--muted)", fontSize:12}}>{new Date(e.ts).toLocaleString()}</span>
                {e.traceId && <span style={{color:"var(--muted)", fontSize:12}}>trace {e.traceId}</span>}
                <span style={{color:e.ok? "var(--good)" : "var(--bad)", fontSize:12}}>{e.ok? "OK":"ERR"}</span>
              </div>
              {e.summary && <div style={{marginTop:4}}>{e.summary}</div>}
              <details style={{marginTop:6}}>
                <summary>payload</summary>
                <pre style={{whiteSpace:"pre-wrap"}}>{JSON.stringify(e.payload, null, 2)}</pre>
              </details>
            </div>
          ))
        }
      </div>
    </section>
  );
}
