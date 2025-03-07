"use client";

import { useState, useEffect } from "react";
import { Product } from "@/types/product";
import CategoryNav from "@/components/CategoryNav";
import ProductCard from "@/components/ProductCard";
import { Skeleton } from "@/components/ui/skeleton";
import { FABRIC_CONFIG, isFabricType } from "@/types/fabric-config";
import { supabase } from "@/lib/supabaseClient";
import { Button } from "@/components/ui/button";
import { RotateCw } from "lucide-react";

export default function TextileCatalogPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch products from Supabase
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const { data, error } = await supabase
          .from("products")
          .select("*")
          .order("created_at", { ascending: false });

        if (error) throw error;
        setProducts(data || []);
      } catch (err) {
        setError("Erreur de chargement des produits");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // Filter products based on selection
  const filteredProducts = products.filter((product) => {
    if (selectedCategory === "all") return true;
    if (selectedCategory === "other")
      return !isFabricType(product.metadata.fabricType);
    return product.metadata.fabricType === selectedCategory;
  });

  if (error) {
    return (
      <div className="container mx-auto p-6 text-center">
        <div className="text-destructive mb-4">{error}</div>
        <Button onClick={() => window.location.reload()}>
          <RotateCw className="mr-2 h-4 w-4" />
          Réessayer
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <CategoryNav
        products={products}
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
      />

      <div className="container mx-auto px-4 py-8">
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <Skeleton key={i} className="h-[420px] rounded-lg" />
            ))}
          </div>
        ) : (
          <>
            <div className="mb-6 text-muted-foreground">
              {filteredProducts.length} résultats pour "
              {selectedCategory === "all"
                ? "Toutes les catégories"
                : FABRIC_CONFIG[selectedCategory as keyof typeof FABRIC_CONFIG]
                    ?.name || selectedCategory}
              "
            </div>

            {filteredProducts.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                Aucun produit trouvé dans cette catégorie
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredProducts.map((product) => {
                  const fabricType = product.metadata.fabricType;
                  const fabricConfig = isFabricType(fabricType)
                    ? FABRIC_CONFIG[fabricType]
                    : null;

                  return (
                    <ProductCard
                      key={product.id}
                      product={{
                        ...product,
                        metadata: {
                          ...product.metadata,
                          unit: fabricConfig?.defaultUnit || "mètre",
                          fabricType: fabricConfig?.name || fabricType,
                        },
                      }}
                    />
                  );
                })}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
