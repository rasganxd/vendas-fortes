import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import PageLayout from '@/components/layout/PageLayout';
import { useToast } from '@/components/ui/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { 
  Database, 
  Download, 
  Trash2, 
  RotateCcw, 
  Plus,
  AlertTriangle,
  HardDrive,
  Cloud
} from 'lucide-react';
import { systemBackupService, SystemBackup } from '@/services/supabase/systemBackupService';
import { useBackups } from '@/hooks/useBackups';
import { formatDateToBR } from '@/lib/date-utils';
import BackupRestoreDialog from '@/components/backups/BackupRestoreDialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';

export default function BackupManagement() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [supabaseBackups, setSupabaseBackups] = useState<SystemBackup[]>([]);
  const [selectedBackup, setSelectedBackup] = useState<SystemBackup | null>(null);
  const [showRestoreDialog, setShowRestoreDialog] = useState(false);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newBackupName, setNewBackupName] = useState('');
  const [newBackupDescription, setNewBackupDescription] = useState('');

  // Local backups
  const { 
    backups: localBackups, 
    createBackup: createLocalBackup, 
    restoreBackup: restoreLocalBackup, 
    deleteBackup: deleteLocalBackup 
  } = useBackups();

  useEffect(() => {
    loadSupabaseBackups();
  }, []);

  const loadSupabaseBackups = async () => {
    try {
      const backups = await systemBackupService.getBackups();
      setSupabaseBackups(backups);
    } catch (error) {
      console.error('Error loading backups:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar backups do servidor",
        variant: "destructive"
      });
    }
  };

  const handleCreateSupabaseBackup = async () => {
    if (!newBackupName.trim()) {
      toast({
        title: "Erro",
        description: "Nome do backup é obrigatório",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      await systemBackupService.createBackup({
        name: newBackupName,
        description: newBackupDescription || undefined,
        backup_type: 'manual',
        data_snapshot: null, // Will be collected automatically
        created_by: 'user'
      });

      toast({
        title: "Sucesso",
        description: "Backup criado com sucesso",
      });

      setShowCreateDialog(false);
      setNewBackupName('');
      setNewBackupDescription('');
      await loadSupabaseBackups();
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao criar backup",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRestoreSupabaseBackup = async (backupId: string) => {
    setIsLoading(true);
    try {
      await systemBackupService.restoreBackup(backupId);
      toast({
        title: "Sucesso",
        description: "Backup restaurado com sucesso",
      });
      await loadSupabaseBackups();
    } catch (error) {
      toast({
        title: "Erro",
        description: error instanceof Error ? error.message : "Erro ao restaurar backup",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteSupabaseBackup = async (backupId: string, backupName: string) => {
    if (!confirm(`Tem certeza que deseja excluir o backup "${backupName}"?`)) {
      return;
    }

    setIsLoading(true);
    try {
      await systemBackupService.deleteBackup(backupId);
      toast({
        title: "Sucesso",
        description: "Backup excluído com sucesso",
      });
      await loadSupabaseBackups();
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao excluir backup",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateLocalBackup = () => {
    const name = prompt('Nome do backup:');
    if (name) {
      createLocalBackup(name);
    }
  };

  const getBackupTypeInfo = (type: string) => {
    const types = {
      'daily': { label: 'Diário', variant: 'default' as const },
      'monthly': { label: 'Mensal', variant: 'secondary' as const },
      'manual': { label: 'Manual', variant: 'outline' as const }
    };
    return types[type as keyof typeof types] || { label: type, variant: 'outline' as const };
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, any> = {
      'completed': { variant: 'default', text: 'Concluído' },
      'in_progress': { variant: 'secondary', text: 'Em Andamento' },
      'failed': { variant: 'destructive', text: 'Falhou' }
    };
    const config = variants[status] || { variant: 'outline', text: status };
    return <Badge variant={config.variant}>{config.text}</Badge>;
  };

  return (
    <PageLayout title="Gerenciamento de Backups">
      <Tabs defaultValue="cloud" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="cloud" className="flex items-center gap-2">
            <Cloud className="w-4 h-4" />
            Backups na Nuvem
          </TabsTrigger>
          <TabsTrigger value="local" className="flex items-center gap-2">
            <HardDrive className="w-4 h-4" />
            Backups Locais
          </TabsTrigger>
        </TabsList>

        <TabsContent value="cloud" className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-semibold">Backups no Servidor</h3>
              <p className="text-sm text-muted-foreground">
                Backups armazenados no banco de dados Supabase
              </p>
            </div>
            <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Criar Backup
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Criar Novo Backup</DialogTitle>
                  <DialogDescription>
                    Criar um backup completo de todos os dados do sistema
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="backup-name">Nome *</Label>
                    <Input
                      id="backup-name"
                      value={newBackupName}
                      onChange={(e) => setNewBackupName(e.target.value)}
                      placeholder="Ex: Backup pré-atualização"
                    />
                  </div>
                  <div>
                    <Label htmlFor="backup-description">Descrição</Label>
                    <Textarea
                      id="backup-description"
                      value={newBackupDescription}
                      onChange={(e) => setNewBackupDescription(e.target.value)}
                      placeholder="Descrição opcional do backup"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                    Cancelar
                  </Button>
                  <Button onClick={handleCreateSupabaseBackup} disabled={isLoading}>
                    Criar Backup
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid gap-4">
            {supabaseBackups.length === 0 ? (
              <Card>
                <CardContent className="text-center py-8">
                  <Database className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground">Nenhum backup encontrado</p>
                </CardContent>
              </Card>
            ) : (
              supabaseBackups.map((backup) => {
                const typeInfo = getBackupTypeInfo(backup.backup_type);
                return (
                  <Card key={backup.id}>
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div className="space-y-1">
                          <CardTitle className="text-base">{backup.name}</CardTitle>
                          {backup.description && (
                            <CardDescription>{backup.description}</CardDescription>
                          )}
                          <div className="flex gap-2 mt-2">
                            <Badge variant={typeInfo.variant}>{typeInfo.label}</Badge>
                            {getStatusBadge(backup.status)}
                            <Badge variant="outline">
                              {Math.round(backup.file_size / 1024)} KB
                            </Badge>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setSelectedBackup(backup);
                              setShowRestoreDialog(true);
                            }}
                            disabled={isLoading || backup.status !== 'completed'}
                          >
                            <RotateCcw className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDeleteSupabaseBackup(backup.id, backup.name)}
                            disabled={isLoading}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="text-sm text-muted-foreground">
                        Criado em {formatDateToBR(backup.created_at)}
                        {backup.created_by && ` por ${backup.created_by}`}
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </div>
        </TabsContent>

        <TabsContent value="local" className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-semibold">Backups Locais</h3>
              <p className="text-sm text-muted-foreground">
                Backups armazenados no localStorage do navegador
              </p>
            </div>
            <Button onClick={handleCreateLocalBackup}>
              <Plus className="w-4 h-4 mr-2" />
              Criar Backup Local
            </Button>
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-4">
            <div className="flex items-center gap-2 text-amber-800">
              <AlertTriangle className="w-4 h-4" />
              <span className="font-medium">Aviso sobre Backups Locais</span>
            </div>
            <p className="text-sm text-amber-700 mt-1">
              Os backups locais são armazenados no navegador e podem ser perdidos se os dados do navegador forem limpos.
              Para maior segurança, use os backups na nuvem.
            </p>
          </div>

          <div className="grid gap-4">
            {localBackups.length === 0 ? (
              <Card>
                <CardContent className="text-center py-8">
                  <HardDrive className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground">Nenhum backup local encontrado</p>
                </CardContent>
              </Card>
            ) : (
              localBackups.map((backup) => (
                <Card key={backup.id}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div className="space-y-1">
                        <CardTitle className="text-base">{backup.name}</CardTitle>
                        {backup.description && (
                          <CardDescription>{backup.description}</CardDescription>
                        )}
                        <div className="flex gap-2 mt-2">
                          {getStatusBadge(backup.status)}
                          <Badge variant="outline">
                            {Math.round(backup.size / 1024)} KB
                          </Badge>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => restoreLocalBackup(backup.id)}
                          disabled={backup.status !== 'completed'}
                        >
                          <RotateCcw className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => deleteLocalBackup(backup.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-sm text-muted-foreground">
                      Criado em {formatDateToBR(backup.createdAt.toISOString())}
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>
      </Tabs>

      <BackupRestoreDialog
        backup={selectedBackup}
        open={showRestoreDialog}
        onOpenChange={setShowRestoreDialog}
        onConfirm={handleRestoreSupabaseBackup}
        isLoading={isLoading}
      />
    </PageLayout>
  );
}