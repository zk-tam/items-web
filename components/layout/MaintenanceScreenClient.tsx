"use client";

import Image from "next/image";
import { LoaderCircle } from "lucide-react";
import { useEffect, useRef, useState, type FormEvent, type PointerEvent } from "react";
import { SidebarContactActions } from "@/components/layout/SidebarContactActions";

const TAP_INTERVAL_MS = 700;

function isInteractiveTarget(target: EventTarget | null) {
  return target instanceof Element && target.closest("a, button, input, form");
}

export function MaintenanceScreenClient() {
  const [accessVisible, setAccessVisible] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const lastTapAt = useRef(0);
  const tapCount = useRef(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (accessVisible) inputRef.current?.focus();
  }, [accessVisible]);

  function handlePointerUp(event: PointerEvent<HTMLElement>) {
    if (accessVisible || isInteractiveTarget(event.target)) return;

    const now = performance.now();
    tapCount.current = now - lastTapAt.current <= TAP_INTERVAL_MS ? tapCount.current + 1 : 1;
    lastTapAt.current = now;

    if (tapCount.current === 3) {
      tapCount.current = 0;
      setAccessVisible(true);
    }
  }

  async function submitAccessCode(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const passcode = inputRef.current?.value ?? "";
    if (!passcode) return;

    setSubmitting(true);
    setError(null);

    try {
      const response = await fetch("/api/maintenance/access", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ passcode })
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => null) as { error?: string } | null;
        throw new Error(payload?.error ?? "Access could not be granted.");
      }

      window.location.reload();
    } catch (submissionError) {
      setError(submissionError instanceof Error ? submissionError.message : "Access could not be granted.");
      inputRef.current?.select();
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="grid min-h-svh place-items-center px-4 py-10" onPointerUp={handlePointerUp}>
      <section aria-labelledby="maintenance-title" className="items-maintenance-card overflow-hidden border border-items-blue bg-items-surface">
        <h1 id="maintenance-title" className="sr-only">ITEMS is under maintenance</h1>
        <div className="items-maintenance-stage">
          <div className="items-maintenance-logo">
            <Image src="/assets/logo.svg" alt="ITEMS" width={320} height={320} priority className="h-auto w-full" />
          </div>
          <div className="items-maintenance-contact">
            <SidebarContactActions variant="maintenance" />
            {accessVisible ? (
              <form className="items-maintenance-access" onSubmit={submitAccessCode} onPointerUp={(event) => event.stopPropagation()}>
                <label className="sr-only" htmlFor="maintenance-access-code">Stakeholder access code</label>
                <input
                  ref={inputRef}
                  id="maintenance-access-code"
                  type="password"
                  name="passcode"
                  autoComplete="off"
                  aria-describedby={error ? "maintenance-access-error" : undefined}
                  placeholder="ENTER ACCESS CODE"
                  disabled={submitting}
                  className="min-w-0 flex-1 bg-items-surface px-2.5 items-maintenance-control-text font-black leading-none outline-none placeholder:text-items-blue/60 disabled:opacity-60"
                />
                <button type="submit" disabled={submitting} className="items-maintenance-access-submit" aria-label="Access website">
                  {submitting ? <LoaderCircle aria-hidden className="items-maintenance-access-loader animate-spin" strokeWidth={2.6} /> : "ENTER"}
                </button>
                {error ? <p id="maintenance-access-error" role="alert" className="items-maintenance-access-error">{error}</p> : null}
              </form>
            ) : null}
          </div>
        </div>
        <p className="items-maintenance-footer bg-items-blue text-center font-medium text-items-white">Site will be live soon.</p>
      </section>
    </main>
  );
}
