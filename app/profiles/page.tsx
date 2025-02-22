"use client";

import { useEffect, useState, useMemo } from "react";
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
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { User, Package, History, Edit } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";

// Schéma de validation aligné avec le schéma Supabase
const profileSchema = z.object({
  name: z.string().min(2, "Nom complet requis"),
  email: z.string().email("Email invalide"),
  phone: z.string().optional(),
  address: z.string().optional(),
});

interface UserProfile {
  id: string;
  email: string;
  name: string;
  role: string;
  phone?: string;
  address?: string;
}

interface Order {
  id: string;
  status: "pending" | "validated" | "delivered";
  total_amount: number;
  created_at: string;
  items: any[];
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  const form = useForm<z.infer<typeof profileSchema>>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      address: "",
    },
  });

  useEffect(() => {
    const loadData = async () => {
      const user = await fetchUserProfile();
      if (user) await fetchUserOrders(user.id);
      setLoading(false);
    };
    loadData();
  }, []);

  const fetchUserProfile = async () => {
    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error || !user) throw error;

      const { data, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (profileError) throw profileError;

      setProfile(data);
      form.reset({
        name: data.name,
        email: data.email,
        phone: data.phone || "",
        address: data.address || "",
      });
      return data;
    } catch (error) {
      toast.error("Erreur de chargement du profil");
      return null;
    }
  };

  const fetchUserOrders = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("orders")
        .select("id, status, total_amount, created_at, items")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setOrders(data || []);
    } catch (error) {
      toast.error("Erreur de chargement des commandes");
    }
  };

  const handleProfileUpdate = async (values: z.infer<typeof profileSchema>) => {
    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error || !user) throw error;

      const { error: updateError } = await supabase
        .from("profiles")
        .update(values)
        .eq("id", user.id);

      if (updateError) throw updateError;

      toast.success("Profil mis à jour !");
      fetchUserProfile();
    } catch (error) {
      toast.error("Échec de la mise à jour");
    }
  };

  const getStatusBadge = (status: Order["status"]) => {
    const statusMap = {
      pending: { color: "bg-yellow-500", text: "En attente" },
      validated: { color: "bg-blue-500", text: "Validée" },
      delivered: { color: "bg-green-500", text: "Livrée" },
    };
    return <Badge className={statusMap[status].color}>{statusMap[status].text}</Badge>;
  };

  const pendingOrders = useMemo(() => 
    orders.filter(o => o.status !== "delivered"), [orders]
  );

  const OrderCard = ({ order }: { order: Order }) => (
    <Card className="mb-4">
      <CardContent className="p-4">
        <div className="flex justify-between items-start">
          <div>
            <p className="font-semibold">Commande #{order.id}</p>
            <p className="text-sm text-gray-500">
              {new Date(order.created_at).toLocaleDateString("fr-FR")}
            </p>
          </div>
          {getStatusBadge(order.status)}
        </div>
        <div className="mt-2">
          <p className="font-semibold">Articles ({order.items.length})</p>
          <ScrollArea className="h-32">
            {order.items.map((item, index) => (
              <div key={index} className="flex justify-between py-1">
                <span>{item.name}</span>
                <span>{item.quantity}x {item.price}€</span>
              </div>
            ))}
          </ScrollArea>
        </div>
        <p className="mt-2 text-right font-bold">{order.total_amount.toFixed(2)}€</p>
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 max-w-4xl space-y-6">
      <Tabs defaultValue="profile">
        <TabsList className="grid grid-cols-3 w-full">
          <TabsTrigger value="profile"><User className="mr-2 h-4 w-4" /> Profil</TabsTrigger>
          <TabsTrigger value="orders"><Package className="mr-2 h-4 w-4" /> Commandes</TabsTrigger>
          <TabsTrigger value="history"><History className="mr-2 h-4 w-4" /> Historique</TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <Card>
            <CardHeader className="flex-row justify-between items-center">
              <CardTitle>Informations du profil</CardTitle>
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Edit className="mr-2 h-4 w-4" /> Modifier
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Modifier le profil</DialogTitle>
                  </DialogHeader>
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(handleProfileUpdate)} className="space-y-4">
                      <FormField control={form.control} name="name" render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nom complet</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}/>
                      <FormField control={form.control} name="email" render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input {...field} disabled />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}/>
                      <FormField control={form.control} name="phone" render={({ field }) => (
                        <FormItem>
                          <FormLabel>Téléphone</FormLabel>
                          <FormControl>
                            <Input {...field} type="tel" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}/>
                      <FormField control={form.control} name="address" render={({ field }) => (
                        <FormItem>
                          <FormLabel>Adresse</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}/>
                      <Button type="submit" className="w-full">Sauvegarder</Button>
                    </form>
                  </Form>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              {profile && (
                <div className="space-y-2">
                  <p><span className="font-semibold">Nom :</span> {profile.name}</p>
                  <p><span className="font-semibold">Email :</span> {profile.email}</p>
                  {profile.phone && <p><span className="font-semibold">Téléphone :</span> {profile.phone}</p>}
                  {profile.address && <p><span className="font-semibold">Adresse :</span> {profile.address}</p>}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="orders">
          <Card>
            <CardHeader>
              <CardTitle>Commandes en cours</CardTitle>
              <CardDescription>{pendingOrders.length} commande(s) en traitement</CardDescription>
            </CardHeader>
            <CardContent>
              {pendingOrders.length === 0 ? (
                <p className="text-gray-500 text-center py-4">Aucune commande en cours</p>
              ) : (
                pendingOrders.map(order => <OrderCard key={order.id} order={order} />)
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle>Historique des commandes</CardTitle>
              <CardDescription>{orders.length} commande(s) au total</CardDescription>
            </CardHeader>
            <CardContent>
              {orders.length === 0 ? (
                <p className="text-gray-500 text-center py-4">Aucune commande passée</p>
              ) : (
                orders.map(order => <OrderCard key={order.id} order={order} />)
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}