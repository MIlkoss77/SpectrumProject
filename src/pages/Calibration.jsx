import React, { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { CalibrationAPI } from "../services/calibration";

function miniLine(points, height = 220) {
    if (!points?.length) return null;
    const w = Math.max(360, points.length * 48);
    const minY = 0, maxY = 1, spanY = (maxY - minY) || 1;
    const x = (i) => (i / (points.length - 1)) * w;
    const y = (v) => (1 - ((v - minY) / spanY)) * height;
    const d = points.map((p, i) => `${i ? "L" : "M"} ${x(i)} ${y(p[1])}`).join(" ");
    const ref = `M 0 ${y(0)} L ${w} ${y(1)}`; // диагональ y=x
    return { w, h: height, d, ref };
}

export default function Calibration() {
    const { t } = useTranslation();
    const [bins, setBins] = useState(10);
    const [n, setN] = useState(300);
    const [res, setRes] = useState(null);
    const [loading, setLoading] = useState(false);
    const [err, setErr] = useState(null);
    const [mode, setMode] = useState("synthetic"); // synthetic | history

    async function run() {
        setErr(null); setLoading(true);
        try {
            const data = await CalibrationAPI.run({
                bins, n,
                source: mode // сервер поймёт и либо сгенерит, либо возьмёт историю
            });
            setRes(data);
        } catch (e) { setErr(e?.response?.data || e?.message || e); }
        finally { setLoading(false); }
    }

    const pts = useMemo(() => {
        if (!res?.bins) return [];
        return res.bins.map(b => [b.p_mean, b.y_rate]);
    }, [res]);

    const plot = useMemo(() => miniLine(pts), [pts]);

    function exportCSV() {
        if (!res?.bins?.length) return;
        const head = "bin, count, p_mean, y_rate\n";
        const rows = res.bins.map((b, i) => [i + 1, b.count, b.p_mean.toFixed(4), b.y_rate.toFixed(4)].join(",")).join("\n");
        const blob = new Blob([head + rows], { type: "text/csv;charset=utf-8" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url; a.download = "calibration_bins.csv"; a.click();
        URL.revokeObjectURL(url);
    }

    return (
        <section className="page">
            <h1 className="page-title">{t("pages.calibration?.title") || "Prediction Calibration (Brier)"}</h1>

            <div className="card" style={{ display: "grid", gridTemplateColumns: "repeat(6, minmax(160px,1fr))", gap: 12, alignItems: "end" }}>
                <label>Mode
                    <select value={mode} onChange={e => setMode(e.target.value)}>
                        <option value="synthetic">Synthetic (demo)</option>
                        <option value="history">History (server)</option>
                    </select>
                </label>
                <label>Bins
                    <input type="number" min="5" max="20" value={bins} onChange={e => setBins(+e.target.value || 10)} />
                </label>
                <label>Samples
                    <input type="number" min="100" max="5000" value={n} onChange={e => setN(+e.target.value || 300)} />
                </label>
                <button className="btn" onClick={run} disabled={loading}>{loading ? "Running…" : "Run"}</button>
                <button className="btn" onClick={exportCSV} disabled={!res?.bins?.length}>Export CSV</button>
            </div>

            {err && <div className="card"><strong>API error:</strong><pre>{JSON.stringify(err, null, 2)}</pre></div>}

            {res && (
                <>
                    <div className="card" style={{ display: "grid", gridTemplateColumns: "repeat(4, minmax(160px,1fr))", gap: 12 }}>
                        <div><div style={{ color: "var(--muted)" }}>Brier score</div><div style={{ fontSize: 22, fontWeight: 700 }}>{res.brier.toFixed(4)}</div></div>
                        <div><div style={{ color: "var(--muted)" }}>Bins</div><div style={{ fontSize: 22, fontWeight: 700 }}>{res.bins.length}</div></div>
                        <div><div style={{ color: "var(--muted)" }}>Samples</div><div style={{ fontSize: 22, fontWeight: 700 }}>{res.count}</div></div>
                        <div><div style={{ color: "var(--muted)" }}>ECE (naive)</div><div style={{ fontSize: 22, fontWeight: 700 }}>{res.ece?.toFixed(4) ?? "—"}</div></div>
                    </div>

                    <div className="card" style={{ marginTop: 12 }}>
                        {!plot ? "No data" :
                            <svg width={plot.w} height={plot.h} style={{ display: "block", overflow: "auto" }}>
                                <path d={plot.ref} fill="none" stroke="var(--line)" strokeWidth="1" />
                                <path d={plot.d} fill="none" stroke="currentColor" strokeWidth="2" />
                            </svg>
                        }
                    </div>
                </>
            )}
        </section>
    );
}
