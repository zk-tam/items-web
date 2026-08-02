"use client";

import { useState } from "react";
import { SEO_DESCRIPTION_MAX_LENGTH, SEO_TITLE_MAX_LENGTH } from "@/lib/seo/constants";

type SeoFieldsProps = {
  seoTitle?: string | null;
  seoDescription?: string | null;
  urlPath: string;
  fallbackTitle: string;
  fallbackDescription: string;
};

export function SeoFields({ seoTitle, seoDescription, urlPath, fallbackTitle, fallbackDescription }: SeoFieldsProps) {
  const [title, setTitle] = useState(seoTitle ?? "");
  const [description, setDescription] = useState(seoDescription ?? "");
  const displayTitle = title || fallbackTitle;
  const displayDescription = description || fallbackDescription;

  return (
    <section className="grid gap-5 border border-items-blue p-5" aria-labelledby="seo-heading">
      <div>
        <h2 id="seo-heading" className="text-xl font-black">Search engine listing</h2>
        <p className="mt-1 text-sm">Optional overrides for the page title and meta description. The URL handle is the slug above.</p>
      </div>
      <label className="grid gap-1 font-bold">
        Page title
        <input name="seoTitle" value={title} maxLength={SEO_TITLE_MAX_LENGTH} onChange={(event) => setTitle(event.currentTarget.value)} className="border border-items-blue bg-transparent p-3" />
        <span className="text-xs font-normal">{title.length} of {SEO_TITLE_MAX_LENGTH} characters used</span>
      </label>
      <label className="grid gap-1 font-bold">
        Meta description
        <textarea name="seoDescription" value={description} maxLength={SEO_DESCRIPTION_MAX_LENGTH} rows={4} onChange={(event) => setDescription(event.currentTarget.value)} className="border border-items-blue bg-transparent p-3" />
        <span className="text-xs font-normal">{description.length} of {SEO_DESCRIPTION_MAX_LENGTH} characters used</span>
      </label>
      <section className="grid gap-3 border border-items-blue bg-items-placeholder p-4" aria-label="URL preview">
        <h3 className="text-sm font-black uppercase tracking-wide">URL preview</h3>
        <div className="grid gap-1 border-l-2 border-items-blue pl-4">
          <p className="truncate text-lg font-bold text-blue-700">{displayTitle} | ITEMS</p>
          <p className="truncate text-sm text-emerald-700">itemsyouwant.com{urlPath}</p>
          <p className="line-clamp-2 text-sm leading-relaxed">{displayDescription}</p>
        </div>
      </section>
    </section>
  );
}
