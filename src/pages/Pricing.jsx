import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

const plans = [
  { id:"Explorer",  price:"Free",  perks:["Read-only", "Signals preview"] },
  { id:"Trader",    price:"$14.9", perks:["AI predictions", "Copy (sim)", "Arbitrage net"] },
  { id:"Pro",       price:"$29",   perks:["All Trader", "Automation via n8n", "Deeplinks/alerts"] },
  { id:"Premium",   price:"$59",   perks:["All Pro", "Priority latency", "VIP alerts"] },
];

export default function Pricing() {
  const { t } = useTranslation();
  const [status, setStatus] = useState({ plan: localStorage.getItem("spectr.plan") || "Explorer", trialUntil: localStorage.getItem("spectr.trialUntil") || null });
  const [msg, setMsg] = useState("");

  function startTrial(plan="Trader") {
    const until = new Date(Date.now()+7*24*3600*1000).toISOString();
    localStorage.setItem("spectr.plan", plan);
    localStorage.setItem("spectr.trialUntil", until);
    setStatus({ plan: plan, trialUntil: until });
    setMsg(`Trial for ${plan} until ${new Date(until).toLocaleString()}`);
  }

  async function mockCheckout(plan="Trader") {
    setMsg("Processing checkout…");
    try {
      const base = import.meta.env.VITE_API_BASE || "";
      await fetch(`${base}/billing/webhook/mock`, {
        method: "POST",
        headers: { "Content-Type":"application/json" },
        body: JSON.stringify({ type:"checkout.session.completed", data:{ plan } })
      });
    } catch { /* ignore for local mock */ }
    localStorage.setItem("spectr.plan", plan);
    localStorage.removeItem("spectr.trialUntil");
    setStatus({ plan, trialUntil: null });
    setMsg(`Activated ${plan}`);
  }

  useEffect(() => {
    // автосброс истёкшего триала
    if (status.trialUntil && Date.now() > Date.parse(status.trialUntil)) {
      localStorage.setItem("spectr.plan", "Explorer");
      localStorage.removeItem("spectr.trialUntil");
      setStatus({ plan:"Explorer", trialUntil:null });
      setMsg("Trial expired");
    }
  }, []);

  return (
    <section className="page">
      <h1 className="page-title">{t("pages.pricing.title") || "Pricing"}</h1>

      <div className="card" style={{marginBottom:12}}>
        <div>Current plan: <strong>{status.plan}</strong>{status.trialUntil ? ` (trial until ${new Date(status.trialUntil).toLocaleString()})` : ""}</div>
        {!!msg && <div style={{color:"var(--muted)", marginTop:6}}>{msg}</div>}
      </div>

      <div style={{display:"grid", gridTemplateColumns:"repeat(4, minmax(220px,1fr))", gap:12}}>
        {plans.map(p => (
          <div key={p.id} className="card">
            <div style={{fontSize:18, fontWeight:700, marginBottom:6}}>{p.id}</div>
            <div style={{fontSize:22, marginBottom:10}}>{p.price}</div>
            <ul style={{margin:"6px 0 12px 16px"}}>
              {p.perks.map((x,i)=><li key={i}>{x}</li>)}
            </ul>
            {p.id==="Explorer" ? (
              <button className="btn" onClick={()=>startTrial("Trader")}>Start 7-day Trader trial</button>
            ) : (
              <>
                <button className="btn" onClick={()=>startTrial(p.id)} style={{marginRight:8}}>Try {p.id}</button>
                <button className="btn" onClick={()=>mockCheckout(p.id)}>Subscribe {p.id}</button>
              </>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
