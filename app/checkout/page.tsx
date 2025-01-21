"use client";

import { useCart } from "@/context/CartContext";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "react-toastify";
import { 
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter 
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue, 
} from "@/components/ui/select";

const checkoutSchema = z.object({
  name: z.string().min(1, "Le nom est requis"),
  address: z.string().min(1, "L'adresse est requise"),
  phone: z.string().min(1, "Le numéro de téléphone est requis"),
  paymentMethod: z.enum(["online", "onplace"]),
});

type CheckoutFormData = z.infer<typeof checkoutSchema>;

export default function CheckoutPage() {
  const { cartItems, clearCart, total } = useCart();
  
  const form = useForm<CheckoutFormData>({
    resolver: zodResolver(checkoutSchema),
  });

  const onSubmit = async (data: CheckoutFormData) => {
    try {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          items: cartItems,
          total,
          status: "pending",
        }),
      });

      if (response.ok) {
        toast.success("Commande passée avec succès !");
        clearCart();
      } else {
        toast.error("Erreur lors de la commande.");
      }
    } catch (error) {
      toast.error("Une erreur est survenue.");
    }
  };

  return (
    <div className="container mx-auto p-4 max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle>Passer la commande</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name">Nom complet</Label>
              <Input
                id="name"
                {...form.register("name")}
                className="w-full"
              />
              {form.formState.errors.name && (
                <p className="text-sm text-red-500">
                  {form.formState.errors.name.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Adresse de livraison</Label>
              <Input
                id="address"
                {...form.register("address")}
                className="w-full"
              />
              {form.formState.errors.address && (
                <p className="text-sm text-red-500">
                  {form.formState.errors.address.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Numéro de téléphone</Label>
              <Input
                id="phone"
                {...form.register("phone")}
                className="w-full"
              />
              {form.formState.errors.phone && (
                <p className="text-sm text-red-500">
                  {form.formState.errors.phone.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="paymentMethod">Méthode de paiement</Label>
              <Select 
                onValueChange={(value) => 
                  form.setValue("paymentMethod", value as "online" | "onplace")
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Choisir un mode de paiement" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="online">En ligne</SelectItem>
                  <SelectItem value="onplace">Sur place</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="pt-4">
              <Button type="submit" className="w-full">
                Confirmer la commande ({total}€)
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}