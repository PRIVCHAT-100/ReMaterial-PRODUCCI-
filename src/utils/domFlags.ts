
type Options = { observe?: boolean; root?: Element | null };

/**
 * Safe-only: NO heurística. Solo oculta elementos que lleven
 * data-ff="settings.account.change_email" dentro del root dado.
 */
export function hideChangeEmailIfFlagDisabled(isEnabled: (path: string) => boolean, options: Options = {}) {
  if (typeof window === "undefined" || typeof document === "undefined") return;
  const root: Element | Document = (options.root ?? document);
  const run = () => {
    try {
      if (isEnabled("settings.account.change_email")) return;
      const nodes = Array.from(root.querySelectorAll('[data-ff="settings.account.change_email"]')) as HTMLElement[];
      nodes.forEach(el => { el.style.display = "none"; });
    } catch (e) {
      console.warn("[feature-flags] hideChangeEmailIfFlagDisabled error:", e);
    }
  };
  run();
  if (options.observe) {
    const obsRoot: Node = (options.root ?? document.body) as Node;
    const observer = new MutationObserver(() => run());
    observer.observe(obsRoot, { childList: true, subtree: true });
  }
}
