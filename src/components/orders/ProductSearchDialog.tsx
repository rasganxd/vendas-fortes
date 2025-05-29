
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Command, CommandEmpty, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Product } from '@/types';
import ProductItem from './ProductItem';

interface ProductSearchDialogProps {
  open: boolean;
  onClose: () => void;
  products: Product[];
  onSelectProduct: (product: Product) => void;
}

export default function ProductSearchDialog({
  open,
  onClose,
  products,
  onSelectProduct
}: ProductSearchDialogProps) {
  const [searchValue, setSearchValue] = useState('');

  const filteredProducts = products.filter(product => {
    const searchTerm = searchValue.toLowerCase();
    return (
      product.name.toLowerCase().includes(searchTerm) ||
      product.code.toString().includes(searchTerm)
    );
  }).slice(0, 50); // Limitar para melhor performance

  const handleSelectProduct = (product: Product) => {
    onSelectProduct(product);
    onClose();
    setSearchValue('');
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            Buscar Produto
          </DialogTitle>
        </DialogHeader>
        
        <Command>
          <CommandInput
            placeholder="Digite o nome ou código do produto..."
            value={searchValue}
            onValueChange={setSearchValue}
          />
          <CommandList className="max-h-[400px]">
            <CommandEmpty>
              {searchValue ? 'Nenhum produto encontrado.' : 'Digite para buscar produtos...'}
            </CommandEmpty>
            
            {filteredProducts.map((product) => (
              <CommandItem
                key={product.id}
                value={`${product.name} ${product.code}`}
                onSelect={() => handleSelectProduct(product)}
                className="p-0"
              >
                <ProductItem 
                  product={product} 
                  onSelect={handleSelectProduct}
                />
              </CommandItem>
            ))}
          </CommandList>
        </Command>
      </DialogContent>
    </Dialog>
  );
}
