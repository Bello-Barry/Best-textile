"use client";

import React, { Suspense } from "react";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { toast } from "react-toastify";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

// Définition des types
interface OrderItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
}

interface Order {
  id: number;
  customer_name: string;
  delivery_address: string;
  phone_number: string;
  payment_method: "online" | "onplace";
  items: string; // JSON string of OrderItem[]
  total_amount: number;
  status: "pending" | "confirmed" | "delivered" | "cancelled";
  created_at: string;
}

// Composant séparé pour le contenu qui utilise useSearchParams
function OrderDetails() {
  const [order, setOrder] = useState<Order | null>(null);
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId");

  useEffect(() => {
    const fetchOrder = async () => {
      if (orderId) {
        const { data, error } = await supabase
          .from("orders")
          .select("*")
          .eq("id", orderId)
          .single();

        if (error) {
          toast.error("Erreur lors du chargement de la commande.");
        } else {
          setOrder(data as Order);
        }
      }
    };

    fetchOrder();
  }, [orderId]);

  if (!order) {
    return (
      <div className="flex justify-center items-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Confirmation de Commande</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-lg">Merci pour votre commande !</p>
        <div className="space-y-2">
          <p>
            <span className="font-medium">Numéro de commande:</span> #{order.id}
          </p>
          <p>
            <span className="font-medium">Client:</span> {order.customer_name}
          </p>
          <p>
            <span className="font-medium">Adresse de livraison:</span>{" "}
            {order.delivery_address}
          </p>
          <p>
            <span className="font-medium">Téléphone:</span> {order.phone_number}
          </p>
          <p>
            <span className="font-medium">Mode de paiement:</span>{" "}
            {order.payment_method === "online" ? "En ligne" : "Sur place"}
          </p>
          <p>
            <span className="font-medium">Statut:</span>{" "}
            <span className="capitalize">{order.status}</span>
          </p>
          <p>
            <span className="font-medium">Total:</span> {order.total_amount} €
          </p>
          <p>
            <span className="font-medium">Date de commande:</span>{" "}
            {new Date(order.created_at).toLocaleDateString("fr-FR", {
              day: "numeric",
              month: "long",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

// Composant principal avec Suspense
export default function ConfirmationPage() {
  return (
    <div className="container mx-auto p-4">
      <Suspense
        fallback={
          <div className="flex justify-center items-center p-8">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        }
      >
        <OrderDetails />
      </Suspense>
    </div>
  );
}
