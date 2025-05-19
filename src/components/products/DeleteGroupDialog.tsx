
import React from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { ProductGroup } from '@/types';

interface DeleteGroupDialogProps {
  group: ProductGroup | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (groupId: string) => void;
}

export function DeleteGroupDialog({
  group,
  open,
  onOpenChange,
  onConfirm,
}: DeleteGroupDialogProps) {
  if (!group) return null;

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Excluir Grupo</AlertDialogTitle>
          <AlertDialogDescription>
            Tem certeza que deseja excluir o grupo <strong>{group.name}</strong>? 
            Esta ação não pode ser desfeita e pode afetar produtos associados a este grupo.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction 
            onClick={() => onConfirm(group.id)}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            Excluir
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
