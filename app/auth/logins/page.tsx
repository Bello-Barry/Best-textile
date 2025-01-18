"use client";
import React, { useState } from "react";
import { useAuthStore } from "@/store/authStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Mail, Lock, User, Building } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { z } from "zod";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";

// Schémas de validation
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
  const { login, register, resetPassword } = useAuthStore();
  const [activeTab, setActiveTab] = useState("login");
  const [isLoading, setIsLoading] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [validationErrors, setValidationErrors] = useState<
    Record<string, string>
  >({});

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

  const validateForm = (data: any, schema: z.ZodSchema<any>) => {
    try {
      schema.parse(data);
      setValidationErrors({});
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
        setValidationErrors(errors);
      }
      return false;
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm(loginData, loginSchema)) return;

    setIsLoading(true);
    try {
      await login(loginData.email, loginData.password);
      if (loginData.rememberMe) {
        localStorage.setItem("rememberedEmail", loginData.email);
      } else {
        localStorage.removeItem("rememberedEmail");
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm(registerData, registerSchema)) return;

    setIsLoading(true);
    try {
      await register(
        registerData.name,
        registerData.email,
        registerData.password,
        registerData.role
      );
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotPasswordEmail) return;

    setIsLoading(true);
    try {
      await resetPassword(forgotPasswordEmail);
      setShowForgotPassword(false);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const slideVariants = {
    enter: { x: 50, opacity: 0 },
    center: { x: 0, opacity: 1 },
    exit: { x: -50, opacity: 0 },
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl text-center">Bienvenue</CardTitle>
          </CardHeader>
          <CardContent>
            <AnimatePresence mode="wait">
              {showForgotPassword ? (
                <motion.div
                  key="forgot"
                  initial="enter"
                  animate="center"
                  exit="exit"
                  variants={slideVariants}
                  transition={{ duration: 0.3 }}
                >
                  <form onSubmit={handleForgotPassword} className="space-y-4">
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
                      disabled={isLoading}
                    >
                      {isLoading ? "Envoi..." : "Réinitialiser le mot de passe"}
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      className="w-full"
                      onClick={() => setShowForgotPassword(false)}
                    >
                      Retour à la connexion
                    </Button>
                  </form>
                </motion.div>
              ) : (
                <motion.div
                  key="auth"
                  initial="enter"
                  animate="center"
                  exit="exit"
                  variants={slideVariants}
                  transition={{ duration: 0.3 }}
                >
                  <Tabs
                    value={activeTab}
                    onValueChange={setActiveTab}
                    className="space-y-4"
                  >
                    <TabsList className="grid grid-cols-2">
                      <TabsTrigger value="login">Connexion</TabsTrigger>
                      <TabsTrigger value="register">Inscription</TabsTrigger>
                    </TabsList>

                    <TabsContent value="login">
                      <form onSubmit={handleLogin} className="space-y-4">
                        <div className="space-y-2">
                          <div className="relative">
                            <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                            <Input
                              type="email"
                              placeholder="Email"
                              className="pl-10"
                              value={loginData.email}
                              onChange={(e) =>
                                setLoginData({
                                  ...loginData,
                                  email: e.target.value,
                                })
                              }
                              required
                            />
                            {validationErrors.email && (
                              <p className="text-red-500 text-sm mt-1">
                                {validationErrors.email}
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="space-y-2">
                          <div className="relative">
                            <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                            <Input
                              type="password"
                              placeholder="Mot de passe"
                              className="pl-10"
                              value={loginData.password}
                              onChange={(e) =>
                                setLoginData({
                                  ...loginData,
                                  password: e.target.value,
                                })
                              }
                              required
                            />
                            {validationErrors.password && (
                              <p className="text-red-500 text-sm mt-1">
                                {validationErrors.password}
                              </p>
                            )}
                          </div>
                        </div>

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
                          disabled={isLoading}
                        >
                          {isLoading ? "Connexion..." : "Se connecter"}
                        </Button>

                        <Button
                          type="button"
                          variant="ghost"
                          className="w-full"
                          onClick={() => setShowForgotPassword(true)}
                        >
                          Mot de passe oublié ?
                        </Button>
                      </form>
                    </TabsContent>

                    <TabsContent value="register">
                      <form onSubmit={handleRegister} className="space-y-4">
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
                          {validationErrors.name && (
                            <p className="text-red-500 text-sm mt-1">
                              {validationErrors.name}
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
                          {validationErrors.email && (
                            <p className="text-red-500 text-sm mt-1">
                              {validationErrors.email}
                            </p>
                          )}
                        </div>
<div className="relative">
  <Building className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
  <Select
    defaultValue={registerData.role}
    onValueChange={(value: "client" | "admin") =>
      setRegisterData({ ...registerData, role: value })
    }
  >
    <SelectTrigger className="pl-10">
      <SelectValue placeholder="Sélectionnez un rôle" />
    </SelectTrigger>
    <SelectContent>
      <SelectItem value="client">Client</SelectItem>
      <SelectItem value="admin">Administrateur</SelectItem>
    </SelectContent>
  </Select>
  {validationErrors.role && (
    <p className="text-red-500 text-sm mt-1">
      {validationErrors.role}
    </p>
  )}
</div>


                        <div className="relative">
                          <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                          <Input
                            type="password"
                            placeholder="Mot de passe"
                            className="pl-10"
                            value={registerData.password}
                            onChange={(e) =>
                              setRegisterData({
                                ...registerData,
                                password: e.target.value,
                              })
                            }
                            required
                          />
                          {validationErrors.password && (
                            <p className="text-red-500 text-sm mt-1">
                              {validationErrors.password}
                            </p>
                          )}
                        </div>

                        <div className="relative">
                          <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                          <Input
                            type="password"
                            placeholder="Confirmer le mot de passe"
                            className="pl-10"
                            value={registerData.confirmPassword}
                            onChange={(e) =>
                              setRegisterData({
                                ...registerData,
                                confirmPassword: e.target.value,
                              })
                            }
                            required
                          />
                          {validationErrors.confirmPassword && (
                            <p className="text-red-500 text-sm mt-1">
                              {validationErrors.confirmPassword}
                            </p>
                          )}
                        </div>

                        <Button
                          type="submit"
                          className="w-full"
                          disabled={isLoading}
                        >
                          {isLoading ? "Inscription..." : "S'inscrire"}
                        </Button>
                      </form>
                    </TabsContent>
                  </Tabs>
                </motion.div>
              )}
            </AnimatePresence>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default AuthPage;
