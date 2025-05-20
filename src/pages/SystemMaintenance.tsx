
import React from 'react';
import { Button } from '@/components/ui/button';
import PageLayout from '@/components/layout/PageLayout';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useAppContext } from '@/hooks/useAppContext';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { useState } from 'react';

const SystemMaintenance = () => {
  const { 
    createBackup, 
    backups, 
    isLoadingBackups, 
    startNewMonth, 
    clearCache 
  } = useAppContext();

  const [statusMessage, setStatusMessage] = useState<{message: string, type: 'success' | 'error' | 'warning' | 'info'} | null>(null);

  // Show status message for 5 seconds
  const showStatus = (message: string, type: 'success' | 'error' | 'warning' | 'info' = 'info') => {
    setStatusMessage({ message, type });
    setTimeout(() => setStatusMessage(null), 5000);
  };

  const handleCreateBackup = async () => {
    try {
      const backupName = `Manual backup ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`;
      await createBackup(backupName);
      showStatus("Backup manual criado com sucesso", "success");
    } catch (error) {
      console.error("Error creating backup:", error);
      showStatus("Houve um erro ao criar o backup", "error");
    }
  };

  const handleStartNewMonth = async () => {
    try {
      await startNewMonth();
      showStatus("O processo de fechamento mensal foi iniciado com sucesso", "success");
    } catch (error) {
      console.error("Error starting new month:", error);
      showStatus("Houve um erro ao iniciar o fechamento mensal", "error");
    }
  };

  const handleClearCache = async () => {
    try {
      await clearCache();
      showStatus("O cache foi limpo com sucesso", "success");
    } catch (error) {
      console.error("Error clearing cache:", error);
      showStatus("Houve um erro ao limpar o cache", "error");
    }
  };

  return (
    <PageLayout 
      title="Manutenção do Sistema" 
      subtitle="Funções para manter o sistema funcionando corretamente"
    >
      {statusMessage && (
        <Alert className={`mb-6 ${
          statusMessage.type === 'success' ? 'bg-green-50 border-green-200' : 
          statusMessage.type === 'error' ? 'bg-red-50 border-red-200' :
          statusMessage.type === 'warning' ? 'bg-amber-50 border-amber-200' :
          'bg-blue-50 border-blue-200'
        }`}>
          <AlertTitle>{
            statusMessage.type === 'success' ? 'Sucesso!' :
            statusMessage.type === 'error' ? 'Erro!' :
            statusMessage.type === 'warning' ? 'Atenção!' :
            'Informação'
          }</AlertTitle>
          <AlertDescription>
            {statusMessage.message}
          </AlertDescription>
        </Alert>
      )}
      
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
