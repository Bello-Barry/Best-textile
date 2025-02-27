export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  images: string[];
  metadata: {
    fabricType: string;
    fabricSubtype: string;
    unit: "mètre" | "rouleau";
  };
  created_at?: string;
}

export interface Category {
  name: string;
  image: string;
  count: number;
}