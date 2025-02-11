"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { toast } from "react-toastify";
import Link from "next/link";
import Image from "next/image";
import {
  Plus,
  Pencil,
  Trash2,
  Search,
  ArrowUpDown,
  Loader2,
  ImageOff,
} from "lucide-react";

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  type: string;
  subtype?: string;
  images: string[];
  created_at: string;
}

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<string>("all");
  const [sortField, setSortField] = useState<keyof Product>("created_at");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");

  const fetchProducts = async () => {
    setLoading(true);
    try {
      if (!supabase) {
        throw new Error("Connexion à la base de données échouée.");
      }

      let query = supabase
        .from("products")
        .select("*")
        .order(sortField, { ascending: sortDirection === "asc" });

      if (filterType !== "all") {
        query = query.eq("type", filterType);
      }

      const { data, error } = await query;

      if (error) {
        throw new Error(error.message || "Erreur lors de la récupération.");
      }

      setProducts(data || []);
    } catch (error) {
      toast.error(
        `Erreur lors du chargement : ${
          error instanceof Error ? error.message : "Inconnue"
        }`
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [filterType, sortField, sortDirection]);

  const handleDelete = async (id: string) => {
    try {
      const productToDelete = products.find((p) => p.id === id);
      if (!productToDelete) throw new Error("Produit introuvable.");

      if (productToDelete.images?.length) {
        for (const imageUrl of productToDelete.images) {
          const imagePath = imageUrl.split("/").pop();
          if (imagePath) {
            await supabase.storage.from("images").remove([imagePath]);
          }
        }
      }

      const { error: deleteError } = await supabase
        .from("products")
        .delete()
        .eq("id", id);

      if (deleteError) throw deleteError;

      setProducts((prev) => prev.filter((product) => product.id !== id));
      toast.success("Produit supprimé avec succès.");
    } catch (error) {
      toast.error(
        `Erreur lors de la suppression : ${
          error instanceof Error ? error.message : "Inconnue"
        }`
      );
    }
  };

  const toggleSort = (field: keyof Product) => {
    if (field === sortField) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const getSortIcon = (field: keyof Product) => {
    if (field !== sortField) return <ArrowUpDown className="h-4 w-4" />;
    return sortDirection === "asc" ? "↑" : "↓";
  };

  return (
    <div className="container mx-auto p-4 space-y-6">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Gestion des Produits</CardTitle>
              <CardDescription>
                {products.length} produit{products.length !== 1 && "s"}
              </CardDescription>
            </div>
            <Link href="/admin/products/new">
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Ajouter un produit
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <Input
              placeholder="Rechercher..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filtrer par type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les types</SelectItem>
                <SelectItem value="soie">Soie</SelectItem>
                <SelectItem value="bazin">Bazin</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {loading ? (
            <div className="flex justify-center items-center h-64">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nom {getSortIcon("name")}</TableHead>
                    <TableHead>Type {getSortIcon("type")}</TableHead>
                    <TableHead>Prix {getSortIcon("price")}</TableHead>
                    <TableHead>Stock {getSortIcon("stock")}</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {products.map((product) => (
                    <TableRow key={product.id}>
                      <TableCell>{product.name}</TableCell>
                      <TableCell>{product.type}</TableCell>
                      <TableCell>{product.price}€</TableCell>
                      <TableCell>{product.stock}</TableCell>
                      <TableCell className="text-right space-x-2">
                        <Link href={`/admin/products/${product.id}`}>
                          <Button variant="outline" size="sm">
                            <Pencil className="h-4 w-4" />
                          </Button>
                        </Link>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="destructive" size="sm">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Annuler</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDelete(product.id)}
                              >
                                Supprimer
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}