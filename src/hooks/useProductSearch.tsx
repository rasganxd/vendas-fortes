
import { useState, useRef, useEffect, useCallback } from 'react';
import { Product } from '@/types';

// Cache for product search results
const productSearchCache = new Map<string, Product[]>();

interface UseProductSearchProps {
  products: Product[];
  addItemToOrder: (product: Product, quantity: number, price: number) => void;
  inputRef?: React.RefObject<HTMLInputElement>;
}

export function useProductSearch({
  products,
  addItemToOrder,
  inputRef
}: UseProductSearchProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState<number | null>(null);
  const [price, setPrice] = useState<number>(0);
  const [showResults, setShowResults] = useState(false);
  const [isAddingItem, setIsAddingItem] = useState(false);
  
  const quantityInputRef = useRef<HTMLInputElement>(null);
  const priceInputRef = useRef<HTMLInputElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);
  const addTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setShowResults(e.target.value.length > 0);
  };
  
  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      
      // Check if input is a product code
      const codeMatch = searchTerm.match(/^(\d+)$/);
      if (codeMatch) {
        const productCode = parseInt(codeMatch[1], 10);
        const product = products.find(p => p.code === productCode);
        
        if (product) {
          handleProductSelect(product);
          return;
        }
      }
      
      // If not a direct code match, and we have results, select the first one
      if (sortedProducts.length > 0) {
        handleProductSelect(sortedProducts[0]);
      }
    }
  };
  
  const handleProductSelect = (product: Product) => {
    console.log("📦 Product selected:", product.name, product.id);
    setSelectedProduct(product);
    setSearchTerm(product.name);
    setPrice(product.price);
    setShowResults(false);
    setQuantity(1); // Set default quantity to 1 when selecting a product
    setTimeout(() => quantityInputRef.current?.focus(), 10);
  };
  
  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Allow empty value
    if (e.target.value === '') {
      setQuantity(null);
      return;
    }
    
    // Only allow numbers and prevent negative values
    const value = e.target.value.replace(/[^\d]/g, '');
    const numericValue = value ? parseInt(value, 10) : null;
    
    setQuantity(numericValue);
  };
  
  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^\d.,]/g, '').replace(',', '.');
    setPrice(parseFloat(value) || 0);
  };

  // Enhanced handleAddToOrder with debounce and validation
  const handleAddToOrder = useCallback(() => {
    console.log("🛒 === ADDING ITEM TO ORDER (PRODUCT SEARCH) ===");
    console.log("📦 Selected product:", selectedProduct?.name, selectedProduct?.id);
    console.log("🔢 Quantity:", quantity);
    console.log("💰 Price:", price);
    console.log("🔄 Currently adding:", isAddingItem);
    
    // Prevent multiple simultaneous additions
    if (isAddingItem) {
      console.log("⚠️ Already adding an item, skipping");
      return;
    }
    
    if (!selectedProduct) {
      console.warn("⚠️ No product selected");
      return;
    }
    
    if (quantity === null || quantity <= 0) {
      console.warn("⚠️ Invalid quantity:", quantity);
      return;
    }
    
    // Clear any existing timeout
    if (addTimeoutRef.current) {
      clearTimeout(addTimeoutRef.current);
    }
    
    // Set timeout to prevent rapid additions
    addTimeoutRef.current = setTimeout(() => {
      if (selectedProduct && (quantity !== null && quantity > 0)) {
        try {
          setIsAddingItem(true);
          console.log("✅ Calling addItemToOrder with:", {
            product: selectedProduct.name,
            quantity,
            price
          });
          
          // Call the addItemToOrder function passed from parent
          addItemToOrder(selectedProduct, quantity, price);
          
          console.log("✅ Item successfully added, resetting form");
          
          // Reset all form fields immediately
          resetForm();
          
          // Focus back on the search input with a small delay
          setTimeout(() => {
            if (inputRef?.current) {
              inputRef.current.focus();
              console.log("🎯 Focus returned to search input");
            }
          }, 100);
        } catch (error) {
          console.error("❌ Error adding item to order:", error);
        } finally {
          // Reset adding flag after a delay
          setTimeout(() => {
            setIsAddingItem(false);
          }, 1000);
        }
      } else {
        console.warn("⚠️ Cannot add item - missing product or invalid quantity");
        console.warn("📦 Selected product:", selectedProduct);
        console.warn("🔢 Quantity:", quantity);
      }
    }, 300); // 300ms debounce
  }, [selectedProduct, quantity, price, addItemToOrder, inputRef, isAddingItem]);

  // Enhanced form reset function
  const resetForm = () => {
    console.log("🔄 Resetting product search form");
    setSearchTerm('');
    setSelectedProduct(null);
    setQuantity(null);
    setPrice(0);
    setShowResults(false);
  };
  
  const incrementQuantity = () => {
    setQuantity(prev => (prev === null ? 1 : prev + 1));
  };
  
  const decrementQuantity = () => {
    setQuantity(prev => {
      if (prev === null) return null;
      return prev > 1 ? prev - 1 : 1;
    });
  };
  
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (resultsRef.current && !resultsRef.current.contains(event.target as Node)) {
        setShowResults(false);
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (addTimeoutRef.current) {
        clearTimeout(addTimeoutRef.current);
      }
    };
  }, []);
  
  // Get filtered products with caching
  const getFilteredProducts = () => {
    if (!searchTerm) return [];
    
    // Check cache first
    const cacheKey = searchTerm.toLowerCase();
    if (productSearchCache.has(cacheKey)) {
      return productSearchCache.get(cacheKey) || [];
    }
    
    // Filter products
    const filtered = products.filter(product => 
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (product.code !== undefined && product.code.toString() === searchTerm) || 
      (product.code !== undefined && product.code.toString().includes(searchTerm))
    );
    
    // Store in cache (limit cache size)
    if (productSearchCache.size > 50) {
      const firstKey = productSearchCache.keys().next().value;
      productSearchCache.delete(firstKey);
    }
    productSearchCache.set(cacheKey, filtered);
    
    return filtered;
  };
  
  const filteredProducts = getFilteredProducts();
  
  // Sort products with exact code matches first
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    // Exact code matches come first
    const aExactCodeMatch = a.code?.toString() === searchTerm;
    const bExactCodeMatch = b.code?.toString() === searchTerm;
    if (aExactCodeMatch && !bExactCodeMatch) return -1;
    if (!aExactCodeMatch && bExactCodeMatch) return 1;
    return 0;
  });

  return {
    searchTerm,
    selectedProduct,
    quantity,
    price,
    showResults,
    sortedProducts,
    resultsRef,
    quantityInputRef,
    priceInputRef,
    isAddingItem,
    handleSearch,
    handleSearchKeyDown,
    handleProductSelect,
    handleQuantityChange,
    handlePriceChange,
    handleAddToOrder,
    incrementQuantity,
    decrementQuantity,
    resetForm
  };
}
