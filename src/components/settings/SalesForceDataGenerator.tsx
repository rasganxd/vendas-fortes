
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, Users, User, CheckCircle, AlertCircle, Zap } from 'lucide-react';
import { toast } from "sonner";
import { useSalesReps } from '@/hooks/useSalesReps';
import { Badge } from '@/components/ui/badge';
import { syncUpdatesService } from '@/services/supabase/syncUpdatesService';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface SalesRepDataStatus {
  salesRepId: string;
  status: 'idle' | 'generating' | 'success' | 'error';
  message?: string;
  generatedAt?: Date;
}

export default function SalesForceDataGenerator() {
  const { salesReps, isLoading } = useSalesReps();
  const [generationStatus, setGenerationStatus] = useState<Record<string, SalesRepDataStatus>>({});
  const [isGeneratingAll, setIsGeneratingAll] = useState(false);
  const [isActivatingSync, setIsActivatingSync] = useState(false);

  const generateDataForSalesRep = async (salesRepId: string) => {
    console.log('🔄 Gerando dados para vendedor:', salesRepId);
    
    setGenerationStatus(prev => ({
      ...prev,
      [salesRepId]: { salesRepId, status: 'generating' }
    }));

    try {
      // Simular geração de dados (aqui você implementaria a lógica real)
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setGenerationStatus(prev => ({
        ...prev,
        [salesRepId]: { 
          salesRepId, 
          status: 'success', 
          message: 'Dados gerados com sucesso',
          generatedAt: new Date()
        }
      }));

      const salesRep = salesReps.find(sr => sr.id === salesRepId);
      toast("Dados gerados", {
        description: `Dados atualizados para ${salesRep?.name}`
      });
      
    } catch (error) {
      console.error('❌ Erro ao gerar dados:', error);
      
      setGenerationStatus(prev => ({
        ...prev,
        [salesRepId]: { 
          salesRepId, 
          status: 'error', 
          message: 'Erro ao gerar dados'
        }
      }));

      toast("Erro", {
        description: "Falha ao gerar dados para o vendedor",
        style: {
          backgroundColor: 'rgb(239, 68, 68)',
          color: 'white'
        }
      });
    }
  };

  const generateDataForAllSalesReps = async () => {
    console.log('🔄 Gerando dados para todos os vendedores');
    setIsGeneratingAll(true);
    
    try {
      // Limpar status anterior
      setGenerationStatus({});
      
      // Gerar para todos os vendedores em sequência
      for (const salesRep of salesReps) {
        await generateDataForSalesRep(salesRep.id);
        // Pequena pausa entre gerações
        await new Promise(resolve => setTimeout(resolve, 500));
      }
      
      toast("Geração completa", {
        description: `Dados gerados para ${salesReps.length} vendedores`
      });
      
    } catch (error) {
      console.error('❌ Erro na geração em lote:', error);
      toast("Erro", {
        description: "Falha na geração em lote",
        style: {
          backgroundColor: 'rgb(239, 68, 68)',
          color: 'white'
        }
      });
    } finally {
      setIsGeneratingAll(false);
    }
  };

  const activateSyncUpdate = async () => {
    console.log('🚀 Ativando atualização de sincronização');
    setIsActivatingSync(true);
    
    try {
      await syncUpdatesService.createSyncUpdate(
        'Dados da força de vendas atualizados - Desktop',
        ['customers', 'products', 'payment_tables'],
        'Desktop User'
      );
      
      toast("Sincronização ativada!", {
        description: "Dispositivos móveis podem agora sincronizar os dados atualizados",
        style: {
          backgroundColor: 'rgb(34, 197, 94)',
          color: 'white'
        }
      });
      
    } catch (error) {
      console.error('❌ Erro ao ativar sincronização:', error);
      toast("Erro", {
        description: "Falha ao ativar sincronização para dispositivos móveis",
        style: {
          backgroundColor: 'rgb(239, 68, 68)',
          color: 'white'
        }
      });
    } finally {
      setIsActivatingSync(false);
    }
  };

  const getStatusBadge = (status: SalesRepDataStatus) => {
    switch (status.status) {
      case 'generating':
        return <Badge variant="secondary" className="bg-blue-100 text-blue-700">Gerando...</Badge>;
      case 'success':
        return <Badge variant="secondary" className="bg-green-100 text-green-700">Sucesso</Badge>;
      case 'error':
        return <Badge variant="destructive">Erro</Badge>;
      default:
        return <Badge variant="outline">Aguardando</Badge>;
    }
  };

  const getStatusIcon = (status: SalesRepDataStatus) => {
    switch (status.status) {
      case 'generating':
        return <Download className="animate-spin" size={16} />;
      case 'success':
        return <CheckCircle size={16} className="text-green-600" />;
      case 'error':
        return <AlertCircle size={16} className="text-red-600" />;
      default:
        return null;
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Gerar Dados Força de Vendas</CardTitle>
          <CardDescription>Carregando vendedores...</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Gerar Dados Força de Vendas</CardTitle>
        <CardDescription>
          Gere e atualize os dados para a força de vendas. Você pode gerar dados para vendedores específicos ou para todos de uma vez.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <p className="text-sm text-gray-600">
              {salesReps.length} vendedores cadastrados
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
            <Button 
              onClick={generateDataForAllSalesReps}
              disabled={isGeneratingAll || salesReps.length === 0}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Users size={16} className="mr-2" />
              {isGeneratingAll ? 'Gerando para Todos...' : 'Gerar para Todos'}
            </Button>
            
            <Button 
              onClick={activateSyncUpdate}
              disabled={isActivatingSync || isGeneratingAll}
              className="bg-green-600 hover:bg-green-700"
            >
              <Zap size={16} className={`mr-2 ${isActivatingSync ? 'animate-spin' : ''}`} />
              {isActivatingSync ? 'Ativando...' : 'Ativar Sincronização Mobile'}
            </Button>
          </div>
        </div>

        {salesReps.length === 0 ? (
          <div className="text-center py-8">
            <Users size={48} className="mx-auto text-gray-400 mb-4" />
            <p className="text-gray-500">Nenhum vendedor cadastrado</p>
            <p className="text-sm text-gray-400">Cadastre vendedores para gerar dados</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Vendedor</TableHead>
                <TableHead>Código</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Última Geração</TableHead>
                <TableHead className="w-[150px]">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {salesReps.map((salesRep) => {
                const status = generationStatus[salesRep.id] || { salesRepId: salesRep.id, status: 'idle' };
                return (
                  <TableRow key={salesRep.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(status)}
                        {salesRep.name}
                      </div>
                    </TableCell>
                    <TableCell>{salesRep.code}</TableCell>
                    <TableCell>
                      {getStatusBadge(status)}
                    </TableCell>
                    <TableCell>
                      {status.generatedAt ? (
                        <span className="text-sm text-gray-600">
                          {status.generatedAt.toLocaleString('pt-BR')}
                        </span>
                      ) : (
                        <span className="text-sm text-gray-400">Nunca</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => generateDataForSalesRep(salesRep.id)}
                        disabled={status.status === 'generating' || isGeneratingAll}
                      >
                        <User size={14} className="mr-1" />
                        Gerar
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}

        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <h4 className="font-medium text-blue-900 mb-2">Como funciona o controle de sincronização:</h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• <strong>Gerar Individual/Todos:</strong> Atualiza os dados para vendedores específicos ou todos</li>
            <li>• <strong>Ativar Sincronização Mobile:</strong> Libera os dados atualizados para dispositivos móveis</li>
            <li>• <strong>Controle de Acesso:</strong> Mobile só recebe dados quando Desktop ativa uma sincronização</li>
            <li>• <strong>Status em Tempo Real:</strong> Acompanhe o progresso da geração e ativação</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
