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
  FabricSubtype,
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
  unit: z.enum(["mètre", "rouleau"]),
  images: z.array(
    z.string().refine(url => 
      url.startsWith('https://') && 
      url.includes('.supabase.co/storage/v1/object/public/images'),
      "URL d'image invalide"
    )
  ).min(1, "Au moins une image est requise")
});

type FormValues = z.infer<typeof schema>;

interface ProductMetadata {
  fabricType: FabricType;
  fabricSubtype: FabricSubtype;
  unit: FabricUnit;
}

export default function NewProductPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedType, setSelectedType] = useState<FabricType | null>(null);
  const [selectedSubtype, setSelectedSubtype] = useState<FabricSubtype | "">("");
  const [selectedUnit, setSelectedUnit] = useState<FabricUnit>("mètre");

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "",
      description: "",
      price: 0,
      stock: 0,
      fabricType: "gabardine" as FabricType,
      fabricSubtype: "",
      unit: "mètre",
      images: []
    }
  });

  // Synchronisation des valeurs du formulaire avec les états
  useEffect(() => {
    if (selectedType) {
      form.setValue("fabricType", selectedType);
      const defaultUnit = FABRIC_CONFIG[selectedType].defaultUnit;
      setSelectedUnit(defaultUnit);
      form.setValue("unit", defaultUnit);
    }
  }, [selectedType, form]);

  useEffect(() => {
    if (selectedSubtype) {
      form.setValue("fabricSubtype", selectedSubtype);
    }
  }, [selectedSubtype, form]);

  useEffect(() => {
    form.setValue("unit", selectedUnit);
  }, [selectedUnit, form]);

  const handleSubmit = async (values: FormValues) => {
    console.log("Formulaire soumis avec les valeurs:", values);

    if (!selectedType) {
      toast.error("Veuillez sélectionner un type de tissu");
      return;
    }

    if (!selectedSubtype) {
      toast.error("Veuillez sélectionner une variante de tissu");
      return;
    }

    // Validation des champs obligatoires
    if (!values.name || !values.description || !values.images.length) {
      toast.error("Veuillez remplir tous les champs obligatoires");
      return;
    }

    setIsSubmitting(true);

    try {
      const metadata: ProductMetadata = {
        fabricType: selectedType,
        fabricSubtype: selectedSubtype as FabricSubtype,
        unit: selectedUnit
      };

      const productData = {
        name: values.name,
        description: values.description,
        price: values.price,
        stock: values.stock,
        images: values.images,
        metadata
      };

      console.log("Données envoyées à Supabase:", productData);

      const { data, error } = await supabase
        .from("products")
        .insert([productData])
        .select();

      console.log("Réponse Supabase:", { data, error });

      if (error) {
        console.error("Erreur Supabase:", error);
        throw error;
      }

      toast.success("Produit créé avec succès");
      router.push("/admin/products");
      
    } catch (error: any) {
      console.error("Erreur complète:", error);
      toast.error(error.message || "Erreur lors de la création du produit");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Gestionnaire pour le changement de type de tissu
  const handleTypeChange = (type: FabricType | null) => {
    console.log("Changement de type:", type);
    setSelectedType(type);
    setSelectedSubtype(""); // Réinitialiser le sous-type
    if (type) {
      form.setValue("fabricType", type);
      form.setValue("fabricSubtype", "");
    }
  };

  // Gestionnaire pour le changement de sous-type
  const handleSubtypeChange = (subtype: string) => {
    console.log("Changement de sous-type:", subtype);
    setSelectedSubtype(subtype as FabricSubtype);
    form.setValue("fabricSubtype", subtype);
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
                onTypeChange={handleTypeChange}
                selectedSubtype={selectedSubtype}
                onSubtypeChange={handleSubtypeChange}
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
                          className="[appearance:textfield] focus-visible:ring-2 focus-visible:ring-blue-500"
                          onChange={(e) => field.onChange(parseFloat(e.target.value))}
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
                          className="[appearance:textfield] focus-visible:ring-2 focus-visible:ring-blue-500"
                          onChange={(e) => field.onChange(parseInt(e.target.value))}
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
                          onUpload={(urls: string[]) => {
                            console.log("Images téléchargées:", urls);
                            field.onChange(urls);
                          }}
                          bucket="images"
                          maxFiles={5}
                        />
                      </FormControl>
                      <FormMessage className="text-red-500 text-sm" />
                    </FormItem>
                  )}
                />
              </div>

              <Button 
                type="submit" 
                className="w-full bg-blue-600 hover:bg-blue-700 transition-colors h-12 text-lg"
                disabled={isSubmitting}
                onClick={() => {
                  console.log("État actuel du formulaire:", form.getValues());
                }}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Création en cours...
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
