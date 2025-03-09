// app/galerie/page.tsx
"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/lib/supabaseClient";
import { Loader2 } from "lucide-react";
import { toast } from "react-toastify";

export interface FabricDesign {
  id: string;
  image_url: string;
  description: string;
  price: number;
  metadata: {
    fabricType: string;
    tags: string[];
  };
}

export default function GalleryPage() {
  const [designs, setDesigns] = useState<FabricDesign[]>([]);
  const [selectedDesigns, setSelectedDesigns] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);

  // Charger les designs
  useEffect(() => {
    const loadDesigns = async () => {
      try {
        const { data, error } = await supabase
          .from("fabric_designs")
          .select("*")
          .order("created_at", { ascending: false });

        if (error) throw error;
        setDesigns(data || []);
      } catch (error) {
        console.error("Erreur chargement:", error);
        toast.error("Erreur lors du chargement des designs");
      } finally {
        setLoading(false);
      }
    };

    loadDesigns();
  }, []);

  // Upload de fichier client
  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);

    try {
      // Vérification du type de fichier
      if (!file.type.startsWith("image/")) {
        throw new Error("Type de fichier non supporté");
      }

      // Génération d'un nom de fichier unique
      const fileExt = file.name.split(".").pop();
      const fileName = `${Date.now()}-${Math.random()
        .toString(36)
        .substring(2, 9)}.${fileExt}`;

      // Upload vers Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("client_designs")
        .upload(fileName, file, {
          cacheControl: "3600",
          upsert: false,
        });

      if (uploadError) throw uploadError;

      // Construction de l'URL publique
      const { data: publicUrlData } = supabase.storage
        .from("client_designs")
        .getPublicUrl(fileName);

      // Ajouter à la base de données
      const { data: dbData, error: dbError } = await supabase
        .from("fabric_designs")
        .insert([
          {
            image_url: publicUrlData?.publicUrl || "",
            description: "Design client",
            metadata: { fabricType: "client", tags: [] },
          },
        ])
        .select("*");

      if (dbError) throw dbError;

      // Mettre à jour l'état local
      if (dbData?.[0]) {
        setDesigns((prev) => [dbData[0], ...prev]);
        toast.success("Design uploadé avec succès !");
      }
    } catch (error) {
      console.error("Erreur upload:", error);
      toast.error(
        `Échec de l'upload: ${
          error instanceof Error ? error.message : "Erreur inconnue"
        }`
      );
    } finally {
      setUploading(false);
    }
  };

  // Partage WhatsApp
  const shareOnWhatsApp = () => {
    const selected = designs.filter((d) => selectedDesigns.includes(d.id));
    const message = `Bonjour! Je suis intéressé par ces modèles :\n\n${selected
      .map((d) => `- ${d.description} (${d.price.toFixed(2)} XOF)`)
      .join("\n")}\n\nMerci de me contacter pour confirmation.`;

    window.open(
      `https://wa.me/${
        process.env.NEXT_PUBLIC_WHATSAPP_NUMBER
      }?text=${encodeURIComponent(message)}`,
      "_blank"
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="h-12 w-12 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <div className="mb-8 flex flex-col md:flex-row gap-4 items-center">
        <Input
          placeholder="Rechercher par type (soie, coton...)"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-xl"
        />

        <label className="cursor-pointer border p-2 rounded-lg bg-white hover:bg-gray-50 transition-colors">
          <span className="flex items-center gap-2">
            {uploading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              "📤 Ajouter mon modèle"
            )}
            <input
              type="file"
              accept="image/*"
              onChange={handleUpload}
              disabled={uploading}
              className="hidden"
            />
          </span>
        </label>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {designs
          .filter(
            (design) =>
              design.metadata.fabricType
                .toLowerCase()
                .includes(searchTerm.toLowerCase()) ||
              design.description
                .toLowerCase()
                .includes(searchTerm.toLowerCase())
          )
          .map((design) => (
            <div
              key={design.id}
              className={`relative group cursor-pointer border rounded-lg overflow-hidden transition-transform ${
                selectedDesigns.includes(design.id)
                  ? "ring-4 ring-blue-500 scale-95"
                  : "hover:scale-105"
              }`}
              onClick={() => {
                setSelectedDesigns((prev) =>
                  prev.includes(design.id)
                    ? prev.filter((id) => id !== design.id)
                    : [...prev, design.id]
                );
              }}
            >
              <div className="relative aspect-square">
                <Image
                  src={design.image_url}
                  alt={design.description}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 50vw, 25vw"
                />
              </div>

              <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/80 to-transparent">
                <p className="text-white font-medium truncate">
                  {design.metadata.fabricType}
                </p>
                {design.price > 0 && (
                  <p className="text-white text-sm">
                    {design.price.toFixed(2)} XOF
                  </p>
                )}
              </div>
            </div>
          ))}
      </div>

      {selectedDesigns.length > 0 && (
        <div className="fixed bottom-6 right-6 animate-in fade-in zoom-in">
          <Button
            onClick={shareOnWhatsApp}
            className="bg-green-600 hover:bg-green-700 shadow-lg px-6 py-4 rounded-full"
          >
            <span className="mr-2">💬</span>
            Commander {selectedDesigns.length} modèle(s) sur WhatsApp
          </Button>
        </div>
      )}
    </div>
  );
}
