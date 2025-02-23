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
      console.error("Erreur détaillée:", error);
      toast.error(`Échec de la création: ${error.message || "Erreur inconnue"}`);
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
                  form.setValue("fabricSubtype", ""); // Reset subtype on type change
                }}
                onSubtypeChange={(subtype) => form.setValue("fabricSubtype", subtype)}
                selectedUnit={form.watch("unit")}
                onUnitChange={(unit) => form.setValue("unit", unit)}
              />

              {/* ... (le reste des champs du formulaire reste inchangé) ... */}

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