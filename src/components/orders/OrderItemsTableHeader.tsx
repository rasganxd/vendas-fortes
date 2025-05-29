
import React from 'react';
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

interface OrderItemsTableHeaderProps {
  itemCount: number;
  searchFilter: string;
  setSearchFilter: (filter: string) => void;
  isEditMode: boolean;
}

export default function OrderItemsTableHeader({
  itemCount,
  searchFilter,
  setSearchFilter,
  isEditMode
}: OrderItemsTableHeaderProps) {
  return (
    <div className="px-4 py-3 border-b bg-gray-50 flex-shrink-0">
      <div className="flex items-center justify-between">
        <h4 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
          Itens do Pedido
          <Badge variant="secondary" className="ml-2">
            {itemCount} {itemCount === 1 ? 'item' : 'itens'}
          </Badge>
        </h4>
        
        {itemCount > 3 && (
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
            <Input
              type="text"
              placeholder="Filtrar itens..."
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              className="pl-9 w-64 h-8 text-sm"
            />
          </div>
        )}
      </div>
      
      {isEditMode && (
        <div className="mt-2 text-sm text-blue-600">
          💡 Clique no ícone de edição para alterar quantidade ou preço
        </div>
      )}
    </div>
  );
}
