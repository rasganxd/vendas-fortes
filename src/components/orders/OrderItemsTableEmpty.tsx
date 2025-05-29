
import React from 'react';

interface OrderItemsTableEmptyProps {
  searchFilter: string;
}

export default function OrderItemsTableEmpty({ searchFilter }: OrderItemsTableEmptyProps) {
  return (
    <div className="text-center py-16 text-gray-500">
      {searchFilter ? (
        <div>
          <div className="text-lg mb-2">Nenhum item encontrado</div>
          <div className="text-sm">Ajuste o filtro de busca ou adicione novos produtos</div>
        </div>
      ) : (
        <div>
          <div className="text-lg mb-2">Nenhum item adicionado ao pedido</div>
          <div className="text-sm">Use a busca de produtos acima para adicionar itens</div>
        </div>
      )}
    </div>
  );
}
