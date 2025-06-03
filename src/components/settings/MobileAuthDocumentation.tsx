
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Smartphone, Key, Shield, Code, AlertTriangle, CheckCircle } from 'lucide-react';

const MobileAuthDocumentation: React.FC = () => {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Smartphone className="h-5 w-5" />
            Mobile API - Documentação Corrigida
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          
          {/* Qual API usar quando */}
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center gap-2 mb-3">
              <AlertTriangle className="h-5 w-5 text-blue-600" />
              <h3 className="font-semibold text-blue-900">Importante: Escolha a API Correta</h3>
            </div>
            <div className="space-y-2 text-sm text-blue-800">
              <p><strong>Para enviar pedidos do mobile:</strong> Use <code>/mobile-orders-import</code></p>
              <p><strong>Para gerenciar pedidos já importados:</strong> Use <code>/orders-api</code></p>
              <p><strong>Para sincronização completa:</strong> Use <code>/mobile-sync</code></p>
            </div>
          </div>

          {/* Mobile Orders Import API */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <h3 className="text-lg font-semibold">1. Mobile Orders Import API</h3>
              <Badge variant="default" className="bg-green-500">RECOMENDADO PARA MOBILE</Badge>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-lg">
              <code className="text-sm">POST https://ufvnubabpcyimahbubkd.supabase.co/functions/v1/mobile-orders-import</code>
            </div>
            
            <div className="space-y-2">
              <p className="text-sm font-medium">Headers:</p>
              <pre className="bg-gray-100 p-3 rounded text-xs overflow-x-auto">
{`Authorization: Bearer token_do_vendedor
Content-Type: application/json`}
              </pre>
            </div>
            
            <div className="space-y-2">
              <p className="text-sm font-medium">Request Body:</p>
              <pre className="bg-gray-100 p-3 rounded text-xs overflow-x-auto">
{`{
  "customer_id": "uuid",
  "customer_name": "Cliente ABC",
  "sales_rep_name": "João Silva",
  "date": "2024-01-15T10:30:00Z",
  "due_date": "2024-01-30T10:30:00Z",
  "total": 1500.00,
  "discount": 50.00,
  "payment_method": "Cartão",
  "payment_table": "30 dias",
  "notes": "Entregar até 16h",
  "delivery_address": "Rua ABC, 123",
  "mobile_order_id": "MOBILE_001",
  "items": [
    {
      "product_name": "Produto A",
      "product_code": 101,
      "quantity": 10,
      "unit": "UN",
      "unit_price": 15.00,
      "price": 15.00,
      "discount": 0,
      "total": 150.00
    }
  ]
}`}
              </pre>
            </div>

            <div className="p-3 bg-green-50 border border-green-200 rounded">
              <p className="text-sm text-green-800">
                <strong>✅ Use esta API</strong> nos seus aplicativos mobile para enviar pedidos. 
                Os pedidos ficam na tabela orders_mobile até serem importados manualmente no desktop.
              </p>
            </div>
          </div>

          {/* Orders API (CRUD) - Warning */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-red-600" />
              <h3 className="text-lg font-semibold">2. Orders API (CRUD)</h3>
              <Badge variant="destructive">NÃO USAR PARA CRIAR PEDIDOS MOBILE</Badge>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-lg">
              <code className="text-sm">https://ufvnubabpcyimahbubkd.supabase.co/functions/v1/orders-api</code>
            </div>
            
            <div className="p-3 bg-red-50 border border-red-200 rounded">
              <p className="text-sm text-red-800">
                <strong>⚠️ ATENÇÃO:</strong> Esta API não deve ser usada para criar pedidos mobile. 
                Ela é apenas para gerenciar pedidos já importados no sistema.
              </p>
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium">Endpoints disponíveis:</p>
              <ul className="text-sm space-y-1 ml-4">
                <li><code>GET /</code> - Listar pedidos importados</li>
                <li><code>GET /:id</code> - Buscar pedido específico</li>
                <li><code>PUT /:id</code> - Atualizar pedido</li>
                <li><code>DELETE /:id</code> - Excluir pedido</li>
                <li className="text-red-600"><strong>POST / - ❌ NÃO ACEITA CRIAÇÃO DE PEDIDOS MOBILE</strong></li>
              </ul>
            </div>
          </div>

          {/* Mobile Sync API */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Code className="h-4 w-4 text-purple-600" />
              <h3 className="text-lg font-semibold">3. Mobile Sync API</h3>
              <Badge variant="outline" className="border-purple-500 text-purple-600">SINCRONIZAÇÃO COMPLETA</Badge>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-lg">
              <code className="text-sm">https://ufvnubabpcyimahbubkd.supabase.co/functions/v1/mobile-sync</code>
            </div>
            
            <div className="space-y-2">
              <p className="text-sm font-medium">Funcionalidades:</p>
              <ul className="text-sm space-y-1 ml-4">
                <li>• Baixar produtos e clientes atualizados</li>
                <li>• Enviar pedidos em lote</li>
                <li>• Obter estatísticas de sincronização</li>
                <li>• Gerenciar tokens de sincronização</li>
              </ul>
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium">Exemplo de Request:</p>
              <pre className="bg-gray-100 p-3 rounded text-xs overflow-x-auto">
{`{
  "action": "get_sync_data",
  "sales_rep_id": "uuid",
  "last_sync": "2024-01-15T10:30:00Z"
}`}
              </pre>
            </div>
          </div>

          {/* Authentication Guide */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Key className="h-4 w-4 text-blue-600" />
              <h3 className="text-lg font-semibold">Autenticação</h3>
            </div>

            <div className="space-y-4">
              <div className="border rounded-lg p-3">
                <p className="font-medium text-sm mb-2">Opção 1: Supabase Auth (Recomendado)</p>
                <div className="bg-gray-100 p-3 rounded text-xs">
                  <pre>
{`// Login
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

// Usar token nas requisições
const headers = {
  'Authorization': \`Bearer \${access_token}\`,
  'Content-Type': 'application/json'
};`}
                  </pre>
                </div>
              </div>

              <div className="border rounded-lg p-3">
                <p className="font-medium text-sm mb-2">Opção 2: API Token</p>
                <div className="bg-gray-100 p-3 rounded text-xs">
                  <pre>
{`const headers = {
  'x-api-key': 'sk_abcd1234...',
  'Content-Type': 'application/json'
};`}
                  </pre>
                </div>
              </div>
            </div>
          </div>

          {/* Error Responses */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold">Códigos de Erro</h3>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Badge variant="destructive">401</Badge>
                <span className="text-sm">Token inválido ou ausente</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="destructive">400</Badge>
                <span className="text-sm">Dados inválidos no request</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="destructive">500</Badge>
                <span className="text-sm">Erro interno do servidor</span>
              </div>
            </div>
          </div>

          {/* Quick Reference */}
          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-semibold text-blue-900 mb-2">Referência Rápida:</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• <strong>Criar pedidos mobile:</strong> <code>/mobile-orders-import</code></li>
              <li>• <strong>Gerenciar pedidos importados:</strong> <code>/orders-api</code></li>
              <li>• <strong>Sincronização completa:</strong> <code>/mobile-sync</code></li>
              <li>• <strong>Auth preferida:</strong> Supabase JWT tokens</li>
              <li>• <strong>Formato:</strong> Sempre JSON</li>
              <li>• <strong>HTTPS:</strong> Obrigatório em produção</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MobileAuthDocumentation;
