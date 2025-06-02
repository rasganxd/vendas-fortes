
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Smartphone, Key, Database, Upload } from 'lucide-react';

const MobileAuthDocumentation = () => {
  const baseUrl = 'https://ufvnubabpcyimahbubkd.supabase.co/functions/v1';

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Smartphone className="h-5 w-5" />
            API Mobile - Documentação
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          
          {/* Authentication Endpoint */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Key className="h-4 w-4 text-green-600" />
              <h3 className="text-lg font-semibold">1. Autenticação</h3>
              <Badge variant="outline">POST</Badge>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-lg">
              <code className="text-sm">POST {baseUrl}/mobile-auth</code>
            </div>
            
            <div className="space-y-2">
              <p className="text-sm font-medium">Request Body:</p>
              <pre className="bg-gray-100 p-3 rounded text-xs overflow-x-auto">
{`{
  "salesRepCode": 1001,
  "password": "senha123"
}`}
              </pre>
            </div>
            
            <div className="space-y-2">
              <p className="text-sm font-medium">Response (Success):</p>
              <pre className="bg-gray-100 p-3 rounded text-xs overflow-x-auto">
{`{
  "success": true,
  "salesRep": {
    "id": "uuid",
    "code": 1001,
    "name": "João Silva",
    "email": "joao@empresa.com"
  },
  "token": "sk_abcd1234..."
}`}
              </pre>
            </div>
          </div>

          {/* Sync Data Endpoint */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Database className="h-4 w-4 text-blue-600" />
              <h3 className="text-lg font-semibold">2. Sincronização de Dados</h3>
              <Badge variant="outline">GET</Badge>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-lg">
              <code className="text-sm">GET {baseUrl}/mobile-sync</code>
            </div>
            
            <div className="space-y-2">
              <p className="text-sm font-medium">Headers:</p>
              <pre className="bg-gray-100 p-3 rounded text-xs overflow-x-auto">
{`Authorization: Bearer sk_abcd1234...`}
              </pre>
            </div>
            
            <div className="space-y-2">
              <p className="text-sm font-medium">Response:</p>
              <pre className="bg-gray-100 p-3 rounded text-xs overflow-x-auto">
{`{
  "success": true,
  "data": {
    "customers": [...],
    "products": [...],
    "paymentTables": [...],
    "lastSync": "2024-01-15T10:30:00Z"
  }
}`}
              </pre>
            </div>
          </div>

          {/* Orders Endpoint */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Upload className="h-4 w-4 text-purple-600" />
              <h3 className="text-lg font-semibold">3. Envio de Pedidos</h3>
              <Badge variant="outline">POST</Badge>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-lg">
              <code className="text-sm">POST {baseUrl}/mobile-orders</code>
            </div>
            
            <div className="space-y-2">
              <p className="text-sm font-medium">Headers:</p>
              <pre className="bg-gray-100 p-3 rounded text-xs overflow-x-auto">
{`Authorization: Bearer sk_abcd1234...
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
      "product_id": "uuid",
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

          {/* Notes */}
          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-semibold text-blue-900 mb-2">Notas Importantes:</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Os tokens de API expiram em 30 dias</li>
              <li>• Todos os endpoints retornam JSON</li>
              <li>• Use HTTPS em produção</li>
              <li>• Os pedidos mobile ficam na tabela orders_mobile até serem importados</li>
              <li>• Atualmente qualquer senha é aceita para vendedores ativos (temporário)</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MobileAuthDocumentation;
