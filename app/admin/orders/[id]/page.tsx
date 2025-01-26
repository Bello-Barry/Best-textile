"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { toast } from "react-toastify";

interface OrderDetails {
  id: string;
  customer_name: string;
  delivery_address: string;
  phone_number: string;
  status: string;
  total_amount: number;
  items: any[];
  created_at: string;
}

export default function OrderDetailPage() {
  const params = useParams();
  const [order, setOrder] = useState<OrderDetails | null>(null);

  useEffect(() => {
    const fetchOrderDetails = async () => {
      try {
        const { data, error } = await supabase
          .from("orders")
          .select("*")
          .eq("id", params.id)
          .single();

        if (error) throw error;

        const parsedItems = JSON.parse(data.items);
        setOrder({ ...data, items: parsedItems });
      } catch (error) {
        toast.error("Erreur lors du chargement des détails de la commande");
      }
    };

    fetchOrderDetails();
  }, [params.id]);

  if (!order) return <div>Chargement...</div>;

  return (
    <div className="container mx-auto p-4">
      <Card>
        <CardHeader>
          <CardTitle>Détails de la Commande #{order.id}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <h3 className="font-semibold mb-2">Informations Client</h3>
              <p>Nom: {order.customer_name}</p>
              <p>Adresse: {order.delivery_address}</p>
              <p>Téléphone: {order.phone_number}</p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Détails de la Commande</h3>
              <p>Date: {new Date(order.created_at).toLocaleString()}</p>
              <p>Total: {order.total_amount}€</p>
              <p>Statut: {order.status}</p>
            </div>
          </div>

          <h3 className="font-semibold mt-4 mb-2">Produits Commandés</h3>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Produit</TableHead>
                <TableHead>Prix</TableHead>
                <TableHead>Quantité</TableHead>
                <TableHead>Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {order.items.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>{item.name}</TableCell>
                  <TableCell>{item.price}€</TableCell>
                  <TableCell>{item.quantity}</TableCell>
                  <TableCell>
                    {(item.price * item.quantity).toFixed(2)}€
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
