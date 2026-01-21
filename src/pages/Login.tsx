import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { usePOSStore, User } from '@/stores/posStore';
import { toast } from 'sonner';

// Demo users
const demoUsers: (User & { password: string })[] = [
  { id: 'user-1', name: 'John Doe', email: 'admin@demo.com', role: 'admin', password: 'admin123' },
  { id: 'user-2', name: 'Jane Smith', email: 'cashier@demo.com', role: 'cashier', password: 'cashier123' },
];

interface LoginProps {
  onLogin: () => void;
}

export function Login({ onLogin }: LoginProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = usePOSStore();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Simulate async login
    setTimeout(() => {
      const user = demoUsers.find(
        (u) => u.email === email && u.password === password
      );

      if (user) {
        const { password: _, ...userWithoutPassword } = user;
        login(userWithoutPassword);
        toast.success(`Bienvenido, ${user.name}!`);
        onLogin();
      } else {
        toast.error('Credenciales incorrectas');
      }
      setIsLoading(false);
    }, 500);
  };

  const handleDemoLogin = (userEmail: string, userPassword: string) => {
    setEmail(userEmail);
    setPassword(userPassword);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-primary rounded-lg flex items-center justify-center mb-4">
            <span className="text-primary-foreground font-bold text-xl">P</span>
          </div>
          <CardTitle className="text-2xl">ProPOS</CardTitle>
          <CardDescription>
            Ingresa tus credenciales para acceder al sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Correo electrónico</Label>
              <Input
                id="email"
                type="email"
                placeholder="correo@ejemplo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Contraseña</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? 'Ingresando...' : 'Ingresar'}
            </Button>
          </form>

          <div className="mt-6 pt-6 border-t border-border">
            <p className="text-sm text-muted-foreground text-center mb-4">
              Usuarios de demostración:
            </p>
            <div className="space-y-2">
              <Button
                variant="outline"
                className="w-full justify-start text-left"
                onClick={() => handleDemoLogin('admin@demo.com', 'admin123')}
              >
                <div>
                  <p className="font-medium">Administrador</p>
                  <p className="text-xs text-muted-foreground">admin@demo.com / admin123</p>
                </div>
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start text-left"
                onClick={() => handleDemoLogin('cashier@demo.com', 'cashier123')}
              >
                <div>
                  <p className="font-medium">Cajero</p>
                  <p className="text-xs text-muted-foreground">cashier@demo.com / cashier123</p>
                </div>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
