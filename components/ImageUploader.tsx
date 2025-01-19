"use client";

import { useEffect, useState } from "react";
import { Widget } from "@uploadcare/react-widget";
import { toast } from "react-toastify";

interface ImageUploaderProps {
  onUpload: (urls: string[]) => void;
}

export default function ImageUploader({ onUpload }: ImageUploaderProps) {
  const [imageUrls, setImageUrls] = useState<string[]>([]);

  const validateUrl = (url: string): boolean => {
    try {
      new URL(url);
      return true;
    } catch (e) {
      console.error('URL invalide:', url);
      return false;
    }
  };

  const handleUpload = (fileInfo: any) => {
    if (fileInfo) {
      try {
        // Gestion d'un seul fichier
        if (fileInfo.cdnUrl) {
          if (validateUrl(fileInfo.cdnUrl)) {
            const url = fileInfo.cdnUrl;
            setImageUrls([url]);
            onUpload([url]);
          } else {
            toast.error("L'URL de l'image est invalide");
          }
        } 
        // Gestion de plusieurs fichiers
        else if (fileInfo.files) {
          const validUrls = fileInfo.files
            .map((file: any) => {
              if (validateUrl(file.cdnUrl)) {
                return file.cdnUrl;
              }
              console.error('URL invalide ignorée:', file.cdnUrl);
              return null;
            })
            .filter(Boolean);

          if (validUrls.length > 0) {
            setImageUrls(validUrls);
            onUpload(validUrls);
          } else {
            toast.error("Aucune URL d'image valide n'a été trouvée");
          }
        }
      } catch (error) {
        console.error('Erreur lors du traitement des images:', error);
        toast.error('Erreur lors du traitement des images');
      }
    }
  };

  const publicKey = process.env.NEXT_PUBLIC_UPLOADCARE_PUBLIC_KEY;

  if (!publicKey) {
    console.error('Clé publique UploadCare manquante');
    return <div>Erreur de configuration UploadCare</div>;
  }

  return (
    <div>
      <Widget
        publicKey={publicKey}
        onChange={handleUpload}
        multiple
        tabs="file camera url facebook gdrive gphotos"
        clearable
        preloader={null}
        onError={(error) => {
          console.error('Erreur UploadCare:', error);
          toast.error('Erreur lors du téléchargement des images');
        }}
      />
      <div className="mt-4 grid grid-cols-3 gap-2">
        {imageUrls.map((url, index) => (
          <div key={index} className="relative">
            <img
              src={url}
              alt={`Uploaded ${index + 1}`}
              className="w-24 h-24 object-cover rounded-lg"
              onError={() => {
                console.error(`Erreur de chargement pour l'image ${index + 1}`);
                const newUrls = imageUrls.filter((_, i) => i !== index);
                setImageUrls(newUrls);
                onUpload(newUrls);
              }}
            />
          </div>
        ))}
      </div>
    </div>
  );
}