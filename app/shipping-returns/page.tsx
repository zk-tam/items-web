import type { Metadata } from "next";
import { SiteShell } from "@/components/layout/SiteShell";

export const metadata: Metadata = {
  title: "Shipping & Returns"
};

const sections = [
  {
    title: "Orders",
    body: "All orders are placed through WhatsApp. Please contact us directly via WhatsApp to receive full product details, pricing, and delivery information before confirming your order."
  },
  {
    title: "Shipping",
    body: "We are currently operating within Malaysia. Orders will be shipped locally across Malaysia. For international (overseas) orders, please contact us via WhatsApp first. We will review your request and try our best to arrange shipping where possible."
  },
  {
    title: "Returns & Refunds",
    body: "All sales are final. However, refunds will only be provided if the item is found to be faulty or defective upon receipt. Please contact us via WhatsApp with proof of the issue for assistance. If the item can't be delivered, we will refund you immediately."
  }
];

export default function ShippingReturnsPage() {
  return (
    <SiteShell activeRoute="shipping">
      <main className="max-w-[1000px] pt-3 lg:pt-0">
        <div className="space-y-11 lg:space-y-14">
          {sections.map((section) => (
            <section key={section.title} className="space-y-5">
              <h1 className="text-[22px] font-black leading-tight lg:text-[24px]">{section.title}</h1>
              <p className="max-w-[980px] text-[19px] font-bold leading-snug lg:text-[28px]">{section.body}</p>
            </section>
          ))}
        </div>
      </main>
    </SiteShell>
  );
}
