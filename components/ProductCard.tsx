"use client";

import React, { useState, ChangeEvent } from "react";
import { useCartStore } from "@/store/cartStore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "react-toastify";
import { ShoppingCart, ChevronLeft, ChevronRight, Maximize } from "lucide-react";
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
  const [isModalOpen, setIsModalOpen] = useState(false);

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % product.images.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) =>
      prev === 0 ? product.images.length - 1 : prev - 1
    );
  };

  const handleAddToCart = () => {
    addToCart({
      id: product.id.toString(),
      name: product.name,
      price: product.price,
      quantity: ,
      images: product.images,
    });

    toast.success(`1 mètre de "${product.name}" ajouté au panier.`);
  };

  return (
    <Card className="w-full max-w-sm mx-auto hover:shadow-lg transition-shadow duration-300">
      <CardHeader>
        <CardTitle className="text-lg font-semibold truncate">
          {product.name}
        </CardTitle>
        <Badge variant="secondary">{product.type}</Badge>
        {product.subtype && <Badge variant="outline">{product.subtype}</Badge>}
      </CardHeader>

      <CardContent className="flex flex-col">
        {/* Carrousel d'images */}
        <div className="relative w-full aspect-square bg-gray-100 rounded-lg overflow-hidden">
          {product.images.length > 0 && (
            <>
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentImageIndex}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="relative w-full h-full"
                >
                  <Image
                    src={product.images[currentImageIndex]}
                    alt={product.name}
                    fill
                    className="object-cover"
                    priority
                  />
                </motion.div>
              </AnimatePresence>

              {/* Navigation gauche/droite */}
              {product.images.length > 1 && (
                <>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute top-1/2 left-2 transform -translate-y-1/2 bg-white/60 hover:bg-white"
                    onClick={prevImage}
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute top-1/2 right-2 transform -translate-y-1/2 bg-white/60 hover:bg-white"
                    onClick={nextImage}
                  >
                    <ChevronRight className="h-5 w-5" />
                  </Button>
                </>
              )}

              {/* Bouton d'agrandissement */}
              <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute top-2 right-2 bg-white/70 hover:bg-white"
                    onClick={() => setIsModalOpen(true)}
                  >
                    <Maximize className="h-5 w-5" />
                  </Button>
                </DialogTrigger>

                <DialogContent className="max-w-3xl w-full bg-white p-4 rounded-lg">
                  <div className="relative w-full h-[70vh] flex items-center justify-center">
                    <Image
                      src={product.images[currentImageIndex]}
                      alt={product.name}
                      fill
                      className="object-contain"
                    />
                  </div>
                  {/* Boutons de navigation dans la modale */}
                  {product.images.length > 1 && (
                    <div className="absolute inset-0 flex justify-between items-center p-4">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={prevImage}
                        className="bg-white/70 hover:bg-white"
                      >
                        <ChevronLeft className="h-5 w-5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={nextImage}
                        className="bg-white/70 hover:bg-white"
                      >
                        <ChevronRight className="h-5 w-5" />
                      </Button>
                    </div>
                  )}
                </DialogContent>
              </Dialog>
            </>
          )}
        </div>

        {/* Infos et actions */}
        <div className="mt-4 flex justify-between items-center">
          <span className="text-lg font-bold">{product.price.toFixed(2)} €/m</span>
          <Button onClick={handleAddToCart} className="flex items-center gap-2">
            <ShoppingCart className="h-4 w-4" />
            Ajouter au panier
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProductCard;