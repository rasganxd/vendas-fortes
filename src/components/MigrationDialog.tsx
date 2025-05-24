
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

interface MigrationDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

const MigrationDialog: React.FC<MigrationDialogProps> = ({
  isOpen,
  onOpenChange
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Migração Concluída</DialogTitle>
          <DialogDescription>
            A migração para Supabase foi concluída com sucesso. 
            Todos os dados agora estão armazenados no Supabase.
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4">
          <p className="text-sm text-gray-500">
            O sistema agora utiliza o Supabase como backend principal.
            Todas as funcionalidades foram migradas e estão funcionando normalmente.
          </p>
        </div>
        
        <DialogFooter>
          <Button onClick={() => onOpenChange(false)}>
            Entendi
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default MigrationDialog;
