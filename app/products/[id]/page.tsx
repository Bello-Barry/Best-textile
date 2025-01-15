"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import Image from "next/image";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useCart } from "@/context/CartContext";
import { toast } from "react-toastify";

export default function ProductPage({ params }: { params: { id: string } }) {
  const [quantity, setQuantity] = useState<number>(1);
  const [product, setProduct] = useState<any>(null);
  const { addToCart } = useCart();

  useEffect(() => {
    const fetchProduct = async () => {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("id", params.id)
        .single();

      if (error || !data) {
        notFound();
      } else {
        setProduct(data);
      }
    };

    fetchProduct();
  }, [params.id]);

  if (!product) {
    return <div>Chargement...</div>;
  }

  const handleAddToCart = () => {
    addToCart({
      id: product.id,
      name: product.name,
      price: product.price * quantity,
      quantity,
      images: product.images,
    });
    toast.success("Produit ajouté au panier !");
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">{product.name}</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          {product.images.map((image: string, index: number) => (
            <Image
              key={index}
              src={image}
              alt={`${product.name} - Image ${index + 1}`}
              width={500}
              height={500}
              className="rounded-lg"
            />
          ))}
        </div>
        <div>
          <p className="text-gray-700 mb-4">{product.description}</p>
          <p className="text-xl font-bold mb-4">
            Prix: {product.price} €/mètre
          </p>
          <div className="flex items-center gap-2 mb-4">
            <label>Quantité (mètres):</label>
            <input
              type="number"
              value={quantity}
              onChange={(e) => setQuantity(parseFloat(e.target.value))}
              min="1"
              className="w-16 border rounded px-2 py-1"
            />
          </div>
          <p className="text-xl font-bold mb-4">
            Prix total: {(product.price * quantity).toFixed(2)} €
          </p>
          {product.stock > 0 ? (
            <Button onClick={handleAddToCart}>Ajouter au panier</Button>
          ) : (
            <p className="text-red-500">Rupture de stock</p>
          )}
        </div>
      </div>
    </div>
  );
}
