import { create } from "zustand";

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  images: string[];
  metadata: {
    fabricType: string;
    fabricSubtype: string;
    unit: "mètre" | "rouleau";
  };
}

interface CartState {
  cartItems: CartItem[];
  addToCart: (item: CartItem) => void;
  removeFromCart: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
}

export const useCartStore = create<CartState>((set) => ({
  cartItems: [],
  
  addToCart: (item) =>
    set((state) => {
      const existingItem = state.cartItems.find((i) => i.id === item.id);
      
      if (existingItem) {
        return {
          cartItems: state.cartItems.map((i) =>
            i.id === item.id 
              ? { ...i, quantity: i.quantity + item.quantity }
              : i
          )
        };
      }
      return { cartItems: [...state.cartItems, item] };
    }),

  removeFromCart: (id) =>
    set((state) => ({
      cartItems: state.cartItems.filter((item) => item.id !== id),
    })),

  updateQuantity: (id, quantity) =>
    set((state) => ({
      cartItems: state.cartItems.map((item) =>
        item.id === id ? { ...item, quantity } : item
      ),
    })),

  clearCart: () => set({ cartItems: [] }),
}));
