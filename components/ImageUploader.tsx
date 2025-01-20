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

  const handleFileSelect = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const files = event.target.files;
    if (!files) return;

    if (files.length > maxFiles) {
      toast.error(`Vous ne pouvez télécharger que ${maxFiles} images maximum`);
      return;
    }

    setIsUploading(true);
    const newUrls: string[] = [];

    try {
      for (const file of files) {
        // Vérification du type de fichier
        if (!file.type.startsWith("image/")) {
          toast.error(`${file.name} n'est pas une image`);
          continue;
        }

        // Vérification de la taille (5MB max)
        if (file.size > 5 * 1024 * 1024) {
          toast.error(`${file.name} est trop volumineux (max 5MB)`);
          continue;
        }

        // Création d'un nom de fichier unique
        const fileExt = file.name.split(".").pop();
        const fileName = `${Math.random()
          .toString(36)
          .substring(2)}-${Date.now()}.${fileExt}`;

        // Upload vers Supabase Storage
        const { data, error } = await supabase.storage
          .from(bucket)
          .upload(fileName, file, {
            cacheControl: "3600",
            upsert: false,
          });

        if (error) {
          console.error("Erreur upload:", error.message);
          toast.error(`Erreur lors du téléchargement de ${file.name}`);
          continue;
        }

        // Récupération de l'URL publique
        const {
          data: { publicUrl },
        } = supabase.storage.from(bucket).getPublicUrl(data.path);

        newUrls.push(publicUrl);
      }

      if (newUrls.length > 0) {
        setImageUrls((prevUrls) => [...prevUrls, ...newUrls]);
        onUpload(newUrls);
        toast.success("Images téléchargées avec succès");
      }
    } catch (error) {
      console.error("Erreur:", error);
      toast.error("Une erreur est survenue lors du téléchargement");
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async (urlToDelete: string) => {
    try {
      // Extraction du nom du fichier de l'URL
      const fileName = urlToDelete.split("/").pop();
      if (!fileName) return;

      const { error } = await supabase.storage.from(bucket).remove([fileName]);

      if (error) throw error;

      // Mise à jour de l'état local
      const newUrls = imageUrls.filter((url) => url !== urlToDelete);
      setImageUrls(newUrls);
      onUpload(newUrls);
      toast.success("Image supprimée");
    } catch (error) {
      console.error("Erreur suppression:", error);
      toast.error("Erreur lors de la suppression");
    }
  };

  return (
    <div className="w-full space-y-4">
      <div className="flex items-center justify-center w-full">
        <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
          <div className="flex flex-col items-center justify-center pt-5 pb-6">
            <svg
              className="w-8 h-8 mb-4 text-gray-500"
              aria-hidden="true"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 20 16"
            >
              <path
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"
              />
            </svg>
            <p className="mb-2 text-sm text-gray-500">
              <span className="font-semibold">Cliquez pour télécharger</span> ou
              glissez-déposez
            </p>
            <p className="text-xs text-gray-500">PNG, JPG ou GIF (Max: 5MB)</p>
          </div>
          <input
            type="file"
            className="hidden"
            multiple
            accept="image/*"
            onChange={handleFileSelect}
            disabled={isUploading}
          />
        </label>
      </div>

      {isUploading && (
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-2 text-sm text-gray-600">
            Téléchargement en cours...
          </p>
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {imageUrls.map((url, index) => (
          <div key={url} className="relative group">
            <div className="aspect-square relative overflow-hidden rounded-lg">
              <Image
                src={url}
                alt={`Image ${index + 1}`}
                fill
                className="object-cover"
              />
            </div>
            <button
              onClick={() => handleDelete(url)}
              className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
