
import React from 'react';
import { Product } from '@/types';
import { 
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import { 
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandList,
  CommandItem
} from "@/components/ui/command";
import { useUnits } from '@/hooks/useUnits';

interface ProductSearchDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  products: Product[];
  productSearch: string;
  onSearchChange: (value: string) => void;
  onSelectProduct: (product: Product) => void;
}

export default function ProductSearchDialog({
  open,
  onOpenChange,
  products,
  productSearch,
  onSearchChange,
  onSelectProduct
}: ProductSearchDialogProps) {
  const { units } = useUnits();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl p-0">
        <Command className="rounded-lg border shadow-md">
          <CommandInput 
            placeholder="Buscar produto por nome..." 
            value={productSearch}
            onValueChange={onSearchChange}
          />
          <CommandList>
            <CommandEmpty>Nenhum produto encontrado.</CommandEmpty>
            <CommandGroup>
              {products.map((product) => (
                <CommandItem
                  key={product.id}
                  value={product.id}
                  onSelect={() => onSelectProduct(product)}
                  className="cursor-pointer py-2 px-2"
                >
                  <div className="flex flex-col w-full">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <span className="bg-gray-100 text-gray-800 px-1.5 py-0.5 rounded text-xs font-medium mr-2">
                          {product.code}
                        </span>
                        <span className="font-medium">{product.name}</span>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium text-gray-700">
                          {units.find(u => u.id === product.main_unit_id)?.code || product.unit || 'UN'}
                        </div>
                      </div>
                    </div>
                    {product.description && (
                      <span className="text-xs text-gray-500 ml-7">
                        {product.description}
                      </span>
                    )}
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </DialogContent>
    </Dialog>
  );
}
