import React, { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { StakingAPI } from "../services/api";

const STORAGE_KEY = "spectr.staking.demo";

const defaultTxState = [];

export default function Staking() {
  const { t } = useTranslation();
  const [pools, setPools] = useState([]);
  const [statusFilter, setStatusFilter] = useState("active");
  const [testnetOnly, setTestnetOnly] = useState(false);
  const [amount, setAmount] = useState(100);
  const [txLog, setTxLog] = useState(() => {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || defaultTxState; }
    catch { return defaultTxState; }
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = async () => {
    try {
      setError(null);
      setLoading(true);
      const data = await StakingAPI.list();
      const items = Array.isArray(data) ? data : data.items || [];
      setPools(items);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    const id = setInterval(load, 60000);
    return () => clearInterval(id);
  }, []);

  const filtered = useMemo(() => {
    return pools
      .filter(pool => (statusFilter === "all" ? true : (pool.status || "active") === statusFilter))
      .filter(pool => (testnetOnly ? /testnet/i.test(pool.network || "") : true));
  }, [pools, statusFilter, testnetOnly]);

  const submit = (pool, type) => {
    const entry = {
      id: `${pool.id}-${Date.now()}`,
      ts: new Date().toISOString(),
      pool: pool.id,
      network: pool.network,
      amount: Number(amount),
      type,
      apr: pool.apr,
    };
    const next = [entry, ...txLog].slice(0, 10);
    setTxLog(next);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  };

  return (
    <section className="page" style={{ display: "grid", gap: 16 }}>
      <h1 className="page-title">{t("pages.staking.title")}</h1>

      <div className="card" style={{ display: "grid", gap: 12, gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", alignItems: "end" }}>
        <label style={{ display: "grid", gap: 6 }}>
          <span style={{ color: "var(--muted)", fontSize: 12 }}>{t("pages.staking.filterStatus")}</span>
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
            <option value="all">{t("pages.staking.statusAll")}</option>
            <option value="active">{t("pages.staking.statusActive")}</option>
            <option value="upcoming">{t("pages.staking.statusUpcoming")}</option>
            <option value="ended">{t("pages.staking.statusEnded")}</option>
          </select>
        </label>
        <label style={{ display: "grid", gap: 6 }}>
          <span style={{ color: "var(--muted)", fontSize: 12 }}>{t("pages.staking.amount")}</span>
          <input type="number" min="1" value={amount} onChange={e => setAmount(Number(e.target.value) || 0)} />
        </label>
        <label style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <input type="checkbox" checked={testnetOnly} onChange={e => setTestnetOnly(e.target.checked)} />
          <span>{t("pages.staking.testnetOnly")}</span>
        </label>
        <button className="btn" onClick={load} disabled={loading}>
          {loading ? t("ui.loading") : t("ui.refresh")}
        </button>
      </div>

      {error && (
        <div className="card" style={{ borderColor: "var(--bad)", color: "var(--bad)" }}>
          <div style={{ fontWeight: 600 }}>{t("ui.error")}</div>
          <pre style={{ whiteSpace: "pre-wrap", margin: 0 }}>{JSON.stringify(error, null, 2)}</pre>
        </div>
      )}

      <div className="card" style={{ display: "grid", gap: 12 }}>
        {loading ? (
          <div>{t("ui.loading")}</div>
        ) : filtered.length === 0 ? (
          <div style={{ color: "var(--muted)" }}>{t("pages.staking.empty")}</div>
        ) : (
          filtered.map(pool => (
            <div
              key={pool.id}
              style={{
                border: "1px solid var(--line)",
                borderRadius: 12,
                padding: 12,
                display: "grid",
                gap: 10,
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
                <div>
                  <div style={{ fontSize: 16, fontWeight: 700 }}>{pool.name || pool.id}</div>
                  <div style={{ color: "var(--muted)", fontSize: 12 }}>
                    {pool.network} · {pool.lockup ? t("pages.staking.lockup", { days: pool.lockup }) : t("pages.staking.flexible")}
                  </div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: 26, fontWeight: 700 }}>{Number(pool.apr || pool.apy || 0).toFixed(2)}%</div>
                  <div style={{ color: "var(--muted)", fontSize: 12 }}>{t("pages.staking.apy")}</div>
                </div>
              </div>
              {pool.description && <div style={{ color: "var(--muted)", fontSize: 13 }}>{pool.description}</div>}
              {pool.risk && (
                <div style={{ fontSize: 12, color: "var(--muted)" }}>
                  {t("pages.staking.risk", { value: pool.risk })}
                </div>
              )}
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                <button className="btn" onClick={() => submit(pool, "stake")}>
                  {t("ui.stake")}
                </button>
                <button className="btn" onClick={() => submit(pool, "unstake")}>
                  {t("ui.unstake")}
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="card" style={{ display: "grid", gap: 10 }}>
        <div style={{ fontWeight: 600 }}>{t("pages.staking.activity")}</div>
        {txLog.length === 0 ? (
          <div style={{ color: "var(--muted)" }}>{t("pages.staking.activityEmpty")}</div>
        ) : (
          txLog.map(entry => (
            <div key={entry.id} style={{ display: "grid", gridTemplateColumns: "140px 1fr 120px", gap: 12 }}>
              <div style={{ fontWeight: 600 }}>{new Date(entry.ts).toLocaleTimeString()}</div>
              <div style={{ color: "var(--muted)", fontSize: 13 }}>
                {entry.type === "stake" ? t("pages.staking.actionStake") : t("pages.staking.actionUnstake")} · {entry.pool}
              </div>
              <div style={{ textAlign: "right" }}>
                {t("pages.staking.amountFmt", { amount: entry.amount })} · {entry.apr}%
              </div>
            </div>
          ))
        )}
      </div>
    </section>
  );
}
