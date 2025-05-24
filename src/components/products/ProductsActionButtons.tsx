
import React from 'react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { RefreshCw, Plus, DollarSign, Tags } from 'lucide-react';

interface ProductsActionButtonsProps {
  onAddProduct: () => void;
  onReloadClassifications?: () => Promise<void>;
  isReloading?: boolean;
}

const ProductsActionButtons: React.FC<ProductsActionButtonsProps> = ({
  onAddProduct,
  onReloadClassifications,
  isReloading = false
}) => {
  return (
    <div className="pb-4 flex flex-wrap gap-2">
      <Button onClick={onAddProduct} className="bg-blue-600 hover:bg-blue-700">
        <Plus size={16} className="mr-2" />
        Adicionar Produto
      </Button>
      
      <Link to="/produtos/precificacao">
        <Button variant="outline">
          <DollarSign size={16} className="mr-2" />
          Precificação
        </Button>
      </Link>
      
      <Link to="/produtos/classificacoes">
        <Button variant="outline">
          <Tags size={16} className="mr-2" />
          Classificações
        </Button>
      </Link>
      
      {onReloadClassifications && (
        <Button variant="outline" onClick={onReloadClassifications} disabled={isReloading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${isReloading ? 'animate-spin' : ''}`} />
          {isReloading ? 'Recarregando...' : 'Recarregar Classificações'}
        </Button>
      )}
    </div>
  );
};

export default ProductsActionButtons;
