
import React, { useState, useRef, useEffect } from 'react';
import { Product } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Package, Plus, Check, AlertTriangle, XCircle } from 'lucide-react';
import QuantityInput from './QuantityInput';
import UnitSelector from '@/components/ui/UnitSelector';
import ProductCodeInput from './ProductCodeInput';
import ProductSearchDialog from './ProductSearchDialog';
import { convertPriceBetweenUnits, calculateQuantityConversion, parseBrazilianPrice, formatBrazilianPrice } from '@/utils/priceConverter';
import { useUnits } from '@/hooks/useUnits';
import { useProductUnits } from '@/components/products/hooks/useProductUnits';
import { Input } from "@/components/ui/input";

interface EnhancedProductSearchProps {
  products: Product[];
  handleAddItem: (product: Product, quantity: number, price: number, unit?: string) => void;
  productInputRef: React.RefObject<HTMLInputElement>;
  isEditMode: boolean;
}

export default function EnhancedProductSearch({
  products,
  handleAddItem,
  productInputRef,
  isEditMode
}: EnhancedProductSearchProps) {
  const { units } = useUnits();
  const { converter } = useProductUnits();
  const [foundProduct, setFoundProduct] = useState<Product | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [price, setPrice] = useState(0);
  const [selectedUnit, setSelectedUnit] = useState('');
  const [priceDisplayValue, setPriceDisplayValue] = useState('');
  const [isProductSearchOpen, setIsProductSearchOpen] = useState(false);
  const [productSearch, setProductSearch] = useState('');
  
  const quantityInputRef = useRef<HTMLInputElement>(null);
  const priceInputRef = useRef<HTMLInputElement>(null);
  const unitSelectorRef = useRef<HTMLButtonElement>(null);
  const addButtonRef = useRef<HTMLButtonElement>(null);

  // Filter products for search dialog
  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(productSearch.toLowerCase())
  ).slice(0, 20);

  const handleProductSelect = (product: Product) => {
    setSelectedProduct(product);
    setFoundProduct(null);
    setIsProductSearchOpen(false);
    setProductSearch('');
    
    // Reset form
    setSelectedUnit('');
    setPrice(0);
    setPriceDisplayValue('');
    setQuantity(1);
    
    setTimeout(() => {
      unitSelectorRef.current?.focus();
    }, 100);
  };

  const handleUnitChange = (unit: string) => {
    if (!selectedProduct) return;
    
    setSelectedUnit(unit);

    // Use the UnitConverter to calculate the correct price
    const basePrice = selectedProduct.sale_price || selectedProduct.price || 0;
    
    const convertedPrice = converter.calculateUnitPrice(
      basePrice,
      1, // quantidade 1
      unit, // unidade selecionada (ex: "UN")
      selectedProduct.unit // unidade base do produto (ex: "CX23")
    );

    console.log('Unit change with converter:', {
      selectedUnit: unit,
      baseUnit: selectedProduct.unit,
      basePrice,
      convertedPrice
    });

    setPrice(convertedPrice);
    setPriceDisplayValue(formatBrazilianPrice(convertedPrice));

    setTimeout(() => {
      priceInputRef.current?.focus();
    }, 100);
  };

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const displayValue = e.target.value;
    setPriceDisplayValue(displayValue);

    const numericPrice = parseBrazilianPrice(displayValue);
    setPrice(numericPrice);
  };

  const handlePriceKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      quantityInputRef.current?.focus();
    }
  };

  // Get the current unit price for validations
  const getCurrentUnitPrice = (): number => {
    if (!selectedProduct || !selectedUnit) return 0;
    
    const basePrice = selectedProduct.sale_price || selectedProduct.price || 0;
    
    return converter.calculateUnitPrice(
      basePrice,
      1, // quantidade 1
      selectedUnit, // unidade selecionada
      selectedProduct.unit // unidade base do produto
    );
  };

  // Validation functions
  const getMinimumPrice = (): number => {
    if (!selectedProduct) return 0;
    
    const currentUnitPrice = getCurrentUnitPrice();
    const maxDiscountPercent = selectedProduct.maxDiscountPercent || selectedProduct.max_discount_percent || 0;
    
    if (maxDiscountPercent > 0) {
      const maxDiscountAmount = (currentUnitPrice * maxDiscountPercent) / 100;
      return currentUnitPrice - maxDiscountAmount;
    }
    
    return 0; // No discount limit
  };

  const isPriceValid = (): boolean => {
    if (!selectedProduct || price <= 0) return false;
    const minimumPrice = getMinimumPrice();
    return minimumPrice === 0 || price >= minimumPrice;
  };

  const getDiscountPercent = (): number => {
    if (!selectedProduct || price <= 0) return 0;
    const currentUnitPrice = getCurrentUnitPrice();
    if (currentUnitPrice <= 0) return 0;
    return ((currentUnitPrice - price) / currentUnitPrice) * 100;
  };

  const getPriceValidationMessage = () => {
    if (!selectedProduct || price <= 0) return null;
    
    const minimumPrice = getMinimumPrice();
    const discountPercent = getDiscountPercent();
    const maxDiscount = selectedProduct.maxDiscountPercent || selectedProduct.max_discount_percent || 0;
    
    if (minimumPrice > 0 && price < minimumPrice) {
      return {
        type: 'error' as const,
        message: `Preço abaixo do limite mínimo (R$ ${minimumPrice.toFixed(2)})`
      };
    }
    
    if (maxDiscount > 0 && discountPercent >= maxDiscount * 0.9) {
      return {
        type: 'warning' as const,
        message: `Próximo do limite máximo de desconto (${maxDiscount}%)`
      };
    }
    
    if (maxDiscount > 0) {
      return {
        type: 'success' as const,
        message: `Desconto válido (máx: ${maxDiscount}%)`
      };
    }
    
    return {
      type: 'success' as const,
      message: 'Preço válido (sem limite de desconto)'
    };
  };

  const handleAdd = () => {
    if (selectedProduct && quantity > 0 && selectedUnit && price > 0 && isPriceValid()) {
      handleAddItem(selectedProduct, quantity, price, selectedUnit);

      // Reset form
      setSelectedProduct(null);
      setFoundProduct(null);
      setQuantity(1);
      setPrice(0);
      setPriceDisplayValue('');
      setSelectedUnit('');

      productInputRef.current?.focus();
    }
  };

  const handleQuantityKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (selectedProduct && selectedUnit && quantity > 0 && price > 0 && isPriceValid()) {
        handleAdd();
      }
    }
  };

  const getQuantityConversion = () => {
    if (!selectedProduct || !selectedProduct.sub_unit_id || !selectedUnit) {
      return '';
    }
    
    const mainUnit = units.find(u => u.id === selectedProduct.main_unit_id);
    const subUnit = units.find(u => u.id === selectedProduct.sub_unit_id);
    
    if (!mainUnit || !subUnit) return '';
    
    if (selectedUnit === subUnit.code) {
      // Converting from subunit to main unit
      const mainPackageQty = mainUnit.package_quantity || 1;
      const subPackageQty = subUnit.package_quantity || 1;
      const conversionRate = mainPackageQty / subPackageQty;
      const convertedQty = quantity / conversionRate;
      return `${quantity} ${subUnit.code} = ${convertedQty.toFixed(3)} ${mainUnit.code}`;
    }
    
    return '';
  };

  const canSelectUnit = selectedProduct !== null;
  const canEnterPrice = selectedProduct && selectedUnit;
  const canEnterQuantity = selectedProduct && selectedUnit && price > 0;
  const canAdd = selectedProduct && selectedUnit && quantity > 0 && price > 0 && isPriceValid();

  const priceValidation = getPriceValidationMessage();

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

      {/* Product Code Input + Search Button */}
      <ProductCodeInput
        products={products}
        foundProduct={foundProduct}
        onProductFound={setFoundProduct}
        onProductSelect={handleProductSelect}
        onSearchDialogOpen={() => setIsProductSearchOpen(true)}
        inputRef={productInputRef}
        isEditMode={isEditMode}
      />

      {/* Product selection form */}
      {selectedProduct && (
        <Card className="border-green-200 bg-green-50">
          <CardContent className="pt-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium text-gray-900">{selectedProduct.name}</div>
                  <div className="text-sm text-gray-500">Cód: {selectedProduct.code}</div>
                  {(selectedProduct.maxDiscountPercent || selectedProduct.max_discount_percent) && (
                    <div className="text-xs text-orange-600">
                      Desconto máximo: {selectedProduct.maxDiscountPercent || selectedProduct.max_discount_percent}%
                    </div>
                  )}
                </div>
                <Badge variant="outline" className="bg-white">
                  {selectedUnit || 'Selecione a unidade'}
                </Badge>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Unidade <span className="text-red-500">*</span>
                  </label>
                  <UnitSelector
                    selectedUnit={selectedUnit}
                    onUnitChange={handleUnitChange}
                    product={selectedProduct}
                    className="h-10"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Preço Unitário <span className="text-red-500">*</span>
                  </label>
                  <Input
                    ref={priceInputRef}
                    type="text"
                    value={priceDisplayValue}
                    onChange={handlePriceChange}
                    onKeyDown={handlePriceKeyDown}
                    placeholder="0,00"
                    className={`h-10 ${
                      priceValidation?.type === 'error' 
                        ? 'border-red-500 focus:border-red-500' 
                        : priceValidation?.type === 'warning'
                        ? 'border-yellow-500 focus:border-yellow-500'
                        : 'border-green-500 focus:border-green-500'
                    }`}
                    disabled={!canEnterPrice}
                  />
                  {priceValidation && (
                    <div className={`flex items-center gap-1 mt-1 text-xs ${
                      priceValidation.type === 'error' 
                        ? 'text-red-600' 
                        : priceValidation.type === 'warning'
                        ? 'text-yellow-600'
                        : 'text-green-600'
                    }`}>
                      {priceValidation.type === 'error' && <XCircle className="h-3 w-3" />}
                      {priceValidation.type === 'warning' && <AlertTriangle className="h-3 w-3" />}
                      {priceValidation.type === 'success' && <Check className="h-3 w-3" />}
                      <span>{priceValidation.message}</span>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Quantidade</label>
                  <QuantityInput
                    quantity={canEnterQuantity ? quantity : null}
                    onQuantityChange={e => setQuantity(parseInt(e.target.value) || 1)}
                    onIncrement={() => setQuantity(prev => prev + 1)}
                    onDecrement={() => setQuantity(prev => Math.max(1, prev - 1))}
                    inputRef={quantityInputRef}
                    onKeyDown={handleQuantityKeyDown}
                    disabled={!canEnterQuantity}
                  />
                </div>

                <div className="flex items-end">
                  <Button
                    ref={addButtonRef}
                    onClick={handleAdd}
                    className="w-full h-10 bg-green-600 hover:bg-green-700"
                    disabled={!canAdd}
                  >
                    <Plus size={16} className="mr-2" />
                    Adicionar
                  </Button>
                </div>
              </div>

              {/* Quantity conversion display */}
              {getQuantityConversion() && (
                <div className="text-xs text-gray-600">
                  {getQuantityConversion()}
                </div>
              )}

              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-600">Total:</span>
                <span className="font-bold text-green-600 text-lg">
                  {canEnterPrice && price > 0 ? (quantity * price).toLocaleString('pt-BR', {
                    style: 'currency',
                    currency: 'BRL'
                  }) : 'Defina o preço'}
                </span>
              </div>

              {/* Step indicators */}
              <div className="flex items-center gap-4 text-xs text-gray-500 pt-2 border-t border-green-200">
                <div className="flex items-center gap-1">
                  <Check className="text-green-500 h-3 w-3" />
                  <span>Produto selecionado</span>
                </div>
                <div className={`flex items-center gap-1 ${selectedUnit ? 'text-green-600' : ''}`}>
                  {selectedUnit ? <Check className="text-green-500 h-3 w-3" /> : <div className="w-3 h-3 border border-gray-300 rounded-full" />}
                  <span>Unidade escolhida</span>
                </div>
                <div className={`flex items-center gap-1 ${canEnterPrice && price > 0 && isPriceValid() ? 'text-green-600' : ''}`}>
                  {canEnterPrice && price > 0 && isPriceValid() ? <Check className="text-green-500 h-3 w-3" /> : <div className="w-3 h-3 border border-gray-300 rounded-full" />}
                  <span>Preço válido</span>
                </div>
                <div className={`flex items-center gap-1 ${canAdd ? 'text-green-600' : ''}`}>
                  {canAdd ? <Check className="text-green-500 h-3 w-3" /> : <div className="w-3 h-3 border border-gray-300 rounded-full" />}
                  <span>Pronto para adicionar</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Product Search Dialog */}
      <ProductSearchDialog
        open={isProductSearchOpen}
        onOpenChange={setIsProductSearchOpen}
        products={filteredProducts}
        productSearch={productSearch}
        onSearchChange={setProductSearch}
        onSelectProduct={handleProductSelect}
      />
    </div>
  );
}
