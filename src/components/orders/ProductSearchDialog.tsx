
import React, { useState } from 'react';
import { Product } from '@/types';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search } from 'lucide-react';

interface ProductSearchDialogProps {
  open: boolean;
  onClose: () => void;
  products: Product[];
  onSelectProduct: (product: Product) => void;
}

const ProductSearchDialog: React.FC<ProductSearchDialogProps> = ({
  open,
  onClose,
  products,
  onSelectProduct
}) => {
  const [search, setSearch] = useState('');

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(search.toLowerCase()) ||
    product.code.toString().includes(search)
  );

  const handleSelect = (product: Product) => {
    onSelectProduct(product);
    onClose();
    setSearch('');
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Buscar Produto</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" size={18} />
            <Input
              placeholder="Buscar por nome ou código..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <div className="max-h-96 overflow-y-auto space-y-2">
            {filteredProducts.map(product => (
              <div
                key={product.id}
                className="p-3 border rounded-lg cursor-pointer hover:bg-gray-50"
                onClick={() => handleSelect(product)}
              >
                <div className="flex justify-between items-center">
                  <div>
                    <div className="font-medium">{product.name}</div>
                    <div className="text-sm text-gray-500">Código: {product.code}</div>
                  </div>
                  <Button variant="outline" size="sm">
                    Selecionar
                  </Button>
                </div>
              </div>
            ))}
            {filteredProducts.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                Nenhum produto encontrado
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ProductSearchDialog;
