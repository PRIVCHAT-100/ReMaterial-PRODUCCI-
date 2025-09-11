
import "./index.css"; // keep your global styles
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { AuthProvider } from "@/contexts/AuthProvider";
import AuthGate from "@/components/auth/AuthGate";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <AuthProvider>
    <AuthGate fallback={null}>
      <App />
    </AuthGate>
  </AuthProvider>
);
