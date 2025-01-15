export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  images: string[];
  type: "soie" | "bazin" | "autre";
  subtype?: "soie fleuri" | "soie plissé" | "bazin riche" | "getzner";
}
