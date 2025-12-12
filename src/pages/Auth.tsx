import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

export default function Auth() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [name, setName] = useState('');

  const { signIn, signUp, user } = useAuth();
  const navigate = useNavigate();

  console.log('DEBUG_SUPABASE_URL', import.meta.env.VITE_SUPABASE_URL);
  console.log('DEBUG_SUPABASE_KEY_DEFINED', !!import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY);

  const handleOfflineLogin = () => {
    // Credenciais de acesso temporário: admin@offline / admin123
    if (email !== 'admin@offline' || password !== 'admin123') {
      setError('Para acesso temporário, use email "admin@offline" e senha "admin123".');
      return;
    }

    try {
      localStorage.setItem(
        'offline_admin_login',
        JSON.stringify({
          email,
          createdAt: new Date().toISOString(),
        }),
      );
    } catch (storageError) {
      console.error('Erro ao salvar acesso offline:', storageError);
    }

    navigate('/', { replace: true });
  };

  useEffect(() => {
    if (user) {
      navigate('/', { replace: true });
    }
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validações básicas
    if (!email || !password) {
      setError('Por favor, preencha todos os campos obrigatórios');
      return;
    }

    if (password.length < 6) {
      setError('A senha deve ter pelo menos 6 caracteres');
      return;
    }

    if (mode === 'signup' && !name.trim()) {
      setError('Por favor, informe seu nome');
      return;
    }

    console.log(`🎯 Iniciando ${mode === 'signin' ? 'login' : 'cadastro'} para:`, email);
    setIsLoading(true);
    setError(null);

    try {
      let result;
      if (mode === 'signin') {
        result = await signIn(email, password);
      } else {
        result = await signUp(email, password, name);
      }

      if (result.error) {
        console.error(`❌ Erro na ${mode === 'signin' ? 'autenticação' : 'criação de conta'}:`, result.error);
        setError(result.error.message || 'Erro inesperado. Tente novamente.');
      } else {
        console.log(`✅ ${mode === 'signin' ? 'Login' : 'Cadastro'} realizado com sucesso!`);
        // O redirecionamento é feito automaticamente no AuthContext
      }
    } catch (err: any) {
      console.error(`💥 Erro inesperado no ${mode}:`, err);
      setError(err.message || 'Erro inesperado. Verifique sua conexão e tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">
            {mode === 'signin' ? 'Login Administrativo' : 'Criar Conta Admin'}
          </CardTitle>
          <CardDescription>
            {mode === 'signin' 
              ? 'Acesse o sistema de gestão'
              : 'Crie sua conta de administrador'
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'signup' && (
              <div className="space-y-2">
                <Label htmlFor="name">Nome</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Seu nome"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="admin@empresa.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
              />
            </div>

            {error && (
              <Alert variant={error.includes('Verifique') ? 'default' : 'destructive'}>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <LoadingSpinner size="sm" className="mr-2" />
                  {mode === 'signin' ? 'Entrando...' : 'Criando conta...'}
                </>
              ) : (
                mode === 'signin' ? 'Entrar' : 'Criar Conta'
              )}
            </Button>

            <Button
              type="button"
              variant="outline"
              className="w-full mt-2"
              onClick={handleOfflineLogin}
            >
              Acesso temporário (offline)
            </Button>
          </form>
 
          <div className="mt-4 text-center">
            <Button
              variant="link"
              onClick={() => {
                setMode(mode === 'signin' ? 'signup' : 'signin');
                setError(null);
              }}
              className="text-sm"
            >
              {mode === 'signin' 
                ? 'Não tem conta? Criar conta'
                : 'Já tem conta? Fazer login'
              }
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}