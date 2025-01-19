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
import { motion, AnimatePresence } from "framer-motion";
import { Loader2 } from "lucide-react";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED_IMAGE_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
];

const schema = z.object({
  name: z.string().min(1, "Le nom est requis"),
  description: z.string().min(1, "La description est requise"),
  price: z.number().min(0, "Le prix doit être positif"),
  type: z.enum(["soie", "bazin", "autre"]),
  subtype: z.string().optional(),
  stock: z.number().min(0, "Le stock doit être positif"),
  images: z.array(z.string()).optional(),
});

type FormData = z.infer<typeof schema>;

const ImagePreview = ({
  url,
  onRemove,
}: {
  url: string;
  onRemove: () => void;
}) => (
  <div className="relative group">
    <img
      src={url}
      alt="Prévisualisation"
      className="w-32 h-32 object-cover rounded-lg"
    />
    <button
      onClick={onRemove}
      className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
    >
      ×
    </button>
  </div>
);

export default function NewProductPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [previewImages, setPreviewImages] = useState<
    { url: string; file: File }[]
  >([]);

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "",
      description: "",
      price: 0,
      type: "soie",
      subtype: "",
      stock: 0,
      images: [],
    },
  });

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    const newFiles = Array.from(files);

    // Validation des fichiers
    const invalidFiles = newFiles.filter(
      (file) =>
        !ACCEPTED_IMAGE_TYPES.includes(file.type) || file.size > MAX_FILE_SIZE
    );

    if (invalidFiles.length > 0) {
      toast.error(
        "Certains fichiers sont invalides. Vérifiez le format et la taille."
      );
      return;
    }

    // Création des previews
    newFiles.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImages((prev) => [
          ...prev,
          { url: reader.result as string, file },
        ]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index: number) => {
    setPreviewImages((prev) => prev.filter((_, i) => i !== index));
  };

  const uploadImages = async () => {
    const uploadedUrls: string[] = [];

    for (const { file } of previewImages) {
      const fileName = `${Date.now()}-${file.name}`;
      const { data, error } = await supabase.storage
        .from("products")
        .upload(fileName, file);

      if (error) {
        toast.error(`Erreur lors du téléchargement de ${file.name}`);
        continue;
      }

      if (data) {
        const {
          data: { publicUrl },
        } = supabase.storage.from("products").getPublicUrl(data.path);
        uploadedUrls.push(publicUrl);
      }
    }

    return uploadedUrls;
  };

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);
    try {
      const imageUrls = await uploadImages();

      const { error } = await supabase
        .from("products")
        .insert([{ ...data, images: imageUrls }]);

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
                        <Input type="number" step="0.01" {...field} />
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
                        <Input type="number" {...field} />
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

              <div className="space-y-4">
                <FormLabel>Images</FormLabel>
                <div className="flex flex-wrap gap-4">
                  <AnimatePresence>
                    {previewImages.map((image, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        transition={{ duration: 0.2 }}
                      >
                        <ImagePreview
                          url={image.url}
                          onRemove={() => removeImage(index)}
                        />
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
                <Input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageChange}
                  className="cursor-pointer"
                />
                <p className="text-sm text-gray-500">
                  Formats acceptés: JPG, PNG, WebP. Taille max: 5MB
                </p>
              </div>

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
