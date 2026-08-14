import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/data";

/**
 * Single-page site: the section links (#about, #work, …) are in-page anchors,
 * not separate URLs, so listing them here would just be duplicate entries.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: siteUrl,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 1,
    },
  ];
}
