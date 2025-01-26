"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useAuthStore } from "@/store/authStore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Package,
  CheckCircle,
  Clock,
  AlertCircle,
  ShoppingCart,
  Info,
} from "lucide-react";
import { toast } from "react-toastify";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";

interface OrderItem {
  id: string;
  product_name: string;
  quantity: number;
  price: number;
}

interface Order {
  id: string;
  status: "pending" | "validated" | "delivered";
  total_amount: number;
  created_at: string;
  items: OrderItem[];
}

export default function CustomerOrdersPage() {
  const { user } = useAuthStore();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  useEffect(() => {
    if (!user) {
      toast.error("Vous devez être connecté");
      return;
    }

    const fetchOrders = async () => {
      try {
        const { data, error } = await supabase
          .from("orders")
          .select(
            `
            *,
            items (
              id,
              product_name,
              quantity,
              price
            )
          `
          )
          .eq("user_id", user.id)
          .order("created_at", { ascending: false });

        if (error) throw error;
        setOrders(data || []);
      } catch (error) {
        toast.error("Erreur lors du chargement des commandes");
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [user]);

  const getStatusConfig = (status: Order["status"]) => {
    const statusMap = {
      pending: {
        label: "En attente",
        color: "bg-yellow-500",
        icon: Clock,
      },
      validated: {
        label: "Validée",
        color: "bg-blue-500",
        icon: CheckCircle,
      },
      delivered: {
        label: "Livrée",
        color: "bg-green-500",
        icon: Package,
      },
    };
    return statusMap[status];
  };

  const renderOrderDetails = (order: Order) => {
    const statusConfig = getStatusConfig(order.status);
    const StatusIcon = statusConfig.icon;

    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <div>
            <p className="text-lg font-semibold">Commande #{order.id}</p>
            <p className="text-sm text-gray-500">
              {new Date(order.created_at).toLocaleDateString()}
            </p>
          </div>
          <Badge
            className={`${statusConfig.color} text-white flex items-center gap-2`}
          >
            <StatusIcon size={16} />
            {statusConfig.label}
          </Badge>
        </div>

        <div className="border rounded-lg p-4 bg-gray-50">
          <h4 className="font-medium mb-2 flex items-center gap-2">
            <ShoppingCart size={16} /> Détails des produits
          </h4>
          <ScrollArea className="h-64 pr-4">
            {order.items.map((item) => (
              <div
                key={item.id}
                className="flex justify-between items-center py-2 border-b last:border-b-0"
              >
                <div>
                  <p className="font-medium">{item.product_name}</p>
                  <p className="text-sm text-gray-500">
                    Quantité : {item.quantity}
                  </p>
                </div>
                <p className="font-semibold">{item.price.toFixed(2)}€</p>
              </div>
            ))}
          </ScrollArea>
        </div>

        <div className="flex justify-between items-center bg-gray-100 p-3 rounded-lg">
          <p className="font-medium flex items-center gap-2">
            <Info size={16} /> Total de la commande
          </p>
          <p className="text-xl font-bold">{order.total_amount.toFixed(2)}€</p>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package /> Mes Commandes
          </CardTitle>
        </CardHeader>
        <CardContent>
          {orders.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <AlertCircle className="mx-auto mb-4" size={48} />
              <p>Vous n'avez pas encore passé de commandes.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => (
                <div
                  key={order.id}
                  className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium">Commande #{order.id}</span>
                    {getStatusConfig(order.status).icon({
                      size: 20,
                      className: `text-${
                        getStatusConfig(order.status).color.split("-")[1]
                      }-500`,
                    })}
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="text-sm text-gray-500">
                      {new Date(order.created_at).toLocaleDateString()}
                    </div>
                    <div className="font-semibold">
                      Total : {order.total_amount.toFixed(2)}€
                    </div>
                  </div>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        className="mt-2 w-full"
                        onClick={() => setSelectedOrder(order)}
                      >
                        Voir les détails
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[600px]">
                      <DialogHeader>
                        <DialogTitle>Détails de la commande</DialogTitle>
                        <DialogDescription>
                          Informations complètes sur votre commande
                        </DialogDescription>
                      </DialogHeader>
                      {selectedOrder && renderOrderDetails(selectedOrder)}
                    </DialogContent>
                  </Dialog>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
