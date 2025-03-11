"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from "@/components/ui/dialog";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { Loader2, ZoomIn, ShoppingCart } from "lucide-react";
import { toast } from "react-toastify";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";

export interface FabricDesign {
  id: string;
  image_url: string;
  description: string;
  price: number | null; // Modification pour accepter null
  metadata: {
    fabricType: string;
    tags: string[];
  };
}

export default function GalleryPage() {
  const [designs, setDesigns] = useState<FabricDesign[]>([]);
  const [selectedDesigns, setSelectedDesigns] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    description: "",
    fabricType: "",
    price: "",
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
        setDesigns(data?.map(d => ({ 
          ...d, 
          price: d.price || 0 // Conversion des null en 0
        })) || []);
      } catch (error) {
        toast.error("Erreur lors du chargement des designs");
      } finally {
        setLoading(false);
      }
    };
    loadDesigns();
  }, [supabase]);

const handleUpload = async () => {
    if (!formData.file || !formData.description || !formData.fabricType) {
      toast.error("Veuillez remplir tous les champs obligatoires");
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

      // Upload fichier
      const { error: uploadError } = await supabase.storage
        .from("client_designs")
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      // Récupération URL publique
      const { data: publicUrlData } = supabase.storage
        .from("client_designs")
        .getPublicUrl(fileName);

      // Insertion dans la base
      const { data: dbData, error: dbError } = await supabase
        .from("fabric_designs")
        .insert([
          {
            image_url: publicUrlData?.publicUrl,
            description: formData.description,
            price: Number(formData.price) || 0,
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
        setOpen(false);
        setFormData({ 
          description: "", 
          fabricType: "", 
          price: "",
          file: null 
        });
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
      .map(d => `- ${d.metadata.fabricType}: ${d.description} (${(d.price ?? 0).toFixed(2)} XOF)\n  ${d.image_url}`)
      .join("\n\n")}`;
    
    window.open(`https://wa.me/+242064767604?text=${encodeURIComponent(message)}`, "_blank");
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
{/* Modal d'ajout */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button className="ml-2">
            <span className="flex items-center gap-2">
              📤 Ajouter mon modèle
            </span>
          </Button>
        </DialogTrigger>
        
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="text-xl">Nouveau design</DialogTitle>
            <button 
              onClick={() => setOpen(false)}
              className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none"
            >
              <X className="h-5 w-5" />
            </button>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <Input
              placeholder="Description *"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                description: e.target.value
              }))}
            />

            <Input
              placeholder="Type de tissu *"
              value={formData.fabricType}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                fabricType: e.target.value
              }))}
            />

            <Input
              type="number"
              placeholder="Prix (XOF)"
              value={formData.price}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                price: e.target.value
              }))}
            />

            <label className="block">
              <span className="sr-only">Sélectionner une image</span>
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
                "Publier le design"
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      {/* En-tête avec recherche et bouton d'ajout */}
      <div className="mb-8 flex flex-col md:flex-row gap-4 items-center justify-between">
        <Input
          placeholder="Rechercher par type ou description..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-xl"
        />
        
      </div>

      {/* Grille des designs */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {designs
          .filter(design =>
            design.metadata.fabricType.toLowerCase().includes(searchTerm.toLowerCase()) ||
            design.description.toLowerCase().includes(searchTerm.toLowerCase())
          )
          .map((design) => (
            <motion.div
              key={design.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className={`relative group border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow ${
                selectedDesigns.includes(design.id) ? "ring-2 ring-primary" : ""
              }`}
              onClick={() => setSelectedDesigns(prev => 
                prev.includes(design.id) 
                  ? prev.filter(id => id !== design.id) 
                  : [...prev, design.id]
              )}
            >
              {/* Zone d'image avec zoom */}
              <Dialog>
                <DialogTrigger asChild>
                  <div 
                    className="relative aspect-square cursor-zoom-in"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Image
                      src={design.image_url}
                      alt={design.description}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 50vw, 33vw"
                    />
                  </div>
                </DialogTrigger>

                <DialogContent className="max-w-4xl p-0 bg-transparent border-none">
                  <div className="relative h-[80vh] bg-gray-50 rounded-lg">
                    <Image
                      src={design.image_url}
                      alt={design.description}
                      fill
                      className="object-contain"
                      priority
                    />
                    <div className="absolute bottom-4 left-4 right-4 bg-background/90 p-4 rounded-lg shadow-sm">
                      <h3 className="font-semibold">{design.metadata.fabricType}</h3>
                      <p className="text-sm">{design.description}</p>
                      <div className="flex justify-between items-center mt-2">
                        <Badge variant="secondary">
                          {(design.price ?? 0).toFixed(2)} XOF
                        </Badge>
                        <Badge variant="outline">
                          {design.metadata.tags?.join(", ") || "Aucun tag"}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>

              {/* Informations basiques */}
              <div className="p-3 space-y-1 border-t">
                <h3 className="font-medium truncate">{design.metadata.fabricType}</h3>
                <p className="text-sm text-muted-foreground truncate">{design.description}</p>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-semibold">
                    {(design.price ?? 0).toFixed(2)} XOF
                  </span>
                  <Badge variant="outline" className="text-xs">
                    {design.metadata.tags?.[0] || "N/A"}
                  </Badge>
                </div>
              </div>
            </motion.div>
          ))}
      </div>

      {/* Bouton de commande flottant */}
      {selectedDesigns.length > 0 && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="fixed bottom-6 right-6 z-50"
        >
          <Button
            onClick={shareOnWhatsApp}
            className="gap-2 shadow-lg px-6 py-5 rounded-full"
          >
            <ShoppingCart className="h-5 w-5" />
            Commander {selectedDesigns.length} sélection
            {selectedDesigns.length > 1 && "s"}
          </Button>
        </motion.div>
      )}
    </div>
  );
}