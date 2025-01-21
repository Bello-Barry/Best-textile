// app/profile/page.tsx
"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { toast } from "react-toastify";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  User, 
  Package, 
  History, 
  ShoppingCart, 
  Mail, 
  Phone,
  MapPin,
  Calendar,
  DollarSign 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  role: "client" | "admin";
  phone?: string;
  address?: string;
}

interface OrderItem {
  id: string;
  product_name: string;
  quantity: number;
  price: number;
}

interface Order {
  id: string;
  status: "pending" | "validated" | "delivered";
  total: number;
  created_at: string;
  items: OrderItem[];
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  useEffect(() => {
    fetchUserProfile();
    fetchUserOrders();
  }, []);

  const fetchUserProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Non authentifié");

      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (error) throw error;
      setProfile(data);
    } catch (error) {
      toast.error("Erreur lors du chargement du profil");
    }
  };

  const fetchUserOrders = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Non authentifié");

      const { data, error } = await supabase
        .from("orders")
        .select(`
          *,
          items (
            id,
            product_name,
            quantity,
            price
          )
        `)
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setOrders(data);
    } catch (error) {
      toast.error("Erreur lors du chargement des commandes");
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: Order["status"]) => {
    const statusConfig = {
      pending: { color: "bg-yellow-500", text: "En attente" },
      validated: { color: "bg-blue-500", text: "Validée" },
      delivered: { color: "bg-green-500", text: "Livrée" },
    };

    return (
      <Badge className={`${statusConfig[status].color} text-white`}>
        {statusConfig[status].text}
      </Badge>
    );
  };

  const OrderDetails = ({ order }: { order: Order }) => (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <p className="text-sm font-medium text-gray-500">Date de commande</p>
          <p>{new Date(order.created_at).toLocaleDateString()}</p>
        </div>
        <div>
          <p className="text-sm font-medium text-gray-500">Statut</p>
          {getStatusBadge(order.status)}
        </div>
      </div>
      
      <div className="border rounded-lg p-4">
        <h4 className="font-medium mb-2">Articles commandés</h4>
        <div className="space-y-2">
          {order.items.map((item) => (
            <div key={item.id} className="flex justify-between items-center">
              <div>
                <p className="font-medium">{item.product_name}</p>
                <p className="text-sm text-gray-500">Quantité: {item.quantity}</p>
              </div>
              <p>{item.price}€</p>
            </div>
          ))}
        </div>
        <div className="mt-4 pt-4 border-t flex justify-between items-center">
          <p className="font-medium">Total</p>
          <p className="font-medium">{order.total}€</p>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="w-full justify-start">
          <TabsTrigger value="profile" className="flex items-center gap-2">
            <User size={16} />
            Profil
          </TabsTrigger>
          <TabsTrigger value="orders" className="flex items-center gap-2">
            <Package size={16} />
            Commandes en cours
          </TabsTrigger>
          <TabsTrigger value="history" className="flex items-center gap-2">
            <History size={16} />
            Historique
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User />
                Information du profil
              </CardTitle>
              <CardDescription>
                Gérez vos informations personnelles et vos préférences
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-gray-500 flex items-center gap-2">
                    <User size={16} />
                    Nom complet
                  </p>
                  <p className="text-lg">{profile?.full_name}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-gray-500 flex items-center gap-2">
                    <Mail size={16} />
                    Email
                  </p>
                  <p className="text-lg">{profile?.email}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-gray-500 flex items-center gap-2">
                    <Phone size={16} />
                    Téléphone
                  </p>
                  <p className="text-lg">{profile?.phone || "Non renseigné"}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-gray-500 flex items-center gap-2">
                    <MapPin size={16} />
                    Adresse
                  </p>
                  <p className="text-lg">{profile?.address || "Non renseignée"}</p>
                </div>
              </div>
              
              <div className="pt-4 border-t">
                <Badge className="text-lg px-3 py-1">
                  {profile?.role === "admin" ? "Administrateur" : "Client"}
                </Badge>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="orders">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package />
                Commandes en cours
              </CardTitle>
              <CardDescription>
                Suivez l'état de vos commandes récentes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>N° Commande</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orders
                    .filter(order => order.status !== "delivered")
                    .map((order) => (
                      <TableRow key={order.id}>
                        <TableCell>#{order.id}</TableCell>
                        <TableCell>{new Date(order.created_at).toLocaleDateString()}</TableCell>
                        <TableCell>{order.total}€</TableCell>
                        <TableCell>{getStatusBadge(order.status)}</TableCell>
                        <TableCell>
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setSelectedOrder(order)}
                              >
                                Voir détails
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Détails de la commande #{order.id}</DialogTitle>
                              </DialogHeader>
                              <OrderDetails order={order} />
                            </DialogContent>
                          </Dialog>
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <History />
                Historique des commandes
              </CardTitle>
              <CardDescription>
                Consultez l'ensemble de vos commandes passées
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>N° Commande</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orders
                    .filter(order => order.status === "delivered")
                    .map((order) => (
                      <TableRow key={order.id}>
                        <TableCell>#{order.id}</TableCell>
                        <TableCell>{new Date(order.created_at).toLocaleDateString()}</TableCell>
                        <TableCell>{order.total}€</TableCell>
                        <TableCell>{getStatusBadge(order.status)}</TableCell>
                        <TableCell>
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setSelectedOrder(order)}
                              >
                                Voir détails
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Détails de la commande #{order.id}</DialogTitle>
                              </DialogHeader>
                              <OrderDetails order={order} />
                            </DialogContent>
                          </Dialog>
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}