"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import ImageUploader from "@/components/ImageUploader";

const schema = z.object({
  name: z.string().min(1, "Le nom est requis"),
  description: z.string().min(1, "La description est requise"),
  price: z.coerce
    .number()
    .min(1, "Le prix doit être positif")
    .refine((val) => !isNaN(val), {
      message: "Le prix doit être un nombre valide",
    }),
  type: z.enum(["soie", "bazin", "autre"]),
  subtype: z.string().optional(),
  stock: z.coerce
    .number()
    .min(0, "Le stock doit être positif")
    .refine((val) => !isNaN(val), {
      message: "Le stock doit être un nombre valide",
    }),
  images: z.array(z.string()).min(1, "Au moins une image est requise"),
});

type FormData = z.infer<typeof schema>;

export default function NewProductPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "",
      description: "",
      price: undefined,
      type: "soie",
      subtype: "",
      stock: undefined,
      images: [],
    },
  });

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);
    try {
      const { error } = await supabase.from("products").insert([data]);

      if (error) throw error;

      toast.success("Produit ajouté avec succès !");
      router.push("/admin/products");
    } catch (error) {
      toast.error("Une erreur est survenue lors de l'ajout du produit.");
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleImageUpload = (urls: string[]) => {
    form.setValue("images", urls);
  };

  return (
    <div className="container mx-auto p-4">
      <ToastContainer />
      <Card>
        <CardHeader>
          <CardTitle>Ajouter un produit</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nom</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="price"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Prix (€/mètre)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          value={field.value || ""}
                          onChange={(e) => {
                            const value = e.target.valueAsNumber;
                            field.onChange(value);
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="stock"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Stock</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          value={field.value || ""}
                          onChange={(e) => {
                            const value = e.target.valueAsNumber;
                            field.onChange(value);
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Type</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Sélectionnez un type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="soie">Soie</SelectItem>
                          <SelectItem value="bazin">Bazin</SelectItem>
                          <SelectItem value="autre">Autre</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="subtype"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Sous-type (optionnel)</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="images"
                render={() => (
                  <FormItem>
                    <FormLabel>Images</FormLabel>
                    <FormControl>
                      <ImageUploader
                        onUpload={handleImageUpload}
                        bucket="products"
                        maxFiles={5}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Ajout en cours...
                  </>
                ) : (
                  "Ajouter le produit"
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
