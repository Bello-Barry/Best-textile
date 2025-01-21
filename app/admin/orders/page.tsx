"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { toast } from "react-toastify";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Clock, Package } from "lucide-react";

interface Order {
  id: string;
  status: "pending" | "validated" | "delivered";
  total: number;
  created_at: string;
  name: string;
  address: string;
  phone: string;
  items: any[];
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const { data, error } = await supabase
        .from("orders")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setOrders(data as Order[]);
    } catch (error) {
      toast.error("Erreur lors du chargement des commandes.");
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (id: string, newStatus: Order["status"]) => {
    try {
      const { error } = await supabase
        .from("orders")
        .update({ status: newStatus })
        .eq("id", id);

      if (error) throw error;

      setOrders(orders.map((order) =>
        order.id === id ? { ...order, status: newStatus } : order
      ));
      toast.success(`Commande ${newStatus === "validated" ? "validée" : "livrée"} avec succès.`);
    } catch (error) {
      toast.error("Erreur lors de la mise à jour du statut.");
    }
  };

  const getStatusBadge = (status: Order["status"]) => {
    const statusConfig = {
      pending: { color: "bg-yellow-500", icon: Clock, text: "En attente" },
      validated: { color: "bg-blue-500", icon: CheckCircle, text: "Validée" },
      delivered: { color: "bg-green-500", icon: Package, text: "Livrée" },
    };

    const config = statusConfig[status];
    const Icon = config.icon;

    return (
      <Badge className={`${config.color} text-white flex items-center gap-1`}>
        <Icon size={14} />
        {config.text}
      </Badge>
    );
  };

  return (
    <div className="container mx-auto p-4">
      <Card>
        <CardHeader>
          <CardTitle>Gestion des Commandes</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Client</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell>#{order.id}</TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium">{order.name}</p>
                      <p className="text-sm text-gray-500">{order.phone}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    {new Date(order.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell>{order.total}€</TableCell>
                  <TableCell>{getStatusBadge(order.status)}</TableCell>
                  <TableCell>
                    {order.status === "pending" && (
                      <Button
                        onClick={() => handleStatusUpdate(order.id, "validated")}
                        size="sm"
                      >
                        Valider
                      </Button>
                    )}
                    {order.status === "validated" && (
                      <Button
                        onClick={() => handleStatusUpdate(order.id, "delivered")}
                        size="sm"
                      >
                        Marquer comme livrée
                      </Button>
                    )}
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