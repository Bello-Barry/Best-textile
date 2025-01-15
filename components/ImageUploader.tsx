"use client";

import { useEffect, useState } from "react";
import { UploadWidget } from "@uploadcare/react-widget";

interface ImageUploaderProps {
  onUpload: (urls: string[]) => void;
}

export default function ImageUploader({ onUpload }: ImageUploaderProps) {
  const [imageUrls, setImageUrls] = useState<string[]>([]);

  const handleUpload = (files: any) => {
    const urls = files.map((file: any) => file.cdnUrl);
    setImageUrls(urls);
    onUpload(urls);
  };

  return (
    <div>
      <UploadWidget
        publicKey="votre_cle_publique_uploadcare" // Remplacez par votre clé publique Uploadcare
        onChange={handleUpload}
      />
      <div className="mt-4 grid grid-cols-3 gap-2">
        {imageUrls.map((url, index) => (
          <img
            key={index}
            src={url}
            alt={`Uploaded ${index + 1}`}
            className="w-24 h-24 object-cover rounded-lg"
          />
        ))}
      </div>
    </div>
  );
}
