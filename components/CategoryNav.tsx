"use client";

import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Shirt,
  Sofa,
  Box,
  ListFilter,
  ChevronRight,
  X,
} from "lucide-react";
import {
  FABRIC_CONFIG,
  FabricType,
  getAllFabricTypes,
  isFabricType,
} from "@/types/fabric-config";
import { Drawer, DrawerContent, DrawerTrigger } from "@/components/ui/drawer";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

interface CategoryNavProps {
  products: Product[];
  selectedCategory: string;
  setSelectedCategory: (category: string) => void;
}

interface Product {
  id: string;
  name: string;
  metadata: {
    fabricType: string;
    fabricSubtype?: string;
    unit?: string;
  };
}

const iconMap: Record<FabricType, React.ReactNode> = {
  // ... (votre mapping d'icônes existant)
};

const CategoryNav = ({
  products,
  selectedCategory,
  setSelectedCategory,
}: CategoryNavProps) => {
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const fabricTypes = useMemo(() => getAllFabricTypes(), []);

  // Catégories de base avec comptage
  const baseCategories = useMemo(() => [
    {
      id: "all",
      name: "Tous",
      icon: <Box className="h-5 w-5 mr-2" />,
      count: products.length,
    },
    ...fabricTypes.map((type) => ({
      id: type,
      name: FABRIC_CONFIG[type].name,
      icon: iconMap[type] || <Box className="h-5 w-5 mr-2" />,
      count: products.filter(p => p.metadata.fabricType === type).length,
    })),
    {
      id: "other",
      name: "Autres",
      icon: <Sofa className="h-5 w-5 mr-2" />,
      count: products.filter(p => !isFabricType(p.metadata.fabricType)).length,
    }
  ], [fabricTypes, products]);

  // Filtrage des catégories
  const filteredCategories = useMemo(() => {
    if (!searchTerm) return baseCategories;
    return baseCategories.filter(cat =>
      cat.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [baseCategories, searchTerm]);

  return (
    <div className="bg-background border-b sticky top-0 z-40">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between py-4 gap-4">
          {/* Filtres mobiles */}
          <Drawer open={isFilterOpen} onOpenChange={setIsFilterOpen}>
            <DrawerTrigger asChild>
              <Button variant="outline" size="sm" className="md:hidden">
                <ListFilter className="h-4 w-4 mr-2" />
                Filtres
              </Button>
            </DrawerTrigger>
            
            <DrawerContent>
              <div className="p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Filtres</h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsFilterOpen(false)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>

                <Input
                  placeholder="Rechercher une catégorie..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />

                <div className="grid grid-cols-2 gap-2">
                  {filteredCategories.map((category) => (
                    <Button
                      key={category.id}
                      variant={
                        selectedCategory === category.id ? "default" : "outline"
                      }
                      className="flex-col h-auto py-3"
                      onClick={() => {
                        setSelectedCategory(category.id);
                        setIsFilterOpen(false);
                      }}
                    >
                      <div className="flex items-center">
                        {category.icon}
                        {category.name}
                      </div>
                      <Badge variant="secondary" className="mt-1">
                        {category.count}
                      </Badge>
                    </Button>
                  ))}
                </div>
              </div>
            </DrawerContent>
          </Drawer>

          {/* Filtres desktop */}
          <ScrollArea className="hidden md:block flex-1">
            <div className="flex space-x-2 pb-2">
              {baseCategories.map((category) => (
                <Button
                  key={category.id}
                  variant={
                    selectedCategory === category.id ? "secondary" : "ghost"
                  }
                  className={`rounded-full px-4 py-2 flex items-center ${
                    category.count === 0 ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                  onClick={() => category.count > 0 && setSelectedCategory(category.id)}
                  disabled={category.count === 0}
                >
                  {category.icon}
                  {category.name}
                  <span className="ml-2 bg-primary/10 px-2 py-1 rounded-full text-sm text-primary">
                    {category.count}
                  </span>
                </Button>
              ))}
            </div>
          </ScrollArea>

          {/* Filtres avancés (desktop) */}
          <Button
            variant="ghost"
            className="hidden md:flex items-center"
            onClick={() => console.log("Filtres avancés")}
          >
            <ListFilter className="h-5 w-5 mr-2" />
            Filtres avancés
            <ChevronRight className="h-4 w-4 ml-2" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CategoryNav;