
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
import { ProductBrand } from '@/types';

interface DeleteBrandDialogProps {
  brand: ProductBrand | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (brandId: string) => void;
}

export function DeleteBrandDialog({
  brand,
  open,
  onOpenChange,
  onConfirm,
}: DeleteBrandDialogProps) {
  if (!brand) return null;

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Excluir Marca</AlertDialogTitle>
          <AlertDialogDescription>
            Tem certeza que deseja excluir a marca <strong>{brand.name}</strong>? 
            Esta ação não pode ser desfeita e pode afetar produtos associados a esta marca.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction 
            onClick={() => onConfirm(brand.id)}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            Excluir
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
