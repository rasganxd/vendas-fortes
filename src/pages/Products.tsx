import React, { useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from "sonner";
import { Product } from '@/types';
import { useAppContext } from '@/hooks/useAppContext';
import PageLayout from '@/components/layout/PageLayout';
import BulkProductUpload from '@/components/products/BulkProductUpload';
import ProductSyncStatus from '@/components/products/ProductSyncStatus';
import { useProducts } from '@/hooks/useProducts';
import ProductsTable from '@/components/products/ProductsTable';
import ProductsActionButtons from '@/components/products/ProductsActionButtons';
import ProductForm from '@/components/products/ProductForm';
import { useConnection } from '@/context/providers/ConnectionProvider';

export default function Products() {
  const { 
    productGroups, 
    productCategories, 
    productBrands
  } = useAppContext();
  
  const { connectionStatus } = useConnection();
  
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
  const [bulkUploadOpen, setBulkUploadOpen] = useState(false);
  
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
        style: { backgroundColor: 'rgb(239, 68, 68)', color: 'white' }
      });
    }
  };

  const handleAdd = () => {
    setIsEditing(false);
    setSelectedProduct(null);
    setOpen(true);
  };

  const handleSubmit = async (data: any) => {
    try {
      const productData: Partial<Product> = {
        code: data.code,
        name: data.name,
        cost: data.cost,
        // Set initial price equal to cost (it will be updated in pricing page)
        price: data.cost,
        unit: data.unit,
        // Make sure to handle "none" values properly
        categoryId: data.categoryId && data.categoryId !== "none" ? data.categoryId : undefined,
        groupId: data.groupId && data.groupId !== "none" ? data.groupId : undefined,
        brandId: data.brandId && data.brandId !== "none" ? data.brandId : undefined,
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
        style: { backgroundColor: 'rgb(239, 68, 68)', color: 'white' }
      });
    }
  };

  const openBulkUpload = () => {
    setBulkUploadOpen(true);
  };
  
  const handleForceRefresh = async () => {
    return await forceRefreshProducts();
  };
  
  const handleSyncProducts = async () => {
    return await syncPendingProducts();
  };

  return (
    <PageLayout title="Produtos">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h2 className="text-lg font-medium">Gerencie os produtos da sua empresa</h2>
        </div>
        <ProductSyncStatus
          productsPending={pendingProducts}
          isLoading={isLoading}
          isSyncing={isSyncing}
          onSyncProducts={handleSyncProducts}
          onRefreshProducts={handleForceRefresh}
        />
      </div>
      
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Produtos</CardTitle>
              <CardDescription>
                Gerencie os produtos da sua empresa
              </CardDescription>
            </div>
            <ProductSyncStatus
              productsPending={pendingProducts}
              isLoading={isLoading}
              isSyncing={isSyncing}
              onSyncProducts={handleSyncProducts}
              onRefreshProducts={handleForceRefresh}
              hideButtons={true}
            />
          </div>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <ProductsActionButtons 
              onAddProduct={handleAdd}
              onOpenBulkUpload={openBulkUpload}
            />
          </div>
          
          <ProductsTable 
            products={products}
            isLoading={isLoading}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        </CardContent>
      </Card>
      
      <ProductForm 
        open={open}
        onOpenChange={setOpen}
        isEditing={isEditing}
        selectedProduct={selectedProduct}
        products={products}
        productCategories={productCategories}
        productGroups={productGroups}
        productBrands={productBrands}
        onSubmit={handleSubmit}
      />
      
      <BulkProductUpload open={bulkUploadOpen} onOpenChange={setBulkUploadOpen} />
    </PageLayout>
  );
}
