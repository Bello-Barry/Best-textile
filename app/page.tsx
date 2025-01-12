// app/page.tsx
import { ProductGrid } from "@/components/products/product-grid";
import { Hero } from "@/components/home/hero";
import { FeaturedCategories } from "@/components/home/featured-categories";
import { Testimonials } from "@/components/home/testimonials";
import Link from "next/link";

export default async function HomePage() {
  return (
    <div className="space-y-12 pb-12">
      <Hero />
      <FeaturedCategories />
      <section className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">Produits Populaires</h2>
          <Link href="/products" className="text-primary hover:underline">
            Voir tous les produits
          </Link>
        </div>
        <ProductGrid featured={true} />
      </section>
      <Testimonials />
    </div>
  );
}
