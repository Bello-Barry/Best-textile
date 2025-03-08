"use client";

import { useState } from "react";
import { useCartStore } from "@/store/cartStore";
import { Product } from "@/types/product";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "react-toastify";
import { ShoppingCart, Check, ChevronLeft, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";

interface ProductCardProps {
  product: Product;
}

const ProductCard = ({ product }: ProductCardProps) => {
  const { addToCart } = useCartStore();
  const [quantity, setQuantity] = useState(product.metadata.unit === "rouleau" ? 1 : 0.5);
  const [isExpanded, setIsExpanded] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const unitLabel = product.metadata.unit;
  const stepValue = unitLabel === "rouleau" ? 1 : 0.5;
  const maxStock = product.stock;
  const totalPrice = quantity * product.price;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF',
      currencyDisplay: 'narrowSymbol',
      maximumFractionDigits: 0
    }).format(amount).replace('XOF', 'FCFA');
  };

  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number(e.target.value);
    if (isNaN(value)) return;
    
    const validatedValue = Math.min(Math.max(value, stepValue), maxStock);
    setQuantity(Number(validatedValue.toFixed(1)));
  };

  const handleAddToCart = () => {
    if (quantity > maxStock) {
      toast.error(
        <div className="flex items-center">
          <span>
            Stock insuffisant ({maxStock} {unitLabel}
            {maxStock > 1 ? "s" : ""} disponible)
          </span>
        </div>,
        { progressClassName: "bg-red-500" }
      );
      return;
    }

    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      quantity,
      images: product.images,
      metadata: product.metadata
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

  const handleImageNavigation = (direction: "next" | "prev") => {
    setCurrentImageIndex(prev => direction === "next" 
      ? (prev + 1) % product.images.length
      : (prev - 1 + product.images.length) % product.images.length);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="h-full"
    >
      <Card 
        className="w-full max-w-sm mx-auto hover:shadow-lg transition-shadow h-full flex flex-col"
      >
        {/* Section image avec navigation */}
        <div 
          className="relative aspect-square rounded-t-lg overflow-hidden"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <Dialog>
            <DialogTrigger asChild>
              <button 
                className="absolute right-2 top-2 z-10 p-2 bg-white/80 rounded-full hover:bg-white transition-colors"
                aria-label="Agrandir l'image"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </DialogTrigger>
            
            <Image
              src={product.images[currentImageIndex]}
              alt={product.name}
              fill
              className="object-cover cursor-pointer"
              sizes="(max-width: 768px) 100vw, 50vw"
              priority
            />
            
            <DialogContent className="max-w-4xl p-0 overflow-hidden">
              <div className="relative h-[80vh]">
                <Image
                  src={product.images[currentImageIndex]}
                  alt={product.name}
                  fill
                  className="object-contain"
                />
              </div>
            </DialogContent>
          </Dialog>

          {product.images.length > 1 && (
            <>
              <div className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-black/50 text-white px-2 py-1 rounded-full text-xs">
                {currentImageIndex + 1}/{product.images.length}
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleImageNavigation('prev');
                }}
                className="absolute left-2 top-1/2 -translate-y-1/2 p-2 bg-white/80 rounded-full hover:bg-white transition-colors"
                aria-label="Image précédente"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleImageNavigation('next');
                }}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-white/80 rounded-full hover:bg-white transition-colors"
                aria-label="Image suivante"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </>
          )}
        </div>

        {/* Section informations de base */}
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-semibold truncate">
            {product.name}
          </CardTitle>
          <div className="text-xl font-bold">
            {formatCurrency(product.price)}
            <span className="text-sm font-normal ml-1">/ {unitLabel}</span>
          </div>
        </CardHeader>

        {/* Section dépliée */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
            >
              <CardContent className="pt-0 space-y-4">
                <div className="text-sm text-muted-foreground">
                  {product.description}
                </div>

                <div className="flex gap-2 flex-wrap">
                  <Badge variant="secondary" className="capitalize">
                    {product.metadata.fabricType}
                  </Badge>
                  {product.metadata.fabricSubtype && (
                    <Badge variant="outline" className="capitalize">
                      {product.metadata.fabricSubtype}
                    </Badge>
                  )}
                </div>

                <div className="text-sm text-muted-foreground">
                  Stock : {maxStock} {unitLabel}{maxStock > 1 ? 's' : ''}
                </div>

                <div className="flex flex-col sm:flex-row gap-2">
                  <div className="flex flex-1 items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        setQuantity(prev => Math.max(prev - stepValue, stepValue));
                      }}
                      disabled={quantity <= stepValue}
                      className="flex-1"
                    >
                      -
                    </Button>
                    <Input
                      type="number"
                      value={quantity}
                      onChange={(e) => {
                        e.stopPropagation();
                        handleQuantityChange(e);
                      }}
                      min={stepValue}
                      max={maxStock}
                      step={stepValue}
                      className="text-center [appearance:textfield] flex-2"
                      onClick={(e) => e.stopPropagation()}
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        setQuantity(prev => Math.min(prev + stepValue, maxStock));
                      }}
                      disabled={quantity >= maxStock}
                      className="flex-1"
                    >
                      +
                    </Button>
                  </div>

                  <Button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleAddToCart();
                    }}
                    className="flex-1 gap-2"
                    disabled={quantity > maxStock}
                  >
                    <ShoppingCart className="h-4 w-4" />
                    Ajouter
                  </Button>
                </div>
              </CardContent>
            </motion.div>
          )}
        </AnimatePresence>
      </Card>
    </motion.div>
  );
};

export default ProductCard;