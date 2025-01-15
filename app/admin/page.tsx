"use client";

import { useAuthStore } from "@/store/authStore";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { toast } from "react-toastify";

export default function AdminPage() {
  const { user } = useAuthStore();
  const router = useRouter();
  const [products, setProducts] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [clients, setClients] = useState<any[]>([]);

  // Rediriger si l'utilisateur n'est pas un administrateur
  useEffect(() => {
    if (!user || user.role !== "admin") {
      router.push("/");
    }
  }, [user, router]);

  // Charger les produits, commandes et clients
  useEffect(() => {
    const fetchData = async () => {
      const { data: products, error: productsError } = await supabase
        .from("products")
        .select("*");
      const { data: orders, error: ordersError } = await supabase
        .from("orders")
        .select("*");
      const { data: clients, error: clientsError } = await supabase
        .from("profiles")
        .select("*");

      if (productsError || ordersError || clientsError) {
        toast.error("Erreur lors du chargement des données.");
      } else {
        setProducts(products || []);
        setOrders(orders || []);
        setClients(clients || []);
      }
    };

    fetchData();
  }, []);

  if (!user || user.role !== "admin") {
    return null; // Ou un message de chargement
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Espace Administrateur</h1>
      <p>Bienvenue, {user.name} !</p>

      {/* Section Gestion des Produits */}
      <div className="mt-8">
        <h2 className="text-xl font-bold mb-4">Gestion des Produits</h2>
        <Link href="/admin/products/new">
          <Button>Ajouter un produit</Button>
        </Link>
        <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
          {products.map((product) => (
            <div key={product.id} className="border rounded-lg p-4">
              <h3 className="text-lg font-semibold">{product.name}</h3>
              <p>{product.description}</p>
              <p>Prix: {product.price} €/mètre</p>
              <Link href={`/admin/products/${product.id}`}>
                <Button variant="outline" className="mt-2">
                  Modifier
                </Button>
              </Link>
            </div>
          ))}
        </div>
      </div>

      {/* Section Gestion des Commandes */}
      <div className="mt-8">
        <h2 className="text-xl font-bold mb-4">Gestion des Commandes</h2>
        <div className="space-y-4">
          {orders.map((order) => (
            <div key={order.id} className="border rounded-lg p-4">
              <h3 className="text-lg font-semibold">Commande #{order.id}</h3>
              <p>Statut: {order.status}</p>
              <p>Total: {order.total} €</p>
              <Link href={`/admin/orders/${order.id}`}>
                <Button variant="outline" className="mt-2">
                  Voir les détails
                </Button>
              </Link>
            </div>
          ))}
        </div>
      </div>

      {/* Section Gestion des Clients */}
      <div className="mt-8">
        <h2 className="text-xl font-bold mb-4">Gestion des Clients</h2>
        <div className="space-y-4">
          {clients.map((client) => (
            <div key={client.id} className="border rounded-lg p-4">
              <h3 className="text-lg font-semibold">{client.name}</h3>
              <p>{client.email}</p>
              <p>Rôle: {client.role}</p>
              <Link href={`/admin/clients/${client.id}`}>
                <Button variant="outline" className="mt-2">
                  Voir les détails
                </Button>
              </Link>
            </div>
          ))}
        </div>
      </div>

      {/* Section Statistiques */}
      <div className="mt-8">
        <h2 className="text-xl font-bold mb-4">Statistiques</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="border rounded-lg p-4">
            <h3 className="text-lg font-semibold">Ventes totales</h3>
            <p>{orders.reduce((sum, order) => sum + order.total, 0)} €</p>
          </div>
          <div className="border rounded-lg p-4">
            <h3 className="text-lg font-semibold">Nombre de clients</h3>
            <p>{clients.length}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
