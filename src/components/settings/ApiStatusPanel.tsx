
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Wifi, WifiOff, RefreshCw, CheckCircle, XCircle, AlertCircle, Globe, Key, Shield } from "lucide-react";
import { toast } from "sonner";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

interface ApiStatus {
  isConnected: boolean;
  isProtected?: boolean;
  responseTime?: number;
  lastChecked?: Date;
  error?: string;
}

const ApiStatusPanel: React.FC = () => {
  const [ordersApiStatus, setOrdersApiStatus] = useState<ApiStatus>({
    isConnected: false
  });
  const [mobileImportStatus, setMobileImportStatus] = useState<ApiStatus>({
    isConnected: false
  });
  const [mobileSyncStatus, setMobileSyncStatus] = useState<ApiStatus>({
    isConnected: false
  });
  const [isTestingConnection, setIsTestingConnection] = useState(false);

  const ORDERS_API_URL = 'https://ufvnubabpcyimahbubkd.supabase.co/functions/v1/orders-api';
  const MOBILE_IMPORT_URL = 'https://ufvnubabpcyimahbubkd.supabase.co/functions/v1/mobile-orders-import';
  const MOBILE_SYNC_URL = 'https://ufvnubabpcyimahbubkd.supabase.co/functions/v1/mobile-sync';

  const testEndpoint = async (url: string, name: string) => {
    const startTime = Date.now();
    try {
      console.log(`🔍 Testing ${name} connection to:`, url);

      const response = await fetch(url, {
        method: 'OPTIONS',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      const responseTime = Date.now() - startTime;
      console.log(`📡 ${name} Response:`, response.status, response.statusText);
      
      if (response.ok || response.status === 200) {
        return {
          isConnected: true,
          responseTime,
          lastChecked: new Date(),
          error: undefined
        };
      } else {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
    } catch (error) {
      console.error(`❌ ${name} connection test failed:`, error);
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      return {
        isConnected: false,
        lastChecked: new Date(),
        error: errorMessage
      };
    }
  };

  const testOrdersApiAuth = async () => {
    const startTime = Date.now();
    try {
      console.log('🔐 Testing Orders API with authentication check...');

      const response = await fetch(ORDERS_API_URL, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      const responseTime = Date.now() - startTime;
      console.log('🔐 Orders API auth test response:', response.status);
      
      if (response.status === 401) {
        // 401 significa que a API está funcionando e protegida
        return {
          isConnected: true,
          isProtected: true,
          responseTime,
          lastChecked: new Date(),
          error: undefined
        };
      } else if (response.ok) {
        return {
          isConnected: true,
          isProtected: false,
          responseTime,
          lastChecked: new Date(),
          error: undefined
        };
      } else {
        throw new Error(`HTTP ${response.status}`);
      }
    } catch (error) {
      console.error('❌ Orders API auth test failed:', error);
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      return {
        isConnected: false,
        lastChecked: new Date(),
        error: errorMessage
      };
    }
  };

  const testAllEndpoints = async (showToast = true) => {
    setIsTestingConnection(true);
    try {
      console.log('🔍 Testing all API endpoints...');

      // Teste do Orders API (com verificação de auth)
      const ordersResult = await testOrdersApiAuth();
      setOrdersApiStatus(ordersResult);

      // Teste do Mobile Import
      const mobileImportResult = await testEndpoint(MOBILE_IMPORT_URL, 'Mobile Import');
      setMobileImportStatus(mobileImportResult);

      // Teste do Mobile Sync
      const mobileSyncResult = await testEndpoint(MOBILE_SYNC_URL, 'Mobile Sync');
      setMobileSyncStatus(mobileSyncResult);

      if (showToast) {
        const allWorking = ordersResult.isConnected && mobileImportResult.isConnected && mobileSyncResult.isConnected;
        if (allWorking) {
          toast.success('Todas as APIs estão funcionando!');
        } else {
          toast.error('Algumas APIs apresentaram problemas');
        }
      }

    } catch (error) {
      console.error('❌ Failed to test endpoints:', error);
      if (showToast) {
        toast.error('Erro ao testar endpoints');
      }
    } finally {
      setIsTestingConnection(false);
    }
  };

  useEffect(() => {
    testAllEndpoints(false);
  }, []);

  const getStatusIcon = (status: ApiStatus) => {
    if (isTestingConnection) {
      return <RefreshCw className="h-5 w-5 animate-spin text-blue-500" />;
    }
    if (status.isConnected && status.isProtected) {
      return <Shield className="h-5 w-5 text-green-500" />;
    }
    return status.isConnected ? <CheckCircle className="h-5 w-5 text-green-500" /> : <XCircle className="h-5 w-5 text-red-500" />;
  };

  const getStatusBadge = (status: ApiStatus) => {
    if (isTestingConnection) {
      return <Badge variant="outline">Testando...</Badge>;
    }
    if (status.isConnected && status.isProtected) {
      return <Badge variant="default" className="bg-green-500">Protegida (Ativa)</Badge>;
    }
    return status.isConnected ? <Badge variant="default" className="bg-green-500">Ativa</Badge> : <Badge variant="destructive">Inativa</Badge>;
  };

  const formatDate = (date: Date) => {
    return date.toLocaleString('pt-BR');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Globe className="h-5 w-5" />
          Status das APIs
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Orders API Status */}
        <div className="flex items-center justify-between p-4 border rounded-lg">
          <div className="flex items-center gap-3">
            {getStatusIcon(ordersApiStatus)}
            <div>
              <p className="font-medium">API de Pedidos (CRUD)</p>
              <p className="text-sm text-muted-foreground">
                {ORDERS_API_URL}
              </p>
              <p className="text-xs text-muted-foreground">
                Gerenciar pedidos importados - Requer autenticação
              </p>
            </div>
          </div>
          {getStatusBadge(ordersApiStatus)}
        </div>

        {/* Mobile Import API Status */}
        <div className="flex items-center justify-between p-4 border rounded-lg">
          <div className="flex items-center gap-3">
            {getStatusIcon(mobileImportStatus)}
            <div>
              <p className="font-medium">API Mobile Import</p>
              <p className="text-sm text-muted-foreground">
                {MOBILE_IMPORT_URL}
              </p>
              <p className="text-xs text-muted-foreground">
                Mobile enviar pedidos - Para apps mobile
              </p>
            </div>
          </div>
          {getStatusBadge(mobileImportStatus)}
        </div>

        {/* Mobile Sync API Status */}
        <div className="flex items-center justify-between p-4 border rounded-lg">
          <div className="flex items-center gap-3">
            {getStatusIcon(mobileSyncStatus)}
            <div>
              <p className="font-medium">API Mobile Sync</p>
              <p className="text-sm text-muted-foreground">
                {MOBILE_SYNC_URL}
              </p>
              <p className="text-xs text-muted-foreground">
                Sincronização completa mobile - Dados + Pedidos
              </p>
            </div>
          </div>
          {getStatusBadge(mobileSyncStatus)}
        </div>

        {/* Status Summary */}
        {(ordersApiStatus.lastChecked || mobileImportStatus.lastChecked || mobileSyncStatus.lastChecked) && (
          <div className="text-sm space-y-1 p-3 bg-gray-50 rounded-lg">
            <p><strong>Última verificação:</strong> {formatDate(new Date())}</p>
            {ordersApiStatus.responseTime && (
              <p><strong>Orders API:</strong> {ordersApiStatus.responseTime}ms</p>
            )}
            {mobileImportStatus.responseTime && (
              <p><strong>Mobile Import:</strong> {mobileImportStatus.responseTime}ms</p>
            )}
            {mobileSyncStatus.responseTime && (
              <p><strong>Mobile Sync:</strong> {mobileSyncStatus.responseTime}ms</p>
            )}
          </div>
        )}

        {/* Errors */}
        {(ordersApiStatus.error || mobileImportStatus.error || mobileSyncStatus.error) && (
          <div className="space-y-2">
            {ordersApiStatus.error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-start gap-2">
                  <AlertCircle className="h-5 w-5 text-red-500 mt-0.5" />
                  <div>
                    <p className="font-medium text-red-800">Orders API</p>
                    <p className="text-sm text-red-600">{ordersApiStatus.error}</p>
                  </div>
                </div>
              </div>
            )}
            {mobileImportStatus.error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-start gap-2">
                  <AlertCircle className="h-5 w-5 text-red-500 mt-0.5" />
                  <div>
                    <p className="font-medium text-red-800">Mobile Import API</p>
                    <p className="text-sm text-red-600">{mobileImportStatus.error}</p>
                  </div>
                </div>
              </div>
            )}
            {mobileSyncStatus.error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-start gap-2">
                  <AlertCircle className="h-5 w-5 text-red-500 mt-0.5" />
                  <div>
                    <p className="font-medium text-red-800">Mobile Sync API</p>
                    <p className="text-sm text-red-600">{mobileSyncStatus.error}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Test Button */}
        <div className="flex gap-2">
          <Button 
            onClick={() => testAllEndpoints(true)} 
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
                Testar Todas APIs
              </>
            )}
          </Button>
        </div>

        {/* API Purpose Guide */}
        <div className="pt-4 border-t">
          <h4 className="font-medium mb-3">Guia de Uso das APIs:</h4>
          <div className="space-y-3 text-sm">
            <div className="p-3 border rounded-lg">
              <div className="flex items-center gap-2 mb-1">
                <Shield className="h-4 w-4 text-blue-500" />
                <span className="font-medium">Orders API (CRUD)</span>
              </div>
              <p className="text-muted-foreground mb-2">Para gerenciar pedidos já importados</p>
              <ul className="text-xs space-y-1 text-muted-foreground">
                <li>• <code>GET /</code> - Listar pedidos importados</li>
                <li>• <code>GET /:id</code> - Buscar pedido específico</li>
                <li>• <code>PUT /:id</code> - Atualizar pedido</li>
                <li>• <code>DELETE /:id</code> - Excluir pedido</li>
                <li>• ⚠️ Não aceita criação de pedidos mobile</li>
              </ul>
            </div>

            <div className="p-3 border rounded-lg">
              <div className="flex items-center gap-2 mb-1">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span className="font-medium">Mobile Import API</span>
              </div>
              <p className="text-muted-foreground mb-2">Para apps mobile enviarem pedidos</p>
              <ul className="text-xs space-y-1 text-muted-foreground">
                <li>• <code>POST /</code> - Enviar pedidos do mobile</li>
                <li>• Pedidos ficam pendentes até importação manual</li>
                <li>• Use este endpoint nos apps mobile</li>
              </ul>
            </div>

            <div className="p-3 border rounded-lg">
              <div className="flex items-center gap-2 mb-1">
                <RefreshCw className="h-4 w-4 text-purple-500" />
                <span className="font-medium">Mobile Sync API</span>
              </div>
              <p className="text-muted-foreground mb-2">Sincronização completa mobile</p>
              <ul className="text-xs space-y-1 text-muted-foreground">
                <li>• Baixar produtos e clientes atualizados</li>
                <li>• Enviar pedidos em lote</li>
                <li>• Obter estatísticas de sincronização</li>
              </ul>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ApiStatusPanel;
