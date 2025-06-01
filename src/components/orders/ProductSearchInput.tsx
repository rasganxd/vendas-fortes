
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

  // Handle product code input change - REMOVIDA A BUSCA AUTOMÁTICA
  const handleProductCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^\d]/g, ''); // Only numbers
    setProductCode(value);

    // Reset selected product if code changes
    if (selectedProduct && selectedProduct.code.toString() !== value) {
      resetForm();
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
    
    // Set default unit to product's main unit
    const defaultUnit = product.unit || 'UN';
    setSelectedUnit(defaultUnit);
    
    // Calculate correct price for default unit
    const correctPrice = calculateUnitPrice(product, defaultUnit);
    console.log(`💰 Preço calculado para ${defaultUnit}: R$ ${correctPrice.toFixed(2)}`);
    
    setPrice(correctPrice);

    // Focus on quantity input after product selection
    setTimeout(() => {
      quantityInputRef.current?.focus();
    }, 100);
  };

  // Calculate price when unit changes
  const handleUnitChange = (unit: string) => {
    console.log("🔄 Mudança de unidade:", unit);
    setSelectedUnit(unit);
    
    if (selectedProduct) {
      // Use the new calculateUnitPrice function
      const correctPrice = calculateUnitPrice(selectedProduct, unit);
      console.log(`💰 Novo preço para ${unit}: R$ ${correctPrice.toFixed(2)}`);
      
      setPrice(correctPrice);
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
      // Show how many main units this subunit quantity represents
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
