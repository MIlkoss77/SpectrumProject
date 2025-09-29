import React from "react";
import { createBrowserRouter } from "react-router-dom";
import Pricing from "./pages/Pricing.jsx";
import Layout from "./components/Layout.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Signals from "./pages/Signals.jsx";
import News from "./pages/News.jsx";
import Arbitrage from "./pages/Arbitrage.jsx";
import CopySim from "./pages/CopySim.jsx";
import Staking from "./pages/Staking.jsx";
import Academy from "./pages/Academy.jsx";
import Settings from "./pages/Settings.jsx";
import NotFound from "./pages/NotFound.jsx";
import Events from "./pages/Events.jsx";
import Forecasts from "./pages/Forecasts.jsx";
import Backtest from "./pages/Backtest.jsx";
import TA from "./pages/TA.jsx";
import Calibration from "./pages/Calibration.jsx";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    errorElement: <NotFound />,
    children: [
        { index: true, element: <Dashboard /> },
        { path: "pricing", element: <Pricing /> },
        { path: "signals", element: <Signals /> },
        { path: "backtest", element: <Backtest /> },
      { path: "news", element: <News /> },
      { path: "arbitrage", element: <Arbitrage /> },
        { path: "copy/sim", element: <CopySim /> },
        { path: "ta", element: <TA /> },
        { path: "calibration", element: <Calibration /> },
        { path: "forecasts", element: <Forecasts /> },
      { path: "staking", element: <Staking /> },
        { path: "academy", element: <Academy /> },
        { path: "events", element: <Events /> },
      { path: "settings", element: <Settings /> },
      { path: "*", element: <NotFound /> }
    ]
  }
]);

export default router;
