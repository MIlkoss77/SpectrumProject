
import React, { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { NewsAPI } from "../services/api";

const langs = ["en", "es", "pt", "ru"];

function ImpactTag({ impact }) {
    const tone = impact === "high" ? "var(--bad)" : impact === "med" ? "var(--warn)" : "var(--muted)";
    return <span style={{ color: tone, fontWeight: 600 }}>{impact?.toUpperCase?.() || "N/A"}</span>;
}

export default function News() {
    const { t } = useTranslation();
    const [items, setItems] = useState([]);
    const [lang, setLang] = useState("en");
    const [impact, setImpact] = useState("all"); // all|low|med|high
    const [err, setErr] = useState(null);
    const [loading, setLoading] = useState(true);

    const filteredItems = useMemo(() => {
        if (impact === "all") return items;
        return items.filter(item => item.impact === impact);
    }, [items, impact]);

    async function load() {
        try {
            setErr(null); setLoading(true);
            const data = await NewsAPI.list({ lang, limit: 40 });
            setItems(Array.isArray(data) ? data : data.items || []);
        } catch (e) { setErr(e); }
        finally { setLoading(false); }
    }

    useEffect(() => { load(); }, [lang]);

    return (
        <section className="page">
            <h1 className="page-title">{t("pages.news.title")}</h1>

            <div className="card" style={{ display: "flex", gap: 8, marginBottom: 12, alignItems: "center" }}>
                <span className="muted">Lang</span>
                {langs.map(l => (
                    <button key={l} className={"pill" + (lang === l ? " selected" : "")} onClick={() => setLang(l)}>{l.toUpperCase()}</button>
                ))}
                <span className="muted" style={{ marginLeft: 16 }}>Impact</span>
                {["all", "low", "med", "high"].map(k => (
                    <button key={k} className={"pill" + (impact === k ? " selected" : "")} onClick={() => setImpact(k)}>{k}</button>
                ))}
                <button className="btn" style={{ marginLeft: "auto" }} onClick={load}>Refresh</button>
            </div>

            {err && <div className="card"><strong>API error:</strong><pre>{JSON.stringify(err, null, 2)}</pre></div>}
            
            <div className="card news-grid">
                {loading ? "Loading…" : filteredItems.length === 0 ? "No news" :
                    filteredItems.map((n, i) => (
                        <div key={n.id || i} className="news-item">
                            <div className="news-header">
                                <a href={n.url} target="_blank" rel="noreferrer" className="news-title">{n.title}</a>
                                <div className="news-meta">
                                    <span>{n.source}</span>
                                    <span>{n.lang?.toUpperCase?.()}</span>
                                    <span><ImpactTag impact={n.impact} /></span>
                                    <span>{n.sentiment}</span>
                                    <span>{Math.round((n.confidence ?? 0) * 100)}%</span>
                                </div>
                            </div>
                            {n.summary && <div className="news-summary">{n.summary}</div>}
                            {n.related?.length ? (
                                <div className="news-tags">
                                    {n.related.map((tag, idx) => <span key={idx} className="pill">{tag}</span>)}
                                </div>
                            ) : null}
                            <div className="news-footer muted">
                                {new Date(n.publishedAt).toLocaleString()}
                            </div>
                            
                        </div>
                    ))
                }
            </div>
        </section>
    );
}