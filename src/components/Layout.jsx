import React, { useEffect } from "react";
import { NavLink, Outlet, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import LanguageSwitcher from "./LanguageSwitcher.jsx";
import ThemeToggle from "./ThemeToggle.jsx";

const links = [
  { to: "/", key: "dashboard" },
  { to: "/signals", key: "signals" },
  { to: "/news", key: "news" },
  { to: "/backtest", key: "backtest" },
  { to: "/calibration", key: "calibration" },
  { to: "/arbitrage", key: "arbitrage" },
  { to: "/copy/sim", key: "copySim" },
  { to: "/staking", key: "staking" },
    { to: "/academy", key: "academy" },
    { to: "/ta", key: "ta" },
    { to: "/pricing", key: "pricing" }, 
  { to: "/settings", key: "settings" }
];

export default function Layout() {
  const { t } = useTranslation();
  const location = useLocation();

  useEffect(() => {
    document.title = `${t("app.title")} — ${t("app." + (links.find(l => l.to === location.pathname)?.key || "dashboard"))}`;
  }, [location, t]);

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">{t("app.title")}</div>
        <nav className="nav">
          {links.map(link => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) => "nav-link" + (isActive ? " active" : "")}
              end={link.to === "/"}
            >
              {t(`app.${link.key}`)}
            </NavLink>
          ))}
        </nav>
        <div className="sidebar-footer">
          <LanguageSwitcher />
          <ThemeToggle />
        </div>
      </aside>
      <main className="main">
        <Outlet />
      </main>
    </div>
  );
}
