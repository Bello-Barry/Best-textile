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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

const schema = z.object({
  name: z.string().min(1, "Le nom est requis"),
  description: z.string().min(1, "La description est requise"),
  price: z.coerce.number().min(0.1, "Le prix doit être positif"),
  stock: z.coerce.number().min(0, "Le stock doit être positif"),
  fabricType: z.string().min(1, "Type de tissu requis"),
  fabricSubtype: z.string().min(1, "Variante requise"),
  unit: z.enum(["mètre", "rouleau"]),
  images: z.array(z.string().url()).min(1, "Au moins une image requise")
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
  unit: "mètre" | "rouleau";
  images: string[];
}

export default function ProductDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [product, setProduct] = useState<Product | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<ProductFormData>({
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
        toast.error("Erreur lors du chargement du produit");
      } else if (data) {
        setProduct(data);
        reset(data);
      }
    };

    fetchProduct();
  }, [id, reset]);

  const onSubmit = async (data: ProductFormData) => {
    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from("products")
        .update(data)
        .eq("id", id);

      if (error) throw error;
      toast.success("Produit mis à jour avec succès");
      router.push("/admin/products");
    } catch (error) {
      toast.error("Erreur lors de la mise à jour");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!product) {
    return <div className="text-center p-8">Chargement en cours...</div>;
  }

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <Card>
        <CardHeader>
          <CardTitle>Modifier le produit</CardTitle>
        </CardHeader>
        <CardContent>
          <ProductGallery 
            images={product.images} 
            alt={`Galerie produit - ${product.name}`}
          />

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Nom du produit</label>
                <Input
                  {...register("name")}
                  defaultValue={product.name}
                />
                {errors.name && <p className="text-red-500 text-sm">{errors.name.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Prix</label>
                <Input
                  type="number"
                  step="0.01"
                  {...register("price")}
                  defaultValue={product.price}
                />
                {errors.price && <p className="text-red-500 text-sm">{errors.price.message}</p>}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Description</label>
              <Textarea
                {...register("description")}
                defaultValue={product.description}
                rows={4}
              />
              {errors.description && <p className="text-red-500 text-sm">{errors.description.message}</p>}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Stock</label>
                <Input
                  type="number"
                  {...register("stock")}
                  defaultValue={product.stock}
                />
                {errors.stock && <p className="text-red-500 text-sm">{errors.stock.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Type de tissu</label>
                <Input
                  {...register("fabricType")}
                  defaultValue={product.fabricType}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Variante</label>
                <Input
                  {...register("fabricSubtype")}
                  defaultValue={product.fabricSubtype}
                />
              </div>
            </div>

            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? "Mise à jour en cours..." : "Mettre à jour le produit"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
      }
