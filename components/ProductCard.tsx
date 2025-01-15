import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";

export default function ProductCard({ product }: { product: any }) {
  return (
    <div className="border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
      <Image
        src={product.images[0]}
        alt={product.name}
        width={300}
        height={200}
        className="w-full h-48 object-cover"
      />
      <div className="p-4">
        <h2 className="text-xl font-semibold">{product.name}</h2>
        <p className="text-gray-700">{product.description}</p>
        <p className="text-lg font-bold mt-2">{product.price} €/mètre</p>
        {product.stock > 0 ? (
          <Link href={`/products/${product.id}`}>
            <Button className="mt-4 w-full">Voir le produit</Button>
          </Link>
        ) : (
          <p className="text-red-500 mt-4">Rupture de stock</p>
        )}
      </div>
    </div>
  );
}
