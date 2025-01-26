"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { supabase } from "@/lib/supabaseClient";
import { useCartStore } from "@/store/cartStore";
import { toast } from "react-toastify";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

const checkoutSchema = z.object({
  name: z.string().min(1, "Le nom est requis"),
  address: z.string().min(1, "L'adresse est requise"),
  phone: z.string().min(1, "Le numéro de téléphone est requis"),
  paymentMethod: z.enum(["online", "onplace"], {
    required_error: "Veuillez sélectionner un mode de paiement",
  }),
});

type CheckoutFormData = z.infer<typeof checkoutSchema>;

export default function CheckoutPage() {
  const { cartItems, clearCart } = useCartStore();
  const [debugInfo, setDebugInfo] = useState<string>("");

  // Calculate total amount
  const total = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const form = useForm<CheckoutFormData>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      name: "",
      address: "",
      phone: "",
      paymentMethod: undefined,
    },
  });

  const addDebugInfo = (info: string) => {
    setDebugInfo((prev) => prev + "\n" + info);
    console.log(info);
  };

  const onSubmit = async (formData: CheckoutFormData) => {
    setDebugInfo(""); // Reset debug info

    try {
      addDebugInfo("Début de la soumission du formulaire");

      if (!cartItems || cartItems.length === 0) {
        throw new Error("Le panier est vide");
      }

      addDebugInfo("Préparation des données de commande");

      // Test de connexion Supabase
      try {
        const { error: testError } = await supabase
          .from("orders")
          .select("id")
          .limit(1);

        if (testError) {
          addDebugInfo(
            `Erreur de connexion Supabase: ${JSON.stringify(testError)}`
          );
          throw testError;
        }
        addDebugInfo("Connexion Supabase OK");
      } catch (testError) {
        addDebugInfo(
          `Erreur lors du test de connexion: ${JSON.stringify(testError)}`
        );
        throw testError;
      }

      const orderData = {
        customer_name: formData.name,
        delivery_address: formData.address,
        phone_number: formData.phone,
        payment_method: formData.paymentMethod,
        items: JSON.stringify(cartItems), // Serialize items to avoid JSONB issues
        total_amount: total, // Ensure total is a number
        status: "pending",
        created_at: new Date().toISOString(),
      };

      addDebugInfo(`Données à envoyer: ${JSON.stringify(orderData)}`);

      // Tentative d'insertion
      const { error } = await supabase.from("orders").insert([orderData]);

      if (error) {
        addDebugInfo(
          `Erreur Supabase lors de l'insertion: ${JSON.stringify(error)}`
        );
        throw error;
      }

      addDebugInfo("Commande créée avec succès");
      toast.success("Commande passée avec succès !");
      clearCart();
      form.reset();
    } catch (error: any) {
      addDebugInfo(`Erreur finale: ${JSON.stringify(error)}`);
      toast.error(error.message || "Une erreur est survenue");
    }
  };

  return (
    <div className="container mx-auto p-4 max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle>Passer la commande</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nom complet</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Adresse de livraison</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Numéro de téléphone</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="paymentMethod"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Méthode de paiement</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Choisir un mode de paiement" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="online">En ligne</SelectItem>
                        <SelectItem value="onplace">Sur place</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                className="w-full"
                disabled={form.formState.isSubmitting}
              >
                {form.formState.isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Traitement...
                  </>
                ) : (
                  `Confirmer la commande (${total}€)`
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
