import { Badge } from "@/components/ui/badge";

interface ProductDetailsProps {
  product: {
    name: string;
    description: string;
    price: number;
    stock: number;
    fabricType: string;
    fabricSubtype?: string;
    unit: "mètre" | "rouleau";
  };
}

export default function ProductDetails({ product }: ProductDetailsProps) {
  const unitLabel = product.unit === "rouleau" ? "rouleau" : "mètre";
  const stockLabel = product.unit === "rouleau" ? "rouleaux" : "mètres";

  return (
    <div className="mt-4 space-y-4">
      <p className="text-xl font-semibold text-primary">
        {product.price.toFixed(2)} € / {unitLabel}
      </p>
      <p className={`text-sm font-medium ${product.stock > 0 ? "text-green-500" : "text-red-500"}`}>
        {product.stock > 0 
          ? `Stock disponible : ${product.stock} ${stockLabel}` 
          : "Rupture de stock"}
      </p>
      <div className="flex gap-2 flex-wrap">
        <Badge variant="secondary" className="whitespace-nowrap">
          {product.fabricType}
        </Badge>
        {product.fabricSubtype && (
          <Badge variant="outline" className="whitespace-nowrap">
            {product.fabricSubtype}
          </Badge>
        )}
      </div>
      <p className="text-gray-700 whitespace-pre-line">{product.description}</p>
    </div>
  );
        }
