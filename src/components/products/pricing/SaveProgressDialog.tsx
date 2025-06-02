
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { CheckCircle, Loader2, AlertCircle } from 'lucide-react';

interface SaveProgressDialogProps {
  open: boolean;
  progress: number;
  total: number;
  currentProduct?: string;
  errors: string[];
  isComplete: boolean;
}

const SaveProgressDialog: React.FC<SaveProgressDialogProps> = ({
  open,
  progress,
  total,
  currentProduct,
  errors,
  isComplete
}) => {
  const percentage = total > 0 ? (progress / total) * 100 : 0;
  const hasErrors = errors.length > 0;

  return (
    <Dialog open={open}>
      <DialogContent className="sm:max-w-md" hideCloseButton>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {isComplete ? (
              hasErrors ? (
                <>
                  <AlertCircle className="h-5 w-5 text-yellow-600" />
                  Salvamento Concluído com Avisos
                </>
              ) : (
                <>
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  Salvamento Concluído
                </>
              )
            ) : (
              <>
                <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
                Salvando Preços
              </>
            )}
          </DialogTitle>
          <DialogDescription>
            {isComplete ? (
              hasErrors ? (
                `${progress - errors.length} de ${total} produtos salvos com sucesso`
              ) : (
                `Todos os ${total} produtos foram salvos com sucesso`
              )
            ) : (
              `Salvando produto ${progress} de ${total}`
            )}
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="space-y-2">
            <Progress value={percentage} className="w-full" />
            <div className="flex justify-between text-sm text-gray-600">
              <span>{progress} / {total}</span>
              <span>{Math.round(percentage)}%</span>
            </div>
          </div>
          
          {currentProduct && !isComplete && (
            <div className="text-sm text-gray-600">
              Processando: <span className="font-medium">{currentProduct}</span>
            </div>
          )}
          
          {errors.length > 0 && (
            <div className="space-y-2">
              <div className="text-sm font-medium text-yellow-700">Produtos com problemas:</div>
              <div className="max-h-32 overflow-y-auto space-y-1">
                {errors.map((error, index) => (
                  <div key={index} className="text-xs text-yellow-600 bg-yellow-50 p-2 rounded">
                    {error}
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {isComplete && (
            <div className="flex justify-center pt-2">
              <div className="text-center">
                <div className={`text-2xl ${hasErrors ? 'text-yellow-600' : 'text-green-600'}`}>
                  {hasErrors ? '⚠️' : '✅'}
                </div>
                <div className="text-sm text-gray-600 mt-1">
                  {hasErrors ? 'Concluído com avisos' : 'Sucesso!'}
                </div>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SaveProgressDialog;
