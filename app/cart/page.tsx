"use client";

import React, { useState } from "react";
import { useCartStore } from "@/store/cartStore";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trash2, ShoppingCart, PackageCheck } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-toastify";
import Image from "next/image";
import { useRouter } from "next/navigation";

export default function CartPage() {
  const { cartItems, removeFromCart, updateQuantity, clearCart } =
    useCartStore();
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
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center">
            <ShoppingCart className="mr-2" /> Votre Panier
          </CardTitle>
          {cartItems.length > 0 && (
            <Button
              variant={isConfirmingClear ? "destructive" : "outline"}
              onClick={handleClearCart}
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
              <>
                {cartItems.map((item) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, x: -50 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 50 }}
                    className="flex items-center border-b py-4 space-x-4"
                  >
                    {item.images && item.images.length > 0 && (
                      <div className="relative w-24 h-24">
                        <Image
                          src={item.images[0]}
                          alt={item.name}
                          fill
                          className="object-cover rounded-lg"
                        />
                      </div>
                    )}
                    <div className="flex-1">
                      <h3 className="font-semibold">{item.name}</h3>
                      <p className="text-sm text-gray-500">
                        {item.price.toFixed(2)} € / unité
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          handleUpdateQuantity(item.id, item.quantity - 1)
                        }
                      >
                        -
                      </Button>
                      <input
                        type="number"
                        value={item.quantity}
                        onChange={(e) =>
                          handleUpdateQuantity(item.id, Number(e.target.value))
                        }
                        className="w-16 text-center border rounded"
                        min="1"
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          handleUpdateQuantity(item.id, item.quantity + 1)
                        }
                      >
                        +
                      </Button>
                    </div>
                    <div className="font-bold">
                      {(item.price * item.quantity).toFixed(2)} €
                    </div>
                    <Button
                      variant="destructive"
                      size="icon"
                      onClick={() => handleRemoveItem(item.id)}
                    >
                      <Trash2 />
                    </Button>
                  </motion.div>
                ))}
                <div className="mt-4 flex justify-between items-center">
                  <span className="text-xl font-bold">Total:</span>
                  <span className="text-2xl font-bold">
                    {calculateTotal().toFixed(2)} €
                  </span>
                </div>
                <Button
                  className="w-full mt-4"
                  size="lg"
                  disabled={cartItems.length === 0}
                  onClick={() => router.push("/checkout")}
                >
                  Procéder au paiement
                </Button>
              </>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>
    </div>
  );
}
