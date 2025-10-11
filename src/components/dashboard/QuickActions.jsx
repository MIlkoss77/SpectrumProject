import React from "react";
import { useTranslation } from "react-i18next";

export default function QuickActions({ actions }) {
  const { t } = useTranslation();
  const list = actions?.length ? actions : [];
  return (
    <div className="card" style={{ display: "grid", gap: 12 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
        <div style={{ fontSize: 16, fontWeight: 700 }}>{t("pages.dashboard.quickActions")}</div>
        <div style={{ color: "var(--muted)", fontSize: 12 }}>{t("pages.dashboard.quickActionsHint")}</div>
      </div>
      <div style={{ display: "grid", gap: 10, gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))" }}>
        {list.map(action => (
          <button
            key={action.id}
            className="btn"
            style={{ textAlign: "left", padding: "12px", display: "grid", gap: 6 }}
            onClick={action.onClick}
            type="button"
          >
            <span style={{ fontWeight: 600 }}>{action.label}</span>
            <span style={{ color: "var(--muted)", fontSize: 12 }}>{action.description}</span>
          </button>
        ))}
        {!list.length && <div style={{ color: "var(--muted)" }}>{t("pages.dashboard.noQuickActions")}</div>}
      </div>
    </div>
  );
}
