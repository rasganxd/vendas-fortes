
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Smartphone, Key, CheckCircle, Book, Code2, Wifi } from 'lucide-react';

const MobileAuthDocumentation: React.FC = () => {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Smartphone className="h-5 w-5" />
            API Mobile - Guia Simples
          </CardTitle>
          <p className="text-sm text-gray-600">
            Documentação simplificada para conectar seu aplicativo mobile ao sistema
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          
          {/* O que é */}
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center gap-2 mb-3">
              <Book className="h-5 w-5 text-blue-600" />
              <h3 className="font-semibold text-blue-900">O que é a API Mobile?</h3>
            </div>
            <p className="text-sm text-blue-800">
              É um sistema que permite que seu aplicativo mobile se conecte com este sistema para:
            </p>
            <ul className="text-sm text-blue-800 mt-2 ml-4 space-y-1">
              <li>• <strong>Baixar</strong> dados atualizados (produtos, clientes)</li>
              <li>• <strong>Enviar</strong> pedidos feitos no mobile</li>
              <li>• <strong>Sincronizar</strong> informações entre mobile e sistema</li>
            </ul>
          </div>

          {/* Como funciona */}
          <div className="border rounded-lg p-4">
            <div className="flex items-center gap-2 mb-3">
              <Wifi className="h-5 w-5 text-green-500" />
              <h3 className="font-semibold text-lg">Como Funciona</h3>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold">1</div>
                <div>
                  <p className="font-medium">Gere um Token de Acesso</p>
                  <p className="text-sm text-gray-600">Na aba "API REST & Mobile", crie um token para o vendedor</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold">2</div>
                <div>
                  <p className="font-medium">Configure o App Mobile</p>
                  <p className="text-sm text-gray-600">Use o endereço da API e o token no seu aplicativo</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold">3</div>
                <div>
                  <p className="font-medium">Sincronize os Dados</p>
                  <p className="text-sm text-gray-600">O app baixa produtos/clientes e envia pedidos automaticamente</p>
                </div>
              </div>
            </div>
          </div>

          {/* Endereço da API */}
          <div className="border rounded-lg p-4">
            <div className="flex items-center gap-2 mb-3">
              <Code2 className="h-5 w-5 text-purple-500" />
              <h3 className="font-semibold text-lg">Endereço da API</h3>
              <Badge variant="default" className="bg-purple-500">COPIE ESTE ENDEREÇO</Badge>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-lg">
              <code className="text-sm font-mono break-all">
                https://ufvnubabpcyimahbubkd.supabase.co/functions/v1/mobile-sync
              </code>
            </div>
            
            <p className="text-sm text-gray-600 mt-2">
              Este é o endereço que você deve usar no seu aplicativo mobile para todas as operações.
            </p>
          </div>

          {/* O que a API faz */}
          <div className="border rounded-lg p-4">
            <h3 className="font-semibold text-lg mb-3">O que você pode fazer com a API</h3>
            
            <div className="space-y-3">
              <div className="p-3 bg-green-50 border border-green-200 rounded">
                <div className="flex items-center gap-2 mb-1">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span className="font-medium text-green-800">Baixar Dados Atualizados</span>
                </div>
                <p className="text-sm text-green-700">
                  Buscar lista de produtos e clientes mais recentes do sistema
                </p>
              </div>

              <div className="p-3 bg-blue-50 border border-blue-200 rounded">
                <div className="flex items-center gap-2 mb-1">
                  <CheckCircle className="h-4 w-4 text-blue-600" />
                  <span className="font-medium text-blue-800">Enviar Pedidos</span>
                </div>
                <p className="text-sm text-blue-700">
                  Enviar pedidos feitos no mobile para o sistema principal
                </p>
              </div>

              <div className="p-3 bg-purple-50 border border-purple-200 rounded">
                <div className="flex items-center gap-2 mb-1">
                  <CheckCircle className="h-4 w-4 text-purple-600" />
                  <span className="font-medium text-purple-800">Ver Estatísticas</span>
                </div>
                <p className="text-sm text-purple-700">
                  Acompanhar quantos pedidos foram sincronizados
                </p>
              </div>
            </div>
          </div>

          {/* Exemplo prático */}
          <div className="border rounded-lg p-4">
            <h3 className="font-semibold text-lg mb-3">Exemplo de Uso no App Mobile</h3>
            
            <div className="space-y-3">
              <div>
                <p className="font-medium text-sm mb-2">1. Para baixar dados atualizados:</p>
                <div className="bg-gray-100 p-3 rounded text-xs">
                  <pre>
{`{
  "action": "get_sync_data",
  "sales_rep_id": "id-do-vendedor",
  "last_sync": "2024-01-15T10:30:00Z"
}`}
                  </pre>
                </div>
              </div>

              <div>
                <p className="font-medium text-sm mb-2">2. Para enviar pedidos:</p>
                <div className="bg-gray-100 p-3 rounded text-xs">
                  <pre>
{`{
  "action": "upload_orders",
  "sales_rep_id": "id-do-vendedor",
  "orders": [
    {
      "customer_name": "Cliente ABC",
      "total": 1500.00,
      "items": [...]
    }
  ]
}`}
                  </pre>
                </div>
              </div>
            </div>
          </div>

          {/* Como autenticar */}
          <div className="border rounded-lg p-4">
            <div className="flex items-center gap-2 mb-3">
              <Key className="h-5 w-5 text-orange-500" />
              <h3 className="font-semibold text-lg">Como Autenticar (Importante!)</h3>
            </div>
            
            <p className="text-sm text-gray-600 mb-3">
              Para usar a API, você precisa incluir o token de acesso em todas as requisições:
            </p>
            
            <div className="bg-yellow-50 border border-yellow-200 p-3 rounded">
              <p className="font-medium text-sm text-yellow-800 mb-1">Cabeçalho obrigatório:</p>
              <code className="text-sm bg-yellow-100 p-2 rounded border block">
                Authorization: Bearer seu_token_aqui
              </code>
            </div>
            
            <p className="text-sm text-gray-600 mt-2">
              O token é gerado na aba "API REST & Mobile" deste sistema.
            </p>
          </div>

          {/* Dicas importantes */}
          <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
            <h4 className="font-semibold text-orange-900 mb-2">💡 Dicas Importantes:</h4>
            <ul className="text-sm text-orange-800 space-y-1">
              <li>• Sempre teste a conexão primeiro antes de usar em produção</li>
              <li>• Guarde o token em local seguro no app mobile</li>
              <li>• Use HTTPS sempre (nunca HTTP)</li>
              <li>• Sincronize os dados regularmente para manter tudo atualizado</li>
              <li>• Se tiver problemas, verifique se o token está correto e ativo</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MobileAuthDocumentation;
