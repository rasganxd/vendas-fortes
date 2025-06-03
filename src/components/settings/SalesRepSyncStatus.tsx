
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Users, 
  Download, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  User,
  Package
} from "lucide-react";
import { useLocalSyncServer } from '@/hooks/useLocalSyncServer';
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { NetworkUtils } from '@/utils/networkUtils';

const SalesRepSyncStatus: React.FC = () => {
  const {
    salesRepStatus,
    generateSalesRepData,
    refreshSalesRepStatus
  } = useLocalSyncServer();

  const handleGenerateData = async (codigo: number) => {
    const data = await generateSalesRepData(codigo);
    if (data) {
      await refreshSalesRepStatus();
    }
  };

  const formatDate = (date: Date | null) => {
    if (!date) return 'Nunca';
    return date.toLocaleString('pt-BR');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          Status de Sincronização por Vendedor
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {salesRepStatus.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <LoadingSpinner size="lg" className="mx-auto mb-4" />
              <p>Carregando vendedores...</p>
            </div>
          ) : (
            salesRepStatus.map((rep) => (
              <div 
                key={rep.salesRepId} 
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <User className="h-5 w-5 text-gray-500" />
                    <h4 className="font-medium">{rep.salesRepName}</h4>
                    <Badge variant="secondary">
                      Código: {rep.salesRepCode}
                    </Badge>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      <span>Última sync: {formatDate(rep.lastSync)}</span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Package className="h-4 w-4" />
                      <span>Pedidos pendentes: {rep.pendingOrders}</span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {rep.isConnected ? (
                        <>
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          <span>Conectado</span>
                        </>
                      ) : (
                        <>
                          <AlertCircle className="h-4 w-4 text-gray-400" />
                          <span>Offline</span>
                        </>
                      )}
                    </div>
                  </div>

                  {rep.totalDataSize > 0 && (
                    <div className="mt-2 text-xs text-gray-500">
                      Tamanho dos dados: {NetworkUtils.formatDataSize(rep.totalDataSize)}
                    </div>
                  )}
                </div>
                
                <div className="flex items-center space-x-2">
                  {rep.pendingOrders > 0 && (
                    <Badge variant="destructive">
                      {rep.pendingOrders} pendentes
                    </Badge>
                  )}
                  
                  {rep.isConnected && (
                    <Badge variant="default">
                      Online
                    </Badge>
                  )}
                  
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => handleGenerateData(rep.salesRepCode)}
                    className="flex items-center gap-1"
                  >
                    <Download className="h-3 w-3" />
                    Gerar Dados
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>

        {salesRepStatus.length > 0 && (
          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {salesRepStatus.length}
                </div>
                <div className="text-gray-600">Vendedores Ativos</div>
              </div>
              
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {salesRepStatus.filter(rep => rep.isConnected).length}
                </div>
                <div className="text-gray-600">Conectados</div>
              </div>
              
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">
                  {salesRepStatus.reduce((sum, rep) => sum + rep.pendingOrders, 0)}
                </div>
                <div className="text-gray-600">Pedidos Pendentes</div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default SalesRepSyncStatus;
