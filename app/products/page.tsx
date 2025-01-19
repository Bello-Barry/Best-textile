"use client";
import React, { useState, useEffect, ChangeEvent } from "react";
import { useCart } from "@/context/CartContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "react-toastify";
import {
  ShoppingCart,
  ChevronLeft,
  ChevronRight,
  Search,
} from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import { motion } from "framer-motion";

// Define the types for the product and the props
interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  stock: number;
  images: string[];
  type: string;
  subtype?: string;
}

interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { addToCart } = useCart();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);

  const nextImage = () => {
    setCurrentImageIndex((prev) =>
      prev === product.images.length - 1 ? 0 : prev + 1
    );
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) =>
      prev === 0 ? product.images.length - 1 : prev - 1
    );
  };

  const handleAddToCart = () => {
    if (quantity > product.stock) {
      toast.error("Stock insuffisant");
      return;
    }

    addToCart({
      id: product.id,
      name: product.name,
      price: product.price * quantity,
      quantity,
      images: [],
    });
    toast.success("Produit ajouté au panier!");
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="w-full max-w-sm mx-auto hover:shadow-lg transition-shadow duration-300">
        <CardHeader>
          <CardTitle className="text-lg font-semibold truncate">
            {product.name}
          </CardTitle>
          <div className="text-sm text-gray-500">
            {product.type} {product.subtype && `- ${product.subtype}`}
          </div>
        </CardHeader>
        <CardContent>
          <div className="relative aspect-square mb-4">
            {product.images && product.images.length > 0 ? (
              <img
                src={product.images[currentImageIndex]}
                alt={product.name}
                className="w-full h-full object-cover rounded-lg"
              />
            ) : (
              <div className="w-full h-full bg-gray-200 rounded-lg flex items-center justify-center">
                Pas d'image
              </div>
            )}
            {product.images && product.images.length > 1 && (
              <>
                <Button
                  variant="outline"
                  size="icon"
                  className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-white/80"
                  onClick={prevImage}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-white/80"
                  onClick={nextImage}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </>
            )}
          </div>

          <p className="text-sm text-gray-600 h-20 overflow-y-auto mb-4">
            {product.description}
          </p>

          <div className="flex justify-between items-center mb-4">
            <span className="text-lg font-bold">
              {product.price.toFixed(2)} €/m
            </span>
            <span
              className={`text-sm ${
                product.stock > 0 ? "text-green-600" : "text-red-600"
              }`}
            >
              Stock: {product.stock}
            </span>
          </div>

          <div className="flex items-center gap-4 mb-4">
            <Input
              type="number"
              min="1"
              max={product.stock}
              value={quantity}
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                setQuantity(Number(e.target.value))
              }
              className="w-20"
            />
            <span className="text-sm text-gray-500">mètre(s)</span>
          </div>

          <Button
            className="w-full"
            onClick={handleAddToCart}
            disabled={product.stock === 0}
          >
            <ShoppingCart className="mr-2 h-4 w-4" />
            {product.stock === 0 ? "Rupture de stock" : "Ajouter au panier"}
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );
};

const ProductsPage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState("all");

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase.from<Product>("products").select("*");

      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      toast.error("Erreur lors du chargement des produits");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = selectedType === "all" || product.type === selectedType;
    return matchesSearch && matchesType;
  });

  return (
    <div className="container mx-auto p-4">
      <div className="mb-8 space-y-4">
        <h1 className="text-3xl font-bold text-center mb-8">Nos Produits</h1>

        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-grow">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <Input
              placeholder="Rechercher un produit..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          <Select value={selectedType} onValueChange={setSelectedType}>
            <SelectTrigger className="w-full md:w-[200px]">
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
      </div>

      {loading ? (
        <div className="text-center py-12">Chargement des produits...</div>
      ) : filteredProducts.length === 0 ? (
        <div className="text-center py-12">Aucun produit trouvé</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}

export default ProductsPage;
