"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Button } from "@/components/ui/button";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "react-toastify";
import ProductGallery from "@/components/ui/ProductGallery";

// Schéma de validation étendu avec les nouveaux champs
const schema = z.object({
  name: z.string().min(1, "Le nom est requis"),
  description: z.string().min(1, "La description est requise"),
  price: z.coerce.number().min(0.1, "Le prix doit être positif"),
  stock: z.coerce.number().min(0, "Le stock doit être positif"),
  fabricType: z.string().min(1, "Le type de tissu est requis"),
  fabricSubtype: z.string().min(1, "La variante est requise"),
  unit: z.enum(["mètre", "rouleau"]),
  images: z.array(z.string().url()).min(1, "Au moins une image est requise")
});

type ProductFormData = z.infer<typeof schema>;

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  fabricType: string;
  fabricSubtype: string;
  unit: string;
  images: string[];
}

export default function ProductDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [product, setProduct] = useState<Product | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset
  } = useForm<ProductFormData>({
    resolver: zodResolver(schema)
  });

  useEffect(() => {
    const fetchProduct = async () => {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        toast.error("Erreur lors du chargement du produit.");
      } else if (data) {
        setProduct(data);
        reset(data); // Initialise le formulaire avec les données récupérées
      }
    };

    fetchProduct();
  }, [id, reset]);

  const onSubmit = async (data: ProductFormData) => {
    try {
      const { error } = await supabase
        .from("products")
        .update(data)
        .eq("id", id);

      if (error) {
        toast.error("Erreur lors de la mise à jour du produit.");
      } else {
        toast.success("Produit mis à jour avec succès !");
        router.push("/admin/products");
      }
    } catch (error) {
      toast.error("Une erreur est survenue.");
    }
  };

  if (!product) {
    return <div>Chargement...</div>;
  }

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <h1 className="text-2xl font-bold mb-4">Modifier le produit</h1>
      
      <ProductGallery 
        images={product.images} 
        alt={`Galerie produit - ${product.name}`} // Correction de l'erreur alt
      />

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Nom</label>
            <input
              {...register("name")}
              className="w-full border rounded px-3 py-2 focus:ring-2 focus:ring-blue-500"
            />
            {errors.name && (
              <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Prix</label>
            <input
              type="number"
              step="0.01"
              {...register("price")}
              className="w-full border rounded px-3 py-2"
            />
            {errors.price && (
              <p className="text-red-500 text-sm mt-1">{errors.price.message}</p>
            )}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Description</label>
          <textarea
            {...register("description")}
            rows={4}
            className="w-full border rounded px-3 py-2"
          />
          {errors.description && (
            <p className="text-red-500 text-sm mt-1">{errors.description.message}</p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Stock</label>
            <input
              type="number"
              {...register("stock")}
              className="w-full border rounded px-3 py-2"
            />
            {errors.stock && (
              <p className="text-red-500 text-sm mt-1">{errors.stock.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Type de tissu</label>
            <input
              {...register("fabricType")}
              className="w-full border rounded px-3 py-2"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Variante</label>
            <input
              {...register("fabricSubtype")}
              className="w-full border rounded px-3 py-2"
            />
          </div>
        </div>

        <Button type="submit" disabled={isSubmitting} className="w-full">
          {isSubmitting ? "Enregistrement..." : "Mettre à jour le produit"}
        </Button>
      </form>
    </div>
  );
}
