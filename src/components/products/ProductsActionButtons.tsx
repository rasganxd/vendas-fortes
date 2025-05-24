import React from 'react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { RefreshCw } from 'lucide-react';
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
  return <div className="pb-4 flex flex-wrap gap-2">
      
      <Link to="/produtos/precificacao">
        
      </Link>
      <Link to="/produtos/classificacoes">
        
      </Link>
      {onReloadClassifications && <Button variant="outline" onClick={onReloadClassifications} disabled={isReloading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${isReloading ? 'animate-spin' : ''}`} />
          {isReloading ? 'Recarregando...' : 'Recarregar Classificações'}
        </Button>}
    </div>;
};
export default ProductsActionButtons;