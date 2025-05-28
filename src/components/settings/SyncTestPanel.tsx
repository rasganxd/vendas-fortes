
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/components/ui/use-toast';
import { syncUpdatesService } from '@/services/supabase/syncUpdatesService';
import { mobileSyncService } from '@/services/supabase/mobileSyncService';
import { AlertTriangle, CheckCircle, XCircle } from 'lucide-react';

export const SyncTestPanel = () => {
  const [isCreating, setIsCreating] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const [isTestingMobileOrders, setIsTestingMobileOrders] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<any>(null);
  const [testResults, setTestResults] = useState<any>(null);

  const createTestUpdate = async () => {
    setIsCreating(true);
    try {
      console.log('🧪 Criando atualização de teste...');
      
      const update = await syncUpdatesService.createSyncUpdate(
        'Teste de sincronização manual',
        ['customers', 'products', 'payment_tables'],
        'admin-test'
      );
      
      setLastUpdate(update);
      
      toast({
        title: "Atualização criada com sucesso",
        description: `ID: ${update.id}`,
      });
      
      console.log('✅ Atualização de teste criada:', update);
      
    } catch (error) {
      console.error('❌ Erro ao criar atualização de teste:', error);
      toast({
        title: "Erro ao criar atualização",
        description: error instanceof Error ? error.message : 'Erro desconhecido',
        variant: "destructive"
      });
    } finally {
      setIsCreating(false);
    }
  };

  const checkForUpdates = async () => {
    setIsChecking(true);
    try {
      console.log('🔍 Verificando atualizações disponíveis...');
      
      const result = await mobileSyncService.checkForUpdates();
      
      toast({
        title: result.hasUpdates ? "Atualização encontrada!" : "Nenhuma atualização",
        description: result.message,
        variant: result.hasUpdates ? "default" : "default"
      });
      
      console.log('📋 Resultado da verificação:', result);
      
    } catch (error) {
      console.error('❌ Erro ao verificar atualizações:', error);
      toast({
        title: "Erro ao verificar atualizações",
        description: error instanceof Error ? error.message : 'Erro desconhecido',
        variant: "destructive"
      });
    } finally {
      setIsChecking(false);
    }
  };

  const testMobileOrderFlow = async () => {
    setIsTestingMobileOrders(true);
    try {
      console.log('🧪 Testando fluxo de pedidos mobile...');
      
      const { supabase } = await import('@/integrations/supabase/client');
      
      // 1. Criar um pedido de teste com imported=false
      const testOrder = {
        code: Math.floor(Math.random() * 10000),
        customer_name: 'Cliente Teste Mobile',
        sales_rep_id: 'test-sales-rep-id',
        sales_rep_name: 'Vendedor Teste',
        date: new Date().toISOString(),
        total: 100.50,
        status: 'pending',
        source_project: 'mobile',
        imported: false, // IMPORTANTE: Deve começar como false
        notes: 'Pedido de teste criado automaticamente'
      };

      const { data: createdOrder, error: orderError } = await supabase
        .from('orders')
        .insert(testOrder)
        .select()
        .single();

      if (orderError) throw orderError;

      // 2. Verificar se o pedido aparece como pendente
      const { data: pendingOrders, error: pendingError } = await supabase
        .from('orders')
        .select('*')
        .eq('source_project', 'mobile')
        .eq('imported', false);

      if (pendingError) throw pendingError;

      // 3. Tentar acessar via orders-api (deve falhar para POST)
      const apiTestResult = await fetch('/api/orders-api', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          cliente: 'Teste API Block',
          itens: [{ produto: 'Produto Teste', quantidade: 1, preco_unitario: 10 }],
          valor_total: 10
        })
      });

      const apiResponse = await apiTestResult.json();

      setTestResults({
        orderCreated: !!createdOrder,
        orderId: createdOrder?.id,
        pendingCount: pendingOrders?.length || 0,
        apiBlocked: apiTestResult.status === 400,
        apiMessage: apiResponse.message,
        timestamp: new Date()
      });

      toast({
        title: "Teste concluído",
        description: `Pedido criado: ${createdOrder?.code}. API bloqueada: ${apiTestResult.status === 400 ? 'Sim' : 'Não'}`,
      });

    } catch (error) {
      console.error('❌ Erro no teste de pedidos mobile:', error);
      toast({
        title: "Erro no teste",
        description: error instanceof Error ? error.message : 'Erro desconhecido',
        variant: "destructive"
      });
    } finally {
      setIsTestingMobileOrders(false);
    }
  };

  const completeUpdate = async () => {
    if (!lastUpdate) {
      toast({
        title: "Nenhuma atualização para completar",
        description: "Crie uma atualização primeiro",
        variant: "destructive"
      });
      return;
    }

    try {
      console.log('✅ Marcando atualização como completada...');
      
      await syncUpdatesService.completeSyncUpdate(lastUpdate.id);
      
      toast({
        title: "Atualização marcada como completada",
        description: `ID: ${lastUpdate.id}`,
      });
      
      setLastUpdate(null);
      
    } catch (error) {
      console.error('❌ Erro ao completar atualização:', error);
      toast({
        title: "Erro ao completar atualização",
        description: error instanceof Error ? error.message : 'Erro desconhecido',
        variant: "destructive"
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Teste de Sincronização</CardTitle>
        <CardDescription>
          Ferramentas para testar o fluxo de sincronização entre Desktop e Mobile
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Button 
            onClick={createTestUpdate}
            disabled={isCreating}
            className="w-full"
          >
            {isCreating ? 'Criando...' : '1. Criar Atualização (Desktop)'}
          </Button>
          
          <Button 
            onClick={checkForUpdates}
            disabled={isChecking}
            variant="outline"
            className="w-full"
          >
            {isChecking ? 'Verificando...' : '2. Verificar Updates (Mobile)'}
          </Button>
          
          <Button 
            onClick={completeUpdate}
            disabled={!lastUpdate}
            variant="secondary"
            className="w-full"
          >
            3. Completar Sync
          </Button>

          <Button 
            onClick={testMobileOrderFlow}
            disabled={isTestingMobileOrders}
            variant="outline"
            className="w-full"
          >
            {isTestingMobileOrders ? 'Testando...' : '🧪 Testar Pedidos Mobile'}
          </Button>
        </div>

        {/* Resultados do teste de pedidos mobile */}
        {testResults && (
          <Alert className="bg-blue-50 border-blue-200">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <div className="space-y-2">
                <h4 className="font-semibold">Resultados do Teste de Pedidos Mobile:</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    {testResults.orderCreated ? <CheckCircle className="h-4 w-4 text-green-600" /> : <XCircle className="h-4 w-4 text-red-600" />}
                    <span>Pedido criado: {testResults.orderCreated ? 'Sim' : 'Não'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {testResults.apiBlocked ? <CheckCircle className="h-4 w-4 text-green-600" /> : <XCircle className="h-4 w-4 text-red-600" />}
                    <span>API bloqueada: {testResults.apiBlocked ? 'Sim' : 'Não'}</span>
                  </div>
                  <div>
                    <Badge variant="outline">Pedidos pendentes: {testResults.pendingCount}</Badge>
                  </div>
                  <div>
                    <Badge variant="outline">ID: {testResults.orderId?.substring(0, 8)}...</Badge>
                  </div>
                </div>
                {testResults.apiMessage && (
                  <div className="mt-2 p-2 bg-blue-100 rounded text-xs">
                    <strong>Mensagem da API:</strong> {testResults.apiMessage}
                  </div>
                )}
              </div>
            </AlertDescription>
          </Alert>
        )}
        
        {lastUpdate && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <h4 className="font-semibold text-green-800 mb-2">Última Atualização Criada</h4>
            <p className="text-sm text-green-700">
              <strong>ID:</strong> {lastUpdate.id}<br/>
              <strong>Descrição:</strong> {lastUpdate.description}<br/>
              <strong>Ativa:</strong> {lastUpdate.is_active ? 'Sim' : 'Não'}<br/>
              <strong>Criada em:</strong> {new Date(lastUpdate.created_at).toLocaleString('pt-BR')}
            </p>
          </div>
        )}
        
        <div className="text-sm text-gray-600 bg-gray-50 rounded-lg p-4">
          <h4 className="font-semibold mb-2">Como usar:</h4>
          <ol className="list-decimal list-inside space-y-1">
            <li>Clique em "Criar Atualização" para simular o Desktop criando uma atualização</li>
            <li>Clique em "Verificar Updates" para simular o Mobile verificando atualizações</li>
            <li>Clique em "Completar Sync" para marcar a atualização como completada</li>
            <li><strong>🧪 Testar Pedidos Mobile:</strong> Cria um pedido de teste e verifica se o fluxo está correto</li>
          </ol>
        </div>

        <Alert className="bg-yellow-50 border-yellow-200">
          <AlertTriangle className="h-4 w-4 text-yellow-600" />
          <AlertDescription className="text-yellow-800">
            <strong>Correção Implementada:</strong> O endpoint <code>/orders-api</code> agora bloqueia a criação de pedidos mobile.
            O mobile deve usar <code>/mobile-orders-import</code> para manter o fluxo de importação manual.
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
};
