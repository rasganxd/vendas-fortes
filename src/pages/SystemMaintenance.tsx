
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import PageLayout from '@/components/layout/PageLayout';
import { useToast } from '@/components/ui/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowRight, Calendar, Save } from 'lucide-react';
import { useAppContext } from '@/hooks/useAppContext';

export default function SystemMaintenance() {
  const { toast } = useToast();
  const { 
    startNewMonth, 
    startNewDay, 
    createBackup
  } = useAppContext();

  const showStatus = (message: string, type: "default" | "success" | "error" = "default") => {
    toast({
      title: type === "error" ? "Erro" : "Sucesso",
      description: message,
      variant: type === "error" ? "destructive" : "default"
    });
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

  return (
    <PageLayout title="Manutenção do Sistema">
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <ArrowRight className="w-5 h-5 mr-2" /> Atualização Diária
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
      </div>
    </PageLayout>
  );
}
