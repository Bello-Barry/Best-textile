"use client";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import ImageUploader from "@/components/ImageUploader";

const schema = z.object({
  name: z.string().min(1, "Le nom est requis"),
  description: z.string().min(1, "La description est requise"),
  price: z.number().min(0, "Le prix doit être positif"),
  type: z.enum(["soie", "bazin", "autre"]),
  subtype: z.string().optional(),
  stock: z.number().min(0, "Le stock doit être positif"),
});

export default function NewProductPage() {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
  });
  const [images, setImages] = useState<string[]>([]);

  const onSubmit = async (data: any) => {
    try {
      const { error } = await supabase
        .from("products")
        .insert([{ ...data, images }]);
      if (error) {
        toast.error("Erreur lors de l'ajout du produit.");
      } else {
        toast.success("Produit ajouté avec succès !");
        router.push("/admin/products");
      }
    } catch (error) {
      toast.error("Une erreur est survenue.");
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Ajouter un produit</h1>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label>Nom</label>
          <input
            {...register("name")}
            className="w-full border rounded px-2 py-1"
          />
          {errors.name && <p className="text-red-500">{errors.name.message}</p>}
        </div>
        <div>
          <label>Description</label>
          <textarea
            {...register("description")}
            className="w-full border rounded px-2 py-1"
          />
          {errors.description && (
            <p className="text-red-500">{errors.description.message}</p>
          )}
        </div>
        <div>
          <label>Prix (€/mètre)</label>
          <input
            type="number"
            {...register("price", { valueAsNumber: true })}
            className="w-full border rounded px-2 py-1"
          />
          {errors.price && (
            <p className="text-red-500">{errors.price.message}</p>
          )}
        </div>
        <div>
          <label>Type</label>
          <select
            {...register("type")}
            className="w-full border rounded px-2 py-1"
          >
            <option value="soie">Soie</option>
            <option value="bazin">Bazin</option>
            <option value="autre">Autre</option>
          </select>
        </div>
        <div>
          <label>Sous-type (optionnel)</label>
          <input
            {...register("subtype")}
            className="w-full border rounded px-2 py-1"
          />
        </div>
        <div>
          <label>Stock</label>
          <input
            type="number"
            {...register("stock", { valueAsNumber: true })}
            className="w-full border rounded px-2 py-1"
          />
          {errors.stock && (
            <p className="text-red-500">{errors.stock.message}</p>
          )}
        </div>
        <div>
          <label>Images</label>
          <ImageUploader onUpload={(urls) => setImages(urls)} />
        </div>
        <button
          type="submit"
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          Ajouter
        </button>
      </form>
    </div>
  );
}
