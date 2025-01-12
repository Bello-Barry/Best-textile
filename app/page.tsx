// app/page.tsx
import { ProductGrid } from "@/components/products/product-grid";
import { Hero } from "@/components/home/hero";
import { FeaturedCategories } from "@/components/home/featured-categories";
import { Testimonials } from "@/components/home/testimonials";

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

// components/home/hero.tsx
import { Button } from "@/components/ui/button";
import Image from "next/image";

export function Hero() {
  return (
    <div className="relative h-[600px] bg-primary/5">
      <div className="container mx-auto px-4 h-full flex items-center">
        <div className="max-w-xl space-y-6">
          <h1 className="text-5xl font-bold">
            Découvrez nos Tissus Africains Authentiques
          </h1>
          <p className="text-xl text-gray-600">
            Une collection unique de tissus traditionnels : Wax, Kente, Bazin et
            plus encore.
          </p>
          <Button size="lg" asChild>
            <Link href="/products">Explorer la Collection</Link>
          </Button>
        </div>
      </div>
      <Image
        src="/api/placeholder/800/600"
        alt="Tissus africains colorés"
        fill
        className="object-cover object-center opacity-20"
        priority
      />
    </div>
  );
}

// components/products/product-card.tsx
import { Product } from "@/types";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import Image from "next/image";
import { Button } from "../ui/button";
import { ShoppingCart } from "lucide-react";
import { formatPrice } from "@/lib/utils";

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  return (
    <Card className="group">
      <CardContent className="p-0">
        <div className="relative aspect-square">
          <Image
            src={product.imageUrls[0]}
            alt={product.name}
            fill
            className="object-cover transition-transform group-hover:scale-105"
          />
        </div>
        <div className="p-4">
          <h3 className="font-semibold">{product.name}</h3>
          <p className="text-sm text-gray-500 mt-1">{product.description}</p>
          <p className="text-lg font-bold mt-2">
            {formatPrice(product.pricePerMeter)}/mètre
          </p>
        </div>
      </CardContent>
      <CardFooter className="p-4 pt-0">
        <Button className="w-full" size="sm">
          <ShoppingCart className="mr-2 h-4 w-4" />
          Ajouter au panier
        </Button>
      </CardFooter>
    </Card>
  );
}
