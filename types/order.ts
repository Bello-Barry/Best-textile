export interface Order {
  id: string;
  clientId: string;
  items: { productId: string; quantity: number }[];
  total: number;
  status: "pending" | "validated" | "shipped";
  deliveryAddress: string;
  phone: string;
  paymentMethod: "online" | "onplace";
}
