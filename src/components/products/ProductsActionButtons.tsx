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
      <Button onClick={onAddProduct}>Adicionar Produto</Button>
      <Link to="/produtos/precificacao">
        <Button variant="outline">Precificação</Button>
      </Link>
      <Link to="/produtos/classificacoes">
        
      </Link>
      {onReloadClassifications}
    </div>;
};
export default ProductsActionButtons;