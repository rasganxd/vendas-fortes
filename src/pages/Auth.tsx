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

  useEffect(() => {
    if (user) {
      navigate('/', { replace: true });
    }
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    // Validações básicas
    if (!email || !password) {
      setError('Por favor, preencha todos os campos obrigatórios');
      setIsLoading(false);
      return;
    }

    if (password.length < 6) {
      setError('A senha deve ter pelo menos 6 caracteres');
      setIsLoading(false);
      return;
    }

    if (mode === 'signup' && !name) {
      setError('Por favor, informe seu nome');
      setIsLoading(false);
      return;
    }

    try {
      console.log(`Iniciando ${mode === 'signin' ? 'login' : 'cadastro'} para:`, email);
      
      let result;
      if (mode === 'signin') {
        result = await signIn(email, password);
      } else {
        result = await signUp(email, password, name);
      }

      if (result.error) {
        console.error('Erro na autenticação:', result.error);
        
        // Tratar diferentes tipos de erro
        let errorMessage = 'Erro inesperado. Tente novamente.';
        
        if (result.error.message?.includes('Invalid login credentials')) {
          errorMessage = 'Email ou senha incorretos';
        } else if (result.error.message?.includes('User already registered')) {
          errorMessage = 'Este email já está cadastrado. Tente fazer login.';
        } else if (result.error.message?.includes('Email not confirmed')) {
          errorMessage = 'Verifique seu email para confirmar a conta';
        } else if (result.error.message?.includes('Password should be at least')) {
          errorMessage = 'A senha deve ter pelo menos 6 caracteres';
        } else if (result.error.message?.includes('Unable to validate email address')) {
          errorMessage = 'Email inválido';
        } else if (result.error.message) {
          errorMessage = result.error.message;
        }
        
        setError(errorMessage);
      } else {
        console.log(`${mode === 'signin' ? 'Login' : 'Cadastro'} realizado com sucesso!`);
        // O redirecionamento é feito automaticamente no AuthContext
      }
    } catch (err: any) {
      console.error('Erro inesperado:', err);
      setError(err.message || 'Erro inesperado. Tente novamente.');
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