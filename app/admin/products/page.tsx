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
      // Vérifie d'abord la connexion Supabase
      if (!supabase) {
        throw new Error("La connexion à la base de données n'est pas établie");
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
        console.error("Erreur Supabase détaillée:", error);
        throw new Error(
          error.message || "Erreur lors de la récupération des produits"
        );
      }

      if (!data) {
        throw new Error("Aucune donnée reçue de la base de données");
      }

      setProducts(data);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Erreur inconnue";
      console.error("Erreur détaillée lors du chargement des produits:", error);
      toast.error(`Erreur lors du chargement des produits: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  // Cette fonction useEffect doit être modifiée pour gérer les dépendances correctement
  useEffect(() => {
    const controller = new AbortController();

    fetchProducts();

    return () => {
      controller.abort();
    };
  }, [filterType, sortField, sortDirection]); // Ajouter les dépendances explicitement

  const handleDelete = async (id: string) => {
    try {
      const productToDelete = products.find((p) => p.id === id);

      if (!productToDelete) {
        throw new Error("Produit non trouvé");
      }

      // Supprimer les images du storage
      if (productToDelete.images?.length) {
        for (const imageUrl of productToDelete.images) {
          const imagePath = imageUrl.split("/").pop();
          if (imagePath) {
            const { error: storageError } = await supabase.storage
              .from("images") // Utiliser "images" au lieu de "products"
              .remove([imagePath]);

            if (storageError) {
              console.error(
                "Erreur lors de la suppression de l'image:",
                storageError
              );
            }
          }
        }
      }

      // Supprimer le produit de la base de données
      const { error: deleteError } = await supabase
        .from("products")
        .delete()
        .eq("id", id);

      if (deleteError) throw deleteError;

      setProducts(products.filter((product) => product.id !== id));
      toast.success("Produit supprimé avec succès.");
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Erreur inconnue";
      console.error("Erreur lors de la suppression:", error);
      toast.error(`Erreur lors de la suppression du produit: ${errorMessage}`);
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

  const filteredProducts = products.filter((product) =>
    Object.values(product).some((value) =>
      String(value).toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  const getSortIcon = (field: keyof Product) => {
    if (field !== sortField) return <ArrowUpDown className="h-4 w-4" />;
    return sortDirection === "asc" ? "↑" : "↓";
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "EUR",
    }).format(price);
  };

  return (
    <div className="container mx-auto p-4 space-y-6">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Gestion des Produits</CardTitle>
              <CardDescription>
                {filteredProducts.length} produit
                {filteredProducts.length !== 1 && "s"} au total
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
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
                <Input
                  placeholder="Rechercher un produit..."
                  className="pl-8"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filtrer par type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les types</SelectItem>
                <SelectItem value="soie">Soie</SelectItem>
                <SelectItem value="bazin">Bazin</SelectItem>
                <SelectItem value="autre">Autre</SelectItem>
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
                    <TableHead>Image</TableHead>
                    <TableHead
                      onClick={() => toggleSort("name")}
                      className="cursor-pointer"
                    >
                      Nom {getSortIcon("name")}
                    </TableHead>
                    <TableHead
                      onClick={() => toggleSort("type")}
                      className="cursor-pointer"
                    >
                      Type {getSortIcon("type")}
                    </TableHead>
                    <TableHead
                      onClick={() => toggleSort("price")}
                      className="cursor-pointer"
                    >
                      Prix {getSortIcon("price")}
                    </TableHead>
                    <TableHead
                      onClick={() => toggleSort("stock")}
                      className="cursor-pointer"
                    >
                      Stock {getSortIcon("stock")}
                    </TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredProducts.map((product) => (
                    <TableRow key={product.id}>
                      <TableCell>
                        <div className="relative w-16 h-16 rounded overflow-hidden">
                          {product.images?.[0] ? (
                            <Image
                              src={product.images[0]}
                              alt={product.name}
                              fill
                              className="object-cover"
                            />
                          ) : (
                            <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                              <ImageOff className="h-6 w-6 text-gray-400" />
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">{product.name}</div>
                        <div className="text-sm text-gray-500 truncate max-w-xs">
                          {product.description}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            product.type === "soie"
                              ? "default"
                              : product.type === "bazin"
                              ? "secondary"
                              : "outline"
                          }
                        >
                          {product.type}
                        </Badge>
                        {product.subtype && (
                          <Badge variant="outline" className="ml-2">
                            {product.subtype}
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>{formatPrice(product.price)}/m</TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            product.stock === 0
                              ? "destructive"
                              : product.stock <= 5
                              ? "warning"
                              : "success"
                          }
                        >
                          {product.stock}
                        </Badge>
                      </TableCell>
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
                            <AlertDialogHeader>
                              <AlertDialogTitle>
                                Confirmer la suppression
                              </AlertDialogTitle>
                              <AlertDialogDescription>
                                Êtes-vous sûr de vouloir supprimer{" "}
                                {product.name} ? Cette action est irréversible.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Annuler</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDelete(product.id)}
                                className="bg-red-600 hover:bg-red-700"
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
