"use client";

import { useAuthStore } from "@/store/authStore";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const schema = z.object({
  email: z.string().email("Email invalide"),
});

export default function ResetPasswordPage() {
  const { resetPassword } = useAuthStore();
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: any) => {
    await resetPassword(data.email);
    router.push("/auth/login");
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">
        Réinitialisation du mot de passe
      </h1>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label>Email</label>
          <input
            {...register("email")}
            className="w-full border rounded px-2 py-1"
          />
          {errors.email && (
            <p className="text-red-500">{errors.email.message}</p>
          )}
        </div>
        <button
          type="submit"
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          Envoyer le lien de réinitialisation
        </button>
      </form>
    </div>
  );
}
