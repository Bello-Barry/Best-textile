"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
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

const ModeToggle = dynamic(() => import("@/components/mode-toggle"), {
  ssr: false,
  loading: () => (
    <div className="w-9 h-9 rounded-full bg-muted animate-pulse" />
  ),
});

export default function Header() {
  const { user, logout, fetchUser } = useAuthStore();
  const cartItems = useCartStore((state) => state.cartItems);
  const [mounted, setMounted] = useState(false);
  const [cartCount, setCartCount] = useState(0);

  useEffect(() => {
    setMounted(true);
    fetchUser();
  }, [fetchUser]);

  useEffect(() => {
    setCartCount(cartItems.length);
  }, [cartItems]);

  if (!mounted) return null;

  return (
    <header className="bg-background border-b">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <Link
            href="/"
            className="text-xl font-bold text-foreground hover:opacity-80 transition-opacity"
          >
            mbaka-textil
          </Link>
        </div>

        <div className="flex items-center gap-4">
          <ModeToggle />

          <nav className="flex items-center gap-4">
            {user ? (
              <>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="text-foreground">
                      {user.name}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="min-w-[200px]">
                    <DropdownMenuItem asChild>
                      <Link href="/profile" className="cursor-pointer">
                        Mon Compte
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={logout}
                      className="cursor-pointer text-destructive"
                    >
                      Déconnexion
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                <Link
                  href="/cart"
                  className="relative p-2 text-foreground hover:text-primary transition-colors"
                >
                  <ShoppingCart className="w-6 h-6" />
                  {cartCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground rounded-full w-5 h-5 flex items-center justify-center text-xs">
                      {cartCount}
                    </span>
                  )}
                </Link>
              </>
            ) : (
              <Link href="/auth/login">
                <Button variant="outline" className="text-foreground">
                  Connexion
                </Button>
              </Link>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
}
