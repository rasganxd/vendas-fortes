
import React from 'react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { Plus, DollarSign, Tags, Package } from 'lucide-react';

interface ProductsActionButtonsProps {
  onAddProduct: () => void;
}

const ProductsActionButtons: React.FC<ProductsActionButtonsProps> = ({
  onAddProduct
}) => {
  return (
    <div className="pb-4 flex flex-wrap gap-2">
      <Button onClick={onAddProduct} className="bg-blue-600 hover:bg-blue-700">
        <Plus size={16} className="mr-2" />
        Adicionar Produto
      </Button>
      
      <Link to="/produtos/unidades">
        <Button variant="outline">
          <Package size={16} className="mr-2" />
          Unidades
        </Button>
      </Link>
      
      <Link to="/produtos/classificacoes">
        <Button variant="outline">
          <Tags size={16} className="mr-2" />
          Classificações
        </Button>
      </Link>
      
      <Link to="/produtos/precificacao">
        <Button variant="outline">
          <DollarSign size={16} className="mr-2" />
          Precificação
        </Button>
      </Link>
    </div>
  );
};

export default ProductsActionButtons;
