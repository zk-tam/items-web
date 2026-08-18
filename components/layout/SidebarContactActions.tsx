"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { Check, LoaderCircle, MessageCircle } from "lucide-react";

const WHATSAPP_URL = "http://wa.me/60176226280";

export function SidebarContactActions() {
  const emailInputRef = useRef<HTMLInputElement>(null);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(null), 3200);
    return () => window.clearTimeout(timer);
  }, [toast]);

  async function subscribe(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const email = emailInputRef.current?.value.trim() ?? "";
    if (!emailInputRef.current?.checkValidity()) {
      emailInputRef.current?.reportValidity();
      return;
    }

    setSubmitting(true);
    setToast(null);

    try {
      const response = await fetch("/api/newsletter/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email })
      });
      const result = await response.json().catch(() => null) as { error?: string } | null;

      if (!response.ok) {
        throw new Error(result?.error ?? "Subscriptions are temporarily unavailable. Please try again.");
      }

      emailInputRef.current?.form?.reset();
      setToast({ type: "success", message: "YOU’RE ON THE LIST." });
    } catch (error) {
      setToast({ type: "error", message: error instanceof Error ? error.message : "SUBSCRIPTIONS ARE TEMPORARILY UNAVAILABLE." });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-3 pt-4">
      <a
        href={WHATSAPP_URL}
        target="_blank"
        rel="noreferrer"
        className="group flex h-9 w-full overflow-hidden border border-items-blue bg-items-surface text-[8px] font-black leading-none transition-colors hover:bg-items-blue hover:text-items-white"
      >
        <span className="flex min-w-0 flex-1 items-center px-2.5">WHATSAPP CHAT SUPPORT</span>
        <span className="flex w-9 shrink-0 items-center justify-center bg-items-blue text-items-white">
          <MessageCircle aria-hidden className="h-5 w-5" strokeWidth={2.6} />
        </span>
      </a>

      <form onSubmit={subscribe} className="flex h-9 w-full overflow-hidden border border-items-blue bg-items-surface">
        <label className="sr-only" htmlFor="sidebar-newsletter-email">Email address for the ITEMS newsletter</label>
        <input
          ref={emailInputRef}
          id="sidebar-newsletter-email"
          name="email"
          type="email"
          required
          disabled={submitting}
          placeholder="SUBSCRIBE TO OUR NEWSLETTER"
          className="min-w-0 flex-1 bg-transparent px-2.5 text-[8px] font-black leading-none outline-none placeholder:text-items-blue/60 disabled:opacity-60"
        />
        <button
          type="submit"
          aria-label="Subscribe to our newsletter"
          disabled={submitting}
          className="relative flex w-9 shrink-0 items-center justify-center bg-items-blue text-items-white transition-colors hover:bg-items-blueHover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-items-blue focus-visible:ring-offset-2 disabled:cursor-default disabled:hover:bg-items-blue"
        >
          {submitting ? (
            <LoaderCircle aria-hidden className="h-4 w-4 animate-spin" strokeWidth={2.6} />
          ) : (
            <span aria-hidden className="items-plus-marker left-1/2 top-1/2 scale-[0.42] -translate-x-1/2 -translate-y-1/2 before:!bg-items-white after:!bg-items-white" />
          )}
        </button>
      </form>
      {toast ? (
        <div
          role="status"
          className="fixed bottom-6 right-6 z-[100] flex max-w-[min(20rem,calc(100vw-3rem))] items-center gap-2 border border-items-blue bg-items-surface px-3 py-2 text-[10px] font-black leading-tight shadow-[4px_4px_0_var(--items-blue)]"
        >
          {toast.type === "success" ? <Check aria-hidden className="h-4 w-4 shrink-0" strokeWidth={2.6} /> : null}
          <span>{toast.message}</span>
        </div>
      ) : null}
    </div>
  );
}
