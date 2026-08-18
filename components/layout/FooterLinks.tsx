import type { ReactNode } from "react";
import Link from "next/link";
import { footerLinks } from "@/data/navigation";

type FooterLinksProps = {
  hideInstagram?: boolean;
  hideShipping?: boolean;
  afterPrivacy?: ReactNode;
};

export function FooterLinks({ hideInstagram = false, hideShipping = false, afterPrivacy }: FooterLinksProps) {
  const links = footerLinks.filter((link) =>
    !(hideInstagram && link.label === "Instagram +") && !(hideShipping && link.label === "Shipping +")
  );

  return (
    <nav aria-label="Footer links" className="space-y-3 text-[11px] font-black leading-none mt-10">
      {links.map((link) => (
        <div key={link.label}>
          {link.external ? (
            <a href={link.href} rel="noreferrer" target="_blank" className="block hover:text-items-blueHover">
              {link.label}
            </a>
          ) : (
            <Link href={link.href} className="block hover:text-items-blueHover">
              {link.label}
            </Link>
          )}
          {link.label === "Privacy & Analytics +" && afterPrivacy}
        </div>
      ))}
    </nav>
  );
}
