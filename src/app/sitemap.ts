import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/data";

/**
 * Only the routes that are actually indexable.
 *
 * The homepage's section links (#about, #work, …) are in-page anchors, not
 * separate URLs, so listing them here would just be duplicate entries. `/v1`
 * and `/avengers` are both `noindex` — a sitemap entry would ask Google to
 * index exactly what their own robots tag refuses.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: siteUrl,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 1,
    },
    {
      url: `${siteUrl}/design`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.5,
    },
  ];
}
