import { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: "hhttps://best-textile.vercel.app",
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: "https://best-textile.vercel.app/galerie",
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.8,
    },
    // Ajouter d'autres URLs
  ];
}
