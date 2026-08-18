import Link from "next/link";
import { footerLinks } from "@/data/navigation";

type FooterLinksProps = {
  hideInstagram?: boolean;
  hideShipping?: boolean;
};

export function FooterLinks({ hideInstagram = false, hideShipping = false }: FooterLinksProps) {
  const links = footerLinks.filter((link) =>
    !(hideInstagram && link.label === "Instagram +") && !(hideShipping && link.label === "Shipping +")
  );

  return (
    <nav aria-label="Footer links" className="space-y-3 text-[11px] font-black leading-none">
      {links.map((link) =>
        link.external ? (
          <a key={link.label} href={link.href} rel="noreferrer" target="_blank" className="block hover:text-items-blueHover">
            {link.label}
          </a>
        ) : (
          <Link key={link.label} href={link.href} className="block hover:text-items-blueHover">
            {link.label}
          </Link>
        )
      )}
    </nav>
  );
}
