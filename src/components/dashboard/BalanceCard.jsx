import React from "react";

function formatPct(value) {
  if (value == null) return "—";
  const num = Number(value);
  if (Number.isNaN(num)) return "—";
  return `${num > 0 ? "+" : ""}${num.toFixed(2)}%`;
}

function formatUsd(value) {
  if (value == null) return "—";
  const num = Number(value);
  if (Number.isNaN(num)) return "—";
  if (Math.abs(num) >= 1000) {
    return `$${num.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
  }
  return `$${num.toFixed(2)}`;
}

export default function BalanceCard({
  title,
  plan,
  trialUntil,
  metrics,
  allocations,
  recommendation,
  onManagePlan,
  onRefresh,
  loading,
  t,
}) {
  const trialActive = trialUntil && Date.now() < Date.parse(trialUntil);
  return (
    <div className="card" style={{ display: "grid", gap: 16 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
        <div>
          <div style={{ fontSize: 18, fontWeight: 700 }}>{title}</div>
          <div style={{ color: "var(--muted)", fontSize: 13 }}>
            {t("pages.dashboard.planLabel", { plan })}
            {trialActive ? ` · ${t("pages.dashboard.trialUntil", { date: new Date(trialUntil).toLocaleString() })}` : ""}
          </div>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          {onRefresh && (
            <button className="btn" onClick={onRefresh} disabled={loading}>
              {loading ? t("ui.loading") : t("ui.refresh")}
            </button>
          )}
          {onManagePlan && (
            <button className="btn" onClick={onManagePlan}>
              {t("pages.dashboard.managePlan")}
            </button>
          )}
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 12 }}>
        <Metric label={t("pages.dashboard.capital")}>{formatUsd(metrics?.capital)}</Metric>
        <Metric label={t("pages.dashboard.pnl24h")}>{formatUsd(metrics?.pnl24h)}</Metric>
        <Metric label={t("pages.dashboard.winRate")}>{formatPct(metrics?.winRate)}</Metric>
        <Metric label={t("pages.dashboard.brier")}>{metrics?.brier != null ? metrics.brier.toFixed(3) : "—"}</Metric>
      </div>

      {!!allocations?.length && (
        <div style={{ display: "grid", gap: 8 }}>
          <div style={{ fontWeight: 600 }}>{t("pages.dashboard.allocations")}</div>
          <div style={{ display: "grid", gap: 6 }}>
            {allocations.map(item => (
              <AllocationRow key={item.symbol} item={item} t={t} />
            ))}
          </div>
        </div>
      )}

      {recommendation && (
        <div style={{ border: "1px dashed var(--line)", borderRadius: 10, padding: 12, background: "rgba(96,165,250,0.06)" }}>
          <div style={{ fontWeight: 600, marginBottom: 4 }}>
            {t("pages.dashboard.recommendationTitle", { profile: recommendation.riskProfile || "balanced" })}
          </div>
          <div style={{ color: "var(--muted)", fontSize: 13 }}>
            {recommendation.rationale || t("pages.dashboard.recommendationFallback")}
          </div>
        </div>
      )}
    </div>
  );
}

function Metric({ label, children }) {
  return (
    <div>
      <div style={{ color: "var(--muted)", fontSize: 12 }}>{label}</div>
      <div style={{ fontSize: 22, fontWeight: 700 }}>{children}</div>
    </div>
  );
}

function AllocationRow({ item, t }) {
  const diff =
    item.recommended != null && item.current != null
      ? item.recommended - item.current
      : null;
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "120px 1fr 120px",
        gap: 12,
        alignItems: "center",
        padding: "6px 8px",
        border: "1px solid var(--line)",
        borderRadius: 10,
      }}
    >
      <div style={{ fontWeight: 600 }}>{item.symbol}</div>
      <div style={{ color: "var(--muted)", fontSize: 12 }}>
        {t("pages.dashboard.currentAllocation", { value: formatPct(item.current) })}
      </div>
      <div style={{ textAlign: "right", fontWeight: 600 }}>
        {item.recommended != null ? (
          <span>
            {t("pages.dashboard.target", { value: formatPct(item.recommended) })}
            {diff != null && Math.abs(diff) > 0.2 && (
              <span style={{ color: diff > 0 ? "var(--good)" : "var(--bad)", marginLeft: 6 }}>
                {diff > 0 ? "↑" : "↓"} {formatPct(Math.abs(diff))}
              </span>
            )}
          </span>
        ) : (
          t("pages.dashboard.noChange")
        )}
      </div>
    </div>
  );
}
