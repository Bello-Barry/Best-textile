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
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

// Schéma de validation du profil
const profileSchema = z.object({
  full_name: z.string().min(2, "Nom complet requis"),
  phone: z.string().optional(),
  address: z.string().optional(),
});

// Interface des données utilisateur
interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  role: "client" | "admin";
  phone?: string;
  address?: string;
}

// Interface des commandes
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

  // Initialisation du formulaire
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

  /** 🔹 Récupérer le profil utilisateur */
  const fetchUserProfile = async () => {
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) throw new Error("Non authentifié");

      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (error) throw error;

      setProfile(data);
      form.reset({
        full_name: data.full_name,
        phone: data.phone || "",
        address: data.address || "",
      });
    } catch (error) {
      toast.error("Erreur lors du chargement du profil");
    }
  };

  /** 🔹 Récupérer les commandes utilisateur */
  const fetchUserOrders = async () => {
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) throw new Error("Non authentifié");

      const { data, error } = await supabase
        .from("orders")
        .select(`
          id, status, total, created_at,
          items:order_items (id, product_name, quantity, price)
        `)
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

  /** 🔹 Mettre à jour le profil utilisateur */
  const onSubmitProfile = async (values: z.infer<typeof profileSchema>) => {
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) throw new Error("Non authentifié");

      const { error } = await supabase
        .from("profiles")
        .update(values)
        .eq("id", user.id);

      if (error) throw error;

      toast.success("Profil mis à jour avec succès");
      setProfile((prev) => (prev ? { ...prev, ...values } : null));
      form.reset(values);
    } catch (error) {
      toast.error("Erreur lors de la mise à jour du profil");
    }
  };

  /** 🔹 Rendre les statuts de commande plus lisibles */
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

  /** 🔹 Optimisation avec useMemo */
  const pendingOrders = useMemo(
    () => orders.filter((order) => order.status !== "delivered"),
    [orders]
  );
  const deliveredOrders = useMemo(
    () => orders.filter((order) => order.status === "delivered"),
    [orders]
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
        <TabsList className="grid grid-cols-3 mb-6">
          <TabsTrigger value="profile"><User size={16} /> Profil</TabsTrigger>
          <TabsTrigger value="orders"><Package size={16} /> Commandes</TabsTrigger>
          <TabsTrigger value="history"><History size={16} /> Historique</TabsTrigger>
        </TabsList>

        {/* Profil */}
        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle>
                <User /> Mon Profil
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm"><Edit size={16} /> Modifier</Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader><DialogTitle>Modifier mon profil</DialogTitle></DialogHeader>
                    <Form {...form}>
                      <form onSubmit={form.handleSubmit(onSubmitProfile)} className="space-y-4">
                        <FormField name="full_name" control={form.control} render={({ field }) => (
                          <FormItem><FormLabel>Nom complet</FormLabel><FormControl><Input {...field} /></FormControl></FormItem>
                        )}/>
                        <FormField name="phone" control={form.control} render={({ field }) => (
                          <FormItem><FormLabel>Téléphone</FormLabel><FormControl><Input {...field} /></FormControl></FormItem>
                        )}/>
                        <FormField name="address" control={form.control} render={({ field }) => (
                          <FormItem><FormLabel>Adresse</FormLabel><FormControl><Input {...field} /></FormControl></FormItem>
                        )}/>
                        <Button type="submit">Enregistrer</Button>
                      </form>
                    </Form>
                  </DialogContent>
                </Dialog>
              </CardTitle>
            </CardHeader>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}