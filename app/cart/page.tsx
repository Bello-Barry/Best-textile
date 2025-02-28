"use client";

import { useState } from "react";
import { useCartStore } from "@/store/cartStore";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trash2, ShoppingCart, PackageCheck } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-toastify";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";

export default function CartPage() {
  const { cartItems, removeFromCart, updateQuantity, clearCart } = useCartStore();
  const [isConfirmingClear, setIsConfirmingClear] = useState(false);
  const router = useRouter();

  const calculateTotal = () => {
    return cartItems.reduce(
      (total, item) => total + item.price * item.quantity,
      0
    );
  };

  const handleUpdateQuantity = (id: string, newQuantity: number) => {
    if (newQuantity > 0) {
      updateQuantity(id, newQuantity);
    } else {
      toast.error("La quantité ne peut pas être inférieure à zéro");
    }
  };

  const handleRemoveItem = (id: string) => {
    removeFromCart(id);
    toast.info("Produit retiré du panier", {
      icon: <Trash2 className="text-red-500" />,
    });
  };

  const handleClearCart = () => {
    if (isConfirmingClear) {
      clearCart();
      toast.warning("Panier vidé", {
        icon: <PackageCheck className="text-red-500" />,
      });
      setIsConfirmingClear(false);
    } else {
      setIsConfirmingClear(true);
    }
  };

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <Card>
        <CardHeader className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <CardTitle className="flex items-center text-xl">
            <ShoppingCart className="mr-2 h-6 w-6" /> Votre Panier
          </CardTitle>
          {cartItems.length > 0 && (
            <Button
              variant={isConfirmingClear ? "destructive" : "outline"}
              onClick={handleClearCart}
              className="w-full sm:w-auto"
            >
              {isConfirmingClear
                ? "Confirmer la suppression"
                : "Vider le panier"}
            </Button>
          )}
        </CardHeader>
        <CardContent>
          <AnimatePresence>
            {cartItems.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-8 text-gray-500"
              >
                Votre panier est vide
              </motion.div>
            ) : (
              <div className="space-y-4">
                {cartItems.map((item) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, x: -50 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 50 }}
                    className="flex flex-col sm:flex-row items-center border-b py-4 gap-4"
                  >
                    {item.images && item.images.length > 0 && (
                      <div className="relative w-32 h-32 shrink-0">
                        <Image
                          src={item.images[0]}
                          alt={item.name}
                          fill
                          className="object-cover rounded-lg"
                          sizes="(max-width: 640px) 100vw, 300px"
                        />
                      </div>
                    )}
                    
                    <div className="flex-1 w-full space-y-2">
                      <h3 className="font-semibold text-lg">{item.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {new Intl.NumberFormat('fr-FR', {
                          style: 'currency',
                          currency: 'EUR'
                        }).format(item.price)} / {item.metadata.unit}
                      </p>
                      
                      <div className="flex items-center gap-2 flex-wrap">
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleUpdateQuantity(item.id, item.quantity - (item.metadata.unit === 'rouleau' ? 1 : 0.1))}
                            disabled={item.quantity <= (item.metadata.unit === 'rouleau' ? 1 : 0.1)}
                          >
                            -
                          </Button>
                          <Input
                            type="number"
                            value={item.quantity}
                            onChange={(e) => handleUpdateQuantity(item.id, Number(e.target.value))}
                            min={item.metadata.unit === 'rouleau' ? 1 : 0.1}
                            step={item.metadata.unit === 'rouleau' ? 1 : 0.1}
                            className="w-20 text-center"
                          />
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleUpdateQuantity(item.id, item.quantity + (item.metadata.unit === 'rouleau' ? 1 : 0.1))}
                          >
                            +
                          </Button>
                        </div>
                        
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveItem(item.id)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Supprimer
                        </Button>
                      </div>
                    </div>
                    
                    <div className="text-right font-semibold whitespace-nowrap">
                      {new Intl.NumberFormat('fr-FR', {
                        style: 'currency',
                        currency: 'EUR'
                      }).format(item.price * item.quantity)}
                    </div>
                  </motion.div>
                ))}
                
                <div className="pt-4 border-t">
                  <div className="flex justify-end items-center gap-4">
                    <span className="text-xl font-bold">
                      Total : {new Intl.NumberFormat('fr-FR', {
                        style: 'currency',
                        currency: 'EUR'
                      }).format(calculateTotal())}
                    </span>
                    <Button 
                      size="lg"
                      onClick={() => router.push('/checkout')}
                    >
                      Commander
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>
    </div>
  );
                    }
