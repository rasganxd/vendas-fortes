
import { useState, useEffect } from 'react';
import { Product } from '@/types';
import { productService } from '@/firebase/firestoreService';
import { toast } from '@/components/ui/use-toast';
import { useAppContext } from './useAppContext';
import { mockProducts } from '@/data/mock/products';

export const loadProducts = async (): Promise<Product[]> => {
  try {
    const products = await productService.getAll();
    
    if (products && products.length > 0) {
      return products;
    } else {
      console.log("No products found in Firebase, using mock data");
      return mockProducts;
    }
  } catch (error) {
    console.error("Erro ao carregar produtos:", error);
    console.log("Using mock products data instead");
    return mockProducts;
  }
};

export const useProducts = () => {
  const { products, setProducts } = useAppContext();
  const [isUsingMockData, setIsUsingMockData] = useState(false);

  // Check if we're using mock data on initial load
  useEffect(() => {
    const checkDataSource = async () => {
      try {
        await productService.getAll();
      } catch (error) {
        console.log("Unable to access Firebase, using mock data");
        setIsUsingMockData(true);
      }
    };
    
    checkDataSource();
  }, []);

  // Function to find the next available code
  const getNextProductCode = (): number => {
    if (products.length === 0) return 1;
    
    // Get the highest existing code and add 1
    const highestCode = Math.max(...products.map(product => product.code || 0));
    return highestCode + 1;
  };

  const addProduct = async (product: Omit<Product, 'id'>) => {
    try {
      // Ensure the product has a code - if not provided, assign the next available one
      const productCode = product.code || getNextProductCode();
      const productWithCode = { ...product, code: productCode };
      
      let id = "";
      
      // Try to add to Firebase first
      try {
        id = await productService.add(productWithCode);
        console.log("Product added to Firebase with ID:", id);
      } catch (firebaseError) {
        console.error("Failed to add product to Firebase:", firebaseError);
        
        // If Firebase fails, generate a local ID and mark as using mock data
        id = `local-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
        setIsUsingMockData(true);
        console.log("Generated local ID for product:", id);
        
        // Store updated mock data in localStorage
        const updatedMockProducts = [...mockProducts, { ...productWithCode, id }];
        localStorage.setItem('mockProducts', JSON.stringify(updatedMockProducts));
      }
      
      const newProduct = { ...productWithCode, id } as Product;
      
      // Update local state
      setProducts([...products, newProduct]);
      toast({
        title: "Produto adicionado",
        description: "Produto adicionado com sucesso!"
      });
      return id;
    } catch (error) {
      console.error("Erro ao adicionar produto:", error);
      toast({
        title: "Erro ao adicionar produto",
        description: "Houve um problema ao adicionar o produto.",
        variant: "destructive"
      });
      return "";
    }
  };

  const updateProduct = async (id: string, product: Partial<Product>) => {
    try {
      // Never allow code to be undefined or null when updating
      const updateData = { ...product };
      if (updateData.code === undefined || updateData.code === null) {
        const existingProduct = products.find(p => p.id === id);
        if (existingProduct && existingProduct.code) {
          updateData.code = existingProduct.code;
        }
      }
      
      // Try Firebase first
      try {
        await productService.update(id, updateData);
        console.log("Product updated in Firebase");
      } catch (firebaseError) {
        console.error("Failed to update product in Firebase:", firebaseError);
        setIsUsingMockData(true);
        
        // If Firebase fails, update mock data in localStorage
        const updatedProducts = products.map(p => 
          p.id === id ? { ...p, ...updateData } : p
        );
        localStorage.setItem('mockProducts', JSON.stringify(updatedProducts));
      }
      
      // Update local state
      setProducts(products.map(p => 
        p.id === id ? { ...p, ...updateData } : p
      ));
      
      toast({
        title: "Produto atualizado",
        description: "Produto atualizado com sucesso!"
      });
    } catch (error) {
      console.error("Erro ao atualizar produto:", error);
      toast({
        title: "Erro ao atualizar produto",
        description: "Houve um problema ao atualizar o produto.",
        variant: "destructive"
      });
    }
  };

  const deleteProduct = async (id: string) => {
    try {
      // Try Firebase first
      try {
        await productService.delete(id);
        console.log("Product deleted from Firebase");
      } catch (firebaseError) {
        console.error("Failed to delete product from Firebase:", firebaseError);
        setIsUsingMockData(true);
        
        // If Firebase fails, update mock data in localStorage
        const remainingProducts = products.filter(p => p.id !== id);
        localStorage.setItem('mockProducts', JSON.stringify(remainingProducts));
      }
      
      // Update local state
      setProducts(products.filter(p => p.id !== id));
      toast({
        title: "Produto excluído",
        description: "Produto excluído com sucesso!"
      });
    } catch (error) {
      console.error("Erro ao excluir produto:", error);
      toast({
        title: "Erro ao excluir produto",
        description: "Houve um problema ao excluir o produto.",
        variant: "destructive"
      });
    }
  };

  // Calculate profit margin percentage for a product
  const calculateProfitMargin = (productId: string): number => {
    const product = products.find(p => p.id === productId);
    if (!product) return 0;
    
    const { price, cost } = product;
    if (!price || !cost || cost <= 0) return 0;
    
    return ((price - cost) / price) * 100;
  };

  // Calculate minimum price based on maximum discount
  const calculateMinimumPrice = (productId: string): number => {
    const product = products.find(p => p.id === productId);
    if (!product) return 0;
    
    const { price, maxDiscountPercentage } = product;
    if (!price) return 0;
    
    if (maxDiscountPercentage === undefined || maxDiscountPercentage === null) {
      return 0; // No minimum price if no maximum discount defined
    }
    
    return price * (1 - (maxDiscountPercentage / 100));
  };

  // Helper to validate if a discount is allowed for a product
  const validateProductDiscount = (productId: string, discountedPrice: number): boolean => {
    const product = products.find(p => p.id === productId);
    if (!product) return true; // If product not found, allow (safer default)
    
    // If no max discount set, allow any price
    if (product.maxDiscountPercentage === undefined || product.maxDiscountPercentage === null) return true;
    
    // If price is 0, don't allow (likely an error)
    if (product.price <= 0) return false;
    
    // Calculate the actual discount percentage
    const discountPercentage = ((product.price - discountedPrice) / product.price) * 100;
    
    // Check if discount is within allowed range - usando toFixed(2) para comparação precisa
    return parseFloat(discountPercentage.toFixed(2)) <= parseFloat(product.maxDiscountPercentage.toFixed(2));
  };

  // Helper to calculate minimum price based on maximum discount
  const getMinimumPrice = (productId: string): number => {
    const product = products.find(p => p.id === productId);
    if (!product) return 0;
    
    if (product.maxDiscountPercentage === undefined || product.maxDiscountPercentage === null) {
      return 0; // No minimum price if no maximum discount defined
    }
    
    // Calculate minimum price based on maximum discount percentage
    const minimumPrice = product.price * (1 - (product.maxDiscountPercentage / 100));
    return parseFloat(minimumPrice.toFixed(2)); // Round to 2 decimal places
  };

  // Batch update multiple products
  const batchUpdateProducts = async (updatesArray: {id: string, updates: Partial<Product>}[]): Promise<boolean> => {
    try {
      // Try Firebase first
      let usingMock = isUsingMockData;
      
      if (!usingMock) {
        try {
          // Process each update one by one
          for (const update of updatesArray) {
            await productService.update(update.id, update.updates);
          }
        } catch (firebaseError) {
          console.error("Failed to batch update products in Firebase:", firebaseError);
          usingMock = true;
          setIsUsingMockData(true);
          
          // If Firebase fails, update mock data in localStorage
          const updatedProducts = [...products];
          for (const update of updatesArray) {
            const index = updatedProducts.findIndex(p => p.id === update.id);
            if (index !== -1) {
              updatedProducts[index] = { ...updatedProducts[index], ...update.updates };
            }
          }
          localStorage.setItem('mockProducts', JSON.stringify(updatedProducts));
        }
      } else {
        // If already using mock data, just update localStorage
        const updatedProducts = [...products];
        for (const update of updatesArray) {
          const index = updatedProducts.findIndex(p => p.id === update.id);
          if (index !== -1) {
            updatedProducts[index] = { ...updatedProducts[index], ...update.updates };
          }
        }
        localStorage.setItem('mockProducts', JSON.stringify(updatedProducts));
      }
      
      // Update local state with all changes
      const updatedProducts = [...products];
      for (const update of updatesArray) {
        const index = updatedProducts.findIndex(p => p.id === update.id);
        if (index !== -1) {
          updatedProducts[index] = { ...updatedProducts[index], ...update.updates };
        }
      }
      
      setProducts(updatedProducts);
      
      toast({
        title: "Produtos atualizados",
        description: `${updatesArray.length} produtos foram atualizados com sucesso.`
      });
      
      return true;
    } catch (error) {
      console.error("Erro ao atualizar produtos em lote:", error);
      toast({
        title: "Erro na atualização em lote",
        description: "Houve um problema ao atualizar os produtos.",
        variant: "destructive"
      });
      return false;
    }
  };

  return {
    products,
    addProduct,
    updateProduct,
    deleteProduct,
    validateProductDiscount,
    getMinimumPrice,
    calculateProfitMargin,
    calculateMinimumPrice,
    batchUpdateProducts,
    isUsingMockData
  };
};
