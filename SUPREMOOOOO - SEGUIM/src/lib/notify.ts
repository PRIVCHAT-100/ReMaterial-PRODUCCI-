
// src/lib/notify.ts
// Toasts DOM con paleta Tailwind/shadcn y posición inferior derecha.
// Fuerza siempre DOM (no usa Sonner) para respetar posición y estilos de la web.

type ToastType = "success" | "error";

function ensureContainer() {
  let container = document.getElementById("toast-container");
  if (!container) {
    container = document.createElement("div");
    container.id = "toast-container";
    // Columna en esquina inferior derecha
    container.className = [
      "fixed", "bottom-6", "right-6",
      "flex", "flex-col", "gap-3",
      "z-[9999]", "items-end", "pointer-events-none"
    ].join(" ");
    document.body.appendChild(container);
  }
  return container;
}

function createToast(message: string, type: ToastType, duration = 3000) {
  const container = ensureContainer();

  const wrapper = document.createElement("div");
  wrapper.className = "pointer-events-auto";

  const card = document.createElement("div");
  card.role = "status";
  card.ariaLive = "polite";
  card.className = [
    // Layout
    "rounded-2xl", "px-4", "py-3", "shadow-lg", "min-w-[260px]", "max-w-[360px]",
    // Borde sutil acorde a paleta
    type === "success" ? "border border-primary/30" : "border border-destructive/30",
    // Colores de la paleta shadcn/Tailwind del proyecto
    type === "success" ? "bg-primary text-primary-foreground" : "bg-destructive text-destructive-foreground",
    // Tipografía
    "text-sm", "leading-5",
    // Animación
    "opacity-0", "translate-y-2", "transition-all", "duration-200", "ease-out"
  ].join(" ");

  const text = document.createElement("div");
  text.textContent = message;

  card.appendChild(text);
  wrapper.appendChild(card);
  container.appendChild(wrapper);

  // Entrada
  requestAnimationFrame(() => {
    card.classList.remove("opacity-0", "translate-y-2");
    card.classList.add("opacity-100", "translate-y-0");
  });

  // Salida + limpieza
  const remove = () => {
    card.classList.remove("opacity-100", "translate-y-0");
    card.classList.add("opacity-0", "translate-y-2");
    setTimeout(() => wrapper.remove(), 200);
  };

  const timer = setTimeout(remove, duration);

  // Cerrar al hacer clic
  card.addEventListener("click", () => {
    clearTimeout(timer);
    remove();
  });
}

export function notifySuccess(message = "Guardado correctamente", duration?: number) {
  createToast(message, "success", duration);
}

export function notifyError(message = "No se pudo guardar. Inténtalo de nuevo", duration?: number) {
  createToast(message, "error", duration);
}
