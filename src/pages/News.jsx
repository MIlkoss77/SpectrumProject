import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { NewsAPI } from "../services/api";

const langs = ["en", "es", "pt", "ru"];

export default function News() {
    const { t } = useTranslation();
    const [items, setItems] = useState([]);
    const [lang, setLang] = useState("en");
    const [impact, setImpact] = useState("all"); // all|low|med|high
    const [err, setErr] = useState(null);
    const [loading, setLoading] = useState(true);

    async function load() {
        try {
            setErr(null); setLoading(true);
            const data = await NewsAPI.list({ lang, impact: impact === "all" ? undefined : impact, limit: 30 });
            setItems(Array.isArray(data) ? data : data.items || []);
        } catch (e) { setErr(e); }
        finally { setLoading(false); }
    }

    useEffect(() => { load(); }, [lang, impact]);

    return (
        <section className="page">
            <h1 className="page-title">{t("pages.news.title")}</h1>

            <div className="card" style={{ display: "flex", gap: 8, marginBottom: 12 }}>
                {langs.map(l => (
                    <button key={l} className={"pill" + (lang === l ? " selected" : "")} onClick={() => setLang(l)}>{l.toUpperCase()}</button>
                ))}
                {["all", "low", "med", "high"].map(k => (
                    <button key={k} className={"pill" + (impact === k ? " selected" : "")} onClick={() => setImpact(k)}>{k}</button>
                ))}
            </div>

            {err && <div className="card"><strong>API error:</strong><pre>{JSON.stringify(err, null, 2)}</pre></div>}
            <div className="card">
                {loading ? "Loading…" : items.length === 0 ? "No news" :
                    items.map((n, i) => (
                        <div key={n.id || i} style={{ padding: "10px 0", borderBottom: "1px solid var(--line)" }}>
                            <div style={{ fontWeight: 600 }}>{n.title}</div>
                            <div style={{ color: "#94a3b8", fontSize: 12 }}>
                                {n.source} · {n.lang?.toUpperCase()} · impact: {n.impact?.toUpperCase()} · {n.sentiment}
                            </div>
                            {n.summary && <div style={{ marginTop: 6 }}>{n.summary}</div>}
                        </div>
                    ))
                }
            </div>
        </section>
    );
}
