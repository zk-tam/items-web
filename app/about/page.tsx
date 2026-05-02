import type { Metadata } from "next";
import Link from "next/link";
import { SiteShell } from "@/components/layout/SiteShell";

export const metadata: Metadata = {
  title: "About Us"
};

export default function AboutPage() {
  return (
    <SiteShell activeRoute="about">
      <main className="max-w-[900px] pt-3 lg:pt-0">
        <section className="space-y-11 lg:space-y-14">
          <div className="space-y-5">
            <h1 className="text-[22px] font-black leading-tight lg:text-[24px]">What&apos;s ITEMS?</h1>
            <p className="max-w-[820px] text-[20px] font-bold leading-snug lg:text-[28px]">
              It&apos;s simply compelling &quot;ideas&quot; in physical forms that could come in any shape and size.
            </p>
          </div>

          <div className="space-y-5">
            <h2 className="text-[22px] font-black leading-tight lg:text-[24px]">Who&apos;s behind it?</h2>
            <p className="max-w-[850px] text-[20px] font-bold leading-snug lg:text-[28px]">
              We&apos;re a growing collective of{" "}
              <Link className="underline underline-offset-4" href="/artists">
                creators
              </Link>{" "}
              trying to bring physical ITEMS to life.
            </p>
          </div>

          <div className="space-y-5">
            <h2 className="text-[22px] font-black leading-tight lg:text-[24px]">Get in touch!</h2>
            <p className="text-[20px] font-bold leading-snug lg:text-[28px]">
              <a className="underline underline-offset-4" href="mailto:info@itemsyouwant.com">info@itemsyouwant.com</a>,{" "}
              <a className="underline underline-offset-4" href="https://instagram.com/itemsyouwant" target="_blank" rel="noreferrer">@itemsyouwant</a>,{" "}
              <a className="underline underline-offset-4" href="https://instagram.com/zz.liu" target="_blank" rel="noreferrer">@zz.liu</a>
            </p>
          </div>
        </section>
      </main>
    </SiteShell>
  );
}
