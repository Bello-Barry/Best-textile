"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { toast } from "react-toastify";
import { Button } from "@/components/ui/button";

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);

  useEffect(() => {
    const fetchOrders = async () => {
      const { data, error } = await supabase.from("orders").select("*");
      if (error) {
        toast.error("Erreur lors du chargement des commandes.");
      } else {
        setOrders(data);
      }
    };

    fetchOrders();
  }, []);

  const handleValidateOrder = async (id: string) => {
    const { error } = await supabase
      .from("orders")
      .update({ status: "validated" })
      .eq("id", id);
    if (error) {
      toast.error("Erreur lors de la validation de la commande.");
    } else {
      setOrders(
        orders.map((order) =>
          order.id === id ? { ...order, status: "validated" } : order
        )
      );
      toast.success("Commande validée avec succès.");
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Gestion des Commandes</h1>
      <div>
        {orders.map((order) => (
          <div key={order.id} className="border-b py-4">
            <h2 className="text-xl font-semibold">Commande #{order.id}</h2>
            <p>Statut: {order.status}</p>
            <p>Total: {order.total} €</p>
            {order.status === "pending" && (
              <Button onClick={() => handleValidateOrder(order.id)}>
                Valider la commande
              </Button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
