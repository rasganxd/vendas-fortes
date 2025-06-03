
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Server, 
  Play, 
  Square, 
  Wifi, 
  Copy, 
  QrCode,
  RefreshCw,
  Activity,
  Network,
  Monitor
} from "lucide-react";
import { useLocalSyncServer } from '@/hooks/useLocalSyncServer';
import { NetworkUtils } from '@/utils/networkUtils';
import { toast } from '@/components/ui/use-toast';

const LocalSyncServerPanel: React.FC = () => {
  const {
    serverStatus,
    isLoading,
    initializeServer,
    updateServerStatus
  } = useLocalSyncServer();

  const [customPort, setCustomPort] = useState(serverStatus.port.toString());

  const handleStartServer = async () => {
    await initializeServer();
  };

  const handleCopyIP = () => {
    const serverUrl = `http://${serverStatus.localIP}:${serverStatus.port}`;
    navigator.clipboard.writeText(serverUrl);
    toast({
      title: "📋 IP copiado",
      description: `URL do servidor: ${serverUrl}`
    });
  };

  const handleRefresh = () => {
    updateServerStatus();
  };

  const generateQRCode = () => {
    const qrData = NetworkUtils.generateQRCodeData(serverStatus.localIP, serverStatus.port);
    console.log('QR Code Data:', qrData);
    toast({
      title: "📱 QR Code",
      description: "Dados de conexão no console (F12)"
    });
  };

  return (
    <div className="space-y-6">
      {/* Status do Servidor */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Server className="h-5 w-5" />
            Status do Servidor Local
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleRefresh}
              className="ml-auto"
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Status:</span>
                <Badge variant={serverStatus.isRunning ? "default" : "secondary"} className="gap-1">
                  {serverStatus.isRunning ? (
                    <>
                      <Activity className="h-3 w-3" />
                      Ativo
                    </>
                  ) : (
                    <>
                      <Square className="h-3 w-3" />
                      Inativo
                    </>
                  )}
                </Badge>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">IP Local:</span>
                <div className="flex items-center gap-2">
                  <code className="text-sm bg-gray-100 px-2 py-1 rounded">
                    {serverStatus.localIP}
                  </code>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={handleCopyIP}
                  >
                    <Copy className="h-3 w-3" />
                  </Button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Porta:</span>
                <code className="text-sm bg-gray-100 px-2 py-1 rounded">
                  {serverStatus.port}
                </code>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">URL Completa:</span>
                <code className="text-sm bg-blue-50 px-2 py-1 rounded border">
                  http://{serverStatus.localIP}:{serverStatus.port}
                </code>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Dispositivos Conectados:</span>
                <Badge variant="outline">
                  {serverStatus.connectedDevices}
                </Badge>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Total de Requisições:</span>
                <Badge variant="outline">
                  {serverStatus.totalRequests}
                </Badge>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Última Atividade:</span>
                <span className="text-sm text-gray-600">
                  {serverStatus.lastActivity 
                    ? serverStatus.lastActivity.toLocaleString('pt-BR')
                    : 'Nenhuma'
                  }
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Controles do Servidor */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Monitor className="h-5 w-5" />
            Controles do Servidor
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <Button
                onClick={handleStartServer}
                disabled={isLoading || serverStatus.isRunning}
                className="flex items-center gap-2"
              >
                <Play className="h-4 w-4" />
                {isLoading ? 'Iniciando...' : 'Iniciar Servidor'}
              </Button>

              <Button
                variant="outline"
                onClick={generateQRCode}
                disabled={!serverStatus.isRunning}
                className="flex items-center gap-2"
              >
                <QrCode className="h-4 w-4" />
                Gerar QR Code
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="port">Porta Personalizada:</Label>
                <Input
                  id="port"
                  value={customPort}
                  onChange={(e) => setCustomPort(e.target.value)}
                  placeholder="3000"
                  disabled={serverStatus.isRunning}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Instruções para Mobile */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wifi className="h-5 w-5" />
            Instruções para Aplicativo Mobile
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <p className="text-sm text-gray-600">
              Para conectar o aplicativo mobile, configure os seguintes dados:
            </p>
            
            <div className="bg-blue-50 p-4 rounded-lg space-y-2">
              <div className="flex items-center justify-between">
                <strong>IP do Servidor:</strong>
                <code className="bg-white px-2 py-1 rounded border">
                  {serverStatus.localIP}
                </code>
              </div>
              <div className="flex items-center justify-between">
                <strong>Porta:</strong>
                <code className="bg-white px-2 py-1 rounded border">
                  {serverStatus.port}
                </code>
              </div>
              <div className="flex items-center justify-between">
                <strong>Endpoint:</strong>
                <code className="bg-white px-2 py-1 rounded border">
                  /primeira-atualizacao/[codigo_vendedor]
                </code>
              </div>
            </div>

            <div className="bg-yellow-50 p-4 rounded-lg">
              <p className="text-sm text-yellow-800">
                <strong>⚠️ Importante:</strong> Certifique-se de que o dispositivo mobile 
                está na mesma rede local (Wi-Fi) que este computador.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default LocalSyncServerPanel;
