"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useSearchParams } from "next/navigation";
import { toast } from "react-toastify";

export default function ConfirmationPage() {
  const [order, setOrder] = useState<any>(null);
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
          setOrder(data);
        }
      }
    };

    fetchOrder();
  }, [orderId]);

  if (!order) {
    return <div>Chargement...</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Confirmation de Commande</h1>
      <p>Merci pour votre commande !</p>
      <p>Numéro de commande: #{order.id}</p>
      <p>Statut: {order.status}</p>
      <p>Total: {order.total} €</p>
    </div>
  );
}
