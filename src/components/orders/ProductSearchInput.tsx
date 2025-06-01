import React, { useEffect, useState, useRef } from 'react';
import { Product } from '@/types';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, ShoppingCart, AlertTriangle } from 'lucide-react';
import QuantityInput from './QuantityInput';
import UnitSelector from '@/components/ui/UnitSelector';
import PriceValidation from '@/components/products/pricing/PriceValidation';
import ProductSearchDialog from './ProductSearchDialog';
import { useAppData } from '@/context/providers/AppDataProvider';
import { useProductUnits } from '@/components/products/hooks/useProductUnits';
import { useProductUnitsMapping } from '@/hooks/useProductUnitsMapping';
import { calculateUnitPrice, formatBrazilianPrice, parseBrazilianPrice } from '@/utils/priceConverter';
import { validateProductDiscount } from '@/context/operations/productOperations';

interface ProductSearchInputProps {
  products: Product[];
  addItemToOrder: (product: Product, quantity: number, price: number, unit?: string) => void;
  inlineLayout?: boolean;
  inputRef?: React.RefObject<HTMLInputElement>;
}

export default function ProductSearchInput({
  products: propProducts,
  addItemToOrder,
  inlineLayout = false,
  inputRef
}: ProductSearchInputProps) {
  const { products: centralizedProducts, refreshProducts } = useAppData();
  const { units } = useProductUnits();
  
  const [productCode, setProductCode] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState<number>(1);
  const [price, setPrice] = useState<number>(0);
  const [selectedUnit, setSelectedUnit] = useState<string>('');
  const [showProductDialog, setShowProductDialog] = useState(false);
  const [isAddingItem, setIsAddingItem] = useState(false);
  const [priceValidationError, setPriceValidationError] = useState<string>('');
  
  const quantityInputRef = useRef<HTMLInputElement>(null);
  
  const products = centralizedProducts.length > 0 ? centralizedProducts : propProducts;
  
  // Hook para obter unidades do produto selecionado
  const { productUnits, mainUnit } = useProductUnitsMapping(selectedProduct?.id);
  
  // Listen for product updates
  useEffect(() => {
    const handleProductsUpdated = () => {
      console.log("Products updated event received in ProductSearchInput");
    };

    window.addEventListener('productsUpdated', handleProductsUpdated);
    
    return () => {
      window.removeEventListener('productsUpdated', handleProductsUpdated);
    };
  }, []);

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

  // Handle product code input change
  const handleProductCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^\d]/g, ''); // Only numbers
    setProductCode(value);

    // Reset selected product if code changes
    if (selectedProduct && selectedProduct.code.toString() !== value) {
      resetForm();
    }
  };

  const handleProductSelect = (product: Product) => {
    console.log("📦 Produto selecionado:", product.name, {
      id: product.id,
      price: product.price,
      cost: product.cost,
      unit: product.unit,
      subunit: product.subunit,
      hasSubunit: product.hasSubunit,
      subunitRatio: product.subunitRatio
    });
    
    // Validar se o produto tem preço válido
    if (!product.price || product.price === 0) {
      console.warn('⚠️ Produto selecionado sem preço válido:', product.name);
    }
    
    setSelectedProduct(product);
    setProductCode(product.code.toString());
    
    // Aguardar carregamento das unidades do mapeamento
    setTimeout(() => {
      // Focus on quantity input after product selection
      quantityInputRef.current?.focus();
    }, 100);
  };

  // Effect para definir unidade e preço quando produto ou unidades mudarem
  useEffect(() => {
    if (selectedProduct && mainUnit) {
      console.log('🎯 Definindo unidade principal a partir do mapeamento:', mainUnit.value);
      setSelectedUnit(mainUnit.value);
      
      // Calculate correct price for main unit
      const correctPrice = calculateUnitPrice(selectedProduct, mainUnit.value);
      console.log(`💰 Preço calculado para ${mainUnit.value}: R$ ${correctPrice.toFixed(2)}`);
      
      const finalPrice = correctPrice > 0 ? correctPrice : selectedProduct.price || 0;
      console.log(`💰 Preço final definido: R$ ${finalPrice.toFixed(2)}`);
      
      setPrice(finalPrice);
    } else if (selectedProduct && !mainUnit && productUnits.length === 0) {
      // Fallback para unidade legacy se não há mapeamento
      const defaultUnit = selectedProduct.unit || 'UN';
      console.log('📋 Usando unidade legacy como fallback:', defaultUnit);
      setSelectedUnit(defaultUnit);
      
      const correctPrice = calculateUnitPrice(selectedProduct, defaultUnit);
      const finalPrice = correctPrice > 0 ? correctPrice : selectedProduct.price || 0;
      setPrice(finalPrice);
    }
  }, [selectedProduct, mainUnit, productUnits]);

  // Calculate price when unit changes
  const handleUnitChange = (unit: string) => {
    console.log("🔄 Mudança de unidade:", unit);
    setSelectedUnit(unit);
    
    if (selectedProduct) {
      const correctPrice = calculateUnitPrice(selectedProduct, unit);
      console.log(`💰 Novo preço para ${unit}: R$ ${correctPrice.toFixed(2)}`);
      
      const finalPrice = correctPrice > 0 ? correctPrice : selectedProduct.price || 0;
      console.log(`💰 Preço final após mudança de unidade: R$ ${finalPrice.toFixed(2)}`);
      
      setPrice(finalPrice);
    }
  };

  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^\d]/g, '');
    const numericValue = value ? parseInt(value, 10) : 1;
    setQuantity(numericValue);
  };

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const displayValue = e.target.value;
    const numericPrice = parseBrazilianPrice(displayValue);
    console.log('💰 Preço alterado manualmente:', { displayValue, numericPrice });
    setPrice(numericPrice);
  };

  const handleAddToOrder = () => {
    if (selectedProduct && quantity && quantity > 0 && !priceValidationError && price > 0) {
      console.log("🛒 Adicionando ao pedido:", {
        product: selectedProduct.name,
        quantity,
        price,
        unit: selectedUnit
      });
      
      setIsAddingItem(true);
      
      try {
        addItemToOrder(selectedProduct, quantity, price, selectedUnit);
        resetForm();
      } catch (error) {
        console.error("Erro ao adicionar item:", error);
      } finally {
        setTimeout(() => setIsAddingItem(false), 1000);
      }
    }
  };

  const resetForm = () => {
    setProductCode('');
    setSelectedProduct(null);
    setQuantity(1);
    setPrice(0);
    setSelectedUnit('');
    setPriceValidationError('');
  };

  const handleProductCodeKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      
      if (productCode) {
        const product = products.find(p => p.code.toString() === productCode);
        if (product) {
          console.log("🔍 Produto encontrado pelo código:", productCode);
          handleProductSelect(product);
        } else {
          console.log("❌ Produto não encontrado pelo código:", productCode);
          setShowProductDialog(true);
        }
      } else {
        setShowProductDialog(true);
      }
    }
  };
  
  const formatPriceDisplay = (value: number): string => {
    if (value === 0) return '';
    return formatBrazilianPrice(value);
  };
  
  // Calculate unit conversion display
  const getConversionDisplay = () => {
    if (!selectedProduct || !selectedUnit || selectedUnit === selectedProduct.unit) {
      return null;
    }
    
    if (selectedProduct.hasSubunit && selectedProduct.subunit === selectedUnit && selectedProduct.subunitRatio) {
      const mainUnitQty = (quantity || 0) / selectedProduct.subunitRatio;
      return `${quantity || 0} ${selectedUnit} = ${mainUnitQty.toFixed(3)} ${selectedProduct.unit}`;
    }
    
    return null;
  };

  const isPriceValid = !priceValidationError && price > 0;
  
  return (
    <div className="relative w-full z-10">
      <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
        <div className="relative flex-1 w-full">
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Input
                ref={inputRef}
                type="text"
                className="h-11 border-gray-300 focus:border-blue-400 focus:ring-blue-400"
                placeholder="Digite o código do produto e pressione Enter"
                value={productCode}
                onChange={handleProductCodeChange}
                onKeyDown={handleProductCodeKeyDown}
                autoComplete="off"
                disabled={isAddingItem}
              />
            </div>
            <Button
              onClick={() => setShowProductDialog(true)}
              variant="outline"
              size="default"
              className="h-11 px-3"
              disabled={isAddingItem}
            >
              <Search size={18} />
            </Button>
          </div>
        </div>
        
        <div className="flex items-center space-x-3 w-full md:w-auto">
          <div className="flex-none">
            <QuantityInput
              quantity={quantity}
              onQuantityChange={handleQuantityChange}
              onIncrement={() => setQuantity(prev => prev + 1)}
              onDecrement={() => setQuantity(prev => Math.max(1, prev - 1))}
              inputRef={quantityInputRef}
            />
          </div>
          
          <div className="flex-none">
            <UnitSelector
              selectedUnit={selectedUnit}
              onUnitChange={handleUnitChange}
              product={selectedProduct}
              className="h-11 w-20"
            />
          </div>
          
          <div className="flex-none">
            <Input
              type="text"
              className={`h-11 text-center w-28 border-gray-300 ${
                !isPriceValid ? 'border-red-500 bg-red-50' : ''
              }`}
              placeholder="Preço"
              value={formatPriceDisplay(price)}
              onChange={handlePriceChange}
              onKeyDown={(e) => e.key === 'Enter' && isPriceValid && handleAddToOrder()}
              disabled={isAddingItem}
            />
          </div>
          
          <Button 
            type="button"
            className="h-11 flex-none w-32 bg-sales-800 hover:bg-sales-700 text-white"
            disabled={!selectedProduct || quantity <= 0 || isAddingItem || !isPriceValid}
            onClick={handleAddToOrder}
          >
            <ShoppingCart size={18} className="mr-2" />
            {isAddingItem ? 'Adicionando...' : 'Adicionar'}
          </Button>
        </div>
      </div>

      {/* Product Search Dialog */}
      <ProductSearchDialog
        open={showProductDialog}
        onClose={() => setShowProductDialog(false)}
        products={products}
        onSelectProduct={handleProductSelect}
      />
      
      {/* Validação de preço */}
      {selectedProduct && (
        <div className="mt-2">
          <PriceValidation
            product={selectedProduct}
            currentPrice={price}
            className="text-sm"
          />
        </div>
      )}

      {priceValidationError && (
        <div className="mt-2 flex items-center text-sm text-red-600 bg-red-50 p-2 rounded">
          <AlertTriangle className="h-4 w-4 mr-2" />
          <span>{priceValidationError}</span>
        </div>
      )}
      
      {getConversionDisplay() && (
        <div className="mt-2 text-xs text-gray-500">
          {getConversionDisplay()}
        </div>
      )}
      
      {/* Mostrar alerta se produto sem preço válido */}
      {selectedProduct && (!selectedProduct.price || selectedProduct.price === 0) && (
        <div className="mt-2 flex items-center text-sm text-amber-600 bg-amber-50 p-2 rounded">
          <AlertTriangle className="h-4 w-4 mr-2" />
          <span>Atenção: Este produto não possui preço cadastrado. Defina um preço antes de adicionar ao pedido.</span>
        </div>
      )}
      
      {selectedProduct && selectedProduct.hasSubunit && selectedUnit && (
        <div className="mt-1 text-xs text-blue-600">
          {selectedUnit === selectedProduct.subunit ? 
            `Preço individual: R$ ${formatPriceDisplay(price)} (de uma ${selectedProduct.unit} com ${selectedProduct.subunitRatio} ${selectedProduct.subunit})` :
            `Preço da ${selectedProduct.unit}: R$ ${formatPriceDisplay(price)}`
          }
        </div>
      )}
    </div>
  );
}
