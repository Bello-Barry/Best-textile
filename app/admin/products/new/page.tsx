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
  images: z.array(z.string().url()).min(1, "Au moins une image est requise")
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

export default function NewProductPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedType, setSelectedType] = useState<FabricType | null>(null);

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

  useEffect(() => {
    if (selectedType) {
      const defaultUnit = FABRIC_CONFIG[selectedType].defaultUnit;
      form.setValue("unit", defaultUnit);
      form.setValue("fabricType", selectedType);
    }
  }, [selectedType, form]);

  const handleSubmit = async (values: FormValues) => {
    setIsSubmitting(true);
    try {
      console.log("Soumission des données:", values); // Log de débogage
      
      const { error } = await supabase
        .from("products")
        .insert([{
          ...values,
          metadata: {
            fabricType: values.fabricType,
            fabricSubtype: values.fabricSubtype,
            unit: values.unit
          }
        }]);

      if (error) {
        throw new Error(error.message);
      }

      toast.success("Produit créé avec succès");
      router.push("/admin/products");
    } catch (error: any) {
      console.error("Erreur complète:", error);
      toast.error(`Erreur lors de la création : ${error.message || "Erreur inconnue"}`);
    } finally {
      setIsSubmitting(false);
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
                  form.setValue("fabricSubtype", "");
                }}
                onSubtypeChange={(subtype) => form.setValue("fabricSubtype", subtype)}
                selectedUnit={form.watch("unit")}
                onUnitChange={(unit) => form.setValue("unit", unit)}
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
                          placeholder="Tissu en coton bio"
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
                        Prix ({form.watch("unit") === "rouleau" ? "par rouleau" : "au mètre"})
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          {...field}
                          placeholder="24.99"
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
                        placeholder="Décrivez les caractéristiques du tissu..."
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
                        Stock ({form.watch("unit") === "rouleau" ? "rouleaux" : "mètres"})
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          {...field}
                          placeholder="50"
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
                          onUpload={(urls) => field.onChange(urls)}
                          bucket="products"
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