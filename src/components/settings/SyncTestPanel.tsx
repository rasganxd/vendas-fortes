
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/components/ui/use-toast';
import { syncUpdatesService } from '@/services/supabase/syncUpdatesService';
import { mobileSyncService } from '@/services/supabase/mobileSyncService';

export const SyncTestPanel = () => {
  const [isCreating, setIsCreating] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<any>(null);

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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
        </div>
        
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
          </ol>
        </div>
      </CardContent>
    </Card>
  );
};
