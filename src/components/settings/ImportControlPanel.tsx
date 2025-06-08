
import React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Import, 
  X, 
  CheckSquare, 
  Square, 
  RefreshCw,
  DollarSign
} from "lucide-react";

interface ImportControlPanelProps {
  selectedCount: number;
  totalCount: number;
  totalValue: number;
  isImporting: boolean;
  onImportSelected: () => void;
  onRejectSelected: () => void;
  onSelectAll: () => void;
  onClearSelection: () => void;
  onRefresh: () => void;
}

export function ImportControlPanel({
  selectedCount,
  totalCount,
  totalValue,
  isImporting,
  onImportSelected,
  onRejectSelected,
  onSelectAll,
  onClearSelection,
  onRefresh
}: ImportControlPanelProps) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-600">Total:</span>
              <Badge variant="outline" className="text-blue-600">
                {totalCount} pedidos
              </Badge>
            </div>
            
            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-green-600" />
              <span className="text-sm font-medium">
                R$ {totalValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </span>
            </div>

            {selectedCount > 0 && (
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-600">Selecionados:</span>
                <Badge variant="default" className="bg-blue-500">
                  {selectedCount}
                </Badge>
              </div>
            )}
          </div>

          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={onRefresh}
              disabled={isImporting}
            >
              <RefreshCw className="h-4 w-4 mr-1" />
              Atualizar
            </Button>

            {totalCount > 0 && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={selectedCount === totalCount ? onClearSelection : onSelectAll}
                  disabled={isImporting}
                >
                  {selectedCount === totalCount ? (
                    <>
                      <Square className="h-4 w-4 mr-1" />
                      Desmarcar Todos
                    </>
                  ) : (
                    <>
                      <CheckSquare className="h-4 w-4 mr-1" />
                      Selecionar Todos
                    </>
                  )}
                </Button>

                {selectedCount > 0 && (
                  <>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={onRejectSelected}
                      disabled={isImporting}
                    >
                      <X className="h-4 w-4 mr-1" />
                      Rejeitar Selecionados
                    </Button>

                    <Button
                      variant="default"
                      size="sm"
                      onClick={onImportSelected}
                      disabled={isImporting}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <Import className="h-4 w-4 mr-1" />
                      {isImporting ? 'Importando...' : 'Importar Selecionados'}
                    </Button>
                  </>
                )}
              </>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
