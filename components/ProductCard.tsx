"use client";

import React, { useState, ChangeEvent } from "react";
import { useCartStore } from "@/store/cartStore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "react-toastify";
import { ShoppingCart, ChevronLeft, ChevronRight, Maximize, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
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
  const { addToCart } = useCartStore();
  const router = useRouter();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);

  const handleQuantityChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = Number(e.target.value);
    if (value < 1) return setQuantity(1);
    if (value > product.stock) return setQuantity(product.stock);
    setQuantity(value);
  };

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev === product.images.length - 1 ? 0 : prev + 1));
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev === 0 ? product.images.length - 1 : prev - 1));
  };

  const handleAddToCart = () => {
    if (quantity > product.stock) {
      toast.error("Stock insuffisant");
      return;
    }

    addToCart({
      id: product.id.toString(),
      name: product.name,
      price: product.price,
      quantity,
      images: product.images,
    });

    toast.success(
  <div className="flex items-center">
    <Check className="mr-2 h-5 w-5 text-green-500" />
    {quantity} mètre{quantity > 1 ? "s" : ""} de &quot;{product.name}&quot; ajouté
    {quantity > 1 ? "s" : ""} au panier
  </div>,
  {
    icon: false,
    progressClassName: "bg-green-500",
  }
);
  };

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
              <CardTitle className="text-lg font-semibold truncate">{product.name}</CardTitle>
              <div className="flex gap-2 mt-1">
                <Badge variant="secondary">{product.type}</Badge>
                {product.subtype && <Badge variant="outline">{product.subtype}</Badge>}
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="flex-1 flex flex-col">
          <Dialog>
            <DialogTrigger className="relative aspect-square mb-4 bg-gray-100 rounded-lg overflow-hidden">
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
                    className="object-cover cursor-pointer"
                  />
                </motion.div>
              </AnimatePresence>
              <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity bg-black/40">
                <Maximize className="text-white h-8 w-8" />
              </div>
            </DialogTrigger>

            <DialogContent className="max-w-3xl">
              <div className="relative w-full h-[500px] bg-gray-100 rounded-lg overflow-hidden">
                <Image
                  src={product.images[currentImageIndex]}
                  alt={product.name}
                  fill
                  className="object-contain"
                />
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
                  </>
                )}
              </div>
            </DialogContent>
          </Dialog>

          <div className="mt-auto">
            <div className="flex justify-between items-center mb-4">
              <span className="text-lg font-bold">{product.price.toFixed(2)} €/m</span>
              <Link href={`/app/product/${product.id}`} passHref>
                <Button variant="link" className="text-blue-600">
                  Voir les détails
                </Button>
              </Link>
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
              <span className="text-sm text-gray-500">mètre{quantity > 1 ? "s" : ""}</span>
              {quantity > 0 && (
                <span className="text-sm text-gray-500 ml-auto">
                  Total: {(product.price * quantity).toFixed(2)} €
                </span>
              )}
            </div>

            <Button className="w-full" onClick={handleAddToCart} disabled={product.stock === 0}>
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