"use client";

import { useEffect, Suspense } from "react";
import { usePathname, useSearchParams } from "next/navigation";

/**
 * Component that cleans up Clerk authentication query parameters
 * from the browser's URL address bar to keep it professional and clean.
 */
function UrlCleanerContent() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      let changed = false;

      // Internal Clerk URL parameters that we want to strip from the address bar
      const paramsToRemove = [
        "__clerk_handshake",
        "__clerk_status",
        "__clerk_created",
        "__clerk_ticket",
        "clerk_handshake",
      ];

      paramsToRemove.forEach((param) => {
        if (url.searchParams.has(param)) {
          url.searchParams.delete(param);
          changed = true;
        }
      });

      if (changed) {
        // Construct the clean URL (pathname + remaining query params + hash)
        const cleanUrl = url.pathname + url.search + url.hash;

        try {
          // Replace the URL in the history state without triggering a page reload or route transition
          window.history.replaceState(
            { ...window.history.state, as: cleanUrl, url: cleanUrl },
            "",
            cleanUrl
          );
        } catch (e) {
          console.warn("UrlCleaner: Failed to update browser history state", e);
        }
      }
    }
  }, [pathname, searchParams]);

  return null;
}

export function UrlCleaner() {
  return (
    <Suspense fallback={null}>
      <UrlCleanerContent />
    </Suspense>
  );
}
