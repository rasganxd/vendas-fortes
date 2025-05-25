
import React from 'react';

interface OrderFormHeaderProps {
  isEditMode: boolean;
}

export default function OrderFormHeader({ isEditMode }: OrderFormHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <h3 className="text-base font-medium">
        {isEditMode ? 'Editar Pedido' : 'Novo Pedido'}
      </h3>
      {isEditMode && (
        <div className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded">
          Modo de Edição
        </div>
      )}
    </div>
  );
}
