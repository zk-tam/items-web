"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { CatalogArtist as Artist } from "@/lib/catalog/types";
import { PlusMinusIconButton } from "@/components/ui/PlusMinusIconButton";
import { ExpandableCardDetails } from "@/components/ui/ExpandableCardDetails";

type ArtistCardProps = {
  artist: Artist;
  priority?: boolean;
};

export function ArtistCard({ artist, priority = false }: ArtistCardProps) {
  const router = useRouter();
  const [expanded, setExpanded] = useState(false);
  const details = [artist.role, artist.bio].filter(Boolean);
  const href = `/artists/${artist.slug}`;

  return (
    <article className="h-full">
      <div className="group flex h-full flex-col">
        <Link href={href} className="block" onFocus={() => router.prefetch(href)} onMouseEnter={() => router.prefetch(href)} prefetch>
          <div className="relative aspect-[4/5] overflow-hidden rounded-item bg-items-placeholder">
            {artist.image && (
              <Image
                src={artist.image}
                alt={artist.imageAlt ?? artist.name}
                fill
                loading={priority ? "eager" : "lazy"}
                sizes="(max-width: 768px) 100vw, 25vw"
                className="object-cover transition-transform duration-300 group-hover:scale-[1.02]"
              />
            )}
          </div>
        </Link>

        <div className="grid min-h-[52px] grid-cols-[minmax(0,1fr)_auto] items-start gap-4 pt-4 text-[16px] font-black leading-tight lg:min-h-[44px] lg:text-[12px]">
          <Link href={href} className="min-w-0 hover:text-items-blueHover" onFocus={() => router.prefetch(href)} onMouseEnter={() => router.prefetch(href)} prefetch>
            {artist.name} | {artist.role}
          </Link>
          <PlusMinusIconButton
            label={`${expanded ? "Collapse" : "Expand"} ${artist.name} details`}
            onClick={() => setExpanded((current) => !current)}
            open={expanded}
          />
        </div>

        <ExpandableCardDetails open={expanded} className="text-[15px] font-bold leading-snug lg:text-[10px]">
          {details.map((detail) => (
            <p key={detail} className="mb-4 last:mb-0">
              {detail}
            </p>
          ))}
          <div className="mt-4 flex flex-wrap gap-x-7 gap-y-2 text-[14px] font-black leading-none lg:text-[10px]">
            {artist.links.map((link) => (
              <a key={link.label} href={link.href} target={link.href.startsWith("http") ? "_blank" : undefined} rel={link.href.startsWith("http") ? "noreferrer" : undefined}>
                + {link.label}
              </a>
            ))}
          </div>
        </ExpandableCardDetails>
      </div>
    </article>
  );
}
