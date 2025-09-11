import React, { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { PredictionsAPI } from "../services/api";

function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); }

// Kelly fraction (b = reward/risk, p = probUp)
function kelly(p, b) {
    if (!b || b <= 0) return 0;
    const f = p - (1 - p) / b;
    return clamp(f, 0, 1);
}

export default function Forecasts() {
    const { t } = useTranslation();
    const [rows, setRows] = useState([]);
    const [loading, setLoading] = useState(true);
    const [err, setErr] = useState(null);

    // inputs для калькулятора
    const [selected, setSelected] = useState(null);       // строка предсказания
    const [stake, setStake] = useState(100);              // $ объём сделки
    const [targetPct, setTargetPct] = useState(2);        // % профита при успехе
    const [stopPct, setStopPct] = useState(1);            // % убытка при неуспехе
    const [feesPct, setFeesPct] = useState(0.10);         // % суммарных комиссий (туда+обратно)
    const [bankroll, setBankroll] = useState(1000);       // $ банкролл (для Kelly)

    async function load() {
        try {
            setErr(null); setLoading(true);
            const data = await PredictionsAPI.list();
            const list = Array.isArray(data) ? data : data.items || [];
            setRows(list);
            setSelected(list[0] || null);
        } catch (e) { setErr(e); }
        finally { setLoading(false); }
    }

    useEffect(() => { load(); }, []);

    // расчёты
    const calc = useMemo(() => {
        if (!selected) return null;
        const p = Number(selected.probUp ?? 0);                 // вероятность роста (0..1)
        const r = Number(targetPct) / Number(stopPct || 1);       // reward/risk
        const fKelly = kelly(p, r);                              // доля от банкролла (0..1)
        const evPct = p * Number(targetPct) - (1 - p) * Number(stopPct) - Number(feesPct); // ожидание, %
        const evUsd = stake * (evPct / 100);
        const recStake = Math.round(fKelly * bankroll);          // $ по Kelly
        return {
            p, r, fKelly, evPct: +evPct.toFixed(2), evUsd: +evUsd.toFixed(2),
            recStake, horizon: selected.horizon, symbol: selected.symbol
        };
    }, [selected, stake, targetPct, stopPct, feesPct, bankroll]);

    return (
        <section className="page">
            <h1 className="page-title">{t("pages.forecasts?.title") || "Forecasts & PnL"}</h1>

            {err && <div className="card"><strong>API error:</strong><pre>{JSON.stringify(err, null, 2)}</pre></div>}

            <div className="card" style={{ marginBottom: 12 }}>
                {loading ? "Loading…" :
                    rows.length === 0 ? "No forecasts yet" :
                        rows.map((r, i) => (
                            <div key={r.id || i}
                                onClick={() => setSelected(r)}
                                style={{
                                    display: "grid",
                                    gridTemplateColumns: "120px 100px 1fr 100px 100px",
                                    gap: 12, padding: "8px 0",
                                    borderBottom: "1px solid var(--line)",
                                    cursor: "pointer",
                                    background: selected === r ? "rgba(255,255,255,0.02)" : "transparent",
                                    borderRadius: 8
                                }}>
                                <div>{r.symbol}</div>
                                <div>{r.horizon || "-"}</div>
                                <div style={{ color: "var(--muted)" }}>brier: {r.brier != null ? r.brier.toFixed(3) : "-"}</div>
                                <div style={{ fontWeight: 700 }}>{r.probUp != null ? Math.round(r.probUp * 100) + "%" : "-"}</div>
                                <div style={{ color: "var(--muted)" }}>{r.ts ? new Date(r.ts).toLocaleTimeString() : ""}</div>
                            </div>
                        ))
                }
            </div>

            <div className="card" style={{ display: "grid", gridTemplateColumns: "repeat(6, minmax(140px,1fr))", gap: 12, alignItems: "end" }}>
                <label>Stake, $<input type="number" value={stake} onChange={e => setStake(+e.target.value || 0)} /></label>
                <label>Target +%, win<input type="number" step="0.1" value={targetPct} onChange={e => setTargetPct(+e.target.value || 0)} /></label>
                <label>Stop −%, loss<input type="number" step="0.1" value={stopPct} onChange={e => setStopPct(+e.target.value || 0)} /></label>
                <label>Fees total %<input type="number" step="0.01" value={feesPct} onChange={e => setFeesPct(+e.target.value || 0)} /></label>
                <label>Bankroll, $<input type="number" value={bankroll} onChange={e => setBankroll(+e.target.value || 0)} /></label>
                <div style={{ alignSelf: "center" }}>
                    <div style={{ fontSize: 12, color: "var(--muted)" }}>Selected</div>
                    <div><strong>{selected ? `${selected.symbol} · ${selected.horizon}` : "—"}</strong></div>
                </div>
            </div>

            {!!calc && (
                <div className="card" style={{ display: "grid", gridTemplateColumns: "repeat(4, minmax(180px,1fr))", gap: 12 }}>
                    <div>
                        <div style={{ color: "var(--muted)" }}>Prob ↑</div>
                        <div style={{ fontSize: 22, fontWeight: 700 }}>{Math.round(calc.p * 100)}%</div>
                    </div>
                    <div>
                        <div style={{ color: "var(--muted)" }}>Reward/Risk (b)</div>
                        <div style={{ fontSize: 22, fontWeight: 700 }}>{calc.r.toFixed(2)}</div>
                    </div>
                    <div>
                        <div style={{ color: "var(--muted)" }}>EV (%, $)</div>
                        <div style={{ fontSize: 22, fontWeight: 700 }}>
                            {calc.evPct > 0 ? "+" : ""}{calc.evPct}% · {calc.evUsd > 0 ? "+" : ""}{calc.evUsd}$
                        </div>
                    </div>
                    <div>
                        <div style={{ color: "var(--muted)" }}>Kelly stake</div>
                        <div style={{ fontSize: 22, fontWeight: 700 }}>
                            {Math.round(calc.fKelly * 100)}% → ${calc.recStake}
                        </div>
                    </div>
                    <div style={{ gridColumn: "1/-1", color: "var(--muted)", fontSize: 12 }}>
                        * Расчёты по Kelly и EV носят информационный характер и не являются финансовой рекомендацией.
                    </div>
                </div>
            )}
        </section>
    );
}
