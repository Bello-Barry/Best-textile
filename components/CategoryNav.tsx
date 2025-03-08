"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Shirt, Sofa, Box } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { FABRIC_CONFIG, FabricType, getAllFabricTypes, isFabricType } from "@/types/fabric-config";

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
  gabardine: <Shirt className="h-4 w-4 mr-2" />,
  bazin: <Shirt className="h-4 w-4 mr-2" />,
  soie: <Shirt className="h-4 w-4 mr-2" />,
  velours: <Shirt className="h-4 w-4 mr-2" />,
  satin: <Shirt className="h-4 w-4 mr-2" />,
  kente: <Shirt className="h-4 w-4 mr-2" />,
  lin: <Shirt className="h-4 w-4 mr-2" />,
  mousseline: <Shirt className="h-4 w-4 mr-2" />,
  pagne: <Shirt className="h-4 w-4 mr-2" />,
  moustiquaire: <Shirt className="h-4 w-4 mr-2" />,
  brocart: <Shirt className="h-4 w-4 mr-2" />,
  bogolan: <Shirt className="h-4 w-4 mr-2" />,
  dashiki: <Shirt className="h-4 w-4 mr-2" />,
  adire: <Shirt className="h-4 w-4 mr-2" />,
  ankara: <Shirt className="h-4 w-4 mr-2" />,
  Dentelle: <Shirt className="h-4 w-4 mr-2" />,
  Accessoires: <Shirt className="h-4 w-4 mr-2" />,
  Super: <Shirt className="h-4 w-4 mr-2" />,
  tulle: <Shirt className="h-4 w-4 mr-2" />,
};

const CategoryNav = ({ products, selectedCategory, setSelectedCategory }: CategoryNavProps) => {
  const fabricTypes = useMemo(() => getAllFabricTypes(), []);

  // Catégories de base avec comptage
  const baseCategories = useMemo(() => [
    {
      id: "all",
      name: "Tous",
      icon: <Box className="h-4 w-4 mr-2" />,
      count: products.length,
    },
    ...fabricTypes.map((type) => ({
      id: type,
      name: FABRIC_CONFIG[type].name,
      icon: iconMap[type] || <Box className="h-4 w-4 mr-2" />,
      count: products.filter(p => p.metadata.fabricType === type).length,
    })),
    {
      id: "other",
      name: "Autres",
      icon: <Sofa className="h-4 w-4 mr-2" />,
      count: products.filter(p => !isFabricType(p.metadata.fabricType)).length,
    }
  ], [fabricTypes, products]);

  return (
    <div className="bg-background border-b sticky top-0 z-40">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between py-4 gap-4">
          {/* Liste horizontale défilable des catégories */}
          <ScrollArea orientation="horizontal" className="w-full">
            <div className="flex space-x-2 pb-2">
              {baseCategories.map((category) => (
                <Button
                  key={category.id}
                  variant={selectedCategory === category.id ? "secondary" : "ghost"}
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
        </div>
      </div>
    </div>
  );
};

export default CategoryNav;