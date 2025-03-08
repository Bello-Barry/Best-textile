"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import ImageUploader from "@/components/ImageUploader";
import SelectFabric from "@/components/SelectFabric";
import { 
  FABRIC_CONFIG,
  FabricType,
  FabricUnit,
  isFabricType,
  isFabricSubtype
} from "@/types/fabric-config";

const schema = z.object({
  name: z.string().min(1, "Le nom est requis"),
  description: z.string().min(1, "La description est requise"),
  price: z.coerce.number().min(0.1, "Le prix doit être positif"),
  stock: z.coerce.number().min(0, "Le stock ne peut pas être négatif"),
  fabricType: z.string().refine(isFabricType, "Type de tissu invalide"),
  fabricSubtype: z.string().min(1, "La variante est requise"),
  unit: z.enum(["mètre", "rouleau", "pièce", "complet", "yards", "bande", "set", "yard"]),
  images: z.array(
    z.string().refine(url => 
      url.startsWith('https://') && 
      url.includes('.supabase.co/storage/v1/object/public/images'),
      "URL d'image invalide"
    )
  ).min(1, "Au moins une image est requise")
});

type FormValues = z.infer<typeof schema>;

export default function NewProductPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedType, setSelectedType] = useState<FabricType>("gabardine");
  const [selectedSubtype, setSelectedSubtype] = useState("");
  const [selectedUnit, setSelectedUnit] = useState<FabricUnit>("mètre");
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "",
      description: "",
      price: 0,
      stock: 0,
      fabricType: "gabardine",
      fabricSubtype: "",
      unit: "mètre",
      images: []
    }
  });

  useEffect(() => {
    if (selectedType) {
      form.setValue("fabricType", selectedType);
      const defaultUnit = FABRIC_CONFIG[selectedType].defaultUnit;
      setSelectedUnit(defaultUnit);
      form.setValue("unit", defaultUnit);
      form.setValue("fabricSubtype", "");
      setSelectedSubtype("");
    }
  }, [selectedType, form]);

  const handleSubmit = async (values: FormValues) => {
    try {
      setIsSubmitting(true);
      
      // Validation renforcée
      if (!values.images?.length) {
        throw new Error("Ajoutez au moins une image");
      }

      if (!selectedType || !isFabricType(selectedType)) {
        throw new Error("Type de tissu invalide");
      }

      if (!selectedSubtype || !isFabricSubtype(selectedType, selectedSubtype)) {
        throw new Error("Sélectionnez une variante valide");
      }

      // Construction du payload
      const payload = {
        name: values.name.trim(),
        description: values.description.trim(),
        price: Number(values.price),
        stock: Number(values.stock),
        images: values.images,
        metadata: {
          fabricType: selectedType,
          fabricSubtype: selectedSubtype,
          unit: selectedUnit
        },
        created_at: new Date().toISOString()
      };

      console.log("Soumission des données:", payload);

      // Envoi à Supabase
      const { data, error } = await supabase
        .from("products")
        .insert([payload])
        .select();

      if (error) {
        console.error("Erreur Supabase:", {
          code: error.code,
          message: error.message,
          details: error.details
        });
        throw new Error(error.message || "Erreur de base de données");
      }

      if (!data || data.length === 0) {
        throw new Error("Aucune donnée retournée par l'API");
      }

      toast.success("Produit créé avec succès !");
      router.push("/admin/products");

    } catch (error: any) {
      console.error("Erreur complète:", error);
      toast.error(error.message || "Erreur lors de la création");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleImageUpload = (urls: string[]) => {
    const validUrls = urls.filter(url => 
      url.startsWith('https://') && 
      url.includes('.supabase.co/storage/v1/object/public/images')
    );
    
    if (validUrls.length === 0) {
      form.setError("images", {
        type: "manual",
        message: "Au moins une image valide est requise"
      });
      return;
    }

    setUploadedImages(validUrls);
    form.setValue("images", validUrls);
    form.clearErrors("images");
  };

  return (
    <div className="container mx-auto p-4 lg:p-6 max-w-4xl">
      <Card className="shadow-lg">
        <CardHeader className="border-b">
          <CardTitle className="text-2xl font-bold text-gray-800">
            Nouveau produit textile
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <Form {...form}>
            <form 
              onSubmit={form.handleSubmit(handleSubmit)} 
              className="space-y-6 lg:space-y-8"
            >
              <SelectFabric
                selectedType={selectedType}
                onTypeChange={setSelectedType}
                selectedSubtype={selectedSubtype}
                onSubtypeChange={setSelectedSubtype}
                selectedUnit={selectedUnit}
                onUnitChange={setSelectedUnit}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-700">Nom du produit</FormLabel>
                      <FormControl>
                        <Input 
                          {...field} 
                          placeholder="Nom du produit"
                          className="focus-visible:ring-2 focus-visible:ring-blue-500"
                        />
                      </FormControl>
                      <FormMessage className="text-red-500 text-sm" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="price"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-700">
                        Prix ({selectedUnit === "rouleau" ? "par rouleau" : "au mètre"})
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          {...field}
                          placeholder="19.99"
                          className="[appearance:textfield] focus-visible:ring-2 focus-visible:ring-blue-500"
                        />
                      </FormControl>
                      <FormMessage className="text-red-500 text-sm" />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-700">Description</FormLabel>
                    <FormControl>
                      <Textarea 
                        {...field} 
                        rows={4}
                        placeholder="Description détaillée du produit..."
                        className="focus-visible:ring-2 focus-visible:ring-blue-500"
                      />
                    </FormControl>
                    <FormMessage className="text-red-500 text-sm" />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6">
                <FormField
                  control={form.control}
                  name="stock"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-700">
                        Stock ({selectedUnit === "rouleau" ? "rouleaux" : "mètres"})
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          {...field}
                          placeholder="100"
                          className="[appearance:textfield] focus-visible:ring-2 focus-visible:ring-blue-500"
                        />
                      </FormControl>
                      <FormMessage className="text-red-500 text-sm" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="images"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-700">Images</FormLabel>
                      <FormControl>
                        <ImageUploader
                          onUpload={handleImageUpload}
                          bucket="images"
                          maxFiles={5}
                          acceptedFormats={["image/jpeg", "image/png"]}
                        />
                      </FormControl>
                      <FormMessage className="text-red-500 text-sm" />
                    </FormItem>
                  )}
                />
              </div>

              <Button 
                type="submit" 
                className="w-full bg-blue-600 hover:bg-blue-700 h-12 text-lg transition-colors"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Création en cours...
                  </>
                ) : "Publier le produit"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}