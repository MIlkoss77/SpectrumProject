import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { useWallet } from "../hooks/useWallet";

const STORAGE_KEY = "spectr.settings";

export default function Settings() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const wallet = useWallet();
  const [prefs, setPrefs] = useState(() => {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {}; }
    catch { return {}; }
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
  }, [prefs]);

  const plan = localStorage.getItem("spectr.plan") || "Explorer";
  const trialUntil = localStorage.getItem("spectr.trialUntil");

  const toggle = (key) => setPrefs(prev => ({ ...prev, [key]: !prev[key] }));

  return (
    <section className="page" style={{ display: "grid", gap: 16 }}>
      <h1 className="page-title">{t("pages.settings.title")}</h1>

      <div className="card" style={{ display: "grid", gap: 12 }}>
        <div style={{ fontWeight: 600 }}>{t("pages.settings.subscription")}</div>
        <div>
          {t("pages.settings.currentPlan", { plan })}
          {trialUntil ? ` · ${t("pages.settings.trialUntil", { date: new Date(trialUntil).toLocaleString() })}` : ""}
        </div>
        <button className="btn" onClick={() => navigate("/pricing")}>{t("pages.settings.managePlan")}</button>
      </div>

      <div className="card" style={{ display: "grid", gap: 12 }}>
        <div style={{ fontWeight: 600 }}>{t("pages.settings.wallet")}</div>
        {wallet.isConnected ? (
          <div>
            <div style={{ fontWeight: 600 }}>{wallet.account}</div>
            <div style={{ color: "var(--muted)", fontSize: 12 }}>{t("pages.settings.chain", { chain: wallet.chainId })}</div>
          </div>
        ) : (
          <div style={{ color: "var(--muted)" }}>{t("pages.settings.walletHint")}</div>
        )}
        <button className="btn" onClick={wallet.connect}>{wallet.isConnected ? t("pages.settings.switchWallet") : t("pages.settings.connectWallet")}</button>
      </div>

      <div className="card" style={{ display: "grid", gap: 12 }}>
        <div style={{ fontWeight: 600 }}>{t("pages.settings.notifications")}</div>
        <ToggleRow
          label={t("pages.settings.push")}
          description={t("pages.settings.pushHint")}
          checked={!!prefs.push}
          onChange={() => toggle("push")}
        />
        <ToggleRow
          label={t("pages.settings.telegram")}
          description={t("pages.settings.telegramHint")}
          checked={!!prefs.telegram}
          onChange={() => toggle("telegram")}
        />
        <ToggleRow
          label={t("pages.settings.vip")}
          description={t("pages.settings.vipHint")}
          checked={!!prefs.vip}
          onChange={() => toggle("vip")}
        />
      </div>

      <div className="card" style={{ color: "var(--muted)", fontSize: 12 }}>
        {t("pages.settings.note")}
      </div>
    </section>
  );
}

function ToggleRow({ label, description, checked, onChange }) {
  return (
    <label style={{ display: "grid", gap: 6 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
        <div>
          <div style={{ fontWeight: 600 }}>{label}</div>
          <div style={{ color: "var(--muted)", fontSize: 12 }}>{description}</div>
        </div>
        <input type="checkbox" checked={checked} onChange={onChange} />
      </div>
    </label>
  );
}
