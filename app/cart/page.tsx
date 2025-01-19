//app/cart/page.tsx
"use client";

import { useCart } from "@/context/CartContext";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function CartPage() {
  const { cartItems, removeFromCart, updateQuantity } = useCart();

  const total = cartItems.reduce((sum, item) => sum + item.price, 0);

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Votre Panier</h1>
      {cartItems.length === 0 ? (
        <p>Votre panier est vide.</p>
      ) : (
        <div>
          {cartItems.map((item) => (
            <div key={item.id} className="border-b py-4">
              <h2 className="text-xl font-semibold">{item.name}</h2>
              <p>Prix total: {item.price.toFixed(2)} €</p>
              <div className="flex items-center gap-2">
                <label>Quantité:</label>
                <input
                  type="number"
                  value={item.quantity}
                  onChange={(e) =>
                    updateQuantity(item.id, parseInt(e.target.value))
                  }
                  className="w-16 border rounded px-2"
                />
              </div>
              <Button
                variant="destructive"
                onClick={() => removeFromCart(item.id)}
              >
                Supprimer
              </Button>
            </div>
          ))}
          <div className="mt-4">
            <p className="text-xl font-bold">Total: {total.toFixed(2)} €</p>
            <Link href="/checkout">
              <Button className="mt-4">Passer la commande</Button>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
