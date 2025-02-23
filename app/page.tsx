"use client";

import React, { useState, useEffect } from "react";
import { Search, ShoppingCart, Star, TrendingUp } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import ProductCard from "@/components/ProductCard";
import { Product } from "@/types/product";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface Category {
  name: string;
  image: string;
  count: number;
}

const LandingPage = () => {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([
    { name: "Soie", image: "/api/placeholder/300/200", count: 0 },
    { name: "Bazin", image: "/api/placeholder/300/200", count: 0 },
    { name: "Autre", image: "/api/placeholder/300/200", count: 0 },
  ]);

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
          fabricType,
          unit,
          created_at,
          category: type,
          subtype
        `)
        .limit(4)
        .order("created_at", { ascending: false });

      if (data) {
        const formattedProducts: Product[] = data.map((product) => ({
          id: product.id.toString(),
          name: product.name,
          description: product.description,
          price: product.price,
          stock: product.stock,
          images: product.images || [],
          fabricType: product.fabricType || product.category || "Non catégorisé",
          unit: product.unit || "mètre",
          type: product.category,
          subtype: product.subtype
        }));
        setFeaturedProducts(formattedProducts);
      }
    };

    fetchFeaturedProducts();
  }, []);

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="relative h-[600px] bg-gradient-to-r from-purple-600 to-blue-600">
        <div className="absolute inset-0 bg-black opacity-50"></div>
        <div className="relative container mx-auto px-4 h-full flex flex-col justify-center items-center text-white text-center">
          <h1 className="text-5xl font-bold mb-6">
            Découvrez Notre Collection de Tissus
          </h1>
          <p className="text-xl mb-8">
            Des tissus de qualité pour vos créations uniques
          </p>
          <div className="flex gap-4">
            <Link href="/products">
              <Button
                size="lg"
                className="bg-white text-purple-600 hover:bg-gray-100"
              >
                Voir la Collection
              </Button>
            </Link>
            <Link href="/about">
              <Button
                size="lg"
                variant="outline"
                className="border-white text-white hover:bg-white/20"
              >
                En Savoir Plus
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Featured Products */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">
            Produits Vedettes
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="flex justify-center mb-4">
                <Star className="w-12 h-12 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Qualité Premium</h3>
              <p className="text-gray-600">
                Sélection rigoureuse des meilleurs tissus
              </p>
            </div>
            <div className="text-center">
              <div className="flex justify-center mb-4">
                <TrendingUp className="w-12 h-12 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">
                Dernières Tendances
              </h3>
              <p className="text-gray-600">
                Collections régulièrement mises à jour
              </p>
            </div>
            <div className="text-center">
              <div className="flex justify-center mb-4">
                <ShoppingCart className="w-12 h-12 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Livraison Rapide</h3>
              <p className="text-gray-600">Expédition soignée sous 24-48h</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
