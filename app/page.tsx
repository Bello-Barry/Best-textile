"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import ProductCard from "@/components/ProductCard";

export default function Home() {
  const [products, setProducts] = useState<any[]>([]);

  useEffect(() => {
    const fetchProducts = async () => {
      const { data, error } = await supabase.from("products").select("*");
      if (error) {
        console.error(error);
      } else {
        setProducts(data);
      }
    };

    fetchProducts();
  }, []);

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Nos Tissus</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
}
