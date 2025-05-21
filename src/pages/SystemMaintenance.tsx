
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import PageLayout from '@/components/layout/PageLayout';
import { useToast } from '@/components/ui/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, ArrowRight, Calendar, Database, RefreshCw, Save, Trash, AlertTriangle } from 'lucide-react';
import { useAppContext } from '@/hooks/useAppContext';
import { clearDemoData } from '@/utils/clearDemoData';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';

export default function SystemMaintenance() {
  const { toast } = useToast();
  const { 
    startNewMonth, 
    startNewDay, 
    createBackup, 
    refreshData 
  } = useAppContext();

  const [isResetting, setIsResetting] = useState(false);
  const [resetDialogOpen, setResetDialogOpen] = useState(false);

  const showStatus = (message: string, type: "default" | "success" | "error" = "default") => {
    toast({
      title: type === "error" ? "Erro" : "Sucesso",
      description: message,
      variant: type === "error" ? "destructive" : "default"
    });
  };

  const handleClearDemoData = async () => {
    try {
      await clearDemoData(true);
      showStatus("Todos os dados de demonstração foram removidos com sucesso", "success");
      // Refresh data to ensure UI is updated
      setTimeout(() => {
        refreshData();
      }, 500);
    } catch (error) {
      console.error("Error clearing demo data:", error);
      showStatus("Erro ao limpar dados de demonstração", "error");
    }
  };

  const handleSystemReset = async () => {
    setIsResetting(true);
    try {
      setResetDialogOpen(false);
      const success = await clearDemoData(true);
      
      if (success) {
        showStatus("O sistema foi reiniciado com sucesso", "success");
        // Refresh data after reset
        setTimeout(() => {
          refreshData();
        }, 1000);
      } else {
        showStatus("O sistema foi reiniciado parcialmente. Alguns dados podem persistir.", "default");
      }
    } catch (error) {
      console.error("Error resetting system:", error);
      showStatus("Erro ao reiniciar o sistema", "error");
    } finally {
      setIsResetting(false);
    }
  };

  const handleCreateMonthlyBackup = async () => {
    try {
      const currentDate = new Date();
      const backupId = await createBackup(
        `Cópia Mensal - ${currentDate.toLocaleDateString('pt-BR')}`,
        'Backup mensal criado manualmente'
      );
      if (backupId) {
        showStatus("Backup mensal criado com sucesso", "success");
      } else {
        showStatus("Não foi possível criar o backup mensal", "error");
      }
    } catch (error) {
      console.error("Error creating monthly backup:", error);
      showStatus("Erro ao criar backup mensal", "error");
    }
  };

  const handleStartNewDay = async () => {
    try {
      await startNewDay();
      showStatus("O processo de atualização diária foi iniciado com sucesso", "success");
    } catch (error) {
      console.error("Error starting new day:", error);
      showStatus("Erro ao iniciar novo dia", "error");
    }
  };

  const handleStartNewMonth = async () => {
    try {
      await startNewMonth();
      showStatus("O processo de fechamento mensal foi iniciado com sucesso", "success");
    } catch (error) {
      console.error("Error starting new month:", error);
      showStatus("Erro ao iniciar novo mês", "error");
    }
  };

  const handleRefreshData = async () => {
    try {
      const success = await refreshData();
      if (success) {
        showStatus("Dados atualizados com sucesso", "success");
      } else {
        showStatus("Não foi possível atualizar os dados", "error");
      }
    } catch (error) {
      console.error("Error refreshing data:", error);
      showStatus("Erro ao atualizar dados", "error");
    }
  };

  return (
    <PageLayout title="Manutenção do Sistema">
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <RefreshCw className="w-5 h-5 mr-2" /> Atualização Diária
            </CardTitle>
            <CardDescription>
              Preparar sistema para um novo dia de trabalho
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm mb-4">
              Este processo realiza a configuração necessária para iniciar um novo dia de trabalho.
            </p>
            <Button onClick={handleStartNewDay} className="w-full">
              Iniciar Novo Dia <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Save className="w-5 h-5 mr-2" /> Cópia Mensal
            </CardTitle>
            <CardDescription>
              Criar um backup mensal dos dados
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm mb-4">
              Salva uma cópia completa de todos os dados do sistema.
            </p>
            <Button onClick={handleCreateMonthlyBackup} className="w-full">
              Criar Backup Mensal <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Calendar className="w-5 h-5 mr-2" /> Fechamento Mensal
            </CardTitle>
            <CardDescription>
              Encerra o mês atual e prepara para o próximo
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm mb-4">
              Este processo encerra o mês atual, prepara relatórios e configura o sistema para o próximo mês.
            </p>
            <Button onClick={handleStartNewMonth} className="w-full">
              Iniciar Novo Mês <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Database className="w-5 h-5 mr-2" /> Atualizar Dados
            </CardTitle>
            <CardDescription>
              Sincroniza dados com o servidor
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm mb-4">
              Este processo atualiza todos os dados a partir do servidor.
            </p>
            <Button onClick={handleRefreshData} className="w-full">
              Atualizar Dados <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Trash className="w-5 h-5 mr-2 text-red-500" /> Limpar Dados Demo
            </CardTitle>
            <CardDescription>
              Remove todos os dados de demonstração
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm mb-4 text-amber-600">
              <AlertCircle className="inline-block w-4 h-4 mr-1" /> 
              Remove os dados de demonstração locais do sistema.
            </p>
            <Button 
              variant="destructive" 
              onClick={handleClearDemoData} 
              className="w-full">
              Remover Dados Demo <Trash className="ml-2 w-4 h-4" />
            </Button>
          </CardContent>
        </Card>

        <Card className="border-2 border-red-200">
          <CardHeader className="bg-red-50">
            <CardTitle className="flex items-center text-red-700">
              <AlertTriangle className="w-5 h-5 mr-2 text-red-600" /> Reiniciar Sistema
            </CardTitle>
            <CardDescription className="text-red-600">
              Limpa TODOS os dados e reinicia o sistema
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm mb-4 text-red-600 font-semibold">
              <AlertTriangle className="inline-block w-4 h-4 mr-1" /> 
              CUIDADO: Esta operação remove TODOS os dados do sistema, incluindo dados do Firestore, e reinicia o sistema completamente.
            </p>
            <Button 
              variant="destructive" 
              onClick={() => setResetDialogOpen(true)} 
              disabled={isResetting}
              className="w-full bg-red-600 hover:bg-red-700">
              {isResetting ? "Reiniciando..." : "Reiniciar Sistema"} {isResetting ? <Loader2 className="ml-2 w-4 h-4 animate-spin" /> : <AlertTriangle className="ml-2 w-4 h-4" />}
            </Button>
          </CardContent>
        </Card>
      </div>

      <Dialog open={resetDialogOpen} onOpenChange={setResetDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="text-red-600 flex items-center">
              <AlertTriangle className="w-5 h-5 mr-2" /> Confirmar Reinicialização do Sistema
            </DialogTitle>
            <DialogDescription>
              Esta ação irá apagar TODOS os dados do sistema, incluindo dados do Firestore. Esta operação não pode ser desfeita.
            </DialogDescription>
          </DialogHeader>
          <div className="bg-red-50 p-4 rounded-md border border-red-200 my-4">
            <p className="text-sm text-red-700">
              Após a reinicialização, o sistema estará vazio e precisará ser configurado novamente.
              Tenha certeza de que você possui um backup se precisar recuperar os dados no futuro.
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setResetDialogOpen(false)}>
              Cancelar
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleSystemReset} 
              disabled={isResetting}
              className="bg-red-600 hover:bg-red-700">
              {isResetting ? "Reiniciando..." : "Confirmar Reinicialização"} {isResetting && <Loader2 className="ml-2 w-4 h-4 animate-spin" />}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageLayout>
  );
}
