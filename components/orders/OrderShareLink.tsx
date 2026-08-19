"use client";

import { useState } from "react";
import { Check, Copy, ExternalLink } from "lucide-react";

type OrderShareLinkProps = {
  href: string;
};

export function OrderShareLink({ href }: OrderShareLinkProps) {
  const [copied, setCopied] = useState(false);

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(href);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  }

  return (
    <section className="mt-8 max-w-3xl border border-items-blue p-5" aria-labelledby="customer-order-link-heading">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 id="customer-order-link-heading" className="font-black">Customer order link</h2>
          <p className="mt-1 text-sm font-medium">Share this private link with the customer so they can review the order, its status, and the invoice.</p>
        </div>
        <a href={href} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 text-sm font-black underline underline-offset-4">
          Open <ExternalLink aria-hidden className="h-3.5 w-3.5" />
        </a>
      </div>
      <div className="mt-4 flex gap-2">
        <input aria-label="Customer order URL" className="min-w-0 flex-1 border border-items-blue bg-transparent px-3 py-2 text-sm font-medium" readOnly value={href} />
        <button type="button" onClick={copyLink} className="inline-flex shrink-0 items-center gap-1.5 bg-items-blue px-3 py-2 text-sm font-black text-items-white">
          {copied ? <Check aria-hidden className="h-4 w-4" /> : <Copy aria-hidden className="h-4 w-4" />}
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
    </section>
  );
}
