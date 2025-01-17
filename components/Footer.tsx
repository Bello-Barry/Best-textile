import { Facebook, Instagram, Twitter } from "lucide-react";
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-gray-800 text-white py-8">
      <div className="container mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
        <div>
          <h3 className="text-xl font-bold mb-4">Ma Boutique de Tissus</h3>
          <p className="text-gray-400">
            Votre destination pour les tissus de qualité. Découvrez notre
            collection unique.
          </p>
        </div>
        <div>
          <h3 className="text-xl font-bold mb-4">Liens Utiles</h3>
          <ul className="space-y-2">
            <li>
              <Link href="/" className="text-gray-400 hover:text-white">
                Accueil
              </Link>
            </li>
            <li>
              <Link href="/products" className="text-gray-400 hover:text-white">
                Produits
              </Link>
            </li>
            <li>
              <Link href="/contact" className="text-gray-400 hover:text-white">
                Contact
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <h3 className="text-xl font-bold mb-4">Suivez-nous</h3>
          <div className="flex gap-4">
            <a href="#" className="text-gray-400 hover:text-white">
              <Facebook className="w-6 h-6" />
            </a>
            <a href="#" className="text-gray-400 hover:text-white">
              <Instagram className="w-6 h-6" />
            </a>
            <a href="#" className="text-gray-400 hover:text-white">
              <Twitter className="w-6 h-6" />
            </a>
          </div>
        </div>
      </div>
      <div className="text-center mt-8 border-t border-gray-700 pt-4">
        <p>
          &copy; {new Date().getFullYear()} Ma Boutique de Tissus. Tous droits
          réservés.
        </p>
      </div>
    </footer>
  );
}
