
import React, { useState, useEffect } from 'react';
import { Product } from '@/types';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Search, X, Plus } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { toast } from "@/components/ui/use-toast";
import { 
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList
} from "@/components/ui/command";

interface ProductSearchInputProps {
  products: Product[];
  addItemToOrder: (product: Product, quantity: number, price: number) => void;
  inlineLayout?: boolean;
}

export default function ProductSearchInput({
  products,
  addItemToOrder,
  inlineLayout = false
}: ProductSearchInputProps) {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [customPrice, setCustomPrice] = useState<number | null>(null);
  const [productInput, setProductInput] = useState('');
  const [isProductSearchOpen, setIsProductSearchOpen] = useState(false);
  const [productSearch, setProductSearch] = useState('');

  useEffect(() => {
    if (selectedProduct) {
      setCustomPrice(selectedProduct.price);
    }
  }, [selectedProduct]);

  const filteredProducts = products.filter(product => 
    product.name.toLowerCase().includes(productSearch.toLowerCase()) ||
    product.code?.toString().includes(productSearch) ||
    product.price?.toString().includes(productSearch)
  );

  const findProductByCode = (code: string) => {
    const foundProduct = products.find(p => p.code && p.code.toString() === code);
    if (foundProduct) {
      setSelectedProduct(foundProduct);
      setCustomPrice(foundProduct.price);
      setProductInput(`${foundProduct.code} - ${foundProduct.name}`);
      return true;
    }
    return false;
  };

  const handleProductInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setProductInput(value);
    
    // Check if input is just a code number
    const codeMatch = value.match(/^(\d+)$/);
    if (codeMatch) {
      findProductByCode(codeMatch[1]);
    } else if (!value) {
      setSelectedProduct(null);
      setCustomPrice(0);
    }
  };

  // Helper function to parse price from Brazilian format to number
  const parsePrice = (priceStr: string) => {
    if (!priceStr) return 0;
    
    // Remove R$ symbol and any dots, replace comma with dot for decimal
    const cleanPriceStr = priceStr.replace(/[^\d,]/g, '').replace(',', '.');
    return parseFloat(cleanPriceStr) || 0;
  };

  const handleAddItem = () => {
    if (!selectedProduct) {
      toast({
        title: "Erro",
        description: "Selecione um produto antes de adicionar ao pedido.",
        variant: "destructive"
      });
      return;
    }

    if (quantity <= 0) {
      toast({
        title: "Erro",
        description: "A quantidade deve ser maior que zero.",
        variant: "destructive"
      });
      return;
    }

    // Use custom price instead of product price
    const priceToUse = customPrice !== null ? customPrice : selectedProduct.price;

    addItemToOrder(selectedProduct, quantity, priceToUse);
    
    // Reset product selection after adding to order
    setSelectedProduct(null);
    setProductInput('');
    setQuantity(1);
    setCustomPrice(0);
  };

  if (inlineLayout) {
    return (
      <>
        <div className="grid grid-cols-12 gap-4 items-end">
          <div className="col-span-5">
            <Label htmlFor="product" className="text-xs text-gray-500">Produto</Label>
            <div className="flex items-center gap-2">
              <Input
                type="text"
                id="product"
                placeholder="Código ou nome do produto"
                value={productInput}
                onChange={handleProductInputChange}
                className="h-9"
              />
              <Button 
                type="button" 
                variant="outline" 
                size="icon" 
                onClick={() => setIsProductSearchOpen(true)}
                className="h-9 w-9 shrink-0"
              >
                <Search size={16} />
              </Button>
              {selectedProduct && (
                <Button 
                  type="button" 
                  variant="ghost" 
                  size="icon"
                  onClick={() => {
                    setSelectedProduct(null);
                    setProductInput('');
                    setCustomPrice(0);
                  }}
                  className="h-9 w-9 shrink-0"
                >
                  <X size={16} />
                </Button>
              )}
            </div>
          </div>
          
          <div className="col-span-2">
            <Label htmlFor="quantity" className="text-xs text-gray-500">Quantidade</Label>
            <Input
              type="number"
              id="quantity"
              value={quantity}
              onChange={(e) => setQuantity(parseInt(e.target.value) || 0)}
              min="1"
              className="h-9"
            />
          </div>
          
          <div className="col-span-3">
            <Label htmlFor="price" className="text-xs text-gray-500">Valor Unitário</Label>
            <Input
              type="text"
              id="price"
              mask="price"
              value={customPrice ? customPrice.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) : '0,00'}
              onChange={(e) => setCustomPrice(parsePrice(e.target.value))}
              className="h-9"
            />
          </div>
          
          <div className="col-span-2">
            <Button 
              onClick={handleAddItem} 
              className="w-full h-9 bg-sales-800 hover:bg-sales-700 text-white"
            >
              <Plus size={16} /> Adicionar
            </Button>
          </div>
        </div>

        {/* Product Search Dialog */}
        <Dialog open={isProductSearchOpen} onOpenChange={setIsProductSearchOpen}>
          <DialogContent className="sm:max-w-md">
            <Command className="rounded-lg border shadow-md">
              <CommandInput 
                placeholder="Buscar produto por código, nome ou preço..." 
                value={productSearch}
                onValueChange={setProductSearch}
                className="h-9"
              />
              <CommandList>
                <CommandEmpty>Nenhum produto encontrado.</CommandEmpty>
                <CommandGroup heading="Produtos">
                  {filteredProducts.map((product) => (
                    <CommandItem
                      key={product.id}
                      value={product.id}
                      onSelect={() => {
                        setSelectedProduct(product);
                        setProductInput(`${product.code} - ${product.name}`);
                        // Update custom price when selecting a product
                        setCustomPrice(product.price);
                        setIsProductSearchOpen(false);
                        setProductSearch('');
                      }}
                      className="cursor-pointer"
                    >
                      <span className="font-medium mr-2">{product.code || '—'}</span>
                      <span className="flex-1">{product.name}</span>
                      <span className="text-right text-muted-foreground">
                        {product.price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                      </span>
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </DialogContent>
        </Dialog>
      </>
    );
  }

  // Original layout
  return (
    <>
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="product">Produto</Label>
          <div className="flex items-center gap-2">
            <Input
              type="text"
              id="product"
              placeholder="Digite o código do produto"
              value={productInput}
              onChange={handleProductInputChange}
              className="w-full"
            />
            <Button 
              type="button" 
              variant="outline" 
              size="icon" 
              onClick={() => setIsProductSearchOpen(true)}
              className="shrink-0"
            >
              <Search size={18} />
            </Button>
            {selectedProduct && (
              <Button 
                type="button" 
                variant="ghost" 
                size="icon" 
                onClick={() => {
                  setSelectedProduct(null);
                  setProductInput('');
                  setCustomPrice(0);
                }}
                className="shrink-0"
              >
                <X size={18} />
              </Button>
            )}
          </div>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="quantity">Quantidade</Label>
          <Input
            type="number"
            id="quantity"
            value={quantity}
            onChange={(e) => setQuantity(parseInt(e.target.value) || 0)}
            min="1"
            className="w-full"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="price">Preço (R$)</Label>
          <Input
            type="text"
            id="price"
            mask="price"
            value={customPrice ? customPrice.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) : '0,00'}
            onChange={(e) => setCustomPrice(parsePrice(e.target.value))}
            className="w-full"
          />
        </div>
        
        <Button onClick={handleAddItem} className="w-full">
          <Plus size={16} className="mr-2" /> Adicionar ao Pedido
        </Button>
        
        {selectedProduct && (
          <div className="p-3 bg-gray-50 rounded-md mt-4">
            <p className="font-medium">{selectedProduct.name}</p>
            <p className="text-sm text-gray-500">{selectedProduct.description}</p>
            <div className="flex justify-between mt-1">
              <p>Preço original:</p>
              <p className="font-semibold">
                {selectedProduct.price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
              </p>
            </div>
            {customPrice !== selectedProduct.price && customPrice !== null && (
              <div className="flex justify-between mt-1">
                <p>Preço personalizado:</p>
                <p className="font-semibold text-sales-700">
                  {customPrice.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Product Search Dialog */}
      <Dialog open={isProductSearchOpen} onOpenChange={setIsProductSearchOpen}>
        <DialogContent className="sm:max-w-md">
          <Command className="rounded-lg border shadow-md">
            <CommandInput 
              placeholder="Buscar produto por código, nome ou preço..." 
              value={productSearch}
              onValueChange={setProductSearch}
              className="h-9"
            />
            <CommandList>
              <CommandEmpty>Nenhum produto encontrado.</CommandEmpty>
              <CommandGroup heading="Produtos">
                {filteredProducts.map((product) => (
                  <CommandItem
                    key={product.id}
                    value={product.id}
                    onSelect={() => {
                      setSelectedProduct(product);
                      setProductInput(`${product.code} - ${product.name}`);
                      // Update custom price when selecting a product
                      setCustomPrice(product.price);
                      setIsProductSearchOpen(false);
                      setProductSearch('');
                    }}
                    className="cursor-pointer"
                  >
                    <span className="font-medium mr-2">{product.code || '—'}</span>
                    <span className="flex-1">{product.name}</span>
                    <span className="text-right text-muted-foreground">
                      {product.price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </span>
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </DialogContent>
      </Dialog>
    </>
  );
}
