"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Shirt,
  Sofa,
  Cylinder,
  Box,
  ListFilter,
  ChevronRight
} from "lucide-react";
import { Product } from "@/types/product";

interface CategoryNavProps {
  products: Product[];
  selectedCategory: string;
  setSelectedCategory: (category: string) => void;
}

const CategoryNav = ({
  products,
  selectedCategory,
  setSelectedCategory
}: CategoryNavProps) => {
  const [categories, setCategories] = useState([
    { 
      name: "Tous",
      icon: <Box className="h-5 w-5 mr-2" />,
      count: 0
    },
    {
      name: "Soie",
      icon: <Shirt className="h-5 w-5 mr-2" />,
      count: 0
    },
    {
      name: "Bazin",
      icon: <Cylinder className="h-5 w-5 mr-2" />,
      count: 0
    },
    {
      name: "Autre",
      icon: <Sofa className="h-5 w-5 mr-2" />,
      count: 0
    }
  ]);

  useEffect(() => {
    const updatedCategories = categories.map(cat => ({
      ...cat,
      count: cat.name === "Tous" 
        ? products.length 
        : products.filter(p => p.metadata.fabricType === cat.name).length
    }));
    setCategories(updatedCategories);
  }, [products]);

  return (
    <div className="bg-white shadow-sm border-b">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between py-4">
          <ScrollArea className="whitespace-nowrap pb-2">
            <div className="flex space-x-4">
              {categories.map((category) => (
                <Button
                  key={category.name}
                  variant={selectedCategory === category.name ? "default" : "ghost"}
                  className={`rounded-full px-6 py-2 flex items-center ${
                    selectedCategory === category.name 
                      ? "bg-primary text-white" 
                      : "hover:bg-gray-100"
                  }`}
                  onClick={() => setSelectedCategory(category.name)}
                >
                  {category.icon}
                  {category.name}
                  <span className="ml-2 bg-white/10 px-2 py-1 rounded-full text-sm">
                    {category.count}
                  </span>
                </Button>
              ))}
            </div>
          </ScrollArea>
          
          <div className="flex items-center space-x-4 pl-6 border-l">
            <Button variant="ghost" className="flex items-center">
              <ListFilter className="h-5 w-5 mr-2" />
              Filtres
              <ChevronRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CategoryNav;
