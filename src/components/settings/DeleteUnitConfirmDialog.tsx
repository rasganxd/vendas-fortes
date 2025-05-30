
import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';
import { AlertTriangle, Loader2 } from 'lucide-react';
import { Unit } from '@/types/unit';
import { unitUsageService, UnitUsageInfo } from '@/services/supabase/unitUsageService';
import { toast } from 'sonner';

interface DeleteUnitConfirmDialogProps {
  unit: Unit | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (forceDelete?: boolean) => Promise<void>;
}

export const DeleteUnitConfirmDialog: React.FC<DeleteUnitConfirmDialogProps> = ({
  unit,
  isOpen,
  onClose,
  onConfirm
}) => {
  const [usageInfo, setUsageInfo] = useState<UnitUsageInfo | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (isOpen && unit) {
      checkUsage();
    }
  }, [isOpen, unit]);

  const checkUsage = async () => {
    if (!unit) return;
    
    setIsLoading(true);
    try {
      const usage = await unitUsageService.checkUnitUsage(unit.value);
      setUsageInfo(usage);
    } catch (error) {
      console.error('Erro ao verificar uso da unidade:', error);
      toast("Erro ao verificar uso da unidade");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (forceDelete = false) => {
    if (!unit) return;
    
    setIsDeleting(true);
    try {
      if (forceDelete && usageInfo?.isUsed) {
        // Remover a unidade de todos os produtos antes de excluir
        await unitUsageService.removeUnitFromProducts(unit.value);
        await unitUsageService.removeUnitMappings(unit.value);
        toast("Unidade removida de todos os produtos");
      }
      
      await onConfirm(forceDelete);
      onClose();
    } catch (error) {
      console.error('Erro ao excluir unidade:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  if (!unit) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-orange-500" />
            Excluir Unidade
          </DialogTitle>
          <DialogDescription>
            Tem certeza que deseja excluir a unidade "{unit.label}" ({unit.value})?
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-4">
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              <span className="text-sm text-gray-500">Verificando uso da unidade...</span>
            </div>
          ) : usageInfo ? (
            <div className="space-y-3">
              {usageInfo.isUsed ? (
                <div className="p-3 bg-orange-50 border border-orange-200 rounded-md">
                  <h4 className="font-medium text-orange-800 mb-2">
                    ⚠️ Unidade em uso
                  </h4>
                  <p className="text-sm text-orange-700 mb-2">
                    Esta unidade está sendo usada em {usageInfo.usageCount} local(is):
                  </p>
                  
                  {usageInfo.usedInProducts.length > 0 && (
                    <div className="mb-2">
                      <p className="text-sm font-medium text-orange-800">
                        Produtos que usam esta unidade:
                      </p>
                      <ul className="text-sm text-orange-700 ml-4">
                        {usageInfo.usedInProducts.slice(0, 5).map((productName, index) => (
                          <li key={index}>• {productName}</li>
                        ))}
                        {usageInfo.usedInProducts.length > 5 && (
                          <li>• ... e mais {usageInfo.usedInProducts.length - 5} produtos</li>
                        )}
                      </ul>
                    </div>
                  )}
                  
                  <p className="text-sm text-orange-700">
                    Para continuar, a unidade será automaticamente removida de todos os produtos
                    e substituída pela unidade padrão "UN" onde necessário.
                  </p>
                </div>
              ) : (
                <div className="p-3 bg-green-50 border border-green-200 rounded-md">
                  <p className="text-sm text-green-700">
                    ✅ Esta unidade não está sendo usada e pode ser excluída com segurança.
                  </p>
                </div>
              )}
            </div>
          ) : null}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isDeleting}>
            Cancelar
          </Button>
          <Button 
            variant="destructive" 
            onClick={() => handleDelete(usageInfo?.isUsed)}
            disabled={isDeleting || isLoading}
          >
            {isDeleting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Excluindo...
              </>
            ) : usageInfo?.isUsed ? (
              'Remover e Excluir'
            ) : (
              'Excluir'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
