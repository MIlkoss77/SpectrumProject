import React from "react";
import i18n from "../i18n/index.js";
import { useTranslation } from "react-i18next";

const langs = [
  { code: "en", label: "EN" },
  { code: "es", label: "ES" },
  { code: "pt", label: "PT" },
  { code: "ru", label: "RU" }
];

export default function LanguageSwitcher() {
  const { t } = useTranslation();
  const current = i18n.resolvedLanguage || "en";
  return (
    <div className="lang-switcher" title={t("ui.language")}>
      {langs.map(l => (
        <button
          key={l.code}
          className={"pill" + (current === l.code ? " selected" : "")}
          onClick={() => i18n.changeLanguage(l.code)}
        >
          {l.label}
        </button>
      ))}
    </div>
  );
}
