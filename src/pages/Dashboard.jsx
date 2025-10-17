
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { fetchDashboardData } from "../services/providers/dashboard";

export default function Dashboard() {
  const { t } = useTranslation();
  const [data, setData] = useState({ markets: [], signals: [], arbitrage: [], predictions: [] });
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);

  async function load() {
    try {
      setErr(null); setLoading(true);
      const snapshot = await fetchDashboardData();
      setData(snapshot);
    } catch (e) { setErr(e); }
    finally { setLoading(false); }
  }

  useEffect(() => { load(); const id = setInterval(load, 60000); return () => clearInterval(id); }, []);

  const { markets, signals, arbitrage, predictions } = data;

  return (
    <section className="page">
   
      <h1 className="page-title">{t("pages.dashboard.title") || "Spectr Overview"}</h1>

      <div className="card" style={{ marginBottom: 12, display: "flex", alignItems: "center", gap: 12 }}>
        <button className="btn" onClick={load}>Refresh</button>
        <div className="muted">{loading ? "Loading…" : `Last sync ${new Date().toLocaleTimeString()}`}</div>
      </div>

      {err && <div className="card"><strong>API error</strong><pre>{JSON.stringify(err, null, 2)}</pre></div>}

      <div className="dashboard-grid">
        <div className="card">
          <div className="section-title">Top Markets</div>
          {markets.length === 0 ? "—" : (
            <div className="market-list">
              {markets.map((m) => (
                <div key={m.id} className="market-row">
                  <div className="market-name">
                    <img src={m.image} alt="" width={28} height={28} />
                    <div>
                      <div>{m.name}</div>
                      <div className="muted">{m.symbol}</div>
                    </div>
                  </div>
                  <div className="market-price">${m.price?.toLocaleString(undefined, { maximumFractionDigits: 2 })}</div>
                  <div className={m.change24h >= 0 ? "positive" : "negative"}>{m.change24h >= 0 ? "+" : ""}{m.change24h?.toFixed?.(2)}%</div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="card">
          <div className="section-title">Signals confidence</div>
          {signals.length === 0 ? "—" : (
            <div className="dashboard-list">
              {signals.map(sig => (
                <div key={sig.id} className="dashboard-row">
                  <div>
                    <div style={{ fontWeight: 600 }}>{sig.symbol}</div>
                    <div className="muted">{sig.timeframe}</div>
                  </div>
                  <div>{sig.signal}</div>
                  <div>{Math.round((sig.confidence ?? 0) * 100)}%</div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="card">
          <div className="section-title">Arbitrage net%</div>
          {arbitrage.length === 0 ? "—" : (
            <div className="dashboard-list">
              {arbitrage.slice(0, 4).map(item => (
                <div key={item.id} className="dashboard-row">
                  <div>
                    <div style={{ fontWeight: 600 }}>{item.symbol}</div>
                    <div className="muted">{item.buy.exchange} → {item.sell.exchange}</div>
                  </div>
                  <div>{(item.net ?? 0).toFixed(2)}%</div>
                  <div className="muted">fees {(item.fees ?? 0).toFixed(2)}%</div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="card">
          <div className="section-title">AI Forecasts</div>
          {predictions.length === 0 ? "—" : (
            <div className="dashboard-list">
              {predictions.slice(0, 4).map(pred => (
                <div key={pred.id} className="dashboard-row">
                  <div>
                    <div style={{ fontWeight: 600 }}>{pred.symbol}</div>
                    <div className="muted">{pred.horizon}</div>
                  </div>
                  <div>{Math.round(pred.probUp * 100)}%</div>
                  <div className="muted">brier {pred.brier?.toFixed?.(3)}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}