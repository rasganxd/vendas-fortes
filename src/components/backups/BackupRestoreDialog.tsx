import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, Database, Calendar, User, FileText } from 'lucide-react';
import { SystemBackup } from '@/services/supabase/systemBackupService';
import { formatDateToBR } from '@/lib/date-utils';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface BackupRestoreDialogProps {
  backup: SystemBackup | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (backupId: string) => Promise<void>;
  isLoading: boolean;
}

export default function BackupRestoreDialog({
  backup,
  open,
  onOpenChange,
  onConfirm,
  isLoading
}: BackupRestoreDialogProps) {
  const [confirmed, setConfirmed] = useState(false);

  if (!backup) return null;

  const handleConfirm = async () => {
    if (!confirmed) {
      setConfirmed(true);
      return;
    }
    
    await onConfirm(backup.id);
    setConfirmed(false);
    onOpenChange(false);
  };

  const getBackupTypeInfo = (type: string) => {
    const types = {
      'daily': { label: 'Diário', variant: 'default' as const },
      'monthly': { label: 'Mensal', variant: 'secondary' as const },
      'manual': { label: 'Manual', variant: 'outline' as const }
    };
    return types[type as keyof typeof types] || { label: type, variant: 'outline' as const };
  };

  const typeInfo = getBackupTypeInfo(backup.backup_type);

  const getDataPreview = () => {
    if (!backup.data_snapshot?.tables) return null;
    
    const tables = backup.data_snapshot.tables;
    return Object.entries(tables).map(([tableName, tableData]: [string, any]) => ({
      name: tableName,
      count: tableData?.count || 0
    }));
  };

  const dataPreview = getDataPreview();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Database className="w-5 h-5" />
            {confirmed ? 'Confirmar Restauração' : 'Restaurar Backup'}
          </DialogTitle>
          <DialogDescription>
            {confirmed 
              ? 'Confirme que deseja restaurar este backup. Esta ação não pode ser desfeita.'
              : 'Visualize os detalhes do backup antes de restaurar'
            }
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {!confirmed ? (
            <>
              {/* Backup Info */}
              <div className="grid grid-cols-2 gap-4 p-4 border rounded-lg">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    <span className="font-medium">{backup.name}</span>
                  </div>
                  {backup.description && (
                    <p className="text-sm text-muted-foreground">{backup.description}</p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    <span className="text-sm">{formatDateToBR(backup.created_at)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4" />
                    <span className="text-sm">{backup.created_by || 'Sistema'}</span>
                  </div>
                  <div className="flex gap-2">
                    <Badge variant={typeInfo.variant}>{typeInfo.label}</Badge>
                    <Badge variant="outline">{Math.round(backup.file_size / 1024)} KB</Badge>
                  </div>
                </div>
              </div>

              {/* Data Preview */}
              {dataPreview && dataPreview.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-medium">Dados a serem restaurados:</h4>
                  <div className="grid grid-cols-2 gap-2">
                    {dataPreview.map((table) => (
                      <div key={table.name} className="flex justify-between items-center p-2 bg-muted rounded">
                        <span className="text-sm capitalize">{table.name}</span>
                        <Badge variant="secondary">{table.count} registros</Badge>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Atenção:</strong> A restauração irá substituir todos os dados atuais pelos dados do backup.
                  Um backup de segurança será criado automaticamente antes da restauração.
                </AlertDescription>
              </Alert>
            </>
          ) : (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <strong>Última confirmação:</strong> Você tem certeza que deseja restaurar o backup "{backup.name}"?
                Todos os dados atuais serão substituídos e não poderão ser recuperados, exceto pelo backup de segurança que será criado.
              </AlertDescription>
            </Alert>
          )}
        </div>

        <DialogFooter>
          <Button 
            variant="outline" 
            onClick={() => {
              setConfirmed(false);
              onOpenChange(false);
            }}
            disabled={isLoading}
          >
            Cancelar
          </Button>
          <Button 
            onClick={handleConfirm}
            disabled={isLoading}
            variant={confirmed ? "destructive" : "default"}
          >
            {isLoading ? 'Restaurando...' : confirmed ? 'Confirmar Restauração' : 'Continuar'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}