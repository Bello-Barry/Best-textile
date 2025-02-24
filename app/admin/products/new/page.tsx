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

// Schéma de validation amélioré
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
}).superRefine((data, ctx) => {
  if (isFabricType(data.fabricType)) {
    if (!isFabricSubtype(data.fabricType, data.fabricSubtype)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Combinaison type/variante invalide",
        path: ["fabricSubtype"]
      });
    }
  }
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
      fabricType: "",
      fabricSubtype: "",
      unit: "mètre",
      images: []
    }
  });

  // Mise à jour automatique des valeurs du formulaire lors des changements
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
    if (!selectedType) {
      toast.error("Veuillez sélectionner un type de tissu");
      return;
    }

    if (!selectedSubtype) {
      toast.error("Veuillez sélectionner une variante de tissu");
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Validation supplémentaire des données
      if (!values.images || values.images.length === 0) {
        throw new Error("Au moins une image est requise");
      }

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

      const { data, error } = await supabase
        .from("products")
        .insert([productData])
        .select();

      if (error) {
        throw error;
      }

      if (!data || data.length === 0) {
        throw new Error("Aucune donnée retournée après l'insertion");
      }

      toast.success("Produit créé avec succès");
      router.push("/admin/products");
      
    } catch (error) {
      if (error instanceof Error) {
        toast.error(`Erreur: ${error.message}`);
      } else {
        toast.error("Une erreur inattendue s'est produite");
      }
      console.error("Erreur lors de la création du produit:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Validation des images avant soumission
  const handleImageUpload = (urls: string[]) => {
    if (urls.length > 0) {
      form.setValue("images", urls);
    } else {
      form.setError("images", {
        type: "manual",
        message: "Au moins une image est requise"
      });
    }
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
                onTypeChange={(type) => {
                  setSelectedType(type);
                  setSelectedSubtype(""); // Réinitialiser le sous-type
                }}
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
                          className="focus-visible:ring-2 focus-visible:ring-blue-500"
                          placeholder="Nom du produit"
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
                          placeholder="0.00"
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
                        placeholder="Description du produit"
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
                          placeholder="0"
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
