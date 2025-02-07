import { create } from "zustand";
import { supabase } from "@/lib/supabaseClient";
import { toast } from "react-toastify";

interface User {
  id: string;
  name: string;
  email: string;
  role: "client" | "admin";
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean; // Nouvelle propriété ajoutée
  login: (email: string, password: string) => Promise<void>;
  register: (
    name: string,
    email: string,
    password: string,
    role: "client" | "admin"
  ) => Promise<void>;
  logout: () => Promise<void>;
  fetchUser: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false, // Initialisation de isAuthenticated

  login: async (email, password) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        toast.error("Erreur lors de la connexion : " + error.message);
        return;
      }

      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", data.user?.id)
        .single();

      if (profileError) {
        toast.error(
          "Erreur lors de la récupération du profil : " + profileError.message
        );
        return;
      }

      set({
        user: {
          id: profile.id,
          name: profile.name,
          email: profile.email,
          role: profile.role,
        },
        isAuthenticated: true, // Mise à jour de isAuthenticated lors de la connexion
      });
      toast.success("Connexion réussie !");
    } catch (error) {
      toast.error("Une erreur est survenue lors de la connexion.");
    }
  },

  register: async (name, email, password, role) => {
    try {
      const { data, error } = await supabase.auth.signUp({ email, password });

      if (error) {
        toast.error("Erreur lors de l'inscription : " + error.message);
        return;
      }

      const { error: profileError } = await supabase
        .from("profiles")
        .insert([{ id: data.user?.id, name, email, role }]);

      if (profileError) {
        toast.error(
          "Erreur lors de la création du profil : " + profileError.message
        );
        return;
      }

      set({
        user: { id: data.user?.id!, name, email, role },
        isAuthenticated: true, // Mise à jour de isAuthenticated lors de l'inscription
      });
      toast.success("Inscription réussie !");
    } catch (error) {
      toast.error("Une erreur est survenue lors de l'inscription.");
    }
  },

  logout: async () => {
    try {
      const { error } = await supabase.auth.signOut();

      if (error) {
        toast.error("Erreur lors de la déconnexion : " + error.message);
        return;
      }

      set({
        user: null,
        isAuthenticated: false, // Mise à jour de isAuthenticated lors de la déconnexion
      });
      toast.success("Déconnexion réussie.");
    } catch (error) {
      toast.error("Une erreur est survenue lors de la déconnexion.");
    }
  },

  fetchUser: async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single();

        if (profileError) {
          toast.error(
            "Erreur lors de la récupération du profil : " + profileError.message
          );
          return;
        }

        set({
          user: {
            id: profile.id,
            name: profile.name,
            email: profile.email,
            role: profile.role,
          },
          isAuthenticated: true, // Mise à jour de isAuthenticated lors de la récupération
        });
      }
    } catch (error) {
      toast.error(
        "Une erreur est survenue lors de la récupération de l'utilisateur."
      );
    }
  },

  resetPassword: async (email) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/update-password`,
      });

      if (error) {
        toast.error(
          "Erreur lors de la réinitialisation du mot de passe : " +
            error.message
        );
        return;
      }

      toast.success(
        "Un lien de réinitialisation a été envoyé à votre adresse email."
      );
    } catch (error) {
      toast.error(
        "Une erreur est survenue lors de la réinitialisation du mot de passe."
      );
    }
  },
}));
