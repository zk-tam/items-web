"use client";

import { useState } from "react";
import { ANALYTICS_OPT_OUT_STORAGE_KEY } from "@/lib/analytics/definitions";

type AnalyticsPreferencesProps = {
  initialEnabled: boolean;
};

export function AnalyticsPreferences({ initialEnabled }: AnalyticsPreferencesProps) {
  const [enabled, setEnabled] = useState(initialEnabled);
  const [status, setStatus] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function updatePreference(nextEnabled: boolean) {
    setSaving(true);
    setStatus(null);

    try {
      const response = await fetch("/api/analytics/preferences", {
        method: "POST",
        credentials: "same-origin",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ enabled: nextEnabled })
      });

      if (!response.ok) throw new Error("Analytics preference could not be saved.");
      if (nextEnabled) {
        window.localStorage.removeItem(ANALYTICS_OPT_OUT_STORAGE_KEY);
      } else {
        window.localStorage.setItem(ANALYTICS_OPT_OUT_STORAGE_KEY, "1");
      }
      setEnabled(nextEnabled);
      setStatus(nextEnabled ? "Anonymous analytics are enabled." : "Anonymous analytics are disabled on this browser.");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Analytics preference could not be saved.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="border border-items-blue p-5" aria-labelledby="analytics-preference-title">
      <div className="space-y-2">
        <h2 id="analytics-preference-title" className="text-[13px] font-heavy">Anonymous analytics</h2>
        <p className="text-[13px] font-medium">Status: {enabled ? "Enabled" : "Disabled"}</p>
      </div>
      <div className="mt-5 flex flex-wrap gap-3">
        <button type="button" className="border border-items-blue px-4 py-2 text-[12px] font-heavy disabled:cursor-wait disabled:opacity-50" disabled={saving || enabled} onClick={() => updatePreference(true)}>Enable analytics</button>
        <button type="button" className="border border-items-blue px-4 py-2 text-[12px] font-heavy disabled:cursor-wait disabled:opacity-50" disabled={saving || !enabled} onClick={() => updatePreference(false)}>Disable analytics</button>
      </div>
      {status ? <p className="mt-4 text-[12px] font-medium" role="status">{status}</p> : null}
    </section>
  );
}
