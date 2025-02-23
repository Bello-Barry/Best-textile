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
        if (!file.type.startsWith("image/")) {
          toast.error(`${file.name} n'est pas une image valide`);
          continue;
        }

        if (file.size > 5 * 1024 * 1024) {
          toast.error(`${file.name} dépasse 5MB`);
          continue;
        }

        const fileExt = file.name.split(".").pop();
        const fileName = `${Math.random().toString(36)}-${Date.now()}.${fileExt}`;
        
        const { data, error } = await supabase.storage
          .from(bucket)
          .upload(fileName, file);

        if (error) throw error;

        const { data: { publicUrl } } = supabase.storage
          .from(bucket)
          .getPublicUrl(data.path);

        newUrls.push(publicUrl);
      }

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
      event.target.value = "";
    }
  };

  const handleDelete = async (url: string) => {
    try {
      const fileName = url.split("/").pop()?.split("?")[0];
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
      <div className="flex items-center justify-center w-full">
        <label className={`
          flex flex-col items-center justify-center w-full h-32 border-2 border-dashed
          rounded-xl cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors
          ${isUploading ? "opacity-50 pointer-events-none" : ""}
          ${imageUrls.length >= maxFiles ? "border-green-500 bg-green-50" : "border-gray-300"}
        `}>
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
            <p className="mb-2 text-sm text-gray-500 text-center">
              <span className="font-semibold">Cliquez pour télécharger</span><br />
              <span className="text-xs">ou glissez-déposez vos images</span>
            </p>
            <p className="text-xs text-gray-500">
              {maxFiles - imageUrls.length} emplacement(s) restant(s)
            </p>
          </div>
          <input
            type="file"
            className="hidden"
            multiple
            accept="image/png, image/jpeg, image/webp"
            onChange={handleFileSelect}
            disabled={isUploading || imageUrls.length >= maxFiles}
          />
        </label>
      </div>

      {isUploading && (
        <div className="text-center p-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-2 text-sm text-gray-600">
            Téléchargement en cours...
          </p>
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {imageUrls.map((url) => (
          <div key={url} className="relative group aspect-square rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
            <Image
              src={url}
              alt="Preview"
              fill
              className="object-cover"
              sizes="(max-width: 640px) 50vw, 33vw"
            />
            <button
              onClick={() => handleDelete(url)}
              className="absolute top-2 right-2 p-1.5 bg-red-500/90 hover:bg-red-600 text-white rounded-full backdrop-blur-sm transition-all"
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

      {imageUrls.length === 0 && !isUploading && (
        <div className="text-center text-gray-400 text-sm py-4">
          Aucune image sélectionnée
        </div>
      )}
    </div>
  );
          }
