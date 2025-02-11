"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import ProductCard from "@/components/ProductCard";
import ProductFilters from "@/components/ui/ProductFilters";

export default function ProductsPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ type: "", search: "" });

  useEffect(() => {
    const fetchProducts = async () => {
      const { data, error } = await supabase.from("products").select("*");
      if (error) {
        toast.error("Erreur lors du chargement des produits.");
      } else {
        setProducts(data);
        setFilteredProducts(data);
      }
      setLoading(false);
    };

    fetchProducts();
  }, []);

  useEffect(() => {
    let filtered = products;
    if (filters.type) {
      filtered = filtered.filter((p) => p.type === filters.type);
    }
    if (filters.search) {
      filtered = filtered.filter((p) =>
        p.name.toLowerCase().includes(filters.search.toLowerCase())
      );
    }
    setFilteredProducts(filtered);
  }, [filters, products]);

  return (
    <div className="container mx-auto p-4">
      <ToastContainer />
      <h1 className="text-2xl font-bold mb-4">Nos Produits</h1>

      {/* Filtres */}
      <ProductFilters filters={filters} setFilters={setFilters} />

      {/* Liste des produits */}
      {loading ? (
        <p>Chargement...</p>
      ) : filteredProducts.length === 0 ? (
        <p>Aucun produit trouvé.</p>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}