import React from 'react';
import { Button } from '@/components/ui/button';
import PageLayout from '@/components/layout/PageLayout';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useAppContext } from '@/hooks/useAppContext';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { useState } from 'react';
import { Calendar, RotateCw, Save, Archive } from 'lucide-react';

const SystemMaintenance = () => {
  const { 
    createBackup, 
    backups, 
    isLoadingBackups, 
    startNewMonth,
    startNewDay
  } = useAppContext();

  const [statusMessage, setStatusMessage] = useState<{message: string, type: 'success' | 'error' | 'warning' | 'info'} | null>(null);

  // Show status message for 5 seconds
  const showStatus = (message: string, type: 'success' | 'error' | 'warning' | 'info' = 'info') => {
    setStatusMessage({ message, type });
    setTimeout(() => setStatusMessage(null), 5000);
  };

  const handleCreateMonthlyBackup = async () => {
    try {
      // Get the current month and year for the backup name
      const date = new Date();
      const monthNames = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 
                         'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
      const monthYear = `${monthNames[date.getMonth()]}/${date.getFullYear()}`;
      
      const backupName = `Cópia mensal ${monthYear}`;
      await createBackup(backupName, "Backup mensal de segurança");
      showStatus("Cópia mensal criada com sucesso", "success");
    } catch (error) {
      console.error("Error creating monthly backup:", error);
      showStatus("Houve um erro ao criar a cópia mensal", "error");
    }
  };

  const handleCreateDailyBackup = async () => {
    try {
      const backupName = `Cópia diária ${new Date().toLocaleDateString()}`;
      await createBackup(backupName, "Backup diário automático");
      showStatus("Backup diário criado com sucesso", "success");
    } catch (error) {
      console.error("Error creating daily backup:", error);
      showStatus("Houve um erro ao criar o backup diário", "error");
    }
  };

  const handleStartNewDay = async () => {
    try {
      await startNewDay();
      showStatus("O processo de atualização diária foi iniciado com sucesso", "success");
    } catch (error) {
      console.error("Error starting new day:", error);
      showStatus("Houve um erro ao iniciar a atualização diária", "error");
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
      
      <h3 className="text-lg font-medium mb-4">Operações Diárias</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <Card className="border-l-4 border-l-blue-500">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-blue-500" />
              <CardTitle>Cópia Diária</CardTitle>
            </div>
            <CardDescription>Cria um backup diário do banco de dados.</CardDescription>
          </CardHeader>
          <CardContent>
            Clique no botão abaixo para criar um backup diário automatizado dos dados do sistema.
          </CardContent>
          <CardFooter>
            <Button onClick={handleCreateDailyBackup} className="bg-blue-500 hover:bg-blue-600">
              <Calendar className="mr-2 h-4 w-4" />
              Criar Cópia Diária
            </Button>
          </CardFooter>
        </Card>

        <Card className="border-l-4 border-l-green-500">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <RotateCw className="h-5 w-5 text-green-500" />
              <CardTitle>Atualização do Dia</CardTitle>
            </div>
            <CardDescription>Prepara o sistema para um novo dia de trabalho.</CardDescription>
          </CardHeader>
          <CardContent>
            Clique no botão abaixo para iniciar o processo de atualização diária e preparar o sistema para um novo dia de trabalho.
          </CardContent>
          <CardFooter>
            <Button onClick={handleStartNewDay} className="bg-green-500 hover:bg-green-600">
              <RotateCw className="mr-2 h-4 w-4" />
              Iniciar Novo Dia
            </Button>
          </CardFooter>
        </Card>
      </div>

      <h3 className="text-lg font-medium mb-4">Operações Mensais</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="border-l-4 border-l-amber-500">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <Save className="h-5 w-5 text-amber-500" />
              <CardTitle>Cópia Mensal</CardTitle>
            </div>
            <CardDescription>Cria um backup mensal do banco de dados.</CardDescription>
          </CardHeader>
          <CardContent>
            Clique no botão abaixo para criar uma cópia de segurança mensal do sistema.
          </CardContent>
          <CardFooter>
            <Button onClick={handleCreateMonthlyBackup} className="bg-amber-500 hover:bg-amber-600">
              <Save className="mr-2 h-4 w-4" />
              Criar Cópia Mensal
            </Button>
          </CardFooter>
        </Card>

        <Card className="border-l-4 border-l-purple-500">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <Archive className="h-5 w-5 text-purple-500" />
              <CardTitle>Fechamento Mensal</CardTitle>
            </div>
            <CardDescription>Prepara o sistema para um novo mês.</CardDescription>
          </CardHeader>
          <CardContent>
            Clique no botão abaixo para iniciar o processo de fechamento mensal e preparar o sistema para um novo mês.
          </CardContent>
          <CardFooter>
            <Button onClick={handleStartNewMonth} className="bg-purple-500 hover:bg-purple-600">
              <Archive className="mr-2 h-4 w-4" />
              Iniciar Fechamento Mensal
            </Button>
          </CardFooter>
        </Card>
      </div>
    </PageLayout>
  );
};

export default SystemMaintenance;
