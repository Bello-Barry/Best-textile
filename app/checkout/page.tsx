"use client";

import { useCart } from "@/context/CartContext";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "react-toastify";

const schema = z.object({
  name: z.string().min(1, "Le nom est requis"),
  address: z.string().min(1, "L'adresse est requise"),
  phone: z.string().min(1, "Le numéro de téléphone est requis"),
  paymentMethod: z.enum(["online", "onplace"]),
});

export default function CheckoutPage() {
  const { cartItems, clearCart } = useCart();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: any) => {
    try {
      // Envoyer la commande à l'API
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, items: cartItems }),
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
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Passer la commande</h1>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label>Nom complet</label>
          <input
            {...register("name")}
            className="w-full border rounded px-2 py-1"
          />
          {errors.name && <p className="text-red-500">{errors.name.message}</p>}
        </div>
        <div>
          <label>Adresse de livraison</label>
          <input
            {...register("address")}
            className="w-full border rounded px-2 py-1"
          />
          {errors.address && (
            <p className="text-red-500">{errors.address.message}</p>
          )}
        </div>
        <div>
          <label>Numéro de téléphone</label>
          <input
            {...register("phone")}
            className="w-full border rounded px-2 py-1"
          />
          {errors.phone && (
            <p className="text-red-500">{errors.phone.message}</p>
          )}
        </div>
        <div>
          <label>Méthode de paiement</label>
          <select
            {...register("paymentMethod")}
            className="w-full border rounded px-2 py-1"
          >
            <option value="online">En ligne</option>
            <option value="onplace">Sur place</option>
          </select>
        </div>
        <button
          type="submit"
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          Confirmer la commande
        </button>
      </form>
    </div>
  );
}
