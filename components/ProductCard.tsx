"use client";

import React, { useState, ChangeEvent } from "react";
import { useCartStore } from "@/store/cartStore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "react-toastify";
import { ShoppingCart, ChevronLeft, ChevronRight, ImageIcon, Loader2, Check, Maximize } from "lucide-react";
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
  const { addToCart } = useCartStore();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [isImageLoading, setIsImageLoading] = useState(true);
  const [showFullDescription, setShowFullDescription] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

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
        {quantity} mètre{quantity > 1 ? "s" : ""} de &quot;{product.name}&quot;
        ajouté
        {quantity > 1 ? "s" : ""} au panier
      </div>,
      {
        icon: false,
        progressClassName: "bg-green-500",
      }
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
          {/* MODALE D'APERÇU DE L'IMAGE */}
          <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
            <DialogTrigger asChild>
              <div className="relative aspect-square mb-4 bg-gray-100 rounded-lg overflow-hidden cursor-pointer">
                {product.images.length > 0 ? (
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

                    {/* Bouton pour zoomer */}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute top-2 right-2 bg-white/70 hover:bg-white"
                    >
                      <Maximize className="h-5 w-5" />
                    </Button>
                  </>
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <ImageIcon className="h-12 w-12 text-gray-400" />
                  </div>
                )}
              </div>
            </DialogTrigger>

            {/* CONTENU DE LA MODALE */}
            <DialogContent className="max-w-3xl w-full bg-white p-4 rounded-lg">
              <div className="relative w-full h-[70vh]">
                <Image
                  src={product.images[currentImageIndex]}
                  alt={product.name}
                  fill
                  className="object-contain"
                />
              </div>
            </DialogContent>
          </Dialog>

          <div className="mt-auto">
            <div className="flex justify-between items-center mb-4">
              <span className="text-lg font-bold">
                {product.price.toFixed(2)} €/m
              </span>
              <span className={`text-sm ${stockStatus.color}`}>
                {stockStatus.text}
              </span>
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