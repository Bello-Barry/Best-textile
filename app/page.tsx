"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Product } from "@/types/product";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import ProductCard from "@/components/ProductCard";
import CategoryNav from "@/components/CategoryNav";

const LandingPage = () => {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("Tous");

  useEffect(() => {
    const fetchFeaturedProducts = async () => {
      const { data, error } = await supabase
        .from("products")
        .select(`
          id,
          name,
          description,
          price,
          stock,
          images,
          metadata
        `)
        .order("created_at", { ascending: false });

      if (!error && data) {
        const formattedProducts = data.map(product => ({
          ...product,
          metadata: {
            fabricType: product.metadata?.fabricType || "Non catégorisé",
            fabricSubtype: product.metadata?.fabricSubtype || "",
            unit: product.metadata?.unit || "mètre"
          }
        }));
        setFeaturedProducts(formattedProducts as Product[]);
      }
    };

    fetchFeaturedProducts();
  }, []);

  const filteredProducts = selectedCategory === "Tous"
    ? featuredProducts
    : featuredProducts.filter(p => p.metadata.fabricType === selectedCategory);

  return (
    <div className="min-h-screen">
      {/* Section Hero */}
      <div className="relative h-[600px] bg-gradient-to-r from-purple-600 to-blue-600">
        <div className="absolute inset-0 bg-black/50" />
        <div className="relative container mx-auto px-4 h-full flex flex-col justify-center items-center text-center text-white">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            Découvrez Notre Collection de Tissus
          </h1>
          <p className="text-lg md:text-xl mb-8">
            Des tissus de qualité pour vos créations uniques
          </p>
          <div className="flex gap-4">
            <Link href="/products">
              <Button size="lg" className="bg-white text-purple-600 hover:bg-gray-100">
                Voir la Collection
              </Button>
            </Link>
            <Link href="/about">
              <Button size="lg" variant="outline" className="border-white hover:bg-white/20">
                En Savoir Plus
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <CategoryNav 
        products={featuredProducts}
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
      />

      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">
            {selectedCategory === "Tous" 
              ? "Tous nos produits" 
              : `Produits en ${selectedCategory}`}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
