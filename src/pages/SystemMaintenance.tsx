
import React, { useState } from 'react';
import { useAppContext } from '@/hooks/useAppContext';
import { Backup, Order } from '@/types';
import PageLayout from '@/components/layout/PageLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { format } from 'date-fns';
import { formatDateTimeToBR } from '@/lib/date-utils';
import { AlertCircle, Download, Upload, Calendar, CalendarClock, Trash2 } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useBackups } from '@/hooks/useBackups';
import { toast } from '@/components/ui/use-toast';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

const SystemMaintenance = () => {
  const { 
    orders,
    setOrders,
    createBackup: contextCreateBackup,
    restoreBackup: contextRestoreBackup, 
    deleteBackup: contextDeleteBackup,
    startNewMonth 
  } = useAppContext();
  
  const { backups, createBackup, restoreBackup, deleteBackup } = useBackups();

  const [newBackupOpen, setNewBackupOpen] = useState(false);
  const [backupName, setBackupName] = useState('');
  const [backupDescription, setBackupDescription] = useState('');
  const [backupType, setBackupType] = useState('manual');
  const [selectedBackup, setSelectedBackup] = useState<Backup | null>(null);
  const [confirmRestore, setConfirmRestore] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [confirmNewDay, setConfirmNewDay] = useState(false);
  const [confirmNewMonth, setConfirmNewMonth] = useState(false);

  const handleCreateBackup = () => {
    if (!backupName.trim()) return;
    
    const typePrefix = backupType === 'daily' ? '[Diário] ' : backupType === 'monthly' ? '[Mensal] ' : '';
    const fullBackupName = `${typePrefix}${backupName}`;
    
    createBackup(fullBackupName, backupDescription || undefined);
    setBackupName('');
    setBackupDescription('');
    setBackupType('manual');
    setNewBackupOpen(false);
  };

  const handleRestoreBackup = () => {
    if (selectedBackup) {
      restoreBackup(selectedBackup.id);
      setSelectedBackup(null);
      setConfirmRestore(false);
    }
  };

  const handleDeleteBackup = () => {
    if (selectedBackup) {
      deleteBackup(selectedBackup.id);
      setSelectedBackup(null);
      setConfirmDelete(false);
    }
  };

  const handleStartNewDay = () => {
    const today = format(new Date(), 'dd/MM/yyyy');
    const backupId = createBackup(`Backup Diário - ${today}`, 'Backup automático criado ao iniciar novo dia');
    
    const archivedOrders = orders.filter(order => order.status === 'delivered' || order.status === 'cancelled');
    
    const pendingOrders = orders.filter(order => 
      order.status !== 'delivered' && order.status !== 'cancelled'
    ).map(order => ({
      ...order,
      archived: true
    }));
    
    setOrders([...archivedOrders, ...pendingOrders]);
    
    toast({
      title: "Novo dia iniciado",
      description: `Backup criado e pedidos pendentes arquivados. O sistema está pronto para um novo dia.`,
    });
    
    setConfirmNewDay(false);
  };

  const handleStartNewMonth = () => {
    startNewMonth();
    setConfirmNewMonth(false);
  };

  const exportBackup = (backup: Backup) => {
    const dataStr = JSON.stringify(backup.data);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `backup_${backup.name.replace(/\s+/g, '_')}_${format(new Date(backup.date), 'yyyy-MM-dd')}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  return (
    <PageLayout title="Manutenção do Sistema" subtitle="Gerenciar backups e iniciar novos períodos">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Backups</CardTitle>
            <CardDescription>Gerencie suas cópias de segurança</CardDescription>
          </CardHeader>
          <CardContent>
            <Dialog open={newBackupOpen} onOpenChange={setNewBackupOpen}>
              <DialogTrigger asChild>
                <Button className="w-full mb-4">Criar novo backup</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Criar novo backup</DialogTitle>
                  <DialogDescription>Insira os detalhes para o novo backup do sistema.</DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="backupType">Tipo de backup</Label>
                    <RadioGroup 
                      value={backupType} 
                      onValueChange={setBackupType}
                      className="flex flex-col space-y-1"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="manual" id="manual" />
                        <Label htmlFor="manual">Backup Manual</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="daily" id="daily" />
                        <Label htmlFor="daily">Backup Diário</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="monthly" id="monthly" />
                        <Label htmlFor="monthly">Backup Mensal</Label>
                      </div>
                    </RadioGroup>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="name">Nome do backup</Label>
                    <Input
                      id="name"
                      placeholder="Ex: Backup mensal - Janeiro"
                      value={backupName}
                      onChange={(e) => setBackupName(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description">Descrição (opcional)</Label>
                    <Textarea
                      id="description"
                      placeholder="Adicione uma descrição para este backup..."
                      value={backupDescription}
                      onChange={(e) => setBackupDescription(e.target.value)}
                      rows={3}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setNewBackupOpen(false)}>Cancelar</Button>
                  <Button onClick={handleCreateBackup}>Criar backup</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
            
            <ScrollArea className="h-[300px]">
              {backups.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  Nenhum backup encontrado
                </div>
              ) : (
                <ul className="space-y-3">
                  {[...backups].reverse().map((backup) => (
                    <li key={backup.id} className="border rounded-lg p-3">
                      <div className="flex justify-between">
                        <div>
                          <div className="font-medium">{backup.name}</div>
                          <div className="text-sm text-muted-foreground">
                            Criado em: {formatDateTimeToBR(backup.date)}
                          </div>
                          {backup.description && (
                            <div className="text-sm mt-1">{backup.description}</div>
                          )}
                        </div>
                        <div className="flex space-x-2">
                          <Button 
                            size="icon" 
                            variant="ghost" 
                            onClick={() => exportBackup(backup)}
                            title="Exportar backup"
                          >
                            <Download size={16} />
                          </Button>
                          <Button 
                            size="icon" 
                            variant="ghost" 
                            onClick={() => {
                              setSelectedBackup(backup);
                              setConfirmRestore(true);
                            }}
                            title="Restaurar backup"
                          >
                            <Upload size={16} />
                          </Button>
                          <Button 
                            size="icon" 
                            variant="ghost" 
                            className="text-destructive hover:text-destructive"
                            onClick={() => {
                              setSelectedBackup(backup);
                              setConfirmDelete(true);
                            }}
                            title="Excluir backup"
                          >
                            <Trash2 size={16} />
                          </Button>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </ScrollArea>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Ciclos de Trabalho</CardTitle>
            <CardDescription>Inicie um novo dia ou mês de trabalho</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <h3 className="text-lg font-medium">Iniciar novo dia</h3>
              <p className="text-sm text-muted-foreground">
                Cria um backup automático e arquiva pedidos pendentes, mantendo o histórico completo.
              </p>
              <Button 
                onClick={() => setConfirmNewDay(true)} 
                className="mt-2"
                variant="outline"
              >
                <Calendar className="mr-2 h-4 w-4" />
                Iniciar novo dia
              </Button>
            </div>
            
            <div className="space-y-2">
              <h3 className="text-lg font-medium">Iniciar novo mês</h3>
              <p className="text-sm text-muted-foreground">
                Cria um backup mensal e arquiva pedidos concluídos há mais de 30 dias.
              </p>
              <Button 
                onClick={() => setConfirmNewMonth(true)} 
                className="mt-2"
                variant="outline"
              >
                <CalendarClock className="mr-2 h-4 w-4" />
                Iniciar novo mês
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <Dialog open={confirmNewDay} onOpenChange={setConfirmNewDay}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Iniciar novo dia</DialogTitle>
            <DialogDescription>
              Esta ação criará um backup automático e arquivará os pedidos pendentes, mantendo todo o histórico.
            </DialogDescription>
          </DialogHeader>
          <Alert className="mt-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Nota</AlertTitle>
            <AlertDescription>
              Os pedidos arquivados permanecerão no histórico, mas serão marcados como arquivados para facilitar a visualização dos novos pedidos.
            </AlertDescription>
          </Alert>
          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setConfirmNewDay(false)}>Cancelar</Button>
            <Button onClick={handleStartNewDay}>Confirmar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      <Dialog open={confirmRestore} onOpenChange={setConfirmRestore}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar restauração</DialogTitle>
            <DialogDescription>
              Você está prestes a restaurar o backup "{selectedBackup?.name}". Esta ação substituirá todos os dados atuais pelos dados do backup.
            </DialogDescription>
          </DialogHeader>
          <Alert variant="destructive" className="mt-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Atenção</AlertTitle>
            <AlertDescription>
              Esta ação não pode ser desfeita. Considere criar um backup dos dados atuais antes de continuar.
            </AlertDescription>
          </Alert>
          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setConfirmRestore(false)}>Cancelar</Button>
            <Button variant="destructive" onClick={handleRestoreBackup}>Confirmar restauração</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      <Dialog open={confirmDelete} onOpenChange={setConfirmDelete}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar exclusão</DialogTitle>
            <DialogDescription>
              Você está prestes a excluir o backup "{selectedBackup?.name}".
            </DialogDescription>
          </DialogHeader>
          <Alert variant="destructive" className="mt-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Atenção</AlertTitle>
            <AlertDescription>
              Esta ação não pode ser desfeita.
            </AlertDescription>
          </Alert>
          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setConfirmDelete(false)}>Cancelar</Button>
            <Button variant="destructive" onClick={handleDeleteBackup}>Confirmar exclusão</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      <Dialog open={confirmNewMonth} onOpenChange={setConfirmNewMonth}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Iniciar novo mês</DialogTitle>
            <DialogDescription>
              Esta ação criará um backup mensal e arquiva pedidos concluídos há mais de 30 dias.
            </DialogDescription>
          </DialogHeader>
          <Alert className="mt-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Nota</AlertTitle>
            <AlertDescription>
              Os pedidos arquivados não serão excluídos permanentemente, mas serão removidos da visualização principal.
            </AlertDescription>
          </Alert>
          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setConfirmNewMonth(false)}>Cancelar</Button>
            <Button onClick={handleStartNewMonth}>Confirmar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageLayout>
  );
};

export default SystemMaintenance;
