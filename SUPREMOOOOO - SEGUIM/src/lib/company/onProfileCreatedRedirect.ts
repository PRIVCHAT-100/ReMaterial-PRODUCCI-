// src/lib/company/onProfileCreatedRedirect.ts
// Llama a esta función justo después de crear el perfil de empresa.
export function onCompanyProfileCreatedRedirect() {
  // Dirige a la sección de ajustes de empresa (ajusta si tu ruta es distinta)
  const target = "/settings/company?tab=plan";
  if (location.pathname !== target) {
    window.location.href = target;
  }
}