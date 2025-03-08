"use client";

import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Shirt,
  Sofa,
  Cylinder,
  Box,
  ListFilter,
  ChevronRight,
  Factory,
  Grid,
  Zap,
  Scissors,
  Gift,
  Feather,
  Cloud,
} from "lucide-react";
import {
  FABRIC_CONFIG,
  FabricType,
  getAllFabricTypes,
  isFabricType,
} from "@/types/fabric-config";

// Interface pour les propriétés du composant
interface CategoryNavProps {
  products: Product[];
  selectedCategory: string;
  setSelectedCategory: (category: string) => void;
}

// Interface pour le type Product
interface Product {
  id: string;
  name: string;
  metadata: {
    fabricType: string;
    fabricSubtype?: string;
    unit?: string;
  };
  // Ajoutez d'autres propriétés si nécessaire
}

// Mapping des icônes
const iconMap: Record<FabricType, React.ReactNode> = {
  gabardine: <Factory className="h-5 w-5 mr-2" />,
  bazin: <Cylinder className="h-5 w-5 mr-2" />,
  soie: <Shirt className="h-5 w-5 mr-2" />,
  velours: <Grid className="h-5 w-5 mr-2" />,
  satin: <Zap className="h-5 w-5 mr-2" />,
  kente: <Scissors className="h-5 w-5 mr-2" />,
  lin: <Feather className="h-5 w-5 mr-2" />,
  mousseline: <Cloud className="h-5 w-5 mr-2" />,
  pagne: <Gift className="h-5 w-5 mr-2" />,
  moustiquaire: <Grid className="h-5 w-5 mr-2" />,
  brocart: <Shirt className="h-5 w-5 mr-2" />,
  bogolan: <Scissors className="h-5 w-5 mr-2" />,
  dashiki: <Shirt className="h-5 w-5 mr-2" />,
  adire: <Grid className="h-5 w-5 mr-2" />,
  ankara: <Gift className="h-5 w-5 mr-2" />,
  Dentelle: <Feather className="h-5 w-5 mr-2" />,
  Accessoires: <Cloud className="h-5 w-5 mr-2" />,
Super: <Shirt className="h-5 w-5 mr-2" />,
tulle: <Gift className="h-5 w-5 mr-2" />,
};

const CategoryNav = ({
  products,
  selectedCategory,
  setSelectedCategory,
}: CategoryNavProps) => {
  const fabricTypes = useMemo(() => getAllFabricTypes(), []);

  const baseCategories = useMemo(
    () => [
      {
        id: "all",
        name: "Tous les tissus",
        icon: <Box className="h-5 w-5 mr-2" />,
        count: products.length,
      },
      ...fabricTypes.map((type) => ({
        id: type,
        name: FABRIC_CONFIG[type].name,
        icon: iconMap[type] || <Box className="h-5 w-5 mr-2" />,
        count: 0,
      })),
      {
        id: "other",
        name: "Autres textiles",
        icon: <Sofa className="h-5 w-5 mr-2" />,
        count: 0,
      },
    ],
    [fabricTypes, products.length]
  );

  const [categories, setCategories] = useState(baseCategories);

  useEffect(() => {
    const updated = baseCategories.map((cat) => {
      if (cat.id === "all") return { ...cat, count: products.length };
      if (cat.id === "other") {
        return {
          ...cat,
          count: products.filter((p) => !isFabricType(p.metadata.fabricType))
            .length,
        };
      }
      return {
        ...cat,
        count: products.filter((p) => p.metadata.fabricType === cat.id).length,
      };
    });

    setCategories(updated);
  }, [products, baseCategories]);

  return (
    <div className="bg-background border-b">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between py-4">
          <ScrollArea className="whitespace-nowrap pb-2">
            <div className="flex space-x-4">
              {categories.map((category) => (
                <Button
                  key={category.id}
                  variant={
                    selectedCategory === category.id ? "secondary" : "ghost"
                  }
                  className={`rounded-full px-6 py-2 flex items-center transition-colors ${
                    selectedCategory === category.id
                      ? "bg-primary/10 text-primary hover:bg-primary/20"
                      : "hover:bg-gray-100 dark:hover:bg-gray-800"
                  }`}
                  onClick={() => setSelectedCategory(category.id)}
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

          <div className="flex items-center space-x-4 pl-6 border-l">
            <Button
              variant="ghost"
              className="flex items-center dark:hover:bg-gray-800"
            >
              <ListFilter className="h-5 w-5 mr-2" />
              Filtres avancés
              <ChevronRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CategoryNav;