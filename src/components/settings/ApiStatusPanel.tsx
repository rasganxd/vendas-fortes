
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Wifi, WifiOff, RefreshCw, CheckCircle, XCircle, AlertCircle, Smartphone } from "lucide-react";
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

  const MOBILE_SYNC_URL = 'https://ufvnubabpcyimahbubkd.supabase.co/functions/v1/mobile-sync';

  const testMobileSyncApi = async () => {
    const startTime = Date.now();
    try {
      console.log('🔍 Testing Mobile Sync API connection...');

      const response = await fetch(MOBILE_SYNC_URL, {
        method: 'OPTIONS',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      const responseTime = Date.now() - startTime;
      console.log('📡 Mobile Sync API Response:', response.status, response.statusText);
      
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
      console.error('❌ Mobile Sync API connection test failed:', error);
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      return {
        isConnected: false,
        lastChecked: new Date(),
        error: errorMessage
      };
    }
  };

  const testConnection = async (showToast = true) => {
    setIsTestingConnection(true);
    try {
      console.log('🔍 Testing Mobile Sync API...');

      const result = await testMobileSyncApi();
      setApiStatus(result);

      if (showToast) {
        if (result.isConnected) {
          toast.success('API Mobile funcionando perfeitamente!');
        } else {
          toast.error('API Mobile com problemas');
        }
      }

    } catch (error) {
      console.error('❌ Failed to test API:', error);
      if (showToast) {
        toast.error('Erro ao testar a API');
      }
    } finally {
      setIsTestingConnection(false);
    }
  };

  useEffect(() => {
    testConnection(false);
  }, []);

  const getStatusIcon = () => {
    if (isTestingConnection) {
      return <RefreshCw className="h-5 w-5 animate-spin text-blue-500" />;
    }
    return apiStatus.isConnected ? <CheckCircle className="h-5 w-5 text-green-500" /> : <XCircle className="h-5 w-5 text-red-500" />;
  };

  const getStatusBadge = () => {
    if (isTestingConnection) {
      return <Badge variant="outline">Testando...</Badge>;
    }
    return apiStatus.isConnected ? <Badge variant="default" className="bg-green-500">Online</Badge> : <Badge variant="destructive">Offline</Badge>;
  };

  const formatDate = (date: Date) => {
    return date.toLocaleString('pt-BR');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Smartphone className="h-5 w-5" />
          Status da API Mobile
        </CardTitle>
        <p className="text-sm text-gray-600">
          Verifique se a API está funcionando corretamente para os aplicativos mobile
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* API Status */}
        <div className="flex items-center justify-between p-4 border rounded-lg">
          <div className="flex items-center gap-3">
            {getStatusIcon()}
            <div>
              <p className="font-medium">API de Sincronização Mobile</p>
              <p className="text-sm text-muted-foreground">
                {MOBILE_SYNC_URL}
              </p>
              <p className="text-xs text-muted-foreground">
                Endpoint principal para aplicativos mobile
              </p>
            </div>
          </div>
          {getStatusBadge()}
        </div>

        {/* Status Details */}
        {apiStatus.lastChecked && (
          <div className="text-sm space-y-1 p-3 bg-gray-50 rounded-lg">
            <p><strong>Última verificação:</strong> {formatDate(apiStatus.lastChecked)}</p>
            {apiStatus.responseTime && (
              <p><strong>Tempo de resposta:</strong> {apiStatus.responseTime}ms</p>
            )}
            <p><strong>Status:</strong> {apiStatus.isConnected ? '✅ Funcionando' : '❌ Com problemas'}</p>
          </div>
        )}

        {/* Error Display */}
        {apiStatus.error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-start gap-2">
              <AlertCircle className="h-5 w-5 text-red-500 mt-0.5" />
              <div>
                <p className="font-medium text-red-800">Problema Detectado</p>
                <p className="text-sm text-red-600">{apiStatus.error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Test Button */}
        <div className="flex gap-2">
          <Button 
            onClick={() => testConnection(true)} 
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
        </div>

        {/* Simple Usage Guide */}
        <div className="pt-4 border-t">
          <h4 className="font-medium mb-3">Como Usar:</h4>
          <div className="space-y-3 text-sm">
            <div className="p-3 border rounded-lg bg-blue-50">
              <div className="flex items-start gap-2 mb-2">
                <div className="w-5 h-5 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold">1</div>
                <span className="font-medium text-blue-900">Gere um Token</span>
              </div>
              <p className="text-blue-800 text-xs ml-7">
                Vá na aba "API REST & Mobile" e crie um token para o vendedor
              </p>
            </div>

            <div className="p-3 border rounded-lg bg-green-50">
              <div className="flex items-start gap-2 mb-2">
                <div className="w-5 h-5 bg-green-500 text-white rounded-full flex items-center justify-center text-xs font-bold">2</div>
                <span className="font-medium text-green-900">Configure o App</span>
              </div>
              <p className="text-green-800 text-xs ml-7">
                Use este endereço e o token no seu aplicativo mobile
              </p>
            </div>

            <div className="p-3 border rounded-lg bg-purple-50">
              <div className="flex items-start gap-2 mb-2">
                <div className="w-5 h-5 bg-purple-500 text-white rounded-full flex items-center justify-center text-xs font-bold">3</div>
                <span className="font-medium text-purple-900">Sincronize</span>
              </div>
              <p className="text-purple-800 text-xs ml-7">
                O app mobile pode baixar dados e enviar pedidos automaticamente
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ApiStatusPanel;
