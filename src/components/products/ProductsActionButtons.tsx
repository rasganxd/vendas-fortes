
import React from 'react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

interface ProductsActionButtonsProps {
  onAddProduct: () => void;
}

const ProductsActionButtons: React.FC<ProductsActionButtonsProps> = ({ 
  onAddProduct
}) => {
  return (
    <div className="pb-4 flex flex-wrap gap-2">
      <Button onClick={onAddProduct}>Adicionar Produto</Button>
      <Link to="/produtos/precificacao">
        <Button variant="outline">Precificação</Button>
      </Link>
      <Link to="/produtos/classificacoes">
        <Button variant="outline">Classificações</Button>
      </Link>
    </div>
  );
};

export default ProductsActionButtons;
