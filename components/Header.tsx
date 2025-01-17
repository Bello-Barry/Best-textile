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
import { useEffect } from "react";

export default function Header() {
  const { user, logout, fetchUser } = useAuthStore();
  const { cartItems } = useCartStore();

  // Récupérer l'utilisateur au chargement du composant
  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  return (
    <header className="bg-white shadow">
      <div className="container mx-auto p-4 flex justify-between items-center">
        <Link href="/" className="text-xl font-bold">
          Ma Boutique de Tissus
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
                    <Link href="/account">Mon Compte</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={logout}>
                    Déconnexion
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <Link href="/cart" className="relative">
                <ShoppingCart className="w-6 h-6" />
                {cartItems.length > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full px-2 text-xs">
                    {cartItems.length}
                  </span>
                )}
              </Link>
            </>
          ) : (
            <>
              <Link href="/auth/logins">
                <Button variant="outline">Connexion</Button>
              </Link>
              <Link href="/auth/register">
                <Button>Inscription</Button>
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
