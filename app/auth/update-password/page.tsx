"use client";

import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "react-toastify";

const schema = z.object({
  password: z
    .string()
    .min(6, "Le mot de passe doit contenir au moins 6 caractères"),
});

export default function UpdatePasswordPage() {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: any) => {
    try {
      const { error } = await supabase.auth.updateUser({
        password: data.password,
      });

      if (error) {
        toast.error(
          "Erreur lors de la mise à jour du mot de passe : " + error.message
        );
        return;
      }

      toast.success("Mot de passe mis à jour avec succès !");
      router.push("/auth/login");
    } catch (error) {
      toast.error(
        "Une erreur est survenue lors de la mise à jour du mot de passe."
      );
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Mise à jour du mot de passe</h1>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label>Nouveau mot de passe</label>
          <input
            type="password"
            {...register("password")}
            className="w-full border rounded px-2 py-1"
          />
          {errors.password && (
            <p className="text-red-500">{errors.password.message}</p>
          )}
        </div>
        <button
          type="submit"
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          Mettre à jour
        </button>
      </form>
    </div>
  );
}
