"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/store/authStore";
import { useCartStore } from "@/store/cartStore";
import { ShoppingCart } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useEffect, useState } from "react";

export default function Header() {
  const { user, logout, fetchUser } = useAuthStore();
  const cartItems = useCartStore((state) => state.cartItems);
  const [cartCount, setCartCount] = useState(0);

  // Récupérer l'utilisateur au chargement du composant
  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  // Mettre à jour le compteur du panier
  useEffect(() => {
    setCartCount(cartItems.length);
  }, [cartItems]);

  return (
    <header className="bg-white shadow">
      <div className="container mx-auto p-4 flex justify-between items-center">
        <Link href="/" className="text-xl font-bold">
          Bienvenue sur le site de Best-textil 
        </Link>
        <nav className="flex gap-4 items-center">
          {user ? (
            <>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline">{user.name}</Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem>
                    <Link href="/profiles">Mon Compte</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={logout}>
                    Déconnexion
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <Link href="/cart" className="relative p-2">
                <ShoppingCart className="w-6 h-6" />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
                    {cartCount}
                  </span>
                )}
              </Link>
            </>
          ) : (
            <>
              <Link href="/auth/logins">
                <Button variant="outline">Connexion</Button>
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}