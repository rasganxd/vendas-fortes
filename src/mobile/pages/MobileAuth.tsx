
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, Smartphone } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { getRedirectPath } from '@/utils/deviceDetection';

export default function MobileAuth() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { user, userProfile, isMobile } = useAuth();

  useEffect(() => {
    if (user && userProfile) {
      const redirectPath = getRedirectPath(userProfile.role, isMobile);
      navigate(redirectPath);
    }
  }, [user, userProfile, isMobile, navigate]);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      if (data.user) {
        // Aguarda o perfil ser carregado e então redireciona
        setTimeout(() => {
          window.location.href = '/mobile';
        }, 1000);
      }
    } catch (error: any) {
      setError(error.message || 'Erro ao fazer login');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-sales-800 to-sales-900 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-sales-100 rounded-full flex items-center justify-center mb-4">
            <Smartphone className="w-6 h-6 text-sales-800" />
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900">
            Acesso Mobile
          </CardTitle>
          <p className="text-sm text-gray-600">
            Entre com suas credenciais de vendedor
          </p>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSignIn} className="space-y-4">
            {error && (
              <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-md">
                <AlertCircle className="w-4 h-4 text-red-500" />
                <span className="text-sm text-red-700">{error}</span>
              </div>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu@email.com"
                required
                className="w-full"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Sua senha"
                required
                className="w-full"
              />
            </div>
            
            <Button 
              type="submit" 
              className="w-full bg-sales-800 hover:bg-sales-700"
              disabled={isLoading}
            >
              {isLoading ? 'Entrando...' : 'Entrar'}
            </Button>
          </form>

          <div className="mt-6 pt-4 border-t border-gray-200">
            <p className="text-xs text-gray-500 text-center">
              Aplicativo mobile para vendedores
            </p>
            <p className="text-xs text-gray-500 text-center mt-1">
              Acesso restrito a usuários autorizados
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
