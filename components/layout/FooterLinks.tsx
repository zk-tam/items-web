import Link from "next/link";
import { footerLinks } from "@/data/navigation";

export function FooterLinks() {
  return (
    <nav aria-label="Footer links" className="space-y-3 text-[11px] font-black leading-none">
      {footerLinks.map((link) =>
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
