export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  images: string[];
  fabricType: string;
  fabricSubtype?: string;
  unit: "mètre" | "rouleau";
  created_at?: string;
}
