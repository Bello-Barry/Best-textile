"use client";
import React, { useEffect, useState } from "react";
import { useAuthStore } from "@/store/authStore";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Package,
  ShoppingCart,
  Users,
  TrendingUp,
  Plus,
  Search,
  Edit,
  Eye,
  Loader2,
} from "lucide-react";
import Link from "next/link";
import { toast } from "react-toastify";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
}

interface Product {
  id: string;
  name: string;
  price: number;
  stock: number;
  type: string;
}

interface Order {
  total_amount: number;
  id: string;
  created_at: string;
  status: string;
  total: number;
}

interface Client {
  id: string;
  name: string;
  email: string;
  role: string;
}

const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon: Icon,
  description,
}) => (
  <Card>
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium">{title}</CardTitle>
      <Icon className="h-4 w-4 text-muted-foreground" />
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold">{value}</div>
      <p className="text-xs text-muted-foreground">{description}</p>
    </CardContent>
  </Card>
);

const AdminPage: React.FC = () => {
  const { user } = useAuthStore();
  const router = useRouter();
  const [isAuthChecking, setIsAuthChecking] = useState(true);
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [orderStatusFilter, setOrderStatusFilter] = useState("all");

  // Premier useEffect pour l'authentification
  useEffect(() => {
    if (user === null) return;
    setIsAuthChecking(false);

    if (user.role !== "admin") {
      router.push("/");
      toast.error("Accès non autorisé");
      return;
    }

    // Déplacer fetchData ici
    const fetchData = async () => {
      try {
        const [productsData, ordersData, clientsData] = await Promise.all([
          supabase.from("products").select("*"),
          supabase.from("orders").select("*"),
          supabase.from("profiles").select("*"),
        ]);

        setProducts(productsData.data || []);
        setOrders(ordersData.data || []);
        setClients(clientsData.data || []);
      } catch (error) {
        toast.error("Erreur lors du chargement des données");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user, router]);

  // Afficher un loader pendant la vérification et le chargement
  if (isAuthChecking || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!user || user.role !== "admin") return null;

  const filteredOrders = orders.filter(
    (order) => orderStatusFilter === "all" || order.status === orderStatusFilter
  );

  const filteredProducts = products.filter((product) =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase())
  );
  const totalRevenue = orders.reduce(
    (sum, order) => sum + order.total_amount,
    0
  );
  const averageOrderValue =
    orders.length > 0 ? totalRevenue / orders.length : 0;

  return (
    <div className="container mx-auto p-4 space-y-8">
      <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Dashboard Admin</h1>
          <p className="text-muted-foreground">
            Bienvenue, {user?.name} ! Voici un aperçu de votre boutique.
          </p>
        </div>
        <Link href="/admin/products/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Nouveau Produit
          </Button>
        </Link>
        <Link href="/admin/orders">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            confirmer la commande
          </Button>
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Revenus Totaux"
          value={`${totalRevenue.toFixed(2)} €`}
          icon={TrendingUp}
          description="Revenus totaux depuis le début"
        />
        <StatCard
          title="Commandes"
          value={orders.length}
          icon={ShoppingCart}
          description="Nombre total de commandes"
        />
        <StatCard
          title="Clients"
          value={clients.length}
          icon={Users}
          description="Clients enregistrés"
        />
        <StatCard
          title="Panier Moyen"
          value={`${averageOrderValue.toFixed(2)} €`}
          icon={Package}
          description="Valeur moyenne des commandes"
        />
      </div>

      <Tabs defaultValue="products" className="space-y-4">
        <TabsList>
          <TabsTrigger value="products">Produits</TabsTrigger>
          <TabsTrigger value="orders">Commandes</TabsTrigger>
          <TabsTrigger value="clients">Clients</TabsTrigger>
        </TabsList>

        <TabsContent value="products">
          <Card>
            <CardHeader>
              <CardTitle>Gestion des Produits</CardTitle>
              <CardDescription>
                Gérez votre catalogue de produits
              </CardDescription>
              <div className="flex items-center space-x-2">
                <div className="relative flex-grow">
                  <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
                  <Input
                    placeholder="Rechercher un produit..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-8"
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nom</TableHead>
                    <TableHead>Prix</TableHead>
                    <TableHead>Stock</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredProducts.map((product) => (
                    <TableRow key={product.id}>
                      <TableCell className="font-medium">
                        {product.name}
                      </TableCell>
                      <TableCell>{product.price} €/m</TableCell>
                      <TableCell>{product.stock}</TableCell>
                      <TableCell className="capitalize">
                        {product.type}
                      </TableCell>
                      <TableCell>
                        <Link href={`/admin/products/${product.id}`}>
                          <Button variant="ghost" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                        </Link>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="orders">
          <Card>
            <CardHeader>
              <CardTitle>Gestion des Commandes</CardTitle>
              <CardDescription>
                Suivez et gérez les commandes de vos clients
              </CardDescription>
              <Select
                value={orderStatusFilter}
                onValueChange={setOrderStatusFilter}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filtrer par statut" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les statuts</SelectItem>
                  <SelectItem value="pending">En attente</SelectItem>
                  <SelectItem value="processing">En traitement</SelectItem>
                  <SelectItem value="completed">Terminée</SelectItem>
                </SelectContent>
              </Select>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredOrders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell>#{order.id}</TableCell>
                      <TableCell>
                        {new Date(order.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <span
                          className={`px-2 py-1 rounded-full text-xs ${
                            order.status === "completed"
                              ? "bg-green-100 text-green-800"
                              : order.status === "processing"
                              ? "bg-blue-100 text-blue-800"
                              : "bg-yellow-100 text-yellow-800"
                          }`}
                        >
                          {order.status}
                        </span>
                      </TableCell>
                      <TableCell>{order.total} €</TableCell>
                      <TableCell>
                        <Link href={`/admin/orders/${order.id}`}>
                          <Button variant="ghost" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </Link>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="clients">
          <Card>
            <CardHeader>
              <CardTitle>Gestion des Clients</CardTitle>
              <CardDescription>
                Consultez les informations de vos clients
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nom</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Rôle</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {clients.map((client) => (
                    <TableRow key={client.id}>
                      <TableCell className="font-medium">
                        {client.name}
                      </TableCell>
                      <TableCell>{client.email}</TableCell>
                      <TableCell className="capitalize">
                        {client.role}
                      </TableCell>
                      <TableCell>
                        <Link href={`/admin/clients/${client.id}`}>
                          <Button variant="ghost" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </Link>
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
};

export default AdminPage;
