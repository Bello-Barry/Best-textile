import { Badge } from "@/components/ui/badge";

interface ProductDetailsProps {
  product: {
    name: string;
    description: string;
    price: number;
    stock: number;
    type: string;
    subtype?: string;
  };
}

export default function ProductDetails({ product }: ProductDetailsProps) {
  return (
    <div className="mt-4 space-y-4">
      <p className="text-xl font-semibold text-primary">{product.price} € / mètre</p>
      <p className={`text-sm font-medium ${product.stock > 0 ? "text-green-500" : "text-red-500"}`}>
        {product.stock > 0 ? `Stock disponible : ${product.stock}` : "Rupture de stock"}
      </p>
      <div className="flex gap-2">
        <Badge variant="secondary">{product.type}</Badge>
        {product.subtype && <Badge variant="outline">{product.subtype}</Badge>}
      </div>
      <p className="text-gray-700">{product.description}</p>
    </div>
  );
}