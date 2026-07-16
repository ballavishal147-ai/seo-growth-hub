import * as React from "react";
import { ThemeProvider } from "./theme-provider";
import { MotionProvider } from "./motion-provider";

/**
 * Single composition root for app-wide providers. Add Phase 5B
 * domain-data providers (query client, auth context, etc.) here
 * once that spec is available — keep them in dependency order,
 * outermost = least likely to change per-route.
 */
export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <MotionProvider>{children}</MotionProvider>
    </ThemeProvider>
  );
}
