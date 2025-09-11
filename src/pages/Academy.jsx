import React from "react";
import { useTranslation } from "react-i18next";

export default function Academy() {
  const { t } = useTranslation();
  return (
    <section className="page">
      <h1 className="page-title">{t("pages.academy.title")}</h1>
      <div className="card">
        <p>👋 This is the <strong>Academy</strong> page skeleton. Wire real data next.</p>
      </div>
    </section>
  );
}
