
import React, { useState, useEffect } from 'react';
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
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Loader2, AlertTriangle, Info, Trash2 } from 'lucide-react';
import { Product } from '@/types';
import { ProductDependency, productDependenciesService } from '@/services/supabase/productDependenciesService';

interface EnhancedDeleteConfirmationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (forceDelete: boolean) => Promise<void>;
  product: Product | null;
}

export const EnhancedDeleteConfirmationDialog: React.FC<EnhancedDeleteConfirmationDialogProps> = ({
  open,
  onOpenChange,
  onConfirm,
  product
}) => {
  const [dependencies, setDependencies] = useState<ProductDependency[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [forceDelete, setForceDelete] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const blockingDependencies = dependencies.filter(dep => !dep.can_delete);
  const removableDependencies = dependencies.filter(dep => dep.can_delete);
  const hasBlockingDependencies = blockingDependencies.length > 0;

  useEffect(() => {
    if (open && product) {
      loadDependencies();
    } else {
      // Reset state when dialog closes
      setDependencies([]);
      setForceDelete(false);
      setError(null);
    }
  }, [open, product]);

  const loadDependencies = async () => {
    if (!product) return;
    
    try {
      setIsLoading(true);
      setError(null);
      console.log('🔍 Loading dependencies for product:', product.id);
      const deps = await productDependenciesService.checkDependencies(product.id);
      console.log('📋 Dependencies loaded:', deps);
      setDependencies(deps);
    } catch (error) {
      console.error('❌ Error loading dependencies:', error);
      setError('Erro ao verificar dependências do produto');
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirm = async () => {
    if (!product) return;
    
    try {
      setIsDeleting(true);
      setError(null);
      console.log('🗑️ Starting product deletion:', { productId: product.id, forceDelete });
      await onConfirm(forceDelete);
      console.log('✅ Product deletion completed successfully');
    } catch (error: any) {
      console.error('❌ Error deleting product:', error);
      const errorMessage = error.message || 'Erro ao excluir produto';
      setError(errorMessage);
    } finally {
      setIsDeleting(false);
    }
  };

  // Corrigir o tratamento do CheckedState para boolean
  const handleForceDeleteChange = (checked: boolean | "indeterminate") => {
    console.log('🔄 Force delete checkbox changed:', checked);
    setForceDelete(checked === true);
  };

  if (!product) return null;

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-2xl">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <Trash2 className="h-5 w-5 text-red-500" />
            Excluir Produto
          </AlertDialogTitle>
          <AlertDialogDescription>
            Confirma a exclusão do produto <strong>{product.name}</strong> (Código: {product.code})?
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="space-y-4">
          {isLoading && (
            <div className="flex items-center justify-center py-4">
              <Loader2 className="h-6 w-6 animate-spin mr-2" />
              <span>Verificando dependências...</span>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <div className="flex items-center gap-2 text-red-700">
                <AlertTriangle className="h-4 w-4" />
                <span className="font-medium">Erro</span>
              </div>
              <p className="text-red-600 mt-1">{error}</p>
            </div>
          )}

          {!isLoading && dependencies.length > 0 && (
            <div className="space-y-3">
              <h4 className="font-medium text-gray-900">Dependências encontradas:</h4>
              
              {/* Dependências removíveis */}
              {removableDependencies.length > 0 && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <div className="flex items-center gap-2 text-blue-700 mb-2">
                    <Info className="h-4 w-4" />
                    <span className="font-medium">Serão removidas automaticamente</span>
                  </div>
                  <div className="space-y-1">
                    {removableDependencies.map((dep, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <span className="text-blue-600">{dep.details.message}</span>
                        <Badge variant="secondary">{dep.dependency_count}</Badge>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Dependências bloqueadoras */}
              {blockingDependencies.length > 0 && (
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                  <div className="flex items-center gap-2 text-amber-700 mb-2">
                    <AlertTriangle className="h-4 w-4" />
                    <span className="font-medium">Dependências que impedem exclusão</span>
                  </div>
                  <div className="space-y-1 mb-3">
                    {blockingDependencies.map((dep, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <span className="text-amber-600">{dep.details.message}</span>
                        <Badge variant="destructive">{dep.dependency_count}</Badge>
                      </div>
                    ))}
                  </div>
                  
                  <div className="flex items-center space-x-2 p-2 bg-amber-100 rounded">
                    <Checkbox
                      id="force-delete"
                      checked={forceDelete}
                      onCheckedChange={handleForceDeleteChange}
                    />
                    <label 
                      htmlFor="force-delete" 
                      className="text-sm text-amber-800 cursor-pointer"
                    >
                      Forçar exclusão (removerá TODAS as dependências - cuidado!)
                    </label>
                  </div>
                </div>
              )}
            </div>
          )}

          {!isLoading && dependencies.length === 0 && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-3">
              <div className="flex items-center gap-2 text-green-700">
                <Info className="h-4 w-4" />
                <span>Produto pode ser excluído sem problemas</span>
              </div>
            </div>
          )}
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>
            Cancelar
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            disabled={isDeleting || isLoading || (hasBlockingDependencies && !forceDelete)}
            className="bg-red-600 hover:bg-red-700"
          >
            {isDeleting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Excluindo...
              </>
            ) : (
              <>
                <Trash2 className="h-4 w-4 mr-2" />
                {hasBlockingDependencies && forceDelete ? 'Forçar Exclusão' : 'Excluir'}
              </>
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
