"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { ANALYTICS_OPT_OUT_STORAGE_KEY, isTrackablePublicPath, normalizeAnalyticsPath } from "@/lib/analytics/definitions";

function hasOptedOut() {
  try {
    return window.localStorage.getItem(ANALYTICS_OPT_OUT_STORAGE_KEY) === "1";
  } catch {
    return false;
  }
}

export function AnalyticsTracker() {
  const pathname = usePathname();
  const hasSeenDocumentView = useRef(false);
  const lastTrackedPath = useRef<string | null>(null);

  useEffect(() => {
    const isLanding = !hasSeenDocumentView.current;
    hasSeenDocumentView.current = true;
    const path = normalizeAnalyticsPath(pathname);

    if (!path || !isTrackablePublicPath(path)) {
      lastTrackedPath.current = null;
      return;
    }
    if (lastTrackedPath.current === path || hasOptedOut()) return;
    lastTrackedPath.current = path;

    const eventId = window.crypto.randomUUID();
    const payload = {
      eventId,
      path,
      isLanding,
      referrer: isLanding ? document.referrer || null : null
    };

    void fetch("/api/analytics/page-view", {
      method: "POST",
      credentials: "same-origin",
      keepalive: true,
      cache: "no-store",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });
  }, [pathname]);

  return null;
}
