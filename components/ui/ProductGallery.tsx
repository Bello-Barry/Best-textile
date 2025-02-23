"use client";

import { useState } from "react";
import Image from "next/image";

interface ProductGalleryProps {
  images: string[];
  alt: string; // Rendons la prop alt optionnelle avec une valeur par défaut
}

export default function ProductGallery({ images, alt = "Gallery produit" }: ProductGalleryProps) {
  const [selectedImage, setSelectedImage] = useState(images[0]);

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-full h-64 rounded-lg border overflow-hidden">
        <Image
          src={selectedImage}
          alt={alt}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, 80vw"
          priority
          quality={85}
        />
      </div>
      
      <div className="flex gap-2 mt-2 overflow-x-auto pb-2">
        {images.map((image, index) => (
          <div 
            key={index}
            className={`relative w-16 h-16 shrink-0 rounded border cursor-pointer transition-all ${
              selectedImage === image 
                ? "border-2 border-primary" 
                : "border-gray-300 hover:border-gray-400"
            }`}
            onClick={() => setSelectedImage(image)}
          >
            <Image
              src={image}
              alt={`${alt} - Vue ${index + 1}`}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 64px, 96px"
              quality={60}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
