import React from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

export default function NotFound() {
  const { t } = useTranslation();
  return (
    <section className="page">
      <h1 className="page-title">404 — {t("app.notFound")}</h1>
      <div className="card">
        <p><Link to="/">{t("app.dashboard")}</Link></p>
      </div>
    </section>
  );
}
