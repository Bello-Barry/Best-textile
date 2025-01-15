import { Button } from "@/components/ui/button";
import { useState } from "react";

export default function CartItem({
  item,
  onRemove,
  onUpdateQuantity,
}: {
  item: any;
  onRemove: () => void;
  onUpdateQuantity: (quantity: number) => void;
}) {
  const [isRemoving, setIsRemoving] = useState(false);

  const handleRemove = () => {
    setIsRemoving(true);
    setTimeout(() => {
      onRemove();
    }, 300); // Durée de l'animation
  };

  return (
    <div
      className={`border-b py-4 ${
        isRemoving ? "opacity-0 transition-opacity duration-300" : ""
      }`}
    >
      <h2 className="text-xl font-semibold">{item.name}</h2>
      <p>Prix total: {item.price.toFixed(2)} €</p>
      <div className="flex items-center gap-2">
        <label>Quantité:</label>
        <input
          type="number"
          value={item.quantity}
          onChange={(e) => onUpdateQuantity(parseFloat(e.target.value))}
          className="w-16 border rounded px-2"
        />
      </div>
      <Button variant="destructive" onClick={handleRemove}>
        Supprimer
      </Button>
    </div>
  );
}
