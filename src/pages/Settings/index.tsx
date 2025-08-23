import Header from "@/components/Header";
import Footer from "@/components/Footer";
import React, { Suspense } from "react";
import { useNavigate } from "react-router-dom";

const Account = React.lazy(() => import("@/components/settings/sections/Account"));
const Security = React.lazy(() => import("@/components/settings/sections/Security"));
const PersonalProfile = React.lazy(() => import("@/components/settings/sections/PersonalProfile"));
const Company = React.lazy(() => import("@/components/settings/sections/Company"));
const Notifications = React.lazy(() => import("@/components/settings/sections/Notifications"));
const Privacy = React.lazy(() => import("@/components/settings/sections/Privacy"));
const Billing = React.lazy(() => import("@/components/settings/sections/Billing"));
const Preferences = React.lazy(() => import("@/components/settings/sections/Preferences"));
const Integrations = React.lazy(() => import("@/components/settings/sections/Integrations"));
const Appearance = React.lazy(() => import("@/components/settings/sections/Appearance"));
const SupportLegal = React.lazy(() => import("@/components/settings/sections/SupportLegal"));

/**
 * Si tu app usa un layout con Header (p. ej. <DashboardLayout/>),
 * puedes envolver aquí el contenido con ese layout:
 *
 *   return (
 *     <DashboardLayout title="Configuración">
 *        ...contenido...
 *     </DashboardLayout>
 *   )
 *
 * De momento usamos un contenedor centrado para que encaje visualmente.
 */

const tabs = [
  { key: "account", label: "Cuenta", Component: Account },
  { key: "security", label: "Seguridad", Component: Security },
  { key: "personal", label: "Perfil personal", Component: PersonalProfile },
  { key: "company", label: "Empresa", Component: Company },
  { key: "notifications", label: "Notificaciones", Component: Notifications },
  { key: "privacy", label: "Privacidad", Component: Privacy },
  { key: "billing", label: "Facturación y pagos", Component: Billing },
  { key: "preferences", label: "Preferencias", Component: Preferences },
  { key: "integrations", label: "Integraciones", Component: Integrations },
  { key: "appearance", label: "Accesibilidad y apariencia", Component: Appearance },
  { key: "support", label: "Soporte y legal", Component: SupportLegal },
];

export default function SettingsPage() {
  const navigate = useNavigate();
  const [active, setActive] = React.useState(tabs[0].key);
  const Active = tabs.find(t => t.key === active)!.Component;
  return (
    <>
      <Header />
      <div className="max-w-6xl mx-auto p-4 md:p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl md:text-4xl font-semibold">Configuración</h1>
        <button onClick={() => navigate(-1)} className="px-3 py-1.5 rounded-xl border">Volver</button>
      </div>
      <div className="flex flex-col md:flex-row gap-4">
        <aside className="md:w-60">
          <nav className="rounded-2xl border bg-white dark:bg-zinc-900 p-2">
            {tabs.map(t => (
              <button
                key={t.key}
                onClick={() => setActive(t.key)}
                className={`w-full text-left px-3 py-2 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800 ${active===t.key ? "bg-zinc-100 dark:bg-zinc-800 font-medium" : ""}`}
              >
                {t.label}
              </button>
            ))}
          </nav>
        </aside>
        <main className="flex-1 space-y-4">
          <Suspense fallback={<div className="rounded-2xl border p-6">Cargando…</div>}>
            <Active />
          </Suspense>
        </main>
      </div>
    </div>
      <Footer />
    </>
  );
}
