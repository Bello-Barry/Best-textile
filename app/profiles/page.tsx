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
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { User, Package, History, Edit, ShoppingCart } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

// Schéma de validation du profil
const profileSchema = z.object({
  full_name: z.string().min(2, "Nom complet requis"),
  phone: z.string().optional(),
  address: z.string().optional(),
});

interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  role: "client" | "admin";
  phone?: string;
  address?: string;
}

interface Order {
  id: string;
  status: "pending" | "validated" | "delivered";
  total: number;
  created_at: string;
  items: {
    id: string;
    product_name: string;
    quantity: number;
    price: number;
  }[];
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  // Initialisation du formulaire de profil
  const form = useForm<z.infer<typeof profileSchema>>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      full_name: "",
      phone: "",
      address: "",
    },
  });

  useEffect(() => {
    const fetchData = async () => {
      await Promise.all([fetchUserProfile(), fetchUserOrders()]);
    };
    fetchData();
  }, []);

  const fetchUserProfile = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Non authentifié");

      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (error) throw error;

      setProfile(data);
      // Mettre à jour les valeurs par défaut du formulaire
      form.reset({
        full_name: data.full_name,
        phone: data.phone || "",
        address: data.address || "",
      });
    } catch (error) {
      toast.error("Erreur lors du chargement du profil");
    }
  };

  const fetchUserOrders = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Non authentifié");

      const { data, error } = await supabase
        .from("orders")
        .select(
          `
          *,
          items (*)
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

  const onSubmitProfile = async (values: z.infer<typeof profileSchema>) => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Non authentifié");

      const { error } = await supabase
        .from("profiles")
        .update(values)
        .eq("id", user.id);

      if (error) throw error;

      toast.success("Profil mis à jour avec succès");
      await fetchUserProfile();
    } catch (error) {
      toast.error("Erreur lors de la mise à jour du profil");
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

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 max-w-4xl space-y-6">
      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-6">
          <TabsTrigger value="profile" className="flex items-center gap-2">
            <User size={16} />
            Profil
          </TabsTrigger>
          <TabsTrigger value="orders" className="flex items-center gap-2">
            <Package size={16} />
            Commandes
          </TabsTrigger>
          <TabsTrigger value="history" className="flex items-center gap-2">
            <History size={16} />
            Historique
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <User />
                  Mon Profil
                </div>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm">
                      <Edit size={16} className="mr-2" /> Modifier
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Modifier mon profil</DialogTitle>
                    </DialogHeader>
                    <Form {...form}>
                      <form
                        onSubmit={form.handleSubmit(onSubmitProfile)}
                        className="space-y-4"
                      >
                        <FormField
                          control={form.control}
                          name="full_name"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Nom complet</FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="Votre nom complet"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="phone"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Téléphone</FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="Votre numéro de téléphone"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="address"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Adresse</FormLabel>
                              <FormControl>
                                <Input placeholder="Votre adresse" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <div className="flex justify-end gap-2">
                          <DialogClose asChild>
                            <Button type="button" variant="outline">
                              Annuler
                            </Button>
                          </DialogClose>
                          <Button type="submit">Enregistrer</Button>
                        </div>
                      </form>
                    </Form>
                  </DialogContent>
                </Dialog>
              </CardTitle>
            </CardHeader>
            <CardContent className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Nom complet</p>
                <p className="font-medium">
                  {profile?.full_name || "Non renseigné"}
                </p>
              </div>
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Email</p>
                <p className="font-medium">{profile?.email}</p>
              </div>
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Téléphone</p>
                <p className="font-medium">
                  {profile?.phone || "Non renseigné"}
                </p>
              </div>
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Adresse</p>
                <p className="font-medium">
                  {profile?.address || "Non renseignée"}
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="orders">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShoppingCart /> Commandes en cours
              </CardTitle>
            </CardHeader>
            <CardContent>
              {orders.filter((order) => order.status !== "delivered").length ===
              0 ? (
                <p className="text-center text-muted-foreground">
                  Aucune commande en cours
                </p>
              ) : (
                <div className="space-y-4">
                  {orders
                    .filter((order) => order.status !== "delivered")
                    .map((order) => (
                      <div
                        key={order.id}
                        className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex justify-between items-center mb-2">
                          <span className="font-medium">
                            Commande #{order.id}
                          </span>
                          {getStatusBadge(order.status)}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {new Date(order.created_at).toLocaleDateString()}
                        </div>
                        <div className="mt-2 font-semibold">
                          Total : {order.total}€
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <History /> Historique des commandes
              </CardTitle>
            </CardHeader>
            <CardContent>
              {orders.filter((order) => order.status === "delivered").length ===
              0 ? (
                <p className="text-center text-muted-foreground">
                  Aucune commande livrée
                </p>
              ) : (
                <div className="space-y-4">
                  {orders
                    .filter((order) => order.status === "delivered")
                    .map((order) => (
                      <div
                        key={order.id}
                        className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex justify-between items-center mb-2">
                          <span className="font-medium">
                            Commande #{order.id}
                          </span>
                          {getStatusBadge(order.status)}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {new Date(order.created_at).toLocaleDateString()}
                        </div>
                        <div className="mt-2 font-semibold">
                          Total : {order.total}€
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
