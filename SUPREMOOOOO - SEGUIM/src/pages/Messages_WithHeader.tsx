
/**
 * Messages_WithHeader.tsx
 *
 * Additive-only wrapper to show the site Header above the Messages page
 * WITHOUT touching your existing components or styles.
 *
 * Usage:
 *  - Point your route to this component instead of the raw Messages page.
 *  - If your Header component lives in a different path, just edit the import path below.
 */

import * as React from "react";

// ⬇️ Adjust this import if your Header lives elsewhere.
import Header from "@/components/layout/Header";

// ⬇️ Import your current Messages page/component (no changes to it).
import Messages from "@/pages/Messages";

export default function Messages_WithHeader() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Sticky header area (no style changes to your Header component) */}
      <div className="sticky top-0 z-40 bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <Header />
      </div>

      {/* Main content: render your existing Messages page as-is */}
      <div className="flex-1">
        <Messages />
      </div>
    </div>
  );
}
