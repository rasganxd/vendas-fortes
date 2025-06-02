
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Wifi, 
  WifiOff, 
  RefreshCw, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  Globe,
  Key
} from "lucide-react";
import { toast } from "sonner";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

interface ApiStatus {
  isConnected: boolean;
  responseTime?: number;
  lastChecked?: Date;
  error?: string;
}

const ApiStatusPanel: React.FC = () => {
  const [apiStatus, setApiStatus] = useState<ApiStatus>({
    isConnected: false
  });
  const [isTestingConnection, setIsTestingConnection] = useState(false);
  const [lastTestResult, setLastTestResult] = useState<string>('');

  const API_BASE_URL = 'https://ufvnubabpcyimahbubkd.supabase.co/functions/v1/orders-api';

  const testApiConnection = async (showToast = true) => {
    setIsTestingConnection(true);
    const startTime = Date.now();

    try {
      console.log('🔍 Testing API connection to:', API_BASE_URL);
      
      // Test basic connectivity with OPTIONS request (no auth needed)
      const response = await fetch(API_BASE_URL, {
        method: 'OPTIONS',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const responseTime = Date.now() - startTime;
      console.log('📡 API Response:', response.status, response.statusText);

      if (response.ok || response.status === 200) {
        const newStatus = {
          isConnected: true,
          responseTime,
          lastChecked: new Date(),
          error: undefined
        };
        
        setApiStatus(newStatus);
        setLastTestResult(`✅ Conectado (${responseTime}ms)`);
        
        if (showToast) {
          toast.success(`API conectada com sucesso! Tempo de resposta: ${responseTime}ms`);
        }
      } else {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
    } catch (error) {
      console.error('❌ API connection test failed:', error);
      
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      const newStatus = {
        isConnected: false,
        lastChecked: new Date(),
        error: errorMessage
      };
      
      setApiStatus(newStatus);
      setLastTestResult(`❌ Erro: ${errorMessage}`);
      
      if (showToast) {
        toast.error(`Falha na conexão: ${errorMessage}`);
      }
    } finally {
      setIsTestingConnection(false);
    }
  };

  const testWithAuthentication = async () => {
    setIsTestingConnection(true);
    
    try {
      console.log('🔐 Testing API with authentication...');
      
      // Test with a GET request (requires authentication)
      const response = await fetch(API_BASE_URL, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': 'test-key' // This will fail but we can see the response
        },
      });

      console.log('🔐 Auth test response:', response.status);
      
      if (response.status === 401) {
        toast.success('API está funcionando! (Erro 401 = autenticação necessária)');
        setLastTestResult('✅ API ativa - Token necessário para acesso');
      } else if (response.ok) {
        toast.success('API e autenticação funcionando!');
        setLastTestResult('✅ API e autenticação OK');
      } else {
        throw new Error(`HTTP ${response.status}`);
      }
    } catch (error) {
      console.error('❌ Auth test failed:', error);
      toast.error('Erro no teste de autenticação');
      setLastTestResult(`❌ Erro auth: ${error}`);
    } finally {
      setIsTestingConnection(false);
    }
  };

  // Test connection on component mount
  useEffect(() => {
    testApiConnection(false);
  }, []);

  const getStatusIcon = () => {
    if (isTestingConnection) {
      return <RefreshCw className="h-5 w-5 animate-spin text-blue-500" />;
    }
    
    return apiStatus.isConnected ? (
      <CheckCircle className="h-5 w-5 text-green-500" />
    ) : (
      <XCircle className="h-5 w-5 text-red-500" />
    );
  };

  const getStatusBadge = () => {
    if (isTestingConnection) {
      return <Badge variant="outline">Testando...</Badge>;
    }
    
    return apiStatus.isConnected ? (
      <Badge variant="default" className="bg-green-500">Conectado</Badge>
    ) : (
      <Badge variant="destructive">Desconectado</Badge>
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Globe className="h-5 w-5" />
          Status da API REST
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Status Principal */}
        <div className="flex items-center justify-between p-4 border rounded-lg">
          <div className="flex items-center gap-3">
            {getStatusIcon()}
            <div>
              <p className="font-medium">API de Pedidos</p>
              <p className="text-sm text-muted-foreground">
                {API_BASE_URL}
              </p>
            </div>
          </div>
          {getStatusBadge()}
        </div>

        {/* Informações de Status */}
        {apiStatus.lastChecked && (
          <div className="text-sm space-y-1">
            <p>
              <strong>Última verificação:</strong> {apiStatus.lastChecked.toLocaleString()}
            </p>
            {apiStatus.responseTime && (
              <p>
                <strong>Tempo de resposta:</strong> {apiStatus.responseTime}ms
              </p>
            )}
            {lastTestResult && (
              <p>
                <strong>Resultado:</strong> {lastTestResult}
              </p>
            )}
          </div>
        )}

        {/* Erro */}
        {apiStatus.error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-start gap-2">
              <AlertCircle className="h-5 w-5 text-red-500 mt-0.5" />
              <div>
                <p className="font-medium text-red-800">Erro de Conexão</p>
                <p className="text-sm text-red-600">{apiStatus.error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Botões de Teste */}
        <div className="flex gap-2">
          <Button 
            onClick={() => testApiConnection(true)}
            disabled={isTestingConnection}
            variant="outline"
            className="flex-1"
          >
            {isTestingConnection ? (
              <>
                <LoadingSpinner size="sm" className="mr-2" />
                Testando...
              </>
            ) : (
              <>
                <Wifi className="mr-2 h-4 w-4" />
                Testar Conexão
              </>
            )}
          </Button>
          
          <Button 
            onClick={testWithAuthentication}
            disabled={isTestingConnection}
            variant="outline"
            className="flex-1"
          >
            {isTestingConnection ? (
              <>
                <LoadingSpinner size="sm" className="mr-2" />
                Testando...
              </>
            ) : (
              <>
                <Key className="mr-2 h-4 w-4" />
                Testar Auth
              </>
            )}
          </Button>
        </div>

        {/* Documentação Rápida */}
        <div className="pt-4 border-t">
          <h4 className="font-medium mb-2">Endpoints Disponíveis:</h4>
          <div className="text-sm space-y-1 text-muted-foreground">
            <p><code>GET /</code> - Listar pedidos</p>
            <p><code>POST /</code> - Criar pedido</p>
            <p><code>GET /:id</code> - Buscar pedido</p>
            <p><code>PUT /:id</code> - Atualizar pedido</p>
            <p><code>DELETE /:id</code> - Excluir pedido</p>
          </div>
        </div>

        {/* Nota sobre Autenticação */}
        <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-start gap-2">
            <AlertCircle className="h-5 w-5 text-blue-500 mt-0.5" />
            <div className="text-sm">
              <p className="font-medium text-blue-800">Autenticação Necessária</p>
              <p className="text-blue-600">
                Para usar a API, inclua o header: <code>x-api-key: seu_token</code>
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ApiStatusPanel;
