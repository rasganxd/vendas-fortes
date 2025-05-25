
import { useState, useRef, useEffect } from 'react';
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
  
  const quantityInputRef = useRef<HTMLInputElement>(null);
  const priceInputRef = useRef<HTMLInputElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);
  
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
    console.log("Product selected in edit mode:", product);
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
  
  const handleAddToOrder = () => {
    console.log("Adding item to order - Selected product:", selectedProduct);
    console.log("Adding item to order - Quantity:", quantity);
    console.log("Adding item to order - Price:", price);
    
    if (selectedProduct && (quantity !== null && quantity > 0)) {
      // Call the addItemToOrder function passed from parent
      addItemToOrder(selectedProduct, quantity, price);
      
      // Reset form fields immediately after successful addition
      console.log("Resetting form fields after adding item");
      setSearchTerm('');
      setSelectedProduct(null);
      setQuantity(null);
      setPrice(0);
      setShowResults(false);
      
      // Focus back on the search input with a small delay
      setTimeout(() => {
        if (inputRef?.current) {
          inputRef.current.focus();
          console.log("Focus returned to search input");
        }
      }, 100);
    } else {
      console.warn("Cannot add item - missing product or invalid quantity");
    }
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
    handleSearch,
    handleSearchKeyDown,
    handleProductSelect,
    handleQuantityChange,
    handlePriceChange,
    handleAddToOrder,
    incrementQuantity,
    decrementQuantity
  };
}
