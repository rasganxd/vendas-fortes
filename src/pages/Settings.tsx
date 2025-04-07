
import React, { useState } from 'react';
import { useAppContext } from '@/hooks/useAppContext';
import PageLayout from '@/components/layout/PageLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Calendar, Archive, Database } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import { Alert, AlertDescription } from '@/components/ui/alert';

const Settings = () => {
  const { createBackup } = useAppContext();
  const [dailyBackupEnabled, setDailyBackupEnabled] = useState(true);
  const [monthlyBackupEnabled, setMonthlyBackupEnabled] = useState(true);
  const [tabValue, setTabValue] = useState("backups");

  const handleCreateBackup = (type: string) => {
    const backupName = type === 'daily' 
      ? `Backup Diário - ${new Date().toLocaleDateString('pt-BR')}`
      : `Backup Mensal - ${new Date().toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}`;
    
    const description = type === 'daily'
      ? 'Backup diário automático'
      : 'Backup mensal automático';
    
    createBackup(backupName, description);
    
    toast({
      title: "Backup criado com sucesso",
      description: `Um novo backup ${type === 'daily' ? 'diário' : 'mensal'} foi criado.`,
    });
  };

  return (
    <PageLayout title="Configurações" subtitle="Gerencie as configurações do sistema">
      <Tabs defaultValue="backups" className="w-full" value={tabValue} onValueChange={setTabValue}>
        <TabsList className="mb-6">
          <TabsTrigger value="backups">Backups</TabsTrigger>
          <TabsTrigger value="system">Sistema</TabsTrigger>
          <TabsTrigger value="users">Usuários</TabsTrigger>
        </TabsList>
        
        <TabsContent value="backups" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Calendar className="mr-2 h-5 w-5" />
                  Backup Diário
                </CardTitle>
                <CardDescription>
                  Configure o backup diário automático do sistema
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between space-x-2">
                  <Label htmlFor="daily-backup" className="flex flex-col space-y-1">
                    <span>Ativar backup diário automático</span>
                    <span className="text-sm text-muted-foreground">
                      O sistema irá criar um backup todos os dias às 23:59
                    </span>
                  </Label>
                  <Switch 
                    id="daily-backup"
                    checked={dailyBackupEnabled}
                    onCheckedChange={setDailyBackupEnabled}
                  />
                </div>
                
                <Button 
                  onClick={() => handleCreateBackup('daily')}
                  className="w-full"
                >
                  <Archive className="mr-2 h-4 w-4" />
                  Criar backup diário agora
                </Button>
                
                <Alert variant="info" className="mt-4">
                  <AlertDescription>
                    Os backups diários são mantidos por 30 dias, depois disso são automaticamente excluídos.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Database className="mr-2 h-5 w-5" />
                  Backup Mensal
                </CardTitle>
                <CardDescription>
                  Configure o backup mensal automático do sistema
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between space-x-2">
                  <Label htmlFor="monthly-backup" className="flex flex-col space-y-1">
                    <span>Ativar backup mensal automático</span>
                    <span className="text-sm text-muted-foreground">
                      O sistema irá criar um backup no último dia de cada mês
                    </span>
                  </Label>
                  <Switch 
                    id="monthly-backup"
                    checked={monthlyBackupEnabled}
                    onCheckedChange={setMonthlyBackupEnabled}
                  />
                </div>
                
                <Button 
                  onClick={() => handleCreateBackup('monthly')}
                  className="w-full"
                >
                  <Archive className="mr-2 h-4 w-4" />
                  Criar backup mensal agora
                </Button>
                
                <Alert variant="info" className="mt-4">
                  <AlertDescription>
                    Os backups mensais são mantidos permanentemente até que sejam excluídos manualmente.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>Gerenciar Backups</CardTitle>
              <CardDescription>
                Visualize, restaure ou exclua backups salvos
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" className="w-full" onClick={() => window.location.href = '/manutencao'}>
                <Database className="mr-2 h-4 w-4" />
                Ir para página de manutenção do sistema
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="system">
          <Card>
            <CardHeader>
              <CardTitle>Configurações do Sistema</CardTitle>
              <CardDescription>
                Configurações gerais do sistema (em desenvolvimento)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Esta seção está em desenvolvimento. Em breve você poderá personalizar várias configurações do sistema.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="users">
          <Card>
            <CardHeader>
              <CardTitle>Gerenciamento de Usuários</CardTitle>
              <CardDescription>
                Gerencie os usuários do sistema (em desenvolvimento)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Esta seção está em desenvolvimento. Em breve você poderá gerenciar usuários e permissões.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </PageLayout>
  );
};

export default Settings;
