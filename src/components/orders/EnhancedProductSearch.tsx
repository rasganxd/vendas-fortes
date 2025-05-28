
import React, { useState, useRef, useEffect } from 'react';
import { Product } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, Package, Plus, Barcode } from 'lucide-react';
import QuantityInput from './QuantityInput';

interface EnhancedProductSearchProps {
  products: Product[];
  handleAddItem: (product: Product, quantity: number, price: number) => void;
  productInputRef: React.RefObject<HTMLInputElement>;
  isEditMode: boolean;
  selectedCustomer: any;
}

export default function EnhancedProductSearch({
  products,
  handleAddItem,
  productInputRef,
  isEditMode,
  selectedCustomer
}: EnhancedProductSearchProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [price, setPrice] = useState(0);
  const [showResults, setShowResults] = useState(false);
  const quantityInputRef = useRef<HTMLInputElement>(null);
  const addButtonRef = useRef<HTMLButtonElement>(null);

  // Check if search term is a product code (numeric)
  const isCodeSearch = /^\d+$/.test(searchTerm.trim());

  // Filter products based on search term
  const filteredProducts = products.filter(product => {
    if (isCodeSearch) {
      // For code search, match exact code
      return product.code.toString() === searchTerm.trim();
    } else {
      // For name search, match name containing the search term
      return product.name.toLowerCase().includes(searchTerm.toLowerCase());
    }
  }).slice(0, 8); // Limit to 8 results

  // Get customer's recent products (simplified - just show first 5 products for now)
  const customerProducts = selectedCustomer ? products.slice(0, 5) : [];

  useEffect(() => {
    if (selectedProduct) {
      setPrice(selectedProduct.price || 0);
    }
  }, [selectedProduct]);

  // Auto-select product when searching by code
  useEffect(() => {
    if (isCodeSearch && filteredProducts.length === 1 && !selectedProduct) {
      const product = filteredProducts[0];
      setSelectedProduct(product);
      setPrice(product.price || 0);
      setShowResults(false);
      
      // Focus on quantity input
      setTimeout(() => {
        quantityInputRef.current?.focus();
      }, 100);
    }
  }, [isCodeSearch, filteredProducts, selectedProduct]);

  const handleProductSelect = (product: Product) => {
    setSelectedProduct(product);
    setSearchTerm(product.name);
    setPrice(product.price || 0);
    setShowResults(false);
    
    // Focus on quantity input
    setTimeout(() => {
      quantityInputRef.current?.focus();
    }, 100);
  };

  const handleAdd = () => {
    if (selectedProduct && quantity > 0) {
      handleAddItem(selectedProduct, quantity, price);
      
      // Reset form
      setSelectedProduct(null);
      setSearchTerm('');
      setQuantity(1);
      setPrice(0);
      
      // Focus back on search
      productInputRef.current?.focus();
    }
  };

  const handleSearchKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (isCodeSearch) {
        // For code search, if we found a product, it's already selected by useEffect
        if (selectedProduct) {
          quantityInputRef.current?.focus();
        }
      } else if (filteredProducts.length > 0) {
        // For name search, select first result
        handleProductSelect(filteredProducts[0]);
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (!isCodeSearch) {
        setShowResults(true);
      }
    }
  };

  const handleQuantityKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAdd();
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    
    // Reset selected product when search changes
    if (selectedProduct && selectedProduct.name !== value) {
      setSelectedProduct(null);
      setPrice(0);
    }
    
    // Show results only for name search (not code search) and when there's input
    const isCode = /^\d+$/.test(value.trim());
    setShowResults(!isCode && value.length > 0);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
          <Package size={20} />
          Busca de Produtos
        </h3>
        <div className="text-xs text-gray-500">
          F2: Buscar produto
        </div>
      </div>

      {/* Search Input */}
      <div className="relative">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            ref={productInputRef}
            type="text"
            placeholder="Buscar por nome ou código..."
            value={searchTerm}
            onChange={handleSearchChange}
            onKeyDown={handleSearchKeyDown}
            onFocus={() => {
              if (!isCodeSearch && searchTerm.length > 0) {
                setShowResults(true);
              }
            }}
            className="pl-10 pr-4 h-11 text-base"
            disabled={isEditMode}
          />
          <Barcode className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
        </div>

        {/* Search Results - Only show for name search */}
        {showResults && !isCodeSearch && filteredProducts.length > 0 && (
          <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-64 overflow-y-auto">
            {filteredProducts.map((product) => (
              <div
                key={product.id}
                className="p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                onClick={() => handleProductSelect(product)}
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">{product.name}</div>
                    <div className="text-sm text-gray-500">Cód: {product.code}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-green-600">
                      {product.price?.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </div>
                    <div className="text-xs text-gray-500">{product.unit}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Product Addition Form */}
      {selectedProduct && (
        <Card className="border-green-200 bg-green-50">
          <CardContent className="pt-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium text-gray-900">{selectedProduct.name}</div>
                  <div className="text-sm text-gray-500">Cód: {selectedProduct.code}</div>
                </div>
                <Badge variant="outline" className="bg-white">
                  {selectedProduct.unit}
                </Badge>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Quantidade</label>
                  <QuantityInput
                    quantity={quantity}
                    onQuantityChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                    onIncrement={() => setQuantity(prev => prev + 1)}
                    onDecrement={() => setQuantity(prev => Math.max(1, prev - 1))}
                    inputRef={quantityInputRef}
                    onKeyDown={handleQuantityKeyDown}
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Preço Unitário</label>
                  <Input
                    type="number"
                    step="0.01"
                    value={price}
                    onChange={(e) => setPrice(parseFloat(e.target.value) || 0)}
                    className="h-10"
                  />
                </div>

                <div className="flex items-end">
                  <Button
                    ref={addButtonRef}
                    onClick={handleAdd}
                    className="w-full h-10 bg-green-600 hover:bg-green-700"
                    disabled={!selectedProduct || quantity <= 0}
                  >
                    <Plus size={16} className="mr-2" />
                    Adicionar
                  </Button>
                </div>
              </div>

              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-600">Total:</span>
                <span className="font-bold text-green-600 text-lg">
                  {(quantity * price).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Customer's Recent Products */}
      {selectedCustomer && customerProducts.length > 0 && (
        <Card className="border-blue-200 bg-blue-50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Produtos Recentes - {selectedCustomer.name}</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-1">
              {customerProducts.map((product) => (
                <div
                  key={product.id}
                  className="flex justify-between items-center p-2 hover:bg-white rounded cursor-pointer"
                  onClick={() => handleProductSelect(product)}
                >
                  <span className="text-sm font-medium">{product.name}</span>
                  <span className="text-sm text-blue-600">
                    {product.price?.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
