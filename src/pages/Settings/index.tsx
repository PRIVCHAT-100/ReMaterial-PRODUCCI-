
import React from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { cn } from "@/lib/utils";

// Secciones
import Account from "@/components/settings/sections/Account";
import Security from "@/components/settings/sections/Security";
import Notifications from "@/components/settings/sections/Notifications";
import Privacy from "@/components/settings/sections/Privacy";
import Billing from "@/components/settings/sections/Billing";
import PreferencesSection from "@/components/settings/sections/Preferences";
import IntegrationsSection from "@/components/settings/sections/Integrations";
import AccessibilityAppearanceSection from "@/components/settings/sections/AccessibilityAppearance";
import SupportLegalSection from "@/components/settings/sections/SupportLegal";

// Flags
import { FeatureFlagsProvider, useFeatureFlags } from "@/contexts/FeatureFlagsProvider";
import { hideChangeEmailIfFlagDisabled } from "@/utils/domFlags";

const TABS = [
  { key: "account",        label: "Cuenta",               Component: Account },
  { key: "security",       label: "Seguridad",            Component: Security },
  { key: "notifications",  label: "Notificaciones",       Component: Notifications },
  { key: "privacy",        label: "Privacidad",           Component: Privacy },
  { key: "billing",        label: "Facturación y pagos",  Component: Billing },
  { key: "preferences",    label: "Preferencias",         Component: PreferencesSection },
  { key: "integrations",   label: "Integraciones",        Component: IntegrationsSection },
  { key: "a11y",           label: "Accesibilidad y apariencia", Component: AccessibilityAppearanceSection },
  { key: "support",        label: "Soporte y legal",      Component: SupportLegalSection },
] as const;

function SettingsInner() {
  const { enabled } = useFeatureFlags();

  const visible = React.useMemo(() => {
    return TABS.filter(t => enabled(`settings.${t.key}.enabled`));
  }, [enabled]);

  const [active, setActive] = React.useState<(typeof TABS)[number]["key"]>(visible[0]?.key ?? "account");
  React.useEffect(() => {
    if (!visible.some(t => t.key === active)) {
      setActive(visible[0]?.key ?? "account");
    }
  }, [visible, active]);

  // Solo ejecuta el ocultador dentro del panel activo y si estamos en "account"
  React.useEffect(() => {
    if (active !== "account") return;
    const root = document.getElementById("settings-active-panel");
    hideChangeEmailIfFlagDisabled(enabled, { observe: true, root });
  }, [enabled, active]);

  const Active = (visible.find(t => t.key === active) ?? visible[0] ?? TABS[0]).Component;

  return (
    <>
      <Header />
      <div className="container max-w-5xl mx-auto px-4 py-8">
        <h1 className="text-2xl md:text-3xl font-bold mb-4">Configuración</h1>
        <div className="grid md:grid-cols-[220px_1fr] gap-6">
          <aside className="space-y-2">
            {visible.length === 0 ? (
              <div className="text-sm text-muted-foreground">No hay secciones habilitadas.</div>
            ) : visible.map(t => (
              <button
                key={t.key}
                className={cn(
                  "w-full text-left rounded-xl border px-3 py-2 transition",
                  active === t.key ? "bg-zinc-100 dark:bg-zinc-800" : "hover:bg-zinc-50 dark:hover:bg-zinc-900"
                )}
                onClick={() => setActive(t.key)}
              >
                {t.label}
              </button>
            ))}
          </aside>

          <main id="settings-active-panel" className="space-y-4">
            {visible.length === 0 ? (
              <div className="text-sm text-muted-foreground">Activa alguna sección en los feature flags.</div>
            ) : (
              <Active />
            )}
          </main>
        </div>
      </div>
      <Footer />
    </>
  );
}

export default function SettingsPage() {
  return (
    <FeatureFlagsProvider>
      <SettingsInner />
    </FeatureFlagsProvider>
  );
}
