export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  images: string[];
  fabricType: string;
  unit: "mètre" | "rouleau";
  type?: string; // Ancienne propriété optionnelle
  subtype?: string;
  created_at?: string;
}
