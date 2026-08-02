import Image from "next/image";
import Link from "next/link";
import type { CatalogArtist as Artist } from "@/lib/catalog/types";

type ArtistBioProps = {
  artist?: Artist;
};

export function ArtistBio({ artist }: ArtistBioProps) {
  if (!artist) {
    return null;
  }

  return (
    <section className="border-t border-items-blue pt-9">
      <div className="grid grid-cols-[1fr_auto] gap-6">
        <Link href={`/artists/${artist.slug}`} className="min-w-0 hover:text-items-blueHover">
          <h2 className="text-[44px] font-black leading-none lg:text-[42px]">{artist.name}</h2>
        </Link>
        {artist.image && (
          <Link href={`/artists/${artist.slug}`} className="relative h-24 w-24 overflow-hidden rounded-full bg-items-placeholder lg:h-28 lg:w-28">
            <Image src={artist.image} alt={artist.imageAlt ?? artist.name} fill sizes="112px" className="object-cover transition-transform duration-300 hover:scale-[1.03]" />
          </Link>
        )}
      </div>

      <div className="mt-8 flex flex-wrap gap-x-8 gap-y-3 text-[18px] font-black leading-none lg:text-[20px]">
        {artist.links.map((link) => (
          <a key={link.label} href={link.href} target={link.href.startsWith("http") ? "_blank" : undefined} rel={link.href.startsWith("http") ? "noreferrer" : undefined}>
            + {link.label}
          </a>
        ))}
      </div>

      {artist.bio && <p className="mt-8 max-w-[680px] text-[16px] font-bold leading-snug lg:text-[20px]">{artist.bio}</p>}
    </section>
  );
}
