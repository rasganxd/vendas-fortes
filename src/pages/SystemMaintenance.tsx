
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import PageLayout from '@/components/layout/PageLayout';
import { useToast } from '@/components/ui/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, Calendar, Save, History, Database } from 'lucide-react';
import { systemMaintenanceService } from '@/services/systemMaintenanceService';
import { formatDateToBR } from '@/lib/date-utils';

export default function SystemMaintenance() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [maintenanceHistory, setMaintenanceHistory] = useState<any[]>([]);
  const [backupHistory, setBackupHistory] = useState<any[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [history, backups] = await Promise.all([
        systemMaintenanceService.getMaintenanceHistory(),
        systemMaintenanceService.getBackupHistory()
      ]);
      
      setMaintenanceHistory(history);
      setBackupHistory(backups);
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const handleOperation = async (operation: () => Promise<boolean | void>, operationName: string) => {
    setIsLoading(true);
    try {
      const result = await operation();
      if (result !== false) {
        await loadData(); // Refresh data after operation
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: `Erro ao executar ${operationName}`,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const formatOperationType = (type: string) => {
    const types: Record<string, string> = {
      'start_new_day': 'Início do Dia',
      'start_new_month': 'Fechamento Mensal',
      'daily_backup': 'Backup Diário',
      'monthly_backup': 'Backup Mensal'
    };
    return types[type] || type;
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, any> = {
      'completed': { variant: 'default', text: 'Concluído' },
      'started': { variant: 'secondary', text: 'Em Andamento' },
      'failed': { variant: 'destructive', text: 'Falhou' }
    };
    const config = variants[status] || { variant: 'outline', text: status };
    return <Badge variant={config.variant}>{config.text}</Badge>;
  };

  return (
    <PageLayout title="Manutenção do Sistema">
      <Tabs defaultValue="operations" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="operations">Operações</TabsTrigger>
          <TabsTrigger value="history">Histórico</TabsTrigger>
          <TabsTrigger value="backups">Backups</TabsTrigger>
        </TabsList>

        <TabsContent value="operations" className="space-y-6">
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
                  Cria backup automático do dia anterior e realiza operações de preparação para o novo dia.
                </p>
                <Button 
                  onClick={() => handleOperation(systemMaintenanceService.startNewDay, 'atualização diária')}
                  className="w-full"
                  disabled={isLoading}
                >
                  Iniciar Novo Dia <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Save className="w-5 h-5 mr-2" /> Backup Manual
                </CardTitle>
                <CardDescription>
                  Criar um backup manual dos dados
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm mb-4">
                  Salva uma cópia completa de todos os dados do sistema no momento atual.
                </p>
                <Button 
                  onClick={() => handleOperation(() => systemMaintenanceService.createManualBackup(), 'backup manual')}
                  className="w-full"
                  disabled={isLoading}
                >
                  Criar Backup <Save className="ml-2 w-4 h-4" />
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
                  Arquiva dados do mês, gera backup mensal completo e prepara o sistema para o novo mês.
                </p>
                <Button 
                  onClick={() => handleOperation(systemMaintenanceService.startNewMonth, 'fechamento mensal')}
                  className="w-full"
                  disabled={isLoading}
                >
                  Iniciar Fechamento <Calendar className="ml-2 w-4 h-4" />
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <History className="w-5 h-5 mr-2" />
                Histórico de Operações
              </CardTitle>
              <CardDescription>
                Registro de todas as operações de manutenção executadas
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {maintenanceHistory.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">
                    Nenhuma operação de manutenção registrada ainda
                  </p>
                ) : (
                  maintenanceHistory.map((log) => (
                    <div key={log.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium">{formatOperationType(log.operation_type)}</span>
                          {getStatusBadge(log.status)}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {formatDateToBR(log.started_at)}
                          {log.duration_seconds && ` • ${log.duration_seconds}s`}
                          {log.error_message && (
                            <span className="text-red-600 block">{log.error_message}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="backups" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Database className="w-5 h-5 mr-2" />
                Histórico de Backups
              </CardTitle>
              <CardDescription>
                Lista de todos os backups criados pelo sistema
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {backupHistory.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">
                    Nenhum backup encontrado
                  </p>
                ) : (
                  backupHistory.map((backup) => (
                    <div key={backup.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium">{backup.name}</span>
                          <Badge variant="outline">{backup.backup_type}</Badge>
                          {getStatusBadge(backup.status)}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {formatDateToBR(backup.created_at)}
                          {backup.file_size && ` • ${Math.round(backup.file_size / 1024)} KB`}
                        </div>
                        {backup.description && (
                          <p className="text-xs text-muted-foreground mt-1">{backup.description}</p>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
              <div className="mt-4 pt-4 border-t">
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => window.location.href = '/backup-management'}
                >
                  <Database className="w-4 h-4 mr-2" />
                  Gerenciar Backups Completo
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </PageLayout>
  );
}
