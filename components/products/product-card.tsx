"use client";

import { useState, ChangeEvent } from "react";
import { useCartStore } from "@/store/cartStore";
import { Product } from "@/types/product";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "react-toastify";
import { ShoppingCart, ChevronLeft, ChevronRight, Maximize, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";

interface ProductCardProps {
  product: Product;
}

const ProductCard = ({ product }: ProductCardProps) => {
  const { addToCart } = useCartStore();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(product.unit === "rouleau" ? 1 : 0.1);

  const unitLabel = product.unit === "rouleau" ? "rouleau" : "mètre";
  const stepValue = product.unit === "rouleau" ? 1 : 0.1;
  const maxStock = product.stock;

  const handleQuantityChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = Number(e.target.value);
    const validatedValue = Math.min(Math.max(value, stepValue), maxStock);
    setQuantity(Number(validatedValue.toFixed(1)));
  };

  const handleImageNavigation = (direction: "next" | "prev") => {
    setCurrentImageIndex(prev => (direction === "next" 
      ? (prev + 1) % product.images.length
      : (prev - 1 + product.images.length) % product.images.length));
  };

  const handleAddToCart = () => {
    if (quantity > maxStock) {
      toast.error(`Stock insuffisant (${maxStock} ${unitLabel}${maxStock > 1 ? "s" : ""} disponible)`);
      return;
    }

    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      quantity,
      images: product.images,
      unit: product.unit,
      fabricType: product.fabricType
    });

    toast.success(
      <div className="flex items-center">
        <Check className="mr-2 h-5 w-5 text-green-500" />
        {quantity.toFixed(1)} {unitLabel}
        {quantity > 1 ? "s" : ""} de &quot;{product.name}&quot; ajouté
        {quantity > 1 ? "s" : ""} au panier
      </div>,
      { icon: false, progressClassName: "bg-green-500" }
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="h-full"
    >
      <Card className="w-full max-w-sm mx-auto hover:shadow-lg transition-shadow h-full flex flex-col">
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-lg font-semibold truncate">
                {product.name}
              </CardTitle>
              <div className="flex gap-2 mt-1 flex-wrap">
                <Badge variant="secondary">{product.fabricType}</Badge>
                {product.fabricSubtype && (
                  <Badge variant="outline">{product.fabricSubtype}</Badge>
                )}
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="flex-1 flex flex-col gap-4">
          <Dialog>
            <DialogTrigger className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden group">
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
                    alt={`${product.name} - Vue ${currentImageIndex + 1}`}
                    fill
                    className="object-cover cursor-pointer"
                    sizes="(max-width: 768px) 100vw, 50vw"
                  />
                </motion.div>
              </AnimatePresence>
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/40">
                <Maximize className="text-white h-8 w-8" />
              </div>
            </DialogTrigger>

            <DialogContent className="max-w-3xl p-0">
              <div className="relative w-full h-[500px] bg-gray-100 rounded-lg overflow-hidden">
                <Image
                  src={product.images[currentImageIndex]}
                  alt={`Vue agrandie - ${product.name}`}
                  fill
                  className="object-contain"
                  quality={85}
                />
                {product.images.length > 1 && (
                  <>
                    <Button
                      variant="outline"
                      size="icon"
                      className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white/90"
                      onClick={() => handleImageNavigation("prev")}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white/90"
                      onClick={() => handleImageNavigation("next")}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </>
                )}
              </div>
            </DialogContent>
          </Dialog>

          <div className="mt-auto space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-lg font-bold">
                {product.price.toFixed(2)} €/{unitLabel}
              </span>
              <Link 
                href={`/products/${product.id}`}
                className="text-primary hover:text-primary/80 transition-colors text-sm"
              >
                Voir détails →
              </Link>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex-1">
                <Input
                  type="number"
                  min={stepValue}
                  max={maxStock}
                  step={stepValue}
                  value={quantity}
                  onChange={handleQuantityChange}
                  className="w-full"
                  disabled={maxStock === 0}
                />
              </div>
              <div className="flex flex-col items-end">
                <span className="text-sm text-muted-foreground">
                  Stock: {maxStock} {unitLabel}{maxStock > 1 ? "s" : ""}
                </span>
                <span className="text-sm font-semibold">
                  {(product.price * quantity).toFixed(2)} €
                </span>
              </div>
            </div>

            <Button 
              className="w-full" 
              onClick={handleAddToCart} 
              disabled={maxStock === 0}
            >
              <ShoppingCart className="mr-2 h-4 w-4" />
              {maxStock === 0 ? "Rupture de stock" : "Ajouter au panier"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default ProductCard;
