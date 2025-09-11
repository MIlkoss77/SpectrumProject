import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

export default function ThemeToggle() {
  const { t } = useTranslation();
  const [dark, setDark] = useState(() => {
    const saved = localStorage.getItem("spectr.theme");
    return saved ? saved === "dark" : window.matchMedia("(prefers-color-scheme: dark)").matches;
  });

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
    localStorage.setItem("spectr.theme", dark ? "dark" : "light");
  }, [dark]);

  return (
    <button className="btn" onClick={() => setDark(v => !v)} title={t("ui.theme")}>
      {dark ? t("ui.light") : t("ui.dark")}
    </button>
  );
}
