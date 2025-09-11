import React, { Suspense } from "react";
import { RouterProvider } from "react-router-dom";
import router from "./router.jsx";
import "./styles/theme.css";
import "./i18n/index.js";

export default function App() {
  return (
    <Suspense fallback={<div style={{padding: 24}}>Loading…</div>}>
      <RouterProvider router={router} />
    </Suspense>
  );
}
