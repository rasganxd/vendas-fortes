
import React, { useState, useRef, useEffect } from 'react';
import { Product } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, Package, Plus, Barcode, Check } from 'lucide-react';
import QuantityInput from './QuantityInput';
import UnitSelector from '@/components/ui/UnitSelector';
import { convertPriceBetweenUnits, calculateQuantityConversion, parseBrazilianPrice, formatBrazilianPrice } from '@/utils/priceConverter';
import { useUnits } from '@/hooks/useUnits';

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

  const { units } = useUnits();

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
      
      // Focus on unit selector
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

    // Calculate price for the selected unit using real unit data
    const basePrice = selectedProduct.sale_price || 0;
    let unitPrice = basePrice;

    // Find the unit data in the database
    const unitData = units.find(u => u.code === unit);
    const mainUnitData = units.find(u => u.id === selectedProduct.main_unit_id);
    const subUnitData = units.find(u => u.id === selectedProduct.sub_unit_id);

    // If we have subunit and the selected unit is the subunit
    if (selectedProduct.sub_unit_id && subUnitData && unit === subUnitData.code) {
      // Find the main unit to get its package quantity
      if (mainUnitData && mainUnitData.package_quantity) {
        // Price per subunit = main unit price / main unit package quantity
        unitPrice = basePrice / mainUnitData.package_quantity;
        console.log(`🔄 Converting price from main unit (${mainUnitData.code}) to subunit (${subUnitData.code})`);
        console.log(`📊 Base price: ${basePrice}, Package quantity: ${mainUnitData.package_quantity}, Unit price: ${unitPrice}`);
      }
    }
    // If selected unit is the main unit, use base price
    else if (mainUnitData && unit === mainUnitData.code) {
      unitPrice = basePrice;
      console.log(`💰 Using base price for main unit: ${unitPrice}`);
    }

    setPrice(unitPrice);
    setPriceDisplayValue(formatBrazilianPrice(unitPrice));

    // Focus on price input after unit selection
    setTimeout(() => {
      priceInputRef.current?.focus();
    }, 100);
  };

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const displayValue = e.target.value;
    setPriceDisplayValue(displayValue);

    // Convert to number for calculations
    const numericPrice = parseBrazilianPrice(displayValue);
    setPrice(numericPrice);
  };

  const handlePriceKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      // Focus on quantity input after price entry
      quantityInputRef.current?.focus();
    }
  };

  const handleAdd = () => {
    if (selectedProduct && quantity > 0 && selectedUnit && price > 0) {
      handleAddItem(selectedProduct, quantity, price, selectedUnit);

      // Reset form
      setSelectedProduct(null);
      setFoundProduct(null);
      setSearchTerm('');
      setQuantity(1);
      setPrice(0);
      setPriceDisplayValue('');
      setSelectedUnit('');

      // Focus back on search
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
      if (selectedProduct && selectedUnit && quantity > 0 && price > 0) {
        handleAdd();
      }
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);

    // Reset states when search changes
    setFoundProduct(null);
    if (selectedProduct && selectedProduct.name !== value) {
      setSelectedProduct(null);
      setPrice(0);
      setPriceDisplayValue('');
      setSelectedUnit('');
    }

    // Show results only for name search (not code search) and when there's input
    const isCode = /^\d+$/.test(value.trim());
    setShowResults(!isCode && value.length > 0);
  };

  // Get quantity conversion display
  const getQuantityConversion = () => {
    if (!selectedProduct || !selectedProduct.sub_unit_id || !selectedUnit) {
      return '';
    }

    const mainUnitData = units.find(u => u.id === selectedProduct.main_unit_id);
    const subUnitData = units.find(u => u.id === selectedProduct.sub_unit_id);
    
    if (!mainUnitData || !subUnitData) return '';

    // If selected unit is subunit, show conversion to main unit
    if (selectedUnit === subUnitData.code && mainUnitData.package_quantity) {
      const mainUnitQty = quantity / mainUnitData.package_quantity;
      return `${quantity} ${subUnitData.code} = ${mainUnitQty.toFixed(3)} ${mainUnitData.code}`;
    }
    
    // If selected unit is main unit, show conversion to subunit
    if (selectedUnit === mainUnitData.code && mainUnitData.package_quantity) {
      const subUnitQty = quantity * mainUnitData.package_quantity;
      return `${quantity} ${mainUnitData.code} = ${subUnitQty} ${subUnitData.code}`;
    }

    return '';
  };

  // Check if we can proceed to next step
  const canSelectUnit = selectedProduct !== null;
  const canEnterPrice = selectedProduct && selectedUnit;
  const canEnterQuantity = selectedProduct && selectedUnit && price > 0;
  const canAdd = selectedProduct && selectedUnit && quantity > 0 && price > 0;

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

        {/* Search Results - Only show for name search */}
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
                      {product.sale_price?.toLocaleString('pt-BR', {
                        style: 'currency',
                        currency: 'BRL'
                      })}
                    </div>
                    <div className="text-xs text-gray-500">
                      {units.find(u => u.id === product.main_unit_id)?.code || 'UN'}
                    </div>
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

      {/* Product selection form - only show when product is selected */}
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
                    className="h-10"
                    disabled={!canEnterPrice}
                  />
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
                <div className={`flex items-center gap-1 ${canEnterPrice && price > 0 ? 'text-green-600' : ''}`}>
                  {canEnterPrice && price > 0 ? <Check className="text-green-500 h-3 w-3" /> : <div className="w-3 h-3 border border-gray-300 rounded-full" />}
                  <span>Preço definido</span>
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
