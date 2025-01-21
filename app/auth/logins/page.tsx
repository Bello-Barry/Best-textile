"use client";
import React, { useState, useEffect } from "react";
import { useAuthStore } from "@/store/authStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Mail, Lock, User, Building, Eye, EyeOff } from "lucide-react";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";

// Validation schemas
const loginSchema = z.object({
  email: z.string().email("Email invalide"),
  password: z
    .string()
    .min(6, "Le mot de passe doit contenir au moins 6 caractères"),
  rememberMe: z.boolean(),
});

const registerSchema = z
  .object({
    name: z.string().min(2, "Le nom doit contenir au moins 2 caractères"),
    email: z.string().email("Email invalide"),
    password: z
      .string()
      .min(6, "Le mot de passe doit contenir au moins 6 caractères")
      .regex(/[A-Z]/, "Le mot de passe doit contenir au moins une majuscule")
      .regex(/[0-9]/, "Le mot de passe doit contenir au moins un chiffre"),
    confirmPassword: z.string(),
    role: z.enum(["client", "admin"], {
      required_error: "Veuillez sélectionner un rôle",
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Les mots de passe ne correspondent pas",
    path: ["confirmPassword"],
  });

const AuthPage = () => {
  const router = useRouter();
  const { login, register, resetPassword, isAuthenticated } = useAuthStore();

  // États
  const [formState, setFormState] = useState({
    activeTab: "login",
    isLoading: false,
    showForgotPassword: false,
    showPassword: false,
    validationErrors: {} as Record<string, string>,
  });

  const [loginData, setLoginData] = useState({
    email: "",
    password: "",
    rememberMe: false,
  });

  const [registerData, setRegisterData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "client" as "client" | "admin",
  });

  const [forgotPasswordEmail, setForgotPasswordEmail] = useState("");

  // Effets
  useEffect(() => {
    if (isAuthenticated) {
      router.push("/");
    }
  }, [isAuthenticated, router]);

  // Charger l'email mémorisé depuis localStorage côté client
  useEffect(() => {
    if (typeof window !== "undefined") {
      const rememberedEmail = localStorage.getItem("rememberedEmail") || "";
      setLoginData((prev) => ({ ...prev, email: rememberedEmail }));
    }
  }, []);

  // Validateurs
  const validateForm = (data: any, schema: z.ZodSchema<any>) => {
    try {
      schema.parse(data);
      setFormState((prev) => ({ ...prev, validationErrors: {} }));
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errors = error.errors.reduce(
          (acc, curr) => ({
            ...acc,
            [curr.path[0]]: curr.message,
          }),
          {}
        );
        setFormState((prev) => ({ ...prev, validationErrors: errors }));
      }
      return false;
    }
  };

  // Gestionnaires d'événements
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm(loginData, loginSchema)) return;

    setFormState((prev) => ({ ...prev, isLoading: true }));
    try {
      await login(loginData.email, loginData.password);
      if (loginData.rememberMe) {
        localStorage.setItem("rememberedEmail", loginData.email);
      } else {
        localStorage.removeItem("rememberedEmail");
      }
      router.push("/");
      toast.success("Connexion réussie !");
    } catch (error) {
      toast.error("Erreur de connexion. Vérifiez vos identifiants.");
      console.error(error);
    } finally {
      setFormState((prev) => ({ ...prev, isLoading: false }));
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm(registerData, registerSchema)) return;

    setFormState((prev) => ({ ...prev, isLoading: true }));
    try {
      await register(
        registerData.name,
        registerData.email,
        registerData.password,
        registerData.role
      );
      toast.success("Inscription réussie ! Veuillez vérifier votre email.");
      setFormState((prev) => ({ ...prev, activeTab: "login" }));
      setRegisterData({
        name: "",
        email: "",
        password: "",
        confirmPassword: "",
        role: "client",
      });
    } catch (error: any) {
      toast.error(error.message || "Erreur lors de l'inscription.");
    } finally {
      setFormState((prev) => ({ ...prev, isLoading: false }));
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotPasswordEmail) {
      toast.error("Veuillez saisir votre email");
      return;
    }

    setFormState((prev) => ({ ...prev, isLoading: true }));
    try {
      await resetPassword(forgotPasswordEmail);
      toast.success("Instructions de réinitialisation envoyées");
      setFormState((prev) => ({ ...prev, showForgotPassword: false }));
      setForgotPasswordEmail("");
    } catch (error) {
      toast.error("Erreur lors de l'envoi des instructions.");
    } finally {
      setFormState((prev) => ({ ...prev, isLoading: false }));
    }
  };

  // Rendu des composants de formulaire
  const renderPasswordInput = (
    value: string,
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void,
    placeholder: string,
    error?: string
  ) => (
    <div className="relative">
      <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
      <Input
        type={formState.showPassword ? "text" : "password"}
        placeholder={placeholder}
        className="pl-10 pr-10"
        value={value}
        onChange={onChange}
        required
      />
      <button
        type="button"
        onClick={() =>
          setFormState((prev) => ({
            ...prev,
            showPassword: !prev.showPassword,
          }))
        }
        className="absolute right-3 top-3"
      >
        {formState.showPassword ? (
          <EyeOff className="h-5 w-5 text-gray-400" />
        ) : (
          <Eye className="h-5 w-5 text-gray-400" />
        )}
      </button>
      {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <ToastContainer position="top-right" autoClose={5000} />
      <div className="w-full max-w-md">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl text-center">Bienvenue</CardTitle>
          </CardHeader>
          <CardContent>
            {formState.showForgotPassword ? (
              <form onSubmit={handleForgotPassword} className="space-y-4">
                {/* Formulaire de réinitialisation du mot de passe */}
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <Input
                    type="email"
                    placeholder="Email"
                    className="pl-10"
                    value={forgotPasswordEmail}
                    onChange={(e) => setForgotPasswordEmail(e.target.value)}
                    required
                  />
                </div>
                <Button
                  type="submit"
                  className="w-full"
                  disabled={formState.isLoading}
                >
                  {formState.isLoading
                    ? "Envoi..."
                    : "Réinitialiser le mot de passe"}
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  className="w-full"
                  onClick={() =>
                    setFormState((prev) => ({
                      ...prev,
                      showForgotPassword: false,
                    }))
                  }
                >
                  Retour à la connexion
                </Button>
              </form>
            ) : (
              <Tabs
                value={formState.activeTab}
                onValueChange={(value) =>
                  setFormState((prev) => ({ ...prev, activeTab: value }))
                }
                className="space-y-4"
              >
                <TabsList className="grid grid-cols-2">
                  <TabsTrigger value="login">Connexion</TabsTrigger>
                  <TabsTrigger value="register">Inscription</TabsTrigger>
                </TabsList>

                <TabsContent value="login">
                  <form onSubmit={handleLogin} className="space-y-4">
                    {/* Formulaire de connexion */}
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                      <Input
                        type="email"
                        placeholder="Email"
                        className="pl-10"
                        value={loginData.email}
                        onChange={(e) =>
                          setLoginData({ ...loginData, email: e.target.value })
                        }
                        required
                      />
                    </div>

                    {renderPasswordInput(
                      loginData.password,
                      (e) =>
                        setLoginData({
                          ...loginData,
                          password: e.target.value,
                        }),
                      "Mot de passe",
                      formState.validationErrors.password
                    )}

                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="rememberMe"
                        checked={loginData.rememberMe}
                        onCheckedChange={(checked) =>
                          setLoginData({
                            ...loginData,
                            rememberMe: checked as boolean,
                          })
                        }
                      />
                      <label
                        htmlFor="rememberMe"
                        className="text-sm text-gray-600 cursor-pointer"
                      >
                        Se souvenir de moi
                      </label>
                    </div>

                    <Button
                      type="submit"
                      className="w-full"
                      disabled={formState.isLoading}
                    >
                      {formState.isLoading ? "Connexion..." : "Se connecter"}
                    </Button>

                    <Button
                      type="button"
                      variant="ghost"
                      className="w-full"
                      onClick={() =>
                        setFormState((prev) => ({
                          ...prev,
                          showForgotPassword: true,
                        }))
                      }
                    >
                      Mot de passe oublié ?
                    </Button>
                  </form>
                </TabsContent>

                <TabsContent value="register">
                  <form onSubmit={handleRegister} className="space-y-4">
                    {/* Formulaire d'inscription */}
                    <div className="relative">
                      <User className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                      <Input
                        type="text"
                        placeholder="Nom complet"
                        className="pl-10"
                        value={registerData.name}
                        onChange={(e) =>
                          setRegisterData({
                            ...registerData,
                            name: e.target.value,
                          })
                        }
                        required
                      />
                      {formState.validationErrors.name && (
                        <p className="text-red-500 text-sm mt-1">
                          {formState.validationErrors.name}
                        </p>
                      )}
                    </div>

                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                      <Input
                        type="email"
                        placeholder="Email"
                        className="pl-10"
                        value={registerData.email}
                        onChange={(e) =>
                          setRegisterData({
                            ...registerData,
                            email: e.target.value,
                          })
                        }
                        required
                      />
                      {formState.validationErrors.email && (
                        <p className="text-red-500 text-sm mt-1">
                          {formState.validationErrors.email}
                        </p>
                      )}
                    </div>

                    <div className="relative">
                      <Building className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                      <Select
                        defaultValue="client"
                        disabled={true}
                        value={registerData.role}
                      >
                        <SelectTrigger className="pl-10">
                          <SelectValue placeholder="Sélectionnez un rôle" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="client">Client</SelectItem>
                          <SelectItem value="admin">Administrateur</SelectItem>
                        </SelectContent>
                      </Select>
                      {formState.validationErrors.role && (
                        <p className="text-red-500 text-sm mt-1">
                          {formState.validationErrors.role}
                        </p>
                      )}
                    </div>

                    {renderPasswordInput(
                      registerData.password,
                      (e) =>
                        setRegisterData({
                          ...registerData,
                          password: e.target.value,
                        }),
                      "Mot de passe",
                      formState.validationErrors.password
                    )}

                    {renderPasswordInput(
                      registerData.confirmPassword,
                      (e) =>
                        setRegisterData({
                          ...registerData,
                          confirmPassword: e.target.value,
                        }),
                      "Confirmer le mot de passe",
                      formState.validationErrors.confirmPassword
                    )}

                    <Button
                      type="submit"
                      className="w-full"
                      disabled={formState.isLoading}
                    >
                      {formState.isLoading ? "Inscription..." : "S'inscrire"}
                    </Button>
                  </form>
                </TabsContent>
              </Tabs>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AuthPage;
