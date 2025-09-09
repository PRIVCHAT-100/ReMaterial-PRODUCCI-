
// src/index.tsx
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { bootA11y } from "@/lib/a11y/apply";
import "./index.css";

bootA11y();

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
