import Link from "next/link";
import { SiteShell } from "@/components/layout/SiteShell";

export default function NotFound() {
  return (
    <SiteShell>
      <div className="max-w-xl space-y-6">
        <h1 className="text-[32px] font-black leading-none lg:text-[48px]">ITEM not found</h1>
        <p className="text-sm leading-snug">This page moved, sold out, or never became physical.</p>
        <Link className="inline-flex border border-items-blue px-4 py-2 text-xs font-black uppercase" href="/">
          Back to Shop All
        </Link>
      </div>
    </SiteShell>
  );
}
