"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { toast } from "react-toastify";

export default function AdminProductsPage() {
  const [products, setProducts] = useState<any[]>([]);

  useEffect(() => {
    const fetchProducts = async () => {
      const { data, error } = await supabase.from("products").select("*");
      if (error) {
        toast.error("Erreur lors du chargement des produits.");
      } else {
        setProducts(data);
      }
    };

    fetchProducts();
  }, []);

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("products").delete().eq("id", id);
    if (error) {
      toast.error("Erreur lors de la suppression du produit.");
    } else {
      setProducts(products.filter((product) => product.id !== id));
      toast.success("Produit supprimé avec succès.");
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Gestion des Produits</h1>
      <Link href="/admin/products/new">
        <Button>Ajouter un produit</Button>
      </Link>
      <div className="mt-4">
        {products.map((product) => (
          <div key={product.id} className="border-b py-4">
            <h2 className="text-xl font-semibold">{product.name}</h2>
            <p>{product.description}</p>
            <p>Prix: {product.price} €/mètre</p>
            <Link href={`/admin/products/${product.id}`}>
              <Button variant="outline" className="mr-2">
                Modifier
              </Button>
            </Link>
            <Button
              variant="destructive"
              onClick={() => handleDelete(product.id)}
            >
              Supprimer
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}
