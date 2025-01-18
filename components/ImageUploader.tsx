"use client";

import { useEffect, useState } from "react";
import { Widget } from "@uploadcare/react-widget";

interface ImageUploaderProps {
  onUpload: (urls: string[]) => void;
}

export default function ImageUploader({ onUpload }: ImageUploaderProps) {
  const [imageUrls, setImageUrls] = useState<string[]>([]);

  const handleUpload = (fileInfo: any) => {
    if (fileInfo) {
      // Si c'est un seul fichier
      if (fileInfo.cdnUrl) {
        setImageUrls([fileInfo.cdnUrl]);
        onUpload([fileInfo.cdnUrl]);
      } 
      // Si c'est multiple fichiers
      else if (fileInfo.files) {
        const urls = fileInfo.files.map((file: any) => file.cdnUrl);
        setImageUrls(urls);
        onUpload(urls);
      }
    }
  };

  const publicKey = process.env.NEXT_PUBLIC_UPLOADCARE_PUBLIC_KEY;

  return (
    <div>
      <Widget
        publicKey={publicKey || ''}
        onChange={handleUpload}
        multiple
        tabs="file camera url facebook gdrive gphotos"
        clearable
        preloader={null}
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