import React, { useState, ChangeEvent } from "react";
import { useCart } from "@/context/CartContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "react-toastify";
import {
  ShoppingCart,
  ChevronLeft,
  ChevronRight,
  ImageIcon,
  Loader2,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";

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
  const [isImageLoading, setIsImageLoading] = useState(true);
  const [showFullDescription, setShowFullDescription] = useState(false);

  const handleQuantityChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = Number(e.target.value);
    if (value < 1) return setQuantity(1);
    if (value > product.stock) return setQuantity(product.stock);
    setQuantity(value);
  };

  const nextImage = () => {
    setIsImageLoading(true);
    setCurrentImageIndex((prev) =>
      prev === product.images.length - 1 ? 0 : prev + 1
    );
  };

  const prevImage = () => {
    setIsImageLoading(true);
    setCurrentImageIndex((prev) =>
      prev === 0 ? product.images.length - 1 : prev - 1
    );
  };

  const handleAddToCart = () => {
    if (quantity > product.stock) {
      toast.error("Stock insuffisant");
      return;
    }

    const totalPrice = Number((product.price * quantity).toFixed(2));

    addToCart({
      id: product.id,
      name: product.name,
      price: totalPrice,
      quantity,
      images: product.images,
    });

    // Toast pour indiquer que le produit a bien été ajouté au panier
    toast.success(
      `${quantity} mètre${quantity > 1 ? "s" : ""} de "${product.name}" ajouté${
        quantity > 1 ? "s" : ""
      } au panier`
    );
  };

  const getStockStatus = () => {
    if (product.stock === 0)
      return { color: "text-red-600", text: "Rupture de stock" };
    if (product.stock <= 5)
      return { color: "text-orange-600", text: "Stock limité" };
    return { color: "text-green-600", text: "En stock" };
  };

  const stockStatus = getStockStatus();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="h-full"
    >
      <Card className="w-full max-w-sm mx-auto hover:shadow-lg transition-shadow duration-300 h-full flex flex-col">
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-lg font-semibold truncate">
                {product.name}
              </CardTitle>
              <div className="flex gap-2 mt-1">
                <Badge variant="secondary">{product.type}</Badge>
                {product.subtype && (
                  <Badge variant="outline">{product.subtype}</Badge>
                )}
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="flex-1 flex flex-col">
          <div className="relative aspect-square mb-4 bg-gray-100 rounded-lg overflow-hidden">
            {product.images && product.images.length > 0 ? (
              <>
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentImageIndex}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="relative w-full h-full"
                  >
                    <Image
                      src={product.images[currentImageIndex]}
                      alt={product.name}
                      fill
                      className="object-cover"
                      onLoadingComplete={() => setIsImageLoading(false)}
                      priority={currentImageIndex === 0}
                    />
                    {isImageLoading && (
                      <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
                        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
                      </div>
                    )}
                  </motion.div>
                </AnimatePresence>

                {product.images.length > 1 && (
                  <>
                    <Button
                      variant="outline"
                      size="icon"
                      className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white/90"
                      onClick={prevImage}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white/90"
                      onClick={nextImage}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                    <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex gap-1">
                      {product.images.map((_, index) => (
                        <div
                          key={index}
                          className={`w-1.5 h-1.5 rounded-full ${
                            index === currentImageIndex
                              ? "bg-white"
                              : "bg-white/50"
                          }`}
                        />
                      ))}
                    </div>
                  </>
                )}
              </>
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <ImageIcon className="h-12 w-12 text-gray-400" />
              </div>
            )}
          </div>

          <motion.div
            animate={{ height: showFullDescription ? "auto" : "5rem" }}
            className="relative mb-4 overflow-hidden"
          >
            <p className="text-sm text-gray-600">{product.description}</p>
            {product.description.length > 150 && (
              <Button
                variant="ghost"
                size="sm"
                className="absolute bottom-0 right-0 bg-white"
                onClick={() => setShowFullDescription(!showFullDescription)}
              >
                {showFullDescription ? "Voir moins" : "Voir plus"}
              </Button>
            )}
          </motion.div>

          <div className="mt-auto">
            <div className="flex justify-between items-center mb-4">
              <span className="text-lg font-bold">
                {product.price.toFixed(2)} €/m
              </span>
              <span className={`text-sm ${stockStatus.color}`}>
                {stockStatus.text}
              </span>
            </div>

            <div className="flex items-center gap-4 mb-4">
              <Input
                type="number"
                min="1"
                max={product.stock}
                value={quantity}
                onChange={handleQuantityChange}
                className="w-20"
                disabled={product.stock === 0}
              />
              <span className="text-sm text-gray-500">
                mètre{quantity > 1 ? "s" : ""}
              </span>
              {quantity > 0 && (
                <span className="text-sm text-gray-500 ml-auto">
                  Total: {(product.price * quantity).toFixed(2)} €
                </span>
              )}
            </div>

            <Button
              className="w-full"
              onClick={handleAddToCart}
              disabled={product.stock === 0}
            >
              <ShoppingCart className="mr-2 h-4 w-4" />
              {product.stock === 0 ? "Rupture de stock" : "Ajouter au panier"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default ProductCard;