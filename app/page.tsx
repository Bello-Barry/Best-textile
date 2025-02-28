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
