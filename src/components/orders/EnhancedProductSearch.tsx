import React, { useState, useRef, useEffect } from 'react';
import { Product } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, Package, Plus, Barcode, Check, AlertTriangle, XCircle } from 'lucide-react';
import QuantityInput from './QuantityInput';
import UnitSelector from '@/components/ui/UnitSelector';
import { convertPriceBetweenUnits, calculateQuantityConversion, parseBrazilianPrice, formatBrazilianPrice } from '@/utils/priceConverter';
import { validateProductDiscount, getMinimumEffectivePrice } from '@/context/operations/productOperations';

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
  const [foundProduct, setFoundProduct] = useState<Product | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [price, setPrice] = useState(0);
  const [selectedUnit, setSelectedUnit] = useState('');
  const [showResults, setShowResults] = useState(false);
  const [priceDisplayValue, setPriceDisplayValue] = useState('');
  
  const quantityInputRef = useRef<HTMLInputElement>(null);
  const priceInputRef = useRef<HTMLInputElement>(null);
  const unitSelectorRef = useRef<HTMLButtonElement>(null);
  const addButtonRef = useRef<HTMLButtonElement>(null);

  // Check if search term is a product code (numeric)
  const isCodeSearch = /^\d+$/.test(searchTerm.trim());

  // Filter products based on search term
  const filteredProducts = products.filter(product => {
    if (isCodeSearch) {
      return product.code.toString() === searchTerm.trim();
    } else {
      return product.name.toLowerCase().includes(searchTerm.toLowerCase());
    }
  }).slice(0, 8);

  // Update found product when searching by code (without selecting)
  useEffect(() => {
    if (isCodeSearch && filteredProducts.length === 1) {
      const product = filteredProducts[0];
      setFoundProduct(product);
      setShowResults(false);
    } else if (isCodeSearch && filteredProducts.length === 0) {
      setFoundProduct(null);
    }
  }, [isCodeSearch, filteredProducts]);

  // Reset states when selected product changes
  useEffect(() => {
    if (selectedProduct) {
      setSelectedUnit('');
      setPrice(0);
      setPriceDisplayValue('');
      setQuantity(1);
      
      setTimeout(() => {
        unitSelectorRef.current?.focus();
      }, 100);
    }
  }, [selectedProduct]);

  const handleProductSelect = (product: Product) => {
    setSelectedProduct(product);
    setFoundProduct(null);
    setSearchTerm(product.name);
    setShowResults(false);
  };

  const handleUnitChange = (unit: string) => {
    if (!selectedProduct) return;
    
    setSelectedUnit(unit);

    // Calculate price for the selected unit using sale_price
    const basePrice = selectedProduct.price || 0;
    let unitPrice = basePrice;

    // If product has subunit and selected unit is the subunit
    if (selectedProduct.hasSubunit && selectedProduct.subunit === unit) {
      const mainUnitData = { package_quantity: 1 };
      const packageQuantity = mainUnitData.package_quantity || 1;
      unitPrice = basePrice / packageQuantity;
    }

    setPrice(unitPrice);
    setPriceDisplayValue(formatBrazilianPrice(unitPrice));

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

  // Validation functions
  const getMinimumPrice = (): number => {
    if (!selectedProduct) return 0;
    return getMinimumEffectivePrice(selectedProduct.id, products);
  };

  const isPriceValid = (): boolean => {
    if (!selectedProduct || price <= 0) return false;
    const minimumPrice = getMinimumPrice();
    return price >= minimumPrice;
  };

  const getDiscountPercent = (): number => {
    if (!selectedProduct || price <= 0) return 0;
    const basePrice = selectedProduct.price || 0;
    if (basePrice <= 0) return 0;
    return ((basePrice - price) / basePrice) * 100;
  };

  const getPriceValidationMessage = () => {
    if (!selectedProduct || price <= 0) return null;
    
    const minimumPrice = getMinimumPrice();
    const discountPercent = getDiscountPercent();
    const maxDiscount = selectedProduct.maxDiscountPercent || 0;
    
    if (price < minimumPrice) {
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
      setSearchTerm('');
      setQuantity(1);
      setPrice(0);
      setPriceDisplayValue('');
      setSelectedUnit('');

      productInputRef.current?.focus();
    }
  };

  const handleSearchKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      
      if (isCodeSearch && foundProduct) {
        handleProductSelect(foundProduct);
      } else if (!isCodeSearch && filteredProducts.length > 0) {
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
      if (selectedProduct && selectedUnit && quantity > 0 && price > 0 && isPriceValid()) {
        handleAdd();
      }
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);

    setFoundProduct(null);
    if (selectedProduct && selectedProduct.name !== value) {
      setSelectedProduct(null);
      setPrice(0);
      setPriceDisplayValue('');
      setSelectedUnit('');
    }

    const isCode = /^\d+$/.test(value.trim());
    setShowResults(!isCode && value.length > 0);
  };

  const getQuantityConversion = () => {
    if (!selectedProduct || !selectedProduct.hasSubunit || !selectedUnit) {
      return '';
    }
    return calculateQuantityConversion(selectedProduct, quantity, selectedUnit, selectedProduct.unit || 'UN');
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

      {/* Search Input */}
      <div className="relative z-[100]">
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
          {foundProduct && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center gap-2">
              <Check className="text-green-500 h-4 w-4" />
              <span className="text-xs text-green-600">Pressione Enter</span>
            </div>
          )}
          {!foundProduct && <Barcode className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />}
        </div>

        {/* Search Results */}
        {showResults && !isCodeSearch && filteredProducts.length > 0 && (
          <div className="absolute z-[9999] w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-xl max-h-64 overflow-y-auto">
            {filteredProducts.map(product => (
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
                      {product.price?.toLocaleString('pt-BR', {
                        style: 'currency',
                        currency: 'BRL'
                      })}
                    </div>
                    <div className="text-xs text-gray-500">{product.unit}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Product found but not selected state */}
      {foundProduct && !selectedProduct && (
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium text-gray-900">{foundProduct.name}</div>
                <div className="text-sm text-gray-500">Cód: {foundProduct.code}</div>
              </div>
              <div className="text-sm text-blue-600 flex items-center gap-2">
                <Check size={16} />
                Pressione Enter para selecionar
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Product selection form */}
      {selectedProduct && (
        <Card className="border-green-200 bg-green-50">
          <CardContent className="pt-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium text-gray-900">{selectedProduct.name}</div>
                  <div className="text-sm text-gray-500">Cód: {selectedProduct.code}</div>
                  {selectedProduct.maxDiscountPercent && (
                    <div className="text-xs text-orange-600">
                      Desconto máximo: {selectedProduct.maxDiscountPercent}%
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
                    mask="price"
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
    </div>
  );
}
