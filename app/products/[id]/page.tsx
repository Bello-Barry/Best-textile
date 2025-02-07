"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import Image from "next/image";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useCart } from "@/context/CartContext";
import { toast } from "react-toastify";

// Définir l'interface pour le produit
interface Product {
  id: string;
  name: string;
  price: number;
  description: string;
  images: string[];
  stock: number;
}

// Définir les props de la page
interface PageProps {
  params: {
    id: string;
  };
  searchParams?: Record<string, string | string[] | undefined>;
}

export default function ProductPage({ params }: PageProps) {
  const [quantity, setQuantity] = useState(1);
  const [product, setProduct] = useState<Product | null>(null);
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
    <div>
      <h1>{product.name}</h1>
      <div>
        <div>
          {product.images.map((image: string, index: number) => (
            <Image
              key={index}
              src={image}
              alt={`${product.name} - Image ${index + 1}`}
              width={500}
              height={500}
            />
          ))}
        </div>
      </div>
      <div>
        <p>{product.description}</p>
        <p>Prix: {product.price} €/mètre</p>
        <div>
          <label>
            Quantité (mètres):
            <input
              type="number"
              value={quantity}
              onChange={(e) => setQuantity(parseFloat(e.target.value))}
              min="1"
              className="w-16 border rounded px-2 py-1"
            />
          </label>
        </div>
        <p>Prix total: {(product.price * quantity).toFixed(2)} €</p>
        {product.stock > 0 ? (
          <Button onClick={handleAddToCart}>Ajouter au panier</Button>
        ) : (
          <Button disabled>Rupture de stock</Button>
        )}
      </div>
    </div>
  );
}
