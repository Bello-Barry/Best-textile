// components/home/hero.tsx
import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";

export function Hero() {
  return (
    <div className="relative h-[600px] bg-primary/5">
      <div className="container mx-auto px-4 h-full flex items-center">
        <div className="max-w-xl space-y-6">
          <h1 className="text-5xl font-bold">
            Découvrez nos Tissus Africains Authentiques
          </h1>
          <p className="text-xl text-gray-600">
            Une collection unique de tissus traditionnels : Wax, Kente, Bazin et
            plus encore.
          </p>
          <Button size="lg" asChild>
            <Link href="/products">Explorer la Collection</Link>
          </Button>
        </div>
      </div>
      <Image
        src="/api/placeholder/800/600"
        alt="Tissus africains colorés"
        fill
        className="object-cover object-center opacity-20"
        priority
      />
    </div>
  );
}
