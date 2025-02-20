"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Button } from "@/components/ui/button";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "react-toastify";

// Définir le schéma de validation
const schema = z.object({
  name: z.string().min(1, "Le nom est requis"),
  description: z.string().min(1, "La description est requise"),
  price: z.number().min(0, "Le prix doit être positif"),
  stock: z.number().min(0, "Le stock doit être positif"),
});

// Créer un type à partir du schéma
type ProductFormData = z.infer<typeof schema>;

// Interface pour le produit
interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
}

export default function ProductDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [product, setProduct] = useState<Product | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ProductFormData>({
    resolver: zodResolver(schema),
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
      } else {
        setProduct(data);
      }
    };

    fetchProduct();
  }, [id]);

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
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Modifier le produit</h1>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label>Nom</label>
          <input
            defaultValue={product.name}
            {...register("name")}
            className="w-full border rounded px-2 py-1"
          />
          {errors.name && (
            <p className="text-red-500">{errors.name.message?.toString()}</p>
          )}
        </div>
        <div>
          <label>Description</label>
          <textarea
            defaultValue={product.description}
            {...register("description")}
            className="w-full border rounded px-2 py-1"
          />
          {errors.description && (
            <p className="text-red-500">
              {errors.description.message?.toString()}
            </p>
          )}
        </div>
        <div>
          <label>Prix (€/mètre)</label>
          <input
            type="number"
            defaultValue={product.price}
            {...register("price", { valueAsNumber: true })}
            className="w-full border rounded px-2 py-1"
          />
          {errors.price && (
            <p className="text-red-500">{errors.price.message?.toString()}</p>
          )}
        </div>
        <div>
          <label>Stock</label>
          <input
            type="number"
            defaultValue={product.stock}
            {...register("stock", { valueAsNumber: true })}
            className="w-full border rounded px-2 py-1"
          />
          {errors.stock && (
            <p className="text-red-500">{errors.stock.message?.toString()}</p>
          )}
        </div>
        <Button type="submit">Mettre à jour</Button>
      </form>
    </div>
  );
}
