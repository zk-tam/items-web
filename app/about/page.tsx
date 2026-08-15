import type { Metadata } from "next";
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
            <h1 className="text-[13px] font-heavy">What’s ITEMS?</h1>
            <p className="max-w-[980px] text-[13px] font-medium">It’s simply compelling “ideas” in physical forms that could come in any shape and size.</p>
          </div>

          <div className="space-y-5">
            <h2 className="text-[13px] font-heavy">Who’s behind it?</h2>
            <p className="max-w-[980px] text-[13px] font-medium">We’re a growing collective of creators trying to bring physical ITEMS to life.</p>
          </div>

          <div className="space-y-5">
            <h2 className="text-[13px] font-heavy">Essence of ITEMS</h2>
            <div className="max-w-[980px] space-y-5 text-[13px] font-medium">
              <p>ITEMS is a platform created as an avenue for creators to bring forth fresh ideas in the form of physical items.</p>
              <p>ITEMS is not a consignment platform created for the sake of commerce, but rather a space to create without restriction and see where compelling ideas can lead.</p>
              <p>In today&apos;s rinse-and-repeat culture, too many creations are built around a templated formula for scale and commerce.</p>
              <p>At ITEMS, we remove the template and the limitations. We&apos;re simply trying to bring new ideas to life. Some ideas may work, some won&apos;t, but let&apos;s have a bit of fun while we&apos;re at it.</p>
            </div>
          </div>

          <div className="space-y-5">
            <h2 className="text-[13px] font-heavy">Get in touch!</h2>
            <p className="max-w-[980px] text-[13px] font-medium">
              <a className="hover:underline" href="mailto:itemsart@gmail.com">itemsart@gmail.com</a> or{" "}
              <a className="hover:underline" href="http://wa.me/60176226280" target="_blank" rel="noreferrer">WhatsApp us.</a>
            </p>
          </div>
        </section>
      </main>
    </SiteShell>
  );
}
