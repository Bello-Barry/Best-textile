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
  login: (email: string, password: string) => Promise<void>;
  register: (
    name: string,
    email: string,
    password: string,
    role: "client" | "admin"
  ) => Promise<void>;
  logout: () => Promise<void>;
  fetchUser: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>; // Nouvelle fonction
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,

  // Connexion de l'utilisateur
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

      // Récupérer le profil utilisateur depuis la table `profiles`
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

      // Mettre à jour l'état avec l'utilisateur connecté
      set({
        user: {
          id: profile.id,
          name: profile.name,
          email: profile.email,
          role: profile.role,
        },
      });
      toast.success("Connexion réussie !");
    } catch (error) {
      toast.error("Une erreur est survenue lors de la connexion.");
    }
  },

  // Inscription de l'utilisateur
  register: async (name, email, password, role) => {
    try {
      // Créer l'utilisateur dans Supabase Auth
      const { data, error } = await supabase.auth.signUp({ email, password });

      if (error) {
        toast.error("Erreur lors de l'inscription : " + error.message);
        return;
      }

      // Ajouter le profil utilisateur dans la table `profiles`
      const { error: profileError } = await supabase
        .from("profiles")
        .insert([{ id: data.user?.id, name, email, role }]);

      if (profileError) {
        toast.error(
          "Erreur lors de la création du profil : " + profileError.message
        );
        return;
      }

      // Mettre à jour l'état avec l'utilisateur inscrit
      set({ user: { id: data.user?.id!, name, email, role } });
      toast.success("Inscription réussie !");
    } catch (error) {
      toast.error("Une erreur est survenue lors de l'inscription.");
    }
  },

  // Déconnexion de l'utilisateur
  logout: async () => {
    try {
      const { error } = await supabase.auth.signOut();

      if (error) {
        toast.error("Erreur lors de la déconnexion : " + error.message);
        return;
      }

      // Réinitialiser l'état de l'utilisateur
      set({ user: null });
      toast.success("Déconnexion réussie.");
    } catch (error) {
      toast.error("Une erreur est survenue lors de la déconnexion.");
    }
  },

  // Récupérer l'utilisateur actuel (au chargement de l'application)
  fetchUser: async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        // Récupérer le profil utilisateur depuis la table `profiles`
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

        // Mettre à jour l'état avec l'utilisateur connecté
        set({
          user: {
            id: profile.id,
            name: profile.name,
            email: profile.email,
            role: profile.role,
          },
        });
      }
    } catch (error) {
      toast.error(
        "Une erreur est survenue lors de la récupération de l'utilisateur."
      );
    }
  },

  // Réinitialisation du mot de passe
  resetPassword: async (email) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/update-password`, // Rediriger vers la page de mise à jour du mot de passe
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
