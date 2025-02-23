// components/ImageUploader.tsx
"use client";

import { useState } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { toast } from "react-toastify";
import Image from "next/image";

interface ImageUploaderProps {
  onUpload: (urls: string[]) => void;
  bucket?: string;
  maxFiles?: number;
}

export default function ImageUploader({
  onUpload,
  bucket = "images",
  maxFiles = 5,
}: ImageUploaderProps) {
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const supabase = createClientComponentClient();

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    if (imageUrls.length + files.length > maxFiles) {
      toast.error(`Maximum ${maxFiles} images autorisées`);
      return;
    }

    setIsUploading(true);
    const newUrls: string[] = [];

    try {
      for (const file of Array.from(files)) {
        // Vérification du type et taille
        if (!file.type.startsWith("image/")) {
          toast.error(`${file.name} n'est pas une image valide`);
          continue;
        }

        if (file.size > 5 * 1024 * 1024) {
          toast.error(`${file.name} dépasse 5MB`);
          continue;
        }

        // Upload vers Supabase
        const fileExt = file.name.split(".").pop();
        const fileName = `${Math.random().toString(36)}-${Date.now()}.${fileExt}`;
        
        const { data, error } = await supabase.storage
          .from(bucket)
          .upload(fileName, file);

        if (error) throw error;

        // Récupération URL publique
        const { data: { publicUrl } } = supabase.storage
          .from(bucket)
          .getPublicUrl(data.path);

        newUrls.push(publicUrl);
      }

      // Mise à jour des URLs
      const updatedUrls = [...imageUrls, ...newUrls];
      setImageUrls(updatedUrls);
      onUpload(updatedUrls);
      
      if (newUrls.length > 0) {
        toast.success(`${newUrls.length} image(s) téléchargée(s)`);
      }
    } catch (error) {
      toast.error("Erreur lors de l'upload");
      console.error(error);
    } finally {
      setIsUploading(false);
      event.target.value = ""; // Réinitialise l'input
    }
  };

  const handleDelete = async (url: string) => {
    try {
      const fileName = url.split("/").pop()?.split("?")[0]; // Supprime les query params
      if (!fileName) return;

      const { error } = await supabase.storage
        .from(bucket)
        .remove([fileName]);

      if (error) throw error;

      setImageUrls(prev => prev.filter(u => u !== url));
      onUpload(imageUrls.filter(u => u !== url));
      toast.success("Image supprimée");
    } catch (error) {
      toast.error("Erreur de suppression");
      console.error(error);
    }
  };

  return (
    <div className="w-full space-y-4">
      {/* ... (reste du JSX inchangé) */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {imageUrls.map((url) => (
          <div key={url} className="relative group aspect-square">
            <Image
              src={url}
              alt="Preview"
              fill
              className="object-cover rounded-lg"
              sizes="(max-width: 768px) 100vw, 50vw"
            />
            {/* Bouton de suppression */}
          </div>
        ))}
      </div>
    </div>
  );
    }
