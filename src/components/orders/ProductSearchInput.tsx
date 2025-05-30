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
import { calculateUnitPrice } from '@/utils/priceConverter';
import { validateProductDiscount } from '@/context/operations/productOperations';
import { PriceInput } from '@/components/ui/price-input';
import { productService } from '@/services/supabase/productService';

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
  const [localProducts, setLocalProducts] = useState<Product[]>([]);
  
  const quantityInputRef = useRef<HTMLInputElement>(null);
  
  // Use centralized products as primary source
  const products = centralizedProducts.length > 0 ? centralizedProducts : propProducts;
  
  // Update local products when centralized products change
  useEffect(() => {
    console.log("🔄 Updating local products cache in ProductSearchInput");
    setLocalProducts(products);
  }, [products]);
  
  // Listen for product updates and refresh immediately
  useEffect(() => {
    const handleProductsUpdated = async (event: CustomEvent) => {
      console.log("📦 Products updated event received in ProductSearchInput:", event.detail);
      
      // Force refresh products to get latest data
      await refreshProducts();
      
      // If a product was added, try to find it in the updated list
      if (event.detail?.action === 'add' && event.detail?.product) {
        const newProduct = event.detail.product;
        setLocalProducts(prev => {
          const exists = prev.find(p => p.id === newProduct.id);
          if (!exists) {
            console.log("➕ Adding new product to local cache:", newProduct.name);
            return [...prev, newProduct];
          }
          return prev;
        });
      }
      
      // Force refresh of selected product if it exists
      if (selectedProduct) {
        const updatedProducts = centralizedProducts.length > 0 ? centralizedProducts : products;
        const updatedProduct = updatedProducts.find(p => p.id === selectedProduct.id);
        if (updatedProduct && updatedProduct.price !== selectedProduct.price) {
          console.log("Product price updated, refreshing");
          setSelectedProduct(updatedProduct);
          const correctPrice = calculateUnitPrice(updatedProduct, selectedUnit || updatedProduct.unit || 'UN');
          setPrice(correctPrice);
        }
      }
    };

    const handlePriceUpdated = (event: CustomEvent) => {
      const { productId, newPrice } = event.detail;
      if (selectedProduct && selectedProduct.id === productId) {
        console.log("Price updated for selected product:", newPrice);
        const correctPrice = calculateUnitPrice({ ...selectedProduct, price: newPrice }, selectedUnit || selectedProduct.unit || 'UN');
        setPrice(correctPrice);
        setSelectedProduct(prev => prev ? { ...prev, price: newPrice } : null);
      }
    };

    window.addEventListener('productsUpdated', handleProductsUpdated as EventListener);
    window.addEventListener('productPriceUpdated', handlePriceUpdated as EventListener);
    
    return () => {
      window.removeEventListener('productsUpdated', handleProductsUpdated as EventListener);
      window.removeEventListener('productPriceUpdated', handlePriceUpdated as EventListener);
    };
  }, [selectedProduct, selectedUnit, refreshProducts, centralizedProducts, products]);

  // Validate price whenever it changes
  useEffect(() => {
    if (selectedProduct && price > 0) {
      const validation = validateProductDiscount(selectedProduct.id, price, localProducts);
      if (validation === true) {
        setPriceValidationError('');
      } else {
        setPriceValidationError(validation as string);
      }
    } else {
      setPriceValidationError('');
    }
  }, [selectedProduct, price, localProducts]);

  // Enhanced product search with fallback to database
  const findProductByCode = async (code: string): Promise<Product | null> => {
    console.log("🔍 Searching for product with code:", code);
    
    // First try local/cached products
    let product = localProducts.find(p => p.code.toString() === code);
    
    if (product) {
      console.log("✅ Product found in local cache:", product.name);
      return product;
    }
    
    // If not found locally, try centralized products
    product = products.find(p => p.code.toString() === code);
    
    if (product) {
      console.log("✅ Product found in centralized products:", product.name);
      return product;
    }
    
    // If still not found, search directly in database as fallback
    console.log("🔄 Product not found locally, searching in database...");
    try {
      const allProducts = await productService.getAll();
      product = allProducts.find(p => p.code.toString() === code);
      
      if (product) {
        console.log("✅ Product found in database:", product.name);
        // Update local cache with fresh data
        setLocalProducts(allProducts);
        return product;
      }
    } catch (error) {
      console.error("❌ Error searching in database:", error);
    }
    
    console.log("❌ Product not found anywhere with code:", code);
    return null;
  };

  // Handle product code input change
  const handleProductCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^\d]/g, '');
    setProductCode(value);

    if (selectedProduct && selectedProduct.code.toString() !== value) {
      resetForm();
    }
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
    
    const defaultUnit = product.unit || 'UN';
    setSelectedUnit(defaultUnit);
    
    const correctPrice = calculateUnitPrice(product, defaultUnit);
    console.log(`💰 Preço calculado para ${defaultUnit}: R$ ${correctPrice.toFixed(2)}`);
    
    setPrice(correctPrice);

    setTimeout(() => {
      quantityInputRef.current?.focus();
    }, 100);
  };

  const handleUnitChange = (unit: string) => {
    console.log("🔄 Mudança de unidade:", unit);
    setSelectedUnit(unit);
    
    if (selectedProduct) {
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

  const handleProductCodeKeyDown = async (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      
      if (productCode) {
        console.log("🔍 Searching for product with code:", productCode);
        const product = await findProductByCode(productCode);
        if (product) {
          console.log("✅ Product found and selected:", product.name);
          handleProductSelect(product);
        } else {
          console.log("❌ Product not found, opening search dialog");
          setShowProductDialog(true);
        }
      } else {
        setShowProductDialog(true);
      }
    }
  };
  
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
            <PriceInput
              value={price}
              onChange={setPrice}
              className={`h-11 text-center w-28 border-gray-300 ${
                !isPriceValid ? 'border-red-500 bg-red-50' : ''
              }`}
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

      <ProductSearchDialog
        open={showProductDialog}
        onClose={() => setShowProductDialog(false)}
        products={localProducts.length > 0 ? localProducts : products}
        onSelectProduct={handleProductSelect}
      />
      
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
            `Preço individual: R$ ${price.toFixed(2)} (de uma ${selectedProduct.unit} com ${selectedProduct.subunitRatio} ${selectedProduct.subunit})` :
            `Preço da ${selectedProduct.unit}: R$ ${price.toFixed(2)}`
          }
        </div>
      )}
    </div>
  );
}
