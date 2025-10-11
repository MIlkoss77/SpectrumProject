import React from "react";
import { useTranslation } from "react-i18next";

export default function SignalsCard({ signals, onViewAll }) {
  const { t } = useTranslation();
  const list = Array.isArray(signals) ? signals.slice(0, 6) : [];
  return (
    <div className="card" style={{ display: "grid", gap: 12 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
        <div style={{ fontSize: 16, fontWeight: 700 }}>{t("pages.dashboard.latestSignals")}</div>
        {onViewAll && (
          <button className="btn" onClick={onViewAll} type="button">
            {t("ui.viewMore")}
          </button>
        )}
      </div>
      <div style={{ display: "grid", gap: 10 }}>
        {list.length === 0 ? (
          <div style={{ color: "var(--muted)" }}>{t("pages.dashboard.noSignals")}</div>
        ) : (
          list.map((s, idx) => (
            <div
              key={s.id || `${s.symbol}-${idx}`}
              style={{
                display: "grid",
                gridTemplateColumns: "120px 1fr 70px 120px",
                gap: 12,
                alignItems: "center",
              }}
            >
              <div style={{ fontWeight: 600 }}>{s.symbol}</div>
              <div>{s.signal}{s.timeframe ? ` · ${s.timeframe}` : ""}</div>
              <div style={{ color: "var(--muted)" }}>
                {s.confidence != null ? Math.round(Number(s.confidence) * 100) + "%" : "—"}
              </div>
              <div style={{ color: "var(--muted)", fontSize: 12 }}>
                {s.ts ? new Date(s.ts).toLocaleTimeString() : ""}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
