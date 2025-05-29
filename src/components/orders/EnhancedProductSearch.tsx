
import React, { useState, useRef, useEffect } from 'react';
import { Product } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, Package, Plus, Barcode, AlertTriangle } from 'lucide-react';
import QuantityInput from './QuantityInput';
import UnitSelector from '@/components/ui/UnitSelector';
import ProductSearchResultsPortal from './ProductSearchResultsPortal';
import PriceValidation from '@/components/products/pricing/PriceValidation';
import { calculateUnitPrice, formatBrazilianPrice, parseBrazilianPrice } from '@/utils/priceConverter';
import { validateProductDiscount } from '@/context/operations/productOperations';

interface EnhancedProductSearchProps {
  products: Product[];
  handleAddItem: (product: Product, quantity: number, price: number, unit?: string) => void;
  productInputRef: React.RefObject<HTMLInputElement>;
  isEditMode: boolean;
  selectedCustomer: any;
}

export default function EnhancedProductSearch({
  products,
  handleAddItem,
  productInputRef,
  isEditMode
}: EnhancedProductSearchProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [price, setPrice] = useState(0);
  const [selectedUnit, setSelectedUnit] = useState('');
  const [showResults, setShowResults] = useState(false);
  const [priceDisplayValue, setPriceDisplayValue] = useState('');
  const [priceValidationError, setPriceValidationError] = useState<string>('');
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

  // Validate price whenever it changes
  useEffect(() => {
    if (selectedProduct && price > 0) {
      const validation = validateProductDiscount(selectedProduct.id, price, products);
      if (validation === true) {
        setPriceValidationError('');
      } else {
        setPriceValidationError(validation as string);
      }
    } else {
      setPriceValidationError('');
    }
  }, [selectedProduct, price, products]);

  useEffect(() => {
    if (selectedProduct) {
      const mainUnit = selectedProduct.unit || 'UN';
      setSelectedUnit(mainUnit);
      
      // Use calculateUnitPrice to get the correct price for the main unit
      const correctPrice = calculateUnitPrice(selectedProduct, mainUnit);
      console.log(`💰 Preço inicial para ${mainUnit}: R$ ${correctPrice.toFixed(2)}`);
      
      setPrice(correctPrice);
      setPriceDisplayValue(formatBrazilianPrice(correctPrice));
    }
  }, [selectedProduct]);

  const handleProductSelect = (product: Product) => {
    console.log("📦 Produto selecionado:", product.name, {
      price: product.price,
      unit: product.unit,
      subunit: product.subunit,
      hasSubunit: product.hasSubunit,
      subunitRatio: product.subunitRatio
    });
    
    setSelectedProduct(product);
    setSearchTerm(product.name);
    setShowResults(false); // Always hide results when selecting a product

    // Focus on quantity input
    setTimeout(() => {
      quantityInputRef.current?.focus();
    }, 100);
  };

  const handleUnitChange = (unit: string) => {
    console.log("🔄 Mudança de unidade:", unit);
    setSelectedUnit(unit);

    if (selectedProduct) {
      // Use calculateUnitPrice to get the correct price for the selected unit
      const correctPrice = calculateUnitPrice(selectedProduct, unit);
      console.log(`💰 Novo preço para ${unit}: R$ ${correctPrice.toFixed(2)}`);
      
      setPrice(correctPrice);
      setPriceDisplayValue(formatBrazilianPrice(correctPrice));
    }
  };

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const displayValue = e.target.value;
    setPriceDisplayValue(displayValue);

    // Convert to number for calculations
    const numericPrice = parseBrazilianPrice(displayValue);
    setPrice(numericPrice);
  };

  const isPriceValid = !priceValidationError && price > 0;

  const handleAdd = () => {
    if (selectedProduct && quantity > 0 && isPriceValid) {
      console.log("🛒 Adicionando ao pedido:", {
        product: selectedProduct.name,
        quantity,
        price,
        unit: selectedUnit
      });
      
      handleAddItem(selectedProduct, quantity, price, selectedUnit);

      // Reset form completely
      setSelectedProduct(null);
      setSearchTerm('');
      setQuantity(1);
      setPrice(0);
      setPriceDisplayValue('');
      setSelectedUnit('');
      setPriceValidationError('');
      setShowResults(false); // Explicitly hide results after adding

      // Focus back on search
      productInputRef.current?.focus();
    }
  };

  const handleSearchKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredProducts.length > 0) {
        // Select first result for both code and name search
        handleProductSelect(filteredProducts[0]);
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (!isCodeSearch && searchTerm.length > 0) {
        setShowResults(true);
      }
    } else if (e.key === 'Escape') {
      setShowResults(false);
    }
  };

  const handleQuantityKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (isPriceValid) {
        handleAdd();
      }
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);

    // Reset selected product when search changes
    if (selectedProduct && selectedProduct.name !== value) {
      setSelectedProduct(null);
      setPrice(0);
      setPriceDisplayValue('');
      setSelectedUnit('');
      setPriceValidationError('');
    }

    // Show results only for name search (not code search) and when there's input
    // AND when we don't have a selected product
    const isCode = /^\d+$/.test(value.trim());
    const shouldShowResults = !isCode && value.length > 0 && !selectedProduct;
    setShowResults(shouldShowResults);
  };

  // Get quantity conversion display
  const getQuantityConversion = () => {
    if (!selectedProduct || !selectedProduct.hasSubunit || !selectedUnit) {
      return '';
    }
    
    if (selectedProduct.hasSubunit && selectedProduct.subunit === selectedUnit && selectedProduct.subunitRatio) {
      // Show how many main units this subunit quantity represents
      const mainUnitQty = quantity / selectedProduct.subunitRatio;
      return `${quantity} ${selectedUnit} = ${mainUnitQty.toFixed(3)} ${selectedProduct.unit}`;
    }
    
    return '';
  };

  // Handle clicks outside to close results
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (productInputRef.current && !productInputRef.current.contains(event.target as Node)) {
        setShowResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [productInputRef]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
          <Package size={20} />
          Busca de Produtos
        </h3>
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
              // Only show results if we have search term, it's not a code search, and no product is selected
              if (!isCodeSearch && searchTerm.length > 0 && !selectedProduct) {
                setShowResults(true);
              }
            }}
            className="pl-10 pr-4 h-11 text-base"
            disabled={isEditMode}
          />
        </div>

        {/* Search Results using Portal */}
        <ProductSearchResultsPortal
          products={filteredProducts}
          inputRef={productInputRef}
          onSelectProduct={handleProductSelect}
          isVisible={showResults && !isCodeSearch && !selectedProduct}
        />
      </div>

      {/* Product Addition Form */}
      {selectedProduct && (
        <Card className={`border-2 ${isPriceValid ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}>
          <CardContent className="pt-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium text-gray-900">{selectedProduct.name}</div>
                  <div className="text-sm text-gray-500">Cód: {selectedProduct.code}</div>
                </div>
                <Badge variant="outline" className="bg-white">
                  {selectedUnit || selectedProduct.unit}
                </Badge>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Quantidade</label>
                  <QuantityInput
                    quantity={quantity}
                    onQuantityChange={e => setQuantity(parseInt(e.target.value) || 1)}
                    onIncrement={() => setQuantity(prev => prev + 1)}
                    onDecrement={() => setQuantity(prev => Math.max(1, prev - 1))}
                    inputRef={quantityInputRef}
                    onKeyDown={handleQuantityKeyDown}
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Unidade</label>
                  <UnitSelector
                    selectedUnit={selectedUnit}
                    onUnitChange={handleUnitChange}
                    product={selectedProduct}
                    className="h-10"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Preço Unitário</label>
                  <Input
                    type="text"
                    mask="price"
                    value={priceDisplayValue}
                    onChange={handlePriceChange}
                    placeholder="0,00"
                    className={`h-10 ${!isPriceValid ? 'border-red-500 bg-red-50' : ''}`}
                  />
                </div>

                <div className="flex items-end">
                  <Button
                    ref={addButtonRef}
                    onClick={handleAdd}
                    className={`w-full h-10 ${isPriceValid ? 'bg-green-600 hover:bg-green-700' : 'bg-gray-400'}`}
                    disabled={!selectedProduct || quantity <= 0 || !isPriceValid}
                  >
                    <Plus size={16} className="mr-2" />
                    Adicionar
                  </Button>
                </div>
              </div>

              {/* Price Validation */}
              <div className="space-y-2">
                <PriceValidation
                  product={selectedProduct}
                  currentPrice={price}
                  className="text-sm"
                />
                
                {priceValidationError && (
                  <div className="flex items-center text-sm text-red-600 bg-red-100 p-2 rounded">
                    <AlertTriangle className="h-4 w-4 mr-2" />
                    <span>{priceValidationError}</span>
                  </div>
                )}
              </div>

              {/* Quantity conversion display */}
              {getQuantityConversion() && (
                <div className="text-sm text-gray-600">
                  {getQuantityConversion()}
                </div>
              )}

              {/* Mostrar informação da conversão de preço */}
              {selectedProduct && selectedProduct.hasSubunit && selectedUnit && (
                <div className="text-xs text-blue-600">
                  {selectedUnit === selectedProduct.subunit ? 
                    `Preço individual: R$ ${formatBrazilianPrice(price)} (de uma ${selectedProduct.unit} com ${selectedProduct.subunitRatio} ${selectedProduct.subunit})` :
                    `Preço da ${selectedProduct.unit}: R$ ${formatBrazilianPrice(price)}`
                  }
                </div>
              )}

              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-600">Total:</span>
                <span className={`font-bold text-lg ${isPriceValid ? 'text-green-600' : 'text-red-600'}`}>
                  {(quantity * price).toLocaleString('pt-BR', {
                    style: 'currency',
                    currency: 'BRL'
                  })}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
