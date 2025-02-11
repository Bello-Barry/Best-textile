"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, ShoppingCart, Heart } from "lucide-react";
import ProductGallery from "@/components/ui/ProductGallery";
import ProductDetails from "@/components/ui/ProductDetails";

export default function ProductPage() {
  const { id } = useParams();
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProduct = async () => {
      const { data, error } = await supabase.from("products").select("*").eq("id", id).single();
      if (error) {
        toast.error("Produit introuvable.");
      } else {
        setProduct(data);
      }
      setLoading(false);
    };

    fetchProduct();
  }, [id]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  if (!product) {
    return <p className="text-center text-red-500 mt-4">Aucun produit trouvé.</p>;
  }

  return (
    <div className="container mx-auto p-4">
      <ToastContainer />
      <Card>
        <CardHeader>
          <CardTitle>{product.name}</CardTitle>
        </CardHeader>
        <CardContent>
          <ProductGallery images={product.images} />
          <ProductDetails product={product} />
          <div className="flex gap-4 mt-4">
            <Button className="flex-1">
              <ShoppingCart className="mr-2 h-5 w-5" /> Ajouter au panier
            </Button>
            <Button variant="outline">
              <Heart className="mr-2 h-5 w-5 text-red-500" /> Ajouter aux favoris
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}