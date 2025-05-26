
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Smartphone, Key, Shield, Code } from 'lucide-react';

const MobileAuthDocumentation: React.FC = () => {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Smartphone className="h-5 w-5" />
            Autenticação Mobile - Guia Completo
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Fluxo de Autenticação
            </h3>
            <div className="space-y-3">
              <div className="border-l-4 border-blue-500 pl-4">
                <p className="font-medium">1. Criar Credenciais do Vendedor</p>
                <p className="text-sm text-gray-600">
                  Na página de vendedores, clique em "Credenciais" para criar email e senha para cada vendedor.
                </p>
              </div>
              <div className="border-l-4 border-green-500 pl-4">
                <p className="font-medium">2. Login no App Mobile</p>
                <p className="text-sm text-gray-600">
                  O vendedor usa email e senha para fazer login no aplicativo mobile.
                </p>
              </div>
              <div className="border-l-4 border-purple-500 pl-4">
                <p className="font-medium">3. Geração Automática de Token</p>
                <p className="text-sm text-gray-600">
                  Após o login, um token de API é gerado automaticamente para acessar os endpoints.
                </p>
              </div>
            </div>
          </div>

          <div>
            <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
              <Key className="h-5 w-5" />
              Endpoints de Autenticação
            </h3>
            <div className="bg-gray-50 p-4 rounded-lg space-y-3">
              <div>
                <Badge variant="outline" className="mb-2">POST</Badge>
                <code className="block text-sm bg-white p-2 rounded border">
                  /auth/v1/token?grant_type=password
                </code>
                <p className="text-sm text-gray-600 mt-1">
                  Endpoint do Supabase para login com email/senha
                </p>
              </div>
              <div>
                <Badge variant="outline" className="mb-2">POST</Badge>
                <code className="block text-sm bg-white p-2 rounded border">
                  /auth/v1/logout
                </code>
                <p className="text-sm text-gray-600 mt-1">
                  Endpoint para logout e invalidação da sessão
                </p>
              </div>
            </div>
          </div>

          <div>
            <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
              <Code className="h-5 w-5" />
              Exemplo de Implementação Mobile
            </h3>
            <div className="bg-gray-900 text-white p-4 rounded-lg text-sm">
              <pre className="whitespace-pre-wrap">
{`// Login no App Mobile
const login = async (email, password) => {
  const response = await fetch(
    'https://ufvnubabpcyimahbubkd.supabase.co/auth/v1/token?grant_type=password',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
      },
      body: JSON.stringify({ email, password })
    }
  );
  
  const data = await response.json();
  if (data.access_token) {
    // Salvar token para uso nas requisições
    localStorage.setItem('auth_token', data.access_token);
    return data;
  }
  throw new Error('Login failed');
};

// Usar token nas requisições da API
const createOrder = async (orderData) => {
  const token = localStorage.getItem('auth_token');
  
  const response = await fetch(
    'https://ufvnubabpcyimahbubkd.supabase.co/functions/v1/orders-api',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': \`Bearer \${token}\`
      },
      body: JSON.stringify(orderData)
    }
  );
  
  return response.json();
};`}
              </pre>
            </div>
          </div>

          <div>
            <h3 className="font-semibold text-lg mb-3">Segurança e RLS</h3>
            <div className="space-y-2">
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                <div>
                  <p className="font-medium">Row Level Security (RLS)</p>
                  <p className="text-sm text-gray-600">
                    Cada vendedor vê apenas seus próprios clientes e pedidos
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                <div>
                  <p className="font-medium">Autenticação JWT</p>
                  <p className="text-sm text-gray-600">
                    Tokens JWT do Supabase para autenticação segura
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-purple-500 rounded-full mt-2"></div>
                <div>
                  <p className="font-medium">API Keys Alternativas</p>
                  <p className="text-sm text-gray-600">
                    Tokens de API personalizados também são suportados
                  </p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MobileAuthDocumentation;
