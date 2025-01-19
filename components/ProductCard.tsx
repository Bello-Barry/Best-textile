import React, { useState, ChangeEvent } from "react";
import { useCart } from "@/context/CartContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "react-toastify";
import { ShoppingCart, ChevronLeft, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";

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
  const [imageError, setImageError] = useState(false);

  const nextImage = () => {
    setImageError(false); // Reset error state when changing image
    setCurrentImageIndex((prev) =>
      prev === product.images.length - 1 ? 0 : prev + 1
    );
  };

  const prevImage = () => {
    setImageError(false); // Reset error state when changing image
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
      images: product.images || [],
    });
    toast.success("Produit ajouté au panier!");
  };

  const handleImageError = () => {
    setImageError(true);
    console.error(`Erreur de chargement d'image pour le produit: ${product.name}`);
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
            {product.images && product.images.length > 0 && !imageError ? (
              <img
                src={product.images[currentImageIndex]}
                alt={product.name}
                className="w-full h-full object-cover rounded-lg"
                onError={handleImageError}
              />
            ) : (
              <div className="w-full h-full bg-gray-200 rounded-lg flex items-center justify-center">
                {imageError ? "Erreur de chargement" : "Pas d'image"}
              </div>
            )}
            {product.images && product.images.length > 1 && !imageError && (
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

export default ProductCard;