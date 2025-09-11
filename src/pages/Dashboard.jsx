import React from "react";
import { useTranslation } from "react-i18next";

export default function Dashboard() {
  const { t } = useTranslation();
  return (
    <section className="page">
      <h1 className="page-title">{t("pages.dashboard.title")}</h1>
      <div className="card">
        <p>👋 This is the <strong>Dashboard</strong> page skeleton. Wire real data next.</p>
      </div>
    </section>
  );
}
