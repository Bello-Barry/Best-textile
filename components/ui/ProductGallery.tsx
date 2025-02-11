"use client";

import { useState } from "react";

interface ProductGalleryProps {
  images: string[];
}

export default function ProductGallery({ images }: ProductGalleryProps) {
  const [selectedImage, setSelectedImage] = useState(images[0]);

  return (
    <div className="flex flex-col items-center">
      <img
        src={selectedImage}
        alt="Produit"
        className="w-full h-64 object-cover rounded-lg border"
      />
      <div className="flex gap-2 mt-2 overflow-x-auto">
        {images.map((image, index) => (
          <img
            key={index}
            src={image}
            alt="Miniature"
            className={`w-16 h-16 object-cover rounded border cursor-pointer ${
              selectedImage === image ? "border-primary" : "border-gray-300"
            }`}
            onClick={() => setSelectedImage(image)}
          />
        ))}
      </div>
    </div>
  );
}