
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useSalesRepAuth } from '@/hooks/useSalesRepAuth';
import { SalesRep } from '@/types';

export const SalesRepLoginTest = () => {
  const [code, setCode] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [result, setResult] = useState<{
    success: boolean;
    salesRep?: Omit<SalesRep, 'password'>;
    error?: string;
  } | null>(null);

  const { authenticate, isLoading } = useSalesRepAuth();

  const handleLogin = async () => {
    if (!code || !password) {
      setResult({
        success: false,
        error: 'Código e senha são obrigatórios'
      });
      return;
    }

    const codeNumber = parseInt(code);
    if (isNaN(codeNumber)) {
      setResult({
        success: false,
        error: 'Código deve ser um número'
      });
      return;
    }

    const response = await authenticate(codeNumber, password);
    setResult(response);
  };

  const handleClear = () => {
    setCode('');
    setPassword('');
    setResult(null);
  };

  return (
    <Card className="max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Teste de Login - Vendedor</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="code">Código do Vendedor</Label>
          <Input
            id="code"
            type="number"
            placeholder="Digite o código"
            value={code}
            onChange={(e) => setCode(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">Senha</Label>
          <Input
            id="password"
            type="password"
            placeholder="Digite a senha"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        <div className="flex gap-2">
          <Button 
            onClick={handleLogin} 
            disabled={isLoading}
            className="flex-1"
          >
            {isLoading ? 'Autenticando...' : 'Login'}
          </Button>
          <Button 
            variant="outline" 
            onClick={handleClear}
            disabled={isLoading}
          >
            Limpar
          </Button>
        </div>

        {result && (
          <Alert variant={result.success ? "default" : "destructive"}>
            <AlertDescription>
              {result.success ? (
                <div>
                  <strong>✅ Login realizado com sucesso!</strong>
                  <br />
                  <strong>Nome:</strong> {result.salesRep?.name}
                  <br />
                  <strong>Código:</strong> {result.salesRep?.code}
                  <br />
                  <strong>Email:</strong> {result.salesRep?.email || 'N/A'}
                  <br />
                  <strong>Telefone:</strong> {result.salesRep?.phone || 'N/A'}
                </div>
              ) : (
                <strong>❌ {result.error}</strong>
              )}
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
};
