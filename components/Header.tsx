"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/hooks/useCart";
import { ShoppingCart } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function Header() {
  const { user, logout } = useAuth();
  const { cartItems } = useCart();

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
              <Link href="/auth/login">
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
