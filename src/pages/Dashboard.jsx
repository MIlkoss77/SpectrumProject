import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import BalanceCard from "../components/dashboard/BalanceCard.jsx";
import QuickActions from "../components/dashboard/QuickActions.jsx";
import SignalsCard from "../components/dashboard/SignalsCard.jsx";
import { BillingAPI, SignalsAPI, StrategyAPI, PredictionsAPI } from "../services/api";

const REFRESH_INTERVAL = 60000;

export default function Dashboard() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [state, setState] = useState({
    loading: true,
    billing: null,
    strategy: null,
    recommendation: null,
    signals: [],
    predictions: [],
    error: null,
  });

  const load = async () => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    try {
      const [billingRes, strategyRes, recsRes, signalsRes, predictionsRes] = await Promise.allSettled([
        BillingAPI.me(),
        StrategyAPI.get(),
        StrategyAPI.recs({ limit: 1 }),
        SignalsAPI.list({ limit: 6 }),
        PredictionsAPI.list({ limit: 10 }),
      ]);

      const billing = billingRes.status === "fulfilled" ? billingRes.value : null;
      const strategy = strategyRes.status === "fulfilled" ? strategyRes.value : null;
      const recommendation =
        recsRes.status === "fulfilled"
          ? Array.isArray(recsRes.value)
            ? recsRes.value[0]
            : recsRes.value?.items?.[0] || null
          : null;
      const signals = signalsRes.status === "fulfilled"
        ? (Array.isArray(signalsRes.value) ? signalsRes.value : signalsRes.value?.items || [])
        : [];
      const predictions = predictionsRes.status === "fulfilled"
        ? (Array.isArray(predictionsRes.value) ? predictionsRes.value : predictionsRes.value?.items || [])
        : [];

      setState({
        loading: false,
        billing,
        strategy,
        recommendation,
        signals,
        predictions,
        error: null,
      });
    } catch (error) {
      setState(prev => ({ ...prev, loading: false, error }));
    }
  };

  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      if (!cancelled) await load();
    };
    run();
    const id = setInterval(() => {
      if (!cancelled) load();
    }, REFRESH_INTERVAL);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, []);

  const metrics = useMemo(() => {
    const capital = state.strategy?.capital ?? state.billing?.capital ?? state.billing?.balance ?? null;
    const pnl24h = state.strategy?.pnl24h ?? state.billing?.pnl24h ?? null;
    const winRate = state.strategy?.winRate ?? state.billing?.winRate ?? null;
    const brier = state.predictions?.length
      ? state.predictions.reduce((acc, item) => acc + Number(item.brier || 0), 0) / state.predictions.length
      : null;
    return { capital, pnl24h, winRate, brier };
  }, [state.strategy, state.billing, state.predictions]);

  const allocations = useMemo(() => {
    const current = state.strategy?.weights || {};
    const recommended = state.recommendation?.suggestedWeights || {};
    const symbols = Array.from(new Set([...Object.keys(current), ...Object.keys(recommended)]));
    return symbols.map(symbol => ({
      symbol,
      current: current[symbol] != null ? Number(current[symbol]) : null,
      recommended: recommended[symbol] != null ? Number(recommended[symbol]) : null,
    }));
  }, [state.strategy, state.recommendation]);

  const actions = useMemo(() => [
    {
      id: "signals",
      label: t("pages.dashboard.actionSignals"),
      description: t("pages.dashboard.actionSignalsDesc"),
      onClick: () => navigate("/signals"),
    },
    {
      id: "copy",
      label: t("pages.dashboard.actionCopy"),
      description: t("pages.dashboard.actionCopyDesc"),
      onClick: () => navigate("/copy/sim"),
    },
    {
      id: "arbitrage",
      label: t("pages.dashboard.actionArb"),
      description: t("pages.dashboard.actionArbDesc"),
      onClick: () => navigate("/arbitrage"),
    },
    {
      id: "rebalance",
      label: t("pages.dashboard.actionRebalance"),
      description: t("pages.dashboard.actionRebalanceDesc"),
      onClick: () => navigate("/events"),
    },
  ], [navigate, t]);

  return (
    <section className="page" style={{ display: "grid", gap: 16 }}>
      <h1 className="page-title">{t("pages.dashboard.title")}</h1>

      {state.error && (
        <div className="card" style={{ borderColor: "var(--bad)", color: "var(--bad)" }}>
          <div style={{ fontWeight: 600 }}>{t("ui.error")}</div>
          <pre style={{ whiteSpace: "pre-wrap", margin: 0 }}>{JSON.stringify(state.error, null, 2)}</pre>
        </div>
      )}

      <BalanceCard
        title={t("pages.dashboard.portfolio")}
        plan={state.billing?.plan || "Explorer"}
        trialUntil={state.billing?.trialUntil}
        metrics={metrics}
        allocations={allocations}
        recommendation={state.recommendation}
        loading={state.loading}
        onRefresh={load}
        onManagePlan={() => navigate("/pricing")}
        t={t}
      />

      <QuickActions actions={actions} />

      <SignalsCard signals={state.signals} onViewAll={() => navigate("/signals")} />
    </section>
  );
}
