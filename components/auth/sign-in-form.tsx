// components/auth/sign-in-form.tsx
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/lib/auth";
import { toast } from "react-hot-toast";

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export function SignInForm() {
  const { signIn } = useAuth();
  const form = useForm({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: z.infer<typeof schema>) => {
    try {
      await signIn(data.email, data.password);
      toast.success("Connexion réussie");
    } catch (error) {
      toast.error("Erreur lors de la connexion");
    }
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      <Input type="email" placeholder="Email" {...form.register("email")} />
      <Input
        type="password"
        placeholder="Mot de passe"
        {...form.register("password")}
      />
      <Button type="submit" className="w-full">
        Se connecter
      </Button>
    </form>
  );
}
