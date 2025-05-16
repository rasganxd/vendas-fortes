
import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { migrateAllDataToFirebase } from '@/utils/migrationUtils';

interface MigrationDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

const MigrationDialog: React.FC<MigrationDialogProps> = ({
  isOpen,
  onOpenChange
}) => {
  const [isMigrating, setIsMigrating] = useState(false);
  
  const handleMigration = async () => {
    try {
      setIsMigrating(true);
      await migrateAllDataToFirebase();
      onOpenChange(false); // Close dialog after successful migration
    } catch (error) {
      console.error("Migration error:", error);
    } finally {
      setIsMigrating(false);
    }
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Migrar para Firebase</DialogTitle>
          <DialogDescription>
            Esta operação irá migrar todos os seus dados do armazenamento local para o Firebase.
            Isso garantirá sincronização entre dispositivos e maior segurança dos dados.
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4">
          <p className="text-sm text-gray-500">
            A migração pode levar alguns minutos, dependendo da quantidade de dados.
            Por favor, não feche o navegador durante este processo.
          </p>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isMigrating}>
            Cancelar
          </Button>
          <Button onClick={handleMigration} disabled={isMigrating}>
            {isMigrating ? 'Migrando...' : 'Iniciar Migração'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default MigrationDialog;
