import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { signup } from "@/actions/auth.actions";

import { createClient } from "@/lib/supabase";

export function Signup() {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) {
        toast.error("Error al iniciar sesión con Google", {
          description: error.message
        });
      }
    } catch (err) {
      toast.error("Ocurrió un error inesperado");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);
    
    // Explicitly set default role if not in form
    if (!formData.get("role")) {
      formData.set("role", "VENDOR");
    }

    try {
      const result = await signup(formData);

      if (result.error) {
        toast.error("Error en el registro", {
          description: result.error
        });
      } else {
        toast.success("¡Cuenta creada exitosamente!", {
          description: "Por favor verifica tu correo para confirmar la cuenta."
        });
        router.push("/login");
      }
    } catch (err) {
      toast.error("Ocurrió un error inesperado");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      {/* Background decoration */}
      <div className="fixed inset-0 z-[-1] overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-primary/20 rounded-full blur-[100px] opacity-40" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-accent/20 rounded-full blur-[100px] opacity-40" />
      </div>

      <Card className="w-full max-w-md border-border/50 shadow-xl backdrop-blur-sm bg-card/95">
        <CardHeader className="text-center space-y-2">
          <div className="mx-auto w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-2 ring-1 ring-primary/20">
            <span className="text-primary font-bold text-xl">F</span>
          </div>
          <CardTitle className="text-2xl font-bold tracking-tight">Crear Cuenta</CardTitle>
          <CardDescription>Regístrate para comenzar a usar Fluxo POS</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nombre completo</Label>
              <Input
                id="name"
                name="name"
                type="text"
                placeholder="Juan Pérez"
                required
                className="bg-background/50"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Correo electrónico</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="nombre@empresa.com"
                required
                className="bg-background/50"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Contraseña</Label>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="••••••••"
                required
                minLength={6}
                className="bg-background/50"
              />
            </div>
            
            {/* Role selection is hidden/defaulted for now, or we could add a selector if needed */}
            <input type="hidden" name="role" value="VENDOR" />

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Registrando..." : "Registrarse"}
            </Button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">O registrarse con</span>
              </div>
            </div>
            <Button 
              type="button" 
              variant="outline" 
              className="w-full flex items-center gap-2" 
              onClick={handleGoogleLogin}
              disabled={isLoading}
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M22.56 12.27c0-.78-.07-1.53-.2-2.26H12v4.51h6.17c-.25 1.26-.98 2.36-2.09 3.18v2.92h3.76c2.2-2.02 3.47-5 3.47-8.65z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c3.24 0 5.95-1.08 7.93-2.92l-3.76-2.92c-1.09.72-2.45 1.14-4.17 1.14-3.21 0-5.93-2.16-6.9-5.06H1.34v2.99C3.26 20.53 7.31 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M4.9 14.09c-.23-.69-.36-1.44-.36-2.27s.13-1.58.36-2.27V6.56H1.34c-.77 1.54-1.2 3.29-1.2 5.44s.43 3.9 1.2 5.44L4.9 14.09z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
              Google
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex justify-center border-t pt-6">
          <p className="text-sm text-muted-foreground">
            ¿Ya tienes una cuenta?{" "}
            <Link href="/login" className="text-primary font-medium hover:underline">
              Inicia sesión
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
