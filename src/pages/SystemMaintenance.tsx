import React from 'react';
import PageLayout from '@/components/layout/PageLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import DatabaseSchemaGenerator from '@/components/system/DatabaseSchemaGenerator';
import { useAppContext } from '@/hooks/useAppContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, ArrowRight, Database, Download, Loader2, RefreshCw, Trash2, Upload } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useState } from 'react';
import { toast } from '@/components/ui/use-toast';
import { format } from 'date-fns';

export default function SystemMaintenance() {
  const { backups, createBackup, restoreBackup, deleteBackup, clearCache, startNewMonth } = useAppContext();
  const [isCreatingBackup, setIsCreatingBackup] = useState(false);
  const [isRestoringBackup, setIsRestoringBackup] = useState(false);
  const [isDeletingBackup, setIsDeletingBackup] = useState(false);
  const [selectedBackupId, setSelectedBackupId] = useState<string | null>(null);
  const [isRestoreDialogOpen, setIsRestoreDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isStartingNewMonth, setIsStartingNewMonth] = useState(false);
  const [isClearingCache, setIsClearingCache] = useState(false);
  const [backupName, setBackupName] = useState('');
  const [backupDescription, setBackupDescription] = useState('');
  const [isCreateBackupDialogOpen, setIsCreateBackupDialogOpen] = useState(false);

  const handleCreateBackup = () => {
    setBackupName(`Backup ${format(new Date(), 'dd/MM/yyyy HH:mm')}`);
    setBackupDescription('');
    setIsCreateBackupDialogOpen(true);
  };

  const confirmCreateBackup = async () => {
    try {
      setIsCreatingBackup(true);
      await createBackup(backupName, backupDescription);
      setIsCreateBackupDialogOpen(false);
      toast({
        title: "Backup criado",
        description: "O backup foi criado com sucesso."
      });
    } catch (error) {
      console.error("Error creating backup:", error);
      toast({
        title: "Erro ao criar backup",
        description: "Não foi possível criar o backup.",
        variant: "destructive"
      });
    } finally {
      setIsCreatingBackup(false);
    }
  };

  const handleRestoreBackup = (id: string) => {
    setSelectedBackupId(id);
    setIsRestoreDialogOpen(true);
  };

  const confirmRestoreBackup = async () => {
    if (!selectedBackupId) return;
    
    try {
      setIsRestoringBackup(true);
      await restoreBackup(selectedBackupId);
      setIsRestoreDialogOpen(false);
      toast({
        title: "Backup restaurado",
        description: "O backup foi restaurado com sucesso."
      });
    } catch (error) {
      console.error("Error restoring backup:", error);
      toast({
        title: "Erro ao restaurar backup",
        description: "Não foi possível restaurar o backup.",
        variant: "destructive"
      });
    } finally {
      setIsRestoringBackup(false);
    }
  };

  const handleDeleteBackup = (id: string) => {
    setSelectedBackupId(id);
    setIsDeleteDialogOpen(true);
  };

  const confirmDeleteBackup = async () => {
    if (!selectedBackupId) return;
    
    try {
      setIsDeletingBackup(true);
      await deleteBackup(selectedBackupId);
      setIsDeleteDialogOpen(false);
      toast({
        title: "Backup excluído",
        description: "O backup foi excluído com sucesso."
      });
    } catch (error) {
      console.error("Error deleting backup:", error);
      toast({
        title: "Erro ao excluir backup",
        description: "Não foi possível excluir o backup.",
        variant: "destructive"
      });
    } finally {
      setIsDeletingBackup(false);
    }
  };

  const handleStartNewMonth = async () => {
    try {
      setIsStartingNewMonth(true);
      await startNewMonth();
      toast({
        title: "Novo mês iniciado",
        description: "O sistema foi preparado para um novo mês."
      });
    } catch (error) {
      console.error("Error starting new month:", error);
      toast({
        title: "Erro ao iniciar novo mês",
        description: "Não foi possível iniciar um novo mês.",
        variant: "destructive"
      });
    } finally {
      setIsStartingNewMonth(false);
    }
  };

  const handleClearCache = async () => {
    try {
      setIsClearingCache(true);
      await clearCache();
      toast({
        title: "Cache limpo",
        description: "O cache do sistema foi limpo com sucesso."
      });
    } catch (error) {
      console.error("Error clearing cache:", error);
      toast({
        title: "Erro ao limpar cache",
        description: "Não foi possível limpar o cache do sistema.",
        variant: "destructive"
      });
    } finally {
      setIsClearingCache(false);
    }
  };

  return (
    <PageLayout title="Manutenção do Sistema">
      <Tabs defaultValue="database" className="space-y-4">
        <TabsList>
          <TabsTrigger value="database">Banco de Dados</TabsTrigger>
          <TabsTrigger value="backups">Backups</TabsTrigger>
          <TabsTrigger value="settings">Configurações</TabsTrigger>
        </TabsList>
        <TabsContent value="database" className="space-y-4">
          <DatabaseSchemaGenerator />
          
          <Card>
            <CardHeader>
              <CardTitle>Manutenção de Dados</CardTitle>
              <CardDescription>
                Operações de manutenção no banco de dados
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Atenção</AlertTitle>
                <AlertDescription>
                  As operações abaixo podem afetar os dados do sistema. Certifique-se de fazer um backup antes de prosseguir.
                </AlertDescription>
              </Alert>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button 
                variant="outline" 
                onClick={handleClearCache}
                disabled={isClearingCache}
              >
                {isClearingCache ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Limpando...
                  </>
                ) : (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Limpar Cache
                  </>
                )}
              </Button>
              <Button 
                variant="default" 
                onClick={handleStartNewMonth}
                disabled={isStartingNewMonth}
              >
                {isStartingNewMonth ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processando...
                  </>
                ) : (
                  <>
                    <ArrowRight className="mr-2 h-4 w-4" />
                    Iniciar Novo Mês
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        <TabsContent value="backups">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Backups do Sistema</span>
                <Button 
                  onClick={handleCreateBackup}
                  size="sm"
                >
                  <Download className="mr-2 h-4 w-4" />
                  Criar Backup
                </Button>
              </CardTitle>
              <CardDescription>
                Gerencie os backups do sistema
              </CardDescription>
            </CardHeader>
            <CardContent>
              {backups.length > 0 ? (
                <div className="border rounded-md overflow-hidden">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nome</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Data</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Descrição</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {backups.map((backup) => (
                        <tr key={backup.id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{backup.name}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {backup.createdAt ? format(new Date(backup.createdAt), 'dd/MM/yyyy HH:mm') : 'N/A'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{backup.description || 'Sem descrição'}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="mr-2"
                              onClick={() => handleRestoreBackup(backup.id)}
                            >
                              <Upload className="h-4 w-4" />
                              <span className="sr-only">Restaurar</span>
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleDeleteBackup(backup.id)}
                            >
                              <Trash2 className="h-4 w-4 text-red-500" />
                              <span className="sr-only">Excluir</span>
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  Nenhum backup encontrado
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="settings">
          <Card>
            <CardHeader>
              <CardTitle>Configurações Avançadas</CardTitle>
              <CardDescription>
                Configurações avançadas do sistema
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Alert>
                <Database className="h-4 w-4" />
                <AlertTitle>Configurações do Banco de Dados</AlertTitle>
                <AlertDescription>
                  O sistema está configurado para usar o Firebase Firestore como banco de dados.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Create Backup Dialog */}
      <Dialog open={isCreateBackupDialogOpen} onOpenChange={setIsCreateBackupDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Criar Backup</DialogTitle>
            <DialogDescription>
              Crie um backup do sistema para restaurar posteriormente.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label htmlFor="backup-name" className="text-sm font-medium">
                Nome do Backup
              </label>
              <input
                id="backup-name"
                className="w-full p-2 border rounded-md"
                value={backupName}
                onChange={(e) => setBackupName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="backup-description" className="text-sm font-medium">
                Descrição (opcional)
              </label>
              <textarea
                id="backup-description"
                className="w-full p-2 border rounded-md"
                rows={3}
                value={backupDescription}
                onChange={(e) => setBackupDescription(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsCreateBackupDialogOpen(false)}
              disabled={isCreatingBackup}
            >
              Cancelar
            </Button>
            <Button 
              onClick={confirmCreateBackup}
              disabled={isCreatingBackup || !backupName}
            >
              {isCreatingBackup ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Criando...
                </>
              ) : (
                'Criar Backup'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Restore Backup Dialog */}
      <Dialog open={isRestoreDialogOpen} onOpenChange={setIsRestoreDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Restaurar Backup</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja restaurar este backup? Esta ação substituirá todos os dados atuais.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsRestoreDialogOpen(false)}
              disabled={isRestoringBackup}
            >
              Cancelar
            </Button>
            <Button 
              variant="destructive" 
              onClick={confirmRestoreBackup}
              disabled={isRestoringBackup}
            >
              {isRestoringBackup ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Restaurando...
                </>
              ) : (
                'Restaurar'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Backup Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Excluir Backup</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja excluir este backup? Esta ação não pode ser desfeita.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsDeleteDialogOpen(false)}
              disabled={isDeletingBackup}
            >
              Cancelar
            </Button>
            <Button 
              variant="destructive" 
              onClick={confirmDeleteBackup}
              disabled={isDeletingBackup}
            >
              {isDeletingBackup ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Excluindo...
                </>
              ) : (
                'Excluir'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageLayout>
  );
}
