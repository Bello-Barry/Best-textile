"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { toast } from "react-toastify";
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
import { Clock, CheckCircle, Package } from "lucide-react";

interface Order {
  id: string;
  status: "pending" | "validated" | "delivered";
  total: number;
  created_at: string;
  name: string;
  address: string;
  phone: string;
  items: any[];
  user_id: string;
}

export default function UserOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    checkUser();
  }, [checkUser]);

  const checkUser = async () => {
    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error) throw error;
      if (user) {
        setUser(user);
        fetchUserOrders(user.id);
      } else {
        // Redirect to login page if user is not authenticated
        window.location.href = '/login';
      }
    } catch (error: any) {
      toast.error("Erreur d'authentification");
      console.error('Error:', error.message);
    }
  };

  const fetchUserOrders = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("orders")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (error) throw error;

      setOrders(data || []);
    } catch (error: any) {
      toast.error("Erreur lors du chargement des commandes");
      console.error('Error:', error.message);
    } finally {
      setLoading(false);
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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-2">Chargement de vos commandes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <Card className="shadow-lg">
        <CardHeader className="border-b">
          <CardTitle className="text-2xl">Mes Commandes</CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          {orders.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">
                Vous n&#39;avez pas encore passé de commande.
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="font-semibold">N° Commande</TableHead>
                  <TableHead className="font-semibold">Date</TableHead>
                  <TableHead className="font-semibold">Total</TableHead>
                  <TableHead className="font-semibold">Statut</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.map((order) => (
                  <TableRow key={order.id} className="hover:bg-gray-50">
                    <TableCell className="font-medium">#{order.id}</TableCell>
                    <TableCell>
                      {new Date(order.created_at).toLocaleDateString('fr-FR', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric'
                      })}
                    </TableCell>
                    <TableCell>{order.total.toFixed(2)}€</TableCell>
                    <TableCell>{getStatusBadge(order.status)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
      }
