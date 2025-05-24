
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from "sonner";
import { Product } from '@/types';
import { useAppContext } from '@/hooks/useAppContext';
import PageLayout from '@/components/layout/PageLayout';
import { useProducts } from '@/hooks/useProducts';
import ProductsTable from '@/components/products/ProductsTable';
import ProductsActionButtons from '@/components/products/ProductsActionButtons';
import ProductForm from '@/components/products/ProductForm';
import { useConnection } from '@/context/providers/ConnectionProvider';
import { useProductBrands } from '@/hooks/useProductBrands';
import { useProductCategories } from '@/hooks/useProductCategories';
import { useProductGroups } from '@/hooks/useProductGroups';

export default function Products() {
  // Get product classifications directly from hooks instead of AppContext
  const {
    productGroups: contextProductGroups,
    productCategories: contextProductCategories,
    productBrands: contextProductBrands
  } = useAppContext();
  
  // Get direct access to classification hooks
  const {
    productBrands,
    forceRefreshBrands,
    isLoading: isBrandsLoading
  } = useProductBrands();
  
  const {
    productGroups,
    isLoading: isGroupsLoading
  } = useProductGroups();
  
  const {
    productCategories,
    isLoading: isCategoriesLoading
  } = useProductCategories();
  
  const {
    connectionStatus
  } = useConnection();

  // Use the enhanced useProducts hook directly
  const {
    products,
    isLoading,
    isSyncing,
    addProduct,
    updateProduct,
    deleteProduct,
    syncPendingProducts,
    forceRefreshProducts
  } = useProducts();
  
  const [open, setOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isReloadingClassifications, setIsReloadingClassifications] = useState(false);

  // Add detailed logging to check if we're getting the product classifications
  useEffect(() => {
    console.log("--- PRODUCT CLASSIFICATIONS STATUS IN PRODUCTS PAGE ---");
    console.log("Direct from hooks:");
    console.log("- Product Groups:", productGroups?.length || 0, "items");
    console.log("- Product Categories:", productCategories?.length || 0, "items");
    console.log("- Product Brands:", productBrands?.length || 0, "items");
    
    console.log("From context:");
    console.log("- Product Groups from context:", contextProductGroups?.length || 0, "items");
    console.log("- Product Categories from context:", contextProductCategories?.length || 0, "items");
    console.log("- Product Brands from context:", contextProductBrands?.length || 0, "items");

    // Check if arrays are actually arrays and contain data
    if (!Array.isArray(productGroups)) {
      console.warn("productGroups is not an array");
    }
    if (!Array.isArray(productBrands)) {
      console.warn("productBrands is not an array");
    }
    if (!Array.isArray(productCategories)) {
      console.warn("productCategories is not an array");
    }

    // Log individual items for debugging
    if (Array.isArray(productCategories) && productCategories.length > 0) {
      console.log("Sample product category:", productCategories[0]);
    }
    if (Array.isArray(productGroups) && productGroups.length > 0) {
      console.log("Sample product group:", productGroups[0]);
    }
    if (Array.isArray(productBrands) && productBrands.length > 0) {
      console.log("Sample product brand:", productBrands[0]);
    }
  }, [productGroups, productCategories, productBrands, contextProductGroups, contextProductCategories, contextProductBrands]);

  // Force reload all classifications
  const handleReloadClassifications = async () => {
    try {
      setIsReloadingClassifications(true);
      console.log("Forcing reload of all product classifications");
      
      // Only call forceRefreshBrands as example, integrate with others as needed
      const result = await forceRefreshBrands();
      
      if (result) {
        toast("Classificações atualizadas",  {
          description: "As classificações de produtos foram atualizadas com sucesso"
        });
      } else {
        toast("Erro na atualização",  {
          description: "Não foi possível atualizar todas as classificações",
          style: {
            backgroundColor: 'rgb(239, 68, 68)',
            color: 'white'
          }
        });
      }
    } catch (error) {
      console.error("Error reloading classifications:", error);
      toast("Erro",  {
        description: "Ocorreu um erro ao recarregar as classificações",
        style: {
          backgroundColor: 'rgb(239, 68, 68)',
          color: 'white'
        }
      });
    } finally {
      setIsReloadingClassifications(false);
    }
  };

  // Count pending products
  const pendingProducts = products.filter(p => p.syncStatus === 'pending').length;
  const handleEdit = (product: Product) => {
    setIsEditing(true);
    setSelectedProduct(product);
    setOpen(true);
  };
  const handleDelete = async (id: string) => {
    try {
      await deleteProduct(id);
      toast("Produto excluído", {
        description: "O produto foi excluído com sucesso"
      });
    } catch (error) {
      console.error("Erro ao excluir produto:", error);
      toast("Erro", {
        description: "Ocorreu um erro ao excluir o produto",
        style: {
          backgroundColor: 'rgb(239, 68, 68)',
          color: 'white'
        }
      });
    }
  };
  const handleAdd = () => {
    // Check if classifications are loaded before opening form
    if (
      (Array.isArray(productGroups) && productGroups.length === 0 && !isGroupsLoading) ||
      (Array.isArray(productCategories) && productCategories.length === 0 && !isCategoriesLoading) ||
      (Array.isArray(productBrands) && productBrands.length === 0 && !isBrandsLoading)
    ) {
      console.log("Some classifications may not be loaded yet. Prompting user.");
      if (confirm("Algumas classificações podem não estar carregadas. Deseja recarregá-las antes de continuar?")) {
        handleReloadClassifications();
        return;
      }
    }
    
    setIsEditing(false);
    setSelectedProduct(null);
    setOpen(true);
  };
  const handleSubmit = async (data: any) => {
    try {
      // Ensure groupId, categoryId, and brandId are null when "none" is selected
      const productData: Partial<Product> = {
        code: data.code,
        name: data.name,
        cost: data.cost,
        // Set initial price equal to cost (it will be updated in pricing page)
        price: data.cost,
        unit: data.unit,
        // Make sure to handle "none" values properly - use null instead of undefined
        categoryId: data.categoryId && data.categoryId !== "none" ? data.categoryId : null,
        groupId: data.groupId && data.groupId !== "none" ? data.groupId : null,
        brandId: data.brandId && data.brandId !== "none" ? data.brandId : null,
        stock: data.stock || 0,
        minStock: 0 // Default value for minStock
      };
      console.log("Form data submitted:", data);
      console.log("Product data being sent:", productData);
      if (isEditing && selectedProduct) {
        await updateProduct(selectedProduct.id, productData);
        toast("Produto atualizado", {
          description: "O produto foi atualizado com sucesso"
        });
      } else {
        const newProductId = await addProduct(productData as Omit<Product, 'id'>);
        console.log("Product added with ID:", newProductId);
        toast("Produto adicionado", {
          description: "O produto foi adicionado com sucesso"
        });
      }
      setOpen(false);
    } catch (error) {
      console.error("Erro ao salvar produto:", error);
      toast("Erro", {
        description: "Ocorreu um erro ao salvar o produto",
        style: {
          backgroundColor: 'rgb(239, 68, 68)',
          color: 'white'
        }
      });
    }
  };
  const handleForceRefresh = async () => {
    return await forceRefreshProducts();
  };
  const handleSyncProducts = async () => {
    return await syncPendingProducts();
  };

  // Use classifications directly from hooks for the most updated data
  const safeProductGroups = Array.isArray(productGroups) ? productGroups : [];
  const safeProductCategories = Array.isArray(productCategories) ? productCategories : [];
  const safeProductBrands = Array.isArray(productBrands) ? productBrands : [];
  
  // Display loading status for debugging
  const isLoadingAnyClassification = isGroupsLoading || isCategoriesLoading || isBrandsLoading;
  
  return <PageLayout title="Produtos">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h2 className="text-lg font-medium">Gerencie os produtos da sua empresa</h2>
          {isLoadingAnyClassification && (
            <p className="text-orange-500 text-sm">Carregando classificações...</p>
          )}
        </div>
      </div>
      
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              
              
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <ProductsActionButtons 
              onAddProduct={handleAdd} 
              onReloadClassifications={handleReloadClassifications}
              isReloading={isReloadingClassifications}
            />
          </div>
          
          <ProductsTable products={products} isLoading={isLoading} onEdit={handleEdit} onDelete={handleDelete} />
        </CardContent>
      </Card>
      
      <ProductForm 
        open={open} 
        onOpenChange={setOpen} 
        isEditing={isEditing} 
        selectedProduct={selectedProduct} 
        products={products} 
        productCategories={safeProductCategories} 
        productGroups={safeProductGroups} 
        productBrands={safeProductBrands} 
        onSubmit={handleSubmit} 
      />
    </PageLayout>;
}
