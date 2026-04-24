import React, { lazy, Suspense } from "react";
import { createBrowserRouter } from "react-router-dom";

const Pricing = lazy(() => import("./pages/Pricing.jsx"));
const Layout = lazy(() => import("./components/Layout.jsx"));
const Dashboard = lazy(() => import("./pages/Overview.jsx"));
const Signals = lazy(() => import("./pages/Signals.jsx"));
const News = lazy(() => import("./pages/News.jsx"));
const Arbitrage = lazy(() => import("./pages/Arbitrage.jsx"));
const CopySim = lazy(() => import("./pages/CopySim.jsx"));
const Staking = lazy(() => import("./pages/Staking.jsx"));
const Academy = lazy(() => import("./pages/Academy.jsx"));
const Settings = lazy(() => import("./pages/Settings.jsx"));
const NotFound = lazy(() => import("./pages/NotFound.jsx"));
const Events = lazy(() => import("./pages/Events.jsx"));
const Forecasts = lazy(() => import("./pages/Forecasts.jsx"));
const Backtest = lazy(() => import("./pages/Backtest.jsx"));
const TA = lazy(() => import("./pages/TA.jsx"));
const Calibration = lazy(() => import("./pages/Calibration.jsx"));

// Lazy Loading Wrapper
const Loadable = (Component) => (props) => (
  <Suspense fallback={null}>
    <Component {...props} />
  </Suspense>
);

const PricingL = Loadable(Pricing);
const LayoutL = Loadable(Layout);
const DashboardL = Loadable(Dashboard);
const SignalsL = Loadable(Signals);
const NewsL = Loadable(News);
const ArbitrageL = Loadable(Arbitrage);
const CopySimL = Loadable(CopySim);
const StakingL = Loadable(Staking);
const AcademyL = Loadable(Academy);
const SettingsL = Loadable(Settings);
const NotFoundL = Loadable(NotFound);
const EventsL = Loadable(Events);
const ForecastsL = Loadable(Forecasts);
const BacktestL = Loadable(Backtest);
const TAL = Loadable(TA);
const CalibrationL = Loadable(Calibration);

const router = createBrowserRouter([
  {
    path: "/",
    element: <LayoutL />,
    errorElement: <NotFoundL />,
    children: [
        { index: true, element: <DashboardL /> },
        { path: "pricing", element: <PricingL /> },
        { path: "signals", element: <SignalsL /> },
        { path: "backtest", element: <BacktestL /> },
      { path: "news", element: <NewsL /> },
      { path: "arbitrage", element: <ArbitrageL /> },
        { path: "copy/sim", element: <CopySimL /> },
        { path: "ta", element: <TAL /> },
        { path: "calibration", element: <CalibrationL /> },
        { path: "forecasts", element: <ForecastsL /> },
      { path: "staking", element: <StakingL /> },
        { path: "academy", element: <AcademyL /> },
        { path: "events", element: <EventsL /> },
      { path: "settings", element: <SettingsL /> },
      { path: "*", element: <NotFoundL /> }
    ]
  }
]);

export default router;
