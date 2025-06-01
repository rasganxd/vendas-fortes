
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
import { Trash2, Info } from 'lucide-react';
import { Product } from '@/types';

interface SimpleDeleteConfirmationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => Promise<void>;
  product: Product | null;
  isDeleting?: boolean;
}

export const SimpleDeleteConfirmationDialog: React.FC<SimpleDeleteConfirmationDialogProps> = ({
  open,
  onOpenChange,
  onConfirm,
  product,
  isDeleting = false
}) => {
  if (!product) return null;

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <Trash2 className="h-5 w-5 text-red-500" />
            Excluir Produto
          </AlertDialogTitle>
          <AlertDialogDescription>
            Confirma a exclusão do produto <strong>{product.name}</strong> (Código: {product.code})?
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <div className="flex items-center gap-2 text-blue-700 mb-2">
            <Info className="h-4 w-4" />
            <span className="font-medium">O que será removido automaticamente:</span>
          </div>
          <ul className="text-blue-600 text-sm space-y-1">
            <li>• Todas as unidades de medida do produto</li>
            <li>• Configurações de desconto</li>
            <li>• Configurações de precificação</li>
          </ul>
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>
            Cancelar
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            disabled={isDeleting}
            className="bg-red-600 hover:bg-red-700"
          >
            {isDeleting ? 'Excluindo...' : 'Excluir Produto'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
