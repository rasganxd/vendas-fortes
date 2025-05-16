
import React from 'react';
import { Button } from '@/components/ui/button';
import PageLayout from '@/components/layout/PageLayout';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useAppContext } from '@/hooks/useAppContext';
import { toast } from '@/hooks/use-toast';

const SystemMaintenance = () => {
  const { 
    createBackup, 
    backups, 
    isLoadingBackups, 
    startNewMonth, 
    clearCache 
  } = useAppContext();

  const handleCreateBackup = async () => {
    try {
      const backupName = `Manual backup ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`;
      await createBackup(backupName);
      toast("Backup criado", {
        description: "Backup manual criado com sucesso"
      });
    } catch (error) {
      console.error("Error creating backup:", error);
      toast.error("Erro", {
        description: "Houve um erro ao criar o backup"
      });
    }
  };

  const handleStartNewMonth = async () => {
    try {
      await startNewMonth();
      toast("Fechamento mensal iniciado", {
        description: "O processo de fechamento mensal foi iniciado com sucesso"
      });
    } catch (error) {
      console.error("Error starting new month:", error);
      toast.error("Erro", {
        description: "Houve um erro ao iniciar o fechamento mensal"
      });
    }
  };

  const handleClearCache = async () => {
    try {
      await clearCache();
      toast("Cache limpo", {
        description: "O cache foi limpo com sucesso"
      });
    } catch (error) {
      console.error("Error clearing cache:", error);
      toast.error("Erro", {
        description: "Houve um erro ao limpar o cache"
      });
    }
  };

  return (
    <PageLayout 
      title="Manutenção do Sistema" 
      subtitle="Funções para manter o sistema funcionando corretamente"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Criar Backup</CardTitle>
            <CardDescription>Cria um backup manual do banco de dados.</CardDescription>
          </CardHeader>
          <CardContent>
            Clique no botão abaixo para criar um backup manual do banco de dados.
          </CardContent>
          <CardFooter>
            <Button onClick={handleCreateBackup}>Criar Backup</Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Iniciar Fechamento Mensal</CardTitle>
            <CardDescription>Prepara o sistema para um novo mês.</CardDescription>
          </CardHeader>
          <CardContent>
            Clique no botão abaixo para iniciar o processo de fechamento mensal.
          </CardContent>
          <CardFooter>
            <Button onClick={handleStartNewMonth}>Iniciar Fechamento Mensal</Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Limpar Cache</CardTitle>
            <CardDescription>Limpa o cache do sistema e recarrega os dados.</CardDescription>
          </CardHeader>
          <CardContent>
            Clique no botão abaixo para limpar o cache do sistema e recarregar os dados do servidor.
          </CardContent>
          <CardFooter>
            <Button onClick={handleClearCache}>Limpar Cache</Button>
          </CardFooter>
        </Card>
      </div>
    </PageLayout>
  );
};

export default SystemMaintenance;
