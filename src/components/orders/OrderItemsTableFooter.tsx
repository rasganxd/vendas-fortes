
import React from 'react';
import { Badge } from "@/components/ui/badge";
import { Separator } from '@/components/ui/separator';

interface OrderItemsTableFooterProps {
  filteredItemsCount: number;
  totalQuantity: number;
  averageValue: number;
  totalValue: number;
  searchFilter: string;
}

export default function OrderItemsTableFooter({
  filteredItemsCount,
  totalQuantity,
  averageValue,
  totalValue,
  searchFilter
}: OrderItemsTableFooterProps) {
  return (
    <div className="border-t-2 bg-gradient-to-r from-gray-50 to-gray-100 flex-shrink-0">
      <div className="px-4 py-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
          {/* Left: Items summary */}
          <div className="flex items-center gap-4 text-sm font-medium text-gray-700">
            <span>Produtos: {filteredItemsCount}</span>
            <Separator orientation="vertical" className="h-4" />
            <span>Qtde Total: {totalQuantity}</span>
            {searchFilter && (
              <>
                <Separator orientation="vertical" className="h-4" />
                <Badge variant="secondary" className="text-xs">
                  Filtrado
                </Badge>
              </>
            )}
          </div>
          
          {/* Center: Average value */}
          <div className="text-center text-sm text-gray-600">
            Valor médio: {averageValue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
          </div>
          
          {/* Right: Total */}
          <div className="text-right">
            <div className="text-sm font-medium text-gray-600">Total Geral</div>
            <div className="text-2xl font-bold text-green-600">
              {totalValue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
