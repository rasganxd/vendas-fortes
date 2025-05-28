
import React from 'react';
import {
  EnhancedTable,
  EnhancedTableBody,
  EnhancedTableCell,
  EnhancedTableHead,
  EnhancedTableHeader,
  EnhancedTableRow,
} from "@/components/ui/enhanced-table";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Button } from '@/components/ui/button';
import { Edit, Trash, Package } from 'lucide-react';
import { Product } from '@/types';
import { formatCurrency } from "@/lib/utils";
import { EnhancedBadge } from '@/components/ui/enhanced-badge';
import { TableSkeleton } from '@/components/ui/loading-skeleton';

interface EnhancedProductsTableProps {
  products: Product[];
  isLoading: boolean;
  onEdit: (product: Product) => void;
  onDelete: (id: string) => void;
}

const EnhancedProductsTable: React.FC<EnhancedProductsTableProps> = ({
  products,
  isLoading,
  onEdit,
  onDelete
}) => {
  if (isLoading) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <TableSkeleton rows={8} columns={6} />
      </div>
    );
  }

  return (
    <EnhancedTable maxHeight="700px">
      <EnhancedTableHeader>
        <EnhancedTableRow>
          <EnhancedTableHead>
            <div className="flex items-center gap-2">
              <Package className="h-4 w-4" />
              Código
            </div>
          </EnhancedTableHead>
          <EnhancedTableHead>Nome do Produto</EnhancedTableHead>
          <EnhancedTableHead>Custo</EnhancedTableHead>
          <EnhancedTableHead>Preço de Venda</EnhancedTableHead>
          <EnhancedTableHead>Estoque</EnhancedTableHead>
          <EnhancedTableHead className="text-center">Ações</EnhancedTableHead>
        </EnhancedTableRow>
      </EnhancedTableHeader>
      <EnhancedTableBody>
        {products && products.length > 0 ? (
          products.map((product) => (
            <EnhancedTableRow key={product.id}>
              <EnhancedTableCell>
                <div className="font-mono text-sm font-semibold text-blue-600">
                  {product.code}
                </div>
              </EnhancedTableCell>
              <EnhancedTableCell>
                <div className="font-medium text-gray-900">{product.name}</div>
              </EnhancedTableCell>
              <EnhancedTableCell>
                <div className="text-gray-600 font-medium">
                  {formatCurrency(product.cost)}
                </div>
              </EnhancedTableCell>
              <EnhancedTableCell>
                <div className="font-semibold text-green-600">
                  {formatCurrency(product.price)}
                </div>
              </EnhancedTableCell>
              <EnhancedTableCell>
                <EnhancedBadge 
                  variant={product.stock > 10 ? "success" : product.stock > 0 ? "warning" : "destructive"}
                  size="sm"
                >
                  {product.stock} un
                </EnhancedBadge>
              </EnhancedTableCell>
              <EnhancedTableCell>
                <div className="flex items-center justify-center gap-1">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => onEdit(product)}
                          className="h-8 w-8 p-0 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Editar produto</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => onDelete(product.id)}
                          className="h-8 w-8 p-0 hover:bg-red-50 hover:text-red-600 transition-colors"
                        >
                          <Trash className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Excluir produto</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              </EnhancedTableCell>
            </EnhancedTableRow>
          ))
        ) : (
          <EnhancedTableRow>
            <EnhancedTableCell colSpan={6} className="text-center py-12">
              <div className="flex flex-col items-center gap-3 text-gray-500">
                <Package className="h-12 w-12 text-gray-300" />
                <div>
                  <p className="font-medium">Nenhum produto encontrado</p>
                  <p className="text-sm">Adicione produtos utilizando o botão acima</p>
                </div>
              </div>
            </EnhancedTableCell>
          </EnhancedTableRow>
        )}
      </EnhancedTableBody>
    </EnhancedTable>
  );
};

export default EnhancedProductsTable;
