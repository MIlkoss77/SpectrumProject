import React, { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { MarketAPI } from "../services/ohlc";

const DEFAULT_SYMBOLS = ["BTCUSDT","ETHUSDT","TONUSDT","SOLUSDT","BNBUSDT"];

function EMA(values, period){
  if (!values?.length || period<=0) return [];
  const k = 2/(period+1);
  const out=[];
  let ema=null;
  for (let i=0;i<values.length;i++){
    const v = values[i];
    ema = ema==null ? v : (v - ema)*k + ema;
    out.push(ema);
  }
  return out;
}
function RSI(closes, period=14){
  if(!closes?.length) return [];
  let gains=0, losses=0;
  const out = new Array(closes.length).fill(null);
  for (let i=1;i<closes.length;i++){
    const change = closes[i]-closes[i-1];
    const up = Math.max(change,0);
    const down = Math.max(-change,0);
    if (i<=period){
      gains += up; losses += down;
      if (i===period){
        const rs = losses===0 ? 100 : gains/losses;
        out[i] = 100 - 100/(1+rs);
      }
    } else {
      gains = (gains*(period-1) + up)/period;
      losses = (losses*(period-1) + down)/period;
      const rs = losses===0 ? 100 : gains/losses;
      out[i] = 100 - 100/(1+rs);
    }
  }
  return out;
}
function MACD(closes, fast=12, slow=26, signal=9){
  const emaFast = EMA(closes, fast);
  const emaSlow = EMA(closes, slow);
  const macd = emaFast.map((v,i)=>(v!=null && emaSlow[i]!=null)? v-emaSlow[i] : null);
  const sig = EMA(macd.map(v=>v??0), signal).map((v,i)=> macd[i]==null? null : v);
  const hist = macd.map((v,i)=> (v==null || sig[i]==null)? null : v - sig[i]);
  return { macd, signal: sig, hist };
}

function miniLine({points, height=220}){
  const w = Math.max(360, points.length*4);
  const min = Math.min(...points), max = Math.max(...points);
  const span = max-min || 1;
  const x = (i) => (i/(points.length-1))*w;
  const y = (v) => (1-((v-min)/span))*height;
  const d = points.map((p,i)=> `${i?"L":"M"} ${x(i)} ${y(p)}`).join(" ");
  return { w, h:height, d };
}

export default function TA(){
  const { t } = useTranslation();
  const [source, setSource] = useState("binance");
  const [symbol, setSymbol] = useState("BTCUSDT");
  const [tf, setTf] = useState("15m");
  const [limit, setLimit] = useState(200);
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);

  async function load(){
    try{
      setErr(null); setLoading(true);
      const data = await MarketAPI.ohlc({ symbol, tf, limit });
      setRows(Array.isArray(data) ? data : data.items || []);
    }catch(e){ setErr(e); } finally { setLoading(false); }
  }
  useEffect(()=>{ load(); }, [symbol, tf, limit]);

  const closes = useMemo(()=> rows.map(r=>r.c), [rows]);
  const ema50 = useMemo(()=> EMA(closes, 50), [closes]);
  const ema200 = useMemo(()=> EMA(closes, 200), [closes]);
  const rsi14 = useMemo(()=> RSI(closes, 14), [closes]);
  const macd = useMemo(()=> MACD(closes, 12, 26, 9), [closes]);

  const latest = rows.at(-1);
  const latestIdx = rows.length-1;
  const trend = useMemo(()=>{
    if (latestIdx<0) return "—";
    const c = closes[latestIdx];
    const e50 = ema50[latestIdx];
    const e200 = ema200[latestIdx];
    const rsi = rsi14[latestIdx] ?? 50;
    const macdNow = macd.macd[latestIdx] ?? 0;
    const sigNow = macd.signal[latestIdx] ?? 0;
    const up = (e50 && e200 && e50>e200) || (c>e200 && macdNow>0 && rsi>55);
    const down = (e50 && e200 && e50<e200) || (c<e200 && macdNow<0 && rsi<45);
    return up ? "UPTREND" : down ? "DOWNTREND" : "RANGE";
  }, [latestIdx, closes, ema50, ema200, rsi14, macd]);

  const score = useMemo(()=>{
    if (latestIdx<0) return 0;
    const c = closes[latestIdx];
    const e200 = ema200[latestIdx] ?? c;
    const rsi = rsi14[latestIdx] ?? 50;
    const mac = macd.macd[latestIdx] ?? 0;
    const sig = macd.signal[latestIdx] ?? 0;
    let s = 0;
    if (mac>sig) s+=1; else s-=1;
    if (mac>0) s+=1; else s-=1;
    if (rsi>55) s+=1; else if (rsi<45) s-=1;
    if (c>e200) s+=1; else s-=1;
    return s; // -4..+4
  }, [latestIdx, closes, ema200, rsi14, macd]);

  const signals = useMemo(()=>{
    const out=[];
    for (let i=1;i<rows.length;i++){
      const rsip = rsi14[i-1], rsin = rsi14[i];
      const macp = macd.macd[i-1], macn = macd.macd[i];
      const sigp = macd.signal[i-1], sign = macd.signal[i];
      const e50p = ema50[i-1], e50n = ema50[i];
      const e200p = ema200[i-1], e200n = ema200[i];
      if (rsip!=null && rsin!=null){
        if (rsip<30 && rsin>=30) out.push({ t: rows[i].t, type:"RSI_30_UP", dir:"BUY" });
        if (rsip>70 && rsin<=70) out.push({ t: rows[i].t, type:"RSI_70_DOWN", dir:"SELL" });
      }
      if (macp!=null && macn!=null && sigp!=null && sign!=null){
        const crossUp = macp<=sigp && macn>sign;
        const crossDn = macp>=sigp && macn<sign;
        if (crossUp) out.push({ t: rows[i].t, type:"MACD_CROSS_UP", dir:"BUY" });
        if (crossDn) out.push({ t: rows[i].t, type:"MACD_CROSS_DN", dir:"SELL" });
      }
      if (e50p!=null && e200p!=null && e50n!=null && e200n!=null){
        const bull = e50p<=e200p && e50n>e200n;
        const bear = e50p>=e200p && e50n<e200n;
        if (bull) out.push({ t: rows[i].t, type:"EMA50_OVER_200", dir:"BUY" });
        if (bear) out.push({ t: rows[i].t, type:"EMA50_UNDER_200", dir:"SELL" });
      }
    }
    return out.slice(-10);
  }, [rows, rsi14, macd, ema50, ema200]);

  const priceLine = useMemo(()=>{
    const points = rows.map(r=>r.c);
    if (!points.length) return null;
    return miniLine({ points, height: 220 });
  }, [rows]);

  return (
    <section className="page">
      <h1 className="page-title">{t("pages.ta?.title") || "TA & Trend (RSI, MACD, EMA)"}</h1>

      <div className="card" style={{display:"grid",gridTemplateColumns:"repeat(6, minmax(140px,1fr))",gap:12, alignItems:"end"}}>
        <label>Symbol<select value={symbol} onChange={e=>setSymbol(e.target.value)}>
          {DEFAULT_SYMBOLS.map(s=> <option key={s} value={s}>{s}</option>)}
        </select></label>
        <label>Timeframe<select value={tf} onChange={e=>setTf(e.target.value)}>
          {["5m","15m","1h","4h"].map(t=> <option key={t} value={t}>{t}</option>)}
        </select></label>
        <label>Bars<input type="number" min="50" max="500" value={limit} onChange={e=>setLimit(+e.target.value||200)} /></label>
        <button className="btn" onClick={()=>load()}>Refresh</button>

        <div style={{alignSelf:"center"}}>
          <div style={{color:"var(--muted)", fontSize:12}}>Trend</div>
          <div style={{fontSize:22,fontWeight:700}}>{trend}</div>
        </div>
        <div style={{alignSelf:"center"}}>
          <div style={{color:"var(--muted)", fontSize:12}}>Score (−4..+4)</div>
          <div style={{fontSize:22,fontWeight:700}}>{score>0?`+${score}`:score}</div>
        </div>
      </div>

      <div className="card" style={{marginTop:12}}>
        {!priceLine ? "Loading…" :
          <svg width={priceLine.w} height={priceLine.h} style={{display:"block", overflow:"auto"}}>
            <path d={priceLine.d} fill="none" stroke="currentColor" strokeWidth="2" />
          </svg>
        }
      </div>

      <div className="card" style={{display:"grid",gridTemplateColumns:"repeat(4, minmax(160px,1fr))",gap:12}}>
        <div>
          <div style={{color:"var(--muted)"}}>Last price</div>
          <div style={{fontSize:22,fontWeight:700}}>{latest? latest.c.toFixed(2) : "—"}</div>
        </div>
        <div>
          <div style={{color:"var(--muted)"}}>RSI(14)</div>
          <div style={{fontSize:22,fontWeight:700}}>{rsi14.at(-1)?.toFixed(1) ?? "—"}</div>
        </div>
        <div>
          <div style={{color:"var(--muted)"}}>MACD</div>
          <div style={{fontSize:22,fontWeight:700}}>{macd.macd.at(-1)?.toFixed(3) ?? "—"} / {macd.signal.at(-1)?.toFixed(3) ?? "—"}</div>
        </div>
        <div>
          <div style={{color:"var(--muted)"}}>EMA(50/200)</div>
          <div style={{fontSize:22,fontWeight:700}}>{ema50.at(-1)?.toFixed(2) ?? "—"} / {ema200.at(-1)?.toFixed(2) ?? "—"}</div>
        </div>
      </div>

      <div className="card">
        <div style={{fontWeight:700, marginBottom:8}}>Recent signals</div>
        {signals.length===0 ? "No recent crossovers" :
          signals.map((s,i)=>(
            <div key={i} style={{display:"grid",gridTemplateColumns:"180px 160px 1fr",gap:12,padding:"6px 0",borderBottom:"1px solid var(--line)"}}>
              <div>{new Date(s.t).toLocaleString()}</div>
              <div style={{fontWeight:600}}>{s.dir}</div>
              <div style={{color:"var(--muted)"}}>{s.type}</div>
            </div>
          ))
        }
      </div>
      <div style={{color:"var(--muted)", fontSize:12, marginTop:8}}>
        * Индикаторы и «score» носят ознакомительный характер и не являются инвестиционной рекомендацией.
      </div>
    </section>
  );
}
