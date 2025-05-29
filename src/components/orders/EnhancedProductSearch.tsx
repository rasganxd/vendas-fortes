import React, { useState, useRef, useEffect } from 'react';
import { Product } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, Package, Plus, AlertTriangle } from 'lucide-react';
import QuantityInput from './QuantityInput';
import UnitSelector from '@/components/ui/UnitSelector';
import ProductSearchDialog from './ProductSearchDialog';
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
  const [productCode, setProductCode] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [price, setPrice] = useState(0);
  const [selectedUnit, setSelectedUnit] = useState('');
  const [priceDisplayValue, setPriceDisplayValue] = useState('');
  const [priceValidationError, setPriceValidationError] = useState<string>('');
  const [showProductDialog, setShowProductDialog] = useState(false);
  const quantityInputRef = useRef<HTMLInputElement>(null);
  const addButtonRef = useRef<HTMLButtonElement>(null);

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

  // Initialize price when product is selected
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

  // Handle product code input change - REMOVIDA A BUSCA AUTOMÁTICA
  const handleProductCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^\d]/g, ''); // Only numbers
    setProductCode(value);

    // Reset selected product if code changes
    if (selectedProduct && selectedProduct.code.toString() !== value) {
      setSelectedProduct(null);
      setPrice(0);
      setPriceDisplayValue('');
      setSelectedUnit('');
      setPriceValidationError('');
    }

    // REMOVIDO: Não buscar produto automaticamente durante a digitação
    // A busca só acontece quando o usuário pressionar Enter
  };
  const handleProductSelect = (product: Product) => {
    console.log("📦 Produto selecionado:", product.name, {
      price: product.price,
      unit: product.unit,
      subunit: product.subunit,
      hasSubunit: product.hasSubunit,
      subunitRatio: product.subunitRatio
    });
    setSelectedProduct(product);
    setProductCode(product.code.toString());

    // Focus on quantity input
    setTimeout(() => {
      quantityInputRef.current?.focus();
    }, 100);
  };
  const handleUnitChange = (unit: string) => {
    console.log("🔄 Mudança de unidade para:", unit);
    setSelectedUnit(unit);
    if (selectedProduct) {
      // Use calculateUnitPrice to get the correct price for the selected unit
      const correctPrice = calculateUnitPrice(selectedProduct, unit);
      console.log(`💰 Novo preço calculado para ${unit}: R$ ${correctPrice.toFixed(2)}`);
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
      setProductCode('');
      setQuantity(1);
      setPrice(0);
      setPriceDisplayValue('');
      setSelectedUnit('');
      setPriceValidationError('');

      // Focus back on search
      productInputRef.current?.focus();
    }
  };

  // NOVA LÓGICA: Buscar produto apenas quando pressionar Enter
  const handleProductCodeKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (productCode) {
        // Buscar produto pelo código exato
        const product = products.find(p => p.code.toString() === productCode);
        if (product) {
          console.log("🔍 Produto encontrado pelo código:", productCode);
          handleProductSelect(product);
        } else {
          console.log("❌ Produto não encontrado pelo código:", productCode);
          // Abrir diálogo de busca se não encontrar produto
          setShowProductDialog(true);
        }
      } else {
        // Se não há código, abrir diálogo de busca
        setShowProductDialog(true);
      }
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
  return <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
          <Package size={20} />
          Busca de Produtos
        </h3>
      </div>

      {/* Product Code Input */}
      <div className="flex gap-2">
        <div className="flex-1">
          <Input ref={productInputRef} type="text" placeholder="Digite o código do produto e pressione Enter..." value={productCode} onChange={handleProductCodeChange} onKeyDown={handleProductCodeKeyDown} className="h-11 text-base" disabled={isEditMode} />
        </div>
        <Button onClick={() => setShowProductDialog(true)} variant="outline" size="default" className="h-11 px-3" disabled={isEditMode}>
          <Search size={18} />
        </Button>
      </div>

      {/* Product Search Dialog */}
      <ProductSearchDialog open={showProductDialog} onClose={() => setShowProductDialog(false)} products={products} onSelectProduct={handleProductSelect} />

      {/* Product Addition Form */}
      {selectedProduct && <Card className={`border-2 ${isPriceValid ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}>
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
                  <QuantityInput quantity={quantity} onQuantityChange={e => setQuantity(parseInt(e.target.value) || 1)} onIncrement={() => setQuantity(prev => prev + 1)} onDecrement={() => setQuantity(prev => Math.max(1, prev - 1))} inputRef={quantityInputRef} onKeyDown={handleQuantityKeyDown} />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Unidade</label>
                  <UnitSelector selectedUnit={selectedUnit} onUnitChange={handleUnitChange} product={selectedProduct} className="h-10" />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Preço Unitário</label>
                  <Input type="text" mask="price" value={priceDisplayValue} onChange={handlePriceChange} placeholder="0,00" className={`h-10 ${!isPriceValid ? 'border-red-500 bg-red-50' : ''}`} />
                </div>

                <div className="flex items-end">
                  <Button ref={addButtonRef} onClick={handleAdd} className={`w-full h-10 ${isPriceValid ? 'bg-green-600 hover:bg-green-700' : 'bg-gray-400'}`} disabled={!selectedProduct || quantity <= 0 || !isPriceValid}>
                    <Plus size={16} className="mr-2" />
                    Adicionar
                  </Button>
                </div>
              </div>

              {/* Price Validation */}
              <div className="space-y-2">
                <PriceValidation product={selectedProduct} currentPrice={price} className="text-sm" />
                
                {priceValidationError && <div className="flex items-center text-sm text-red-600 bg-red-100 p-2 rounded">
                    <AlertTriangle className="h-4 w-4 mr-2" />
                    <span>{priceValidationError}</span>
                  </div>}
              </div>

              {/* Quantity conversion display */}
              {getQuantityConversion()}

              {/* Mostrar informação da conversão de preço */}
              {selectedProduct && selectedProduct.hasSubunit && selectedUnit}

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
        </Card>}
    </div>;
}