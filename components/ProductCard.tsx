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
  const [quantity, setQuantity] = useState(product.metadata.unit === "rouleau" ? 1 : 0.1);

  const unitLabel = product.metadata.unit;
  const stepValue = unitLabel === "rouleau" ? 1 : 0.1;
  const maxStock = product.stock;

  const handleQuantityChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = Number(e.target.value);
    const validatedValue = Math.min(Math.max(value, stepValue), maxStock);
    setQuantity(Number(validatedValue.toFixed(1)));
  };

  const handleImageNavigation = (direction: "next" | "prev") => {
    setCurrentImageIndex(prev => direction === "next" 
      ? (prev + 1) % product.images.length
      : (prev - 1 + product.images.length) % product.images.length);
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
      metadata: {
        fabricType: product.metadata.fabricType,
        fabricSubtype: product.metadata.fabricSubtype,
        unit: product.metadata.unit
      }
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
                <Badge variant="secondary">{product.metadata.fabricType}</Badge>
                {product.metadata.fabricSubtype && (
                  <Badge variant="outline">{product.metadata.fabricSubtype}</Badge>
                )}
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="flex-1 flex flex-col gap-4">
  {/* Section Galerie d'images */}
  <div className="relative aspect-square rounded-lg overflow-hidden group">
    <AnimatePresence initial={false} mode="wait">
      <motion.div
        key={currentImageIndex}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="relative h-full w-full"
      >
        <Dialog>
          <DialogTrigger asChild>
            <button className="absolute right-2 top-2 z-10 p-2 bg-white/80 rounded-full hover:bg-white transition-colors">
              <Maximize className="h-4 w-4" />
            </button>
          </DialogTrigger>
          
          <Image
            src={product.images[currentImageIndex]}
            alt={product.name}
            fill
            className="object-cover cursor-zoom-in"
            sizes="(max-width: 768px) 100vw, 50vw"
          />
          
          <DialogContent className="max-w-4xl p-0">
            <Image
              src={product.images[currentImageIndex]}
              alt={product.name}
              width={1200}
              height={1200}
              className="object-contain max-h-[80vh]"
            />
          </DialogContent>
        </Dialog>
      </motion.div>
    </AnimatePresence>

    {/* Navigation entre les images */}
    {product.images.length > 1 && (
      <>
        <button
          onClick={() => handleImageNavigation('prev')}
          className="absolute left-2 top-1/2 -translate-y-1/2 p-2 bg-white/80 rounded-full hover:bg-white transition-colors"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <button
          onClick={() => handleImageNavigation('next')}
          className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-white/80 rounded-full hover:bg-white transition-colors"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      </>
    )}
  </div>

  {/* Prix et Stock */}
  <div className="flex justify-between items-center">
    <span className="text-2xl font-bold">
      {new Intl.NumberFormat('fr-FR', {
        style: 'currency',
        currency: 'EUR'
      }).format(product.price)}
    </span>
    <span className="text-sm text-muted-foreground">
      {maxStock} {unitLabel}
      {maxStock > 1 ? 's' : ''} disponible
      {maxStock > 1 ? 's' : ''}
    </span>
  </div>

  {/* Contrôles de quantité */}
  <div className="flex gap-2">
    <div className="flex flex-1 items-center gap-2">
      <Button
        variant="outline"
        size="sm"
        onClick={() => setQuantity(prev => Math.max(prev - stepValue, stepValue))}
        disabled={quantity <= stepValue}
      >
        -
      </Button>
      <Input
        type="number"
        value={quantity}
        onChange={handleQuantityChange}
        min={stepValue}
        max={maxStock}
        step={stepValue}
        className="text-center [appearance:textfield]"
      />
      <Button
        variant="outline"
        size="sm"
        onClick={() => setQuantity(prev => Math.min(prev + stepValue, maxStock))}
        disabled={quantity >= maxStock}
      >
        +
      </Button>
    </div>

    {/* Bouton d'ajout au panier */}
    <Button
      onClick={handleAddToCart}
      className="flex-1 gap-2"
      disabled={quantity > maxStock}
    >
      <ShoppingCart className="h-4 w-4" />
      Ajouter
    </Button>
  </div>
</CardContent>
      </Card>
    </motion.div>
  );
};

export default ProductCard;
