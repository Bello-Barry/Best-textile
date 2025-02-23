// types/product.ts
export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  fabricType: string;
  fabricSubtype?: string;
  unit: "mètre" | "rouleau";
  images: string[];
}
