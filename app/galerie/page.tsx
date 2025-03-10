"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { Loader2, X } from "lucide-react";
import { toast } from "react-toastify";
import { Dialog } from "@headlessui/react";

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
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    description: "",
    fabricType: "",
    file: null as File | null,
  });

  const supabase = createClientComponentClient();

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
  }, [supabase]);

  const handleUpload = async () => {
    if (!formData.file || !formData.description || !formData.fabricType) {
      toast.error("Veuillez remplir tous les champs");
      return;
    }

    setUploading(true);

    try {
      const file = formData.file;
      if (!file.type.startsWith("image/")) {
        throw new Error("Type de fichier non supporté");
      }

      if (file.size > 5 * 1024 * 1024) {
        throw new Error("Le fichier dépasse 5MB");
      }

      const fileExt = file.name.split(".").pop();
      const fileName = `${Math.random().toString(36)}-${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("client_designs")
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: publicUrlData } = supabase.storage
        .from("client_designs")
        .getPublicUrl(fileName);

      const { data: dbData, error: dbError } = await supabase
        .from("fabric_designs")
        .insert([
          {
            image_url: publicUrlData?.publicUrl,
            description: formData.description,
            metadata: { 
              fabricType: formData.fabricType,
              tags: [] 
            },
          }
        ])
        .select("*");

      if (dbError) throw dbError;

      if (dbData?.[0]) {
        setDesigns(prev => [dbData[0], ...prev]);
        toast.success("Design uploadé avec succès !");
        setShowModal(false);
        setFormData({ description: "", fabricType: "", file: null });
      }
    } catch (error) {
      console.error("Erreur upload:", error);
      toast.error(`Échec de l'upload: ${error instanceof Error ? error.message : "Erreur inconnue"}`);
    } finally {
      setUploading(false);
    }
  };

  const shareOnWhatsApp = () => {
    const selected = designs.filter(d => selectedDesigns.includes(d.id));
    const message = `Bonjour! Je suis intéressé par ces modèles :\n\n${selected
      .map(d => `- ${d.description} (${d.price.toFixed(2)} XOF)`)
      .join("\n")}\n\nMerci de me contacter pour confirmation.`;

    window.open(
      `https://wa.me/+242064767604?text=${encodeURIComponent(message)}`,
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
      {/* Modal */}
      <Dialog
        open={showModal}
        onClose={() => setShowModal(false)}
        className="relative z-50"
      >
        <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
        
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Dialog.Panel className="w-full max-w-md rounded-lg bg-white p-6">
            <div className="flex justify-between items-center mb-4">
              <Dialog.Title className="text-xl font-bold">
                Ajouter un nouveau design
              </Dialog.Title>
              <button 
                onClick={() => setShowModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4">
              <Input
                placeholder="Description du design"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  description: e.target.value
                }))}
              />

              <Input
                placeholder="Type de tissu (ex: Coton)"
                value={formData.fabricType}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  fabricType: e.target.value
                }))}
              />

              <label className="block">
                <span className="sr-only">Choisir une image</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    file: e.target.files?.[0] || null
                  }))}
                  className="block w-full text-sm text-gray-500
                    file:mr-4 file:py-2 file:px-4
                    file:rounded-full file:border-0
                    file:text-sm file:font-semibold
                    file:bg-blue-50 file:text-blue-700
                    hover:file:bg-blue-100"
                />
              </label>

              <Button
                onClick={handleUpload}
                disabled={uploading}
                className="w-full"
              >
                {uploading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  "Uploader le design"
                )}
              </Button>
            </div>
          </Dialog.Panel>
        </div>
      </Dialog>

      {/* Interface principale */}
      <div className="mb-8 flex flex-col md:flex-row gap-4 items-center">
        <Input
          placeholder="Rechercher par type (soie, coton...)"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-xl"
        />

        <Button onClick={() => setShowModal(true)}>
          <span className="flex items-center gap-2">
            📤 Ajouter mon modèle
          </span>
        </Button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {designs
          .filter(design =>
            design.metadata.fabricType.toLowerCase().includes(searchTerm.toLowerCase()) ||
            design.description.toLowerCase().includes(searchTerm.toLowerCase())
          )
          .map(design => (
            <div
              key={design.id}
              className={`relative group cursor-pointer border rounded-lg overflow-hidden transition-transform ${
                selectedDesigns.includes(design.id)
                  ? "ring-4 ring-blue-500 scale-95"
                  : "hover:scale-105"
              }`}
              onClick={() => {
                setSelectedDesigns(prev =>
                  prev.includes(design.id)
                    ? prev.filter(id => id !== design.id)
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
                <p className="text-white text-sm truncate">
                  {design.description}
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