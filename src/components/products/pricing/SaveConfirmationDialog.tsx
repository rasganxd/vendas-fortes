
import React from 'react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";
import { Product } from '@/types';

interface PriceChange {
  product: Product;
  oldPrice: number;
  newPrice: number;
  oldMaxDiscount: number;
  newMaxDiscount: number;
}

interface SaveConfirmationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  priceChanges: PriceChange[];
  onConfirm: () => void;
}

const SaveConfirmationDialog: React.FC<SaveConfirmationDialogProps> = ({
  open,
  onOpenChange,
  priceChanges,
  onConfirm
}) => {
  const totalProducts = priceChanges.length;
  const priceIncreases = priceChanges.filter(change => change.newPrice > change.oldPrice).length;
  const priceDecreases = priceChanges.filter(change => change.newPrice < change.oldPrice).length;
  
  const totalValueOld = priceChanges.reduce((sum, change) => sum + change.oldPrice, 0);
  const totalValueNew = priceChanges.reduce((sum, change) => sum + change.newPrice, 0);
  const totalChange = totalValueNew - totalValueOld;

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            Confirmar Alterações de Preços
            <Badge variant="outline">{totalProducts} produtos</Badge>
          </AlertDialogTitle>
          <AlertDialogDescription>
            Revise as alterações antes de salvar. Esta ação não pode ser desfeita.
          </AlertDialogDescription>
        </AlertDialogHeader>
        
        <div className="space-y-4">
          {/* Resumo das mudanças */}
          <div className="grid grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{priceIncreases}</div>
              <div className="text-sm text-gray-600">Aumentos</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">{priceDecreases}</div>
              <div className="text-sm text-gray-600">Reduções</div>
            </div>
            <div className="text-center">
              <div className={`text-2xl font-bold ${totalChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {formatCurrency(Math.abs(totalChange))}
              </div>
              <div className="text-sm text-gray-600">
                {totalChange >= 0 ? 'Aumento Total' : 'Redução Total'}
              </div>
            </div>
          </div>

          {/* Lista de produtos alterados */}
          <div className="space-y-2 max-h-60 overflow-y-auto">
            <h4 className="font-medium text-sm text-gray-700">Produtos que serão alterados:</h4>
            {priceChanges.slice(0, 10).map((change) => (
              <div key={change.product.id} className="flex justify-between items-center p-2 bg-white border rounded">
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm truncate">{change.product.name}</div>
                  <div className="text-xs text-gray-500">Código: {change.product.code}</div>
                </div>
                <div className="text-right">
                  <div className="text-sm">
                    <span className="text-gray-500">{formatCurrency(change.oldPrice)}</span>
                    <span className="mx-1">→</span>
                    <span className={change.newPrice > change.oldPrice ? 'text-green-600' : 'text-red-600'}>
                      {formatCurrency(change.newPrice)}
                    </span>
                  </div>
                  {change.oldMaxDiscount !== change.newMaxDiscount && (
                    <div className="text-xs text-gray-500">
                      Desc: {change.oldMaxDiscount}% → {change.newMaxDiscount}%
                    </div>
                  )}
                </div>
              </div>
            ))}
            {priceChanges.length > 10 && (
              <div className="text-center text-sm text-gray-500 py-2">
                ...e mais {priceChanges.length - 10} produtos
              </div>
            )}
          </div>
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm} className="bg-blue-600 hover:bg-blue-700">
            Salvar {totalProducts} Produtos
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default SaveConfirmationDialog;
