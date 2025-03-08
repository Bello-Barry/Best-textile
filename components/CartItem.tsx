"use client";

import { Button } from "@/components/ui/button";
import { useCartStore } from "@/store/cartStore";

export default function CartItem({ item }: { item: any }) {
  const { removeFromCart, updateQuantity } = useCartStore();

  return (
    <div className="border-b py-4">
      <h2 className="text-xl font-semibold">{item.name}</h2>
      <p>Prix total: {item.price.toFixed(2)} FCFA</p>
      <div className="flex items-center gap-2">
        <label>Quantité:</label>
        <input
          type="number"
          value={item.quantity}
          onChange={(e) => updateQuantity(item.id, parseFloat(e.target.value))}
          className="w-16 border rounded px-2"
        />
      </div>
      <Button variant="destructive" onClick={() => removeFromCart(item.id)}>
        Supprimer
      </Button>
    </div>
  );
}
