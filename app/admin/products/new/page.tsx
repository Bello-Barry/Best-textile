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
  type FabricType,
  type FabricSubtype,
  type FabricUnit
} from "@/types/fabric-config";

// Schéma de validation corrigé
const schema = z.object({
  name: z.string().min(1, "Le nom est requis"),
  description: z.string().min(1, "La description est requise"),
  price: z.coerce.number().min(0.1, "Le prix doit être positif"),
  stock: z.coerce.number().min(0, "Le stock ne peut pas être négatif"),
  fabricType: z.string().refine((val): val is FabricType => {
    return Object.keys(FABRIC_CONFIG).includes(val);
  }, "Type de tissu invalide"),
  fabricSubtype: z.string().min(1, "La variante est requise"),
  unit: z.enum(["mètre", "rouleau"]),
  images: z.array(z.string().url()).min(1, "Au moins une image est requise")
}).superRefine((data, ctx) => {
  // Validation croisée type/subtype
  const type = data.fabricType as FabricType;
  const subtype = data.fabricSubtype;
  
  if (!FABRIC_CONFIG[type]?.subtypes.includes(subtype)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Combinaison type/variante invalide",
      path: ["fabricSubtype"]
    });
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

  useEffect(() => {
    if (selectedType) {
      const defaultUnit = FABRIC_CONFIG[selectedType].defaultUnit;
      setSelectedUnit(defaultUnit);
      form.setValue("unit", defaultUnit);
    }
  }, [selectedType, form]);

  const handleSubmit = async (values: FormValues) => {
    setIsSubmitting(true);
    try {
      const metadata: ProductMetadata = {
        fabricType: selectedType!,
        fabricSubtype: selectedSubtype as FabricSubtype,
        unit: selectedUnit
      };

      const { error } = await supabase.from("products").insert([{
        ...values,
        metadata
      }]);

      if (error) throw error;

      toast.success("Produit créé avec succès");
      router.push("/admin/products");
    } catch (error) {
      toast.error("Erreur lors de la création du produit");
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <Card>
        <CardHeader>
          <CardTitle>Nouveau produit textile</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
              <SelectFabric
                selectedType={selectedType}
                onTypeChange={(type: FabricType) => {
                  setSelectedType(type);
                  setSelectedSubtype("");
                  form.setValue("fabricType", type);
                }}
                selectedSubtype={selectedSubtype}
                onSubtypeChange={(subtype: FabricSubtype) => {
                  setSelectedSubtype(subtype);
                  form.setValue("fabricSubtype", subtype);
                }}
                selectedUnit={selectedUnit}
                onUnitChange={(unit: FabricUnit) => {
                  setSelectedUnit(unit);
                  form.setValue("unit", unit);
                }}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nom du produit</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="price"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Prix ({selectedUnit === "rouleau" ? "par rouleau" : "au mètre"})</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          {...field}
                          onChange={(e) => field.onChange(parseFloat(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea {...field} rows={4} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="stock"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Stock ({selectedUnit === "rouleau" ? "rouleaux" : "mètres"})</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          {...field}
                          onChange={(e) => field.onChange(parseInt(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="images"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Images</FormLabel>
                      <FormControl>
                        <ImageUploader
                          onUpload={(urls: string[]) => field.onChange(urls)}
                          bucket="products"
                          maxFiles={5}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
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
