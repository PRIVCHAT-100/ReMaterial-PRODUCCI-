// src/components/ScrollToTop.tsx
import { useLayoutEffect, useEffect } from "react";
import { useLocation } from "react-router-dom";

/**
 * Fuerza el scroll al inicio en cada navegación.
 * - Desactiva la restauración automática del navegador.
 * - Aplica scrollTo(0,0) en tres fases para evitar auto-scrolls de componentes hijos.
 */
const ScrollToTop = () => {
  const { pathname, search, hash, key } = useLocation();

  // 1) Desactivar restauración de scroll del navegador una sola vez
  useEffect(() => {
    if ("scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual";
    }
  }, []);

  // 2) Forzar scroll to top en cada navegación
  useLayoutEffect(() => {
    const scrollTop = () => {
      // Varios intentos por si algún hijo mueve el scroll
      window.scrollTo(0, 0);
      // Redundancias por si el user agent usa otro origen
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
    };

    // Inmediato
    scrollTop();

    // En el siguiente frame (antes del paint de muchos efectos de hijos)
    const rafId = requestAnimationFrame(scrollTop);

    // En la cola de tareas (por si algún efecto tarda un tick más)
    const timeoutId = setTimeout(scrollTop, 0);

    return () => {
      cancelAnimationFrame(rafId);
      clearTimeout(timeoutId);
    };
  }, [pathname, search, hash, key]);

  return null;
};

export default ScrollToTop;
