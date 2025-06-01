
import React, { useState, useEffect } from 'react';
import PageLayout from '@/components/layout/PageLayout';
import { EnhancedCard, EnhancedCardContent, EnhancedCardDescription, EnhancedCardHeader, EnhancedCardTitle } from '@/components/ui/enhanced-card';
import { Button } from '@/components/ui/button';
import { Plus, Search, Filter, Upload } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useProducts } from '@/hooks/useProducts';
import { useAppContext } from '@/hooks/useAppContext';
import { useProductClassification } from '@/hooks/useProductClassification';
import ProductForm from '@/components/products/ProductForm';
import EnhancedProductsTable from '@/components/products/EnhancedProductsTable';
import ProductsActionButtons from '@/components/products/ProductsActionButtons';
import BulkProductUpload from '@/components/products/BulkProductUpload';
import { Product } from '@/types';
import { toast } from "sonner";
import { productUnitsMappingService } from '@/services/supabase/productUnitsMapping';
import { EnhancedDeleteConfirmationDialog } from '@/components/products/EnhancedDeleteConfirmationDialog';
import { productService } from '@/services/supabase/productService';

export default function Products() {
  const {
    products,
    isLoading,
    addProduct,
    updateProduct
  } = useProducts();
  const {
    refreshData
  } = useAppContext();

  // Use the product classification hook to get categories, groups, and brands
  const {
    productCategories,
    productGroups,
    productBrands,
    isLoadingCategories,
    isLoadingGroups,
    isLoadingBrands
  } = useProductClassification();
  const [searchTerm, setSearchTerm] = useState('');
  const [isProductFormOpen, setIsProductFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [isBulkUploadOpen, setIsBulkUploadOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  
  const filteredProducts = products.filter(product => 
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    product.code.toString().toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setIsProductFormOpen(true);
  };
  
  const handleDeleteProduct = (product: Product) => {
    setProductToDelete(product);
    setDeleteDialogOpen(true);
  };
  
  const handleConfirmDelete = async (forceDelete: boolean = false) => {
    if (!productToDelete || isDeleting) {
      return;
    }
    
    setIsDeleting(true);
    
    try {
      // Use only the enhanced deletion method from productService
      await productService.deleteWithDependencies(productToDelete.id, forceDelete);
      
      toast.success("Produto excluído", {
        description: forceDelete 
          ? "O produto e suas dependências foram removidos com sucesso" 
          : "O produto foi excluído com sucesso"
      });
      
      // Refresh all data to ensure consistency
      await refreshData();
      
      setDeleteDialogOpen(false);
      setProductToDelete(null);
      
    } catch (error: any) {
      let errorMessage = "Erro ao excluir produto";
      
      if (error.message) {
        if (error.message.includes('pelo menos uma unidade principal')) {
          errorMessage = "Erro: Produto deve ter pelo menos uma unidade principal configurada";
        } else if (error.message.includes('foreign key')) {
          errorMessage = "Produto não pode ser excluído pois está sendo usado em outros registros";
        } else if (error.message.includes('dependências')) {
          errorMessage = "Produto possui dependências que impedem a exclusão";
        } else {
          errorMessage = error.message;
        }
      }
      
      toast.error("Erro", {
        description: errorMessage
      });
    } finally {
      setIsDeleting(false);
    }
  };
  
  const handleProductSaved = async (data: any) => {
    const isEditingProduct = !!editingProduct;
    
    try {
      // Validate unit data
      if (!data.primaryUnit) {
        throw new Error("Produto deve ter uma unidade principal");
      }

      const productData = {
        code: data.code,
        name: data.name,
        description: data.description || "",
        cost: data.cost,
        stock: data.stock,
        minStock: data.minStock || 0,
        categoryId: data.categoryId,
        groupId: data.groupId,
        brandId: data.brandId,
        // Preserve existing price when editing
        price: isEditingProduct && editingProduct ? editingProduct.price : 0,
        syncStatus: 'synced' as const,
        createdAt: isEditingProduct && editingProduct ? editingProduct.createdAt : new Date(),
        updatedAt: new Date()
      };
      
      let productId: string;
      
      if (isEditingProduct && editingProduct) {
        // Update product without changing price
        await updateProduct(editingProduct.id, {
          code: productData.code,
          name: productData.name,
          description: productData.description,
          cost: productData.cost,
          stock: productData.stock,
          minStock: productData.minStock,
          categoryId: productData.categoryId,
          groupId: productData.groupId,
          brandId: productData.brandId,
          syncStatus: productData.syncStatus
        });
        productId = editingProduct.id;
        
        toast.success("Produto atualizado", {
          description: "Produto atualizado com sucesso. Sincronizando unidades..."
        });
      } else {
        productId = await addProduct(productData);
        
        if (!productId) {
          throw new Error("Falha ao criar produto - ID não retornado");
        }
        
        toast.success("Produto criado", {
          description: "Produto criado com sucesso. Configurando unidades..."
        });
      }

      // Synchronize units using the new system
      const existingUnits = isEditingProduct 
        ? await productUnitsMappingService.getProductUnits(productId)
        : [];
      
      // Remove all existing units to clean up
      for (const existingUnit of existingUnits) {
        await productUnitsMappingService.removeUnitFromProduct(productId, existingUnit.id);
      }
      
      // Add primary unit
      await productUnitsMappingService.addUnitToProduct(
        productId, 
        data.primaryUnit.id, 
        true // is primary unit
      );
      
      // Add secondary units
      for (const secondaryUnit of data.secondaryUnits || []) {
        await productUnitsMappingService.addUnitToProduct(
          productId, 
          secondaryUnit.id, 
          false // not primary unit
        );
      }
      
      toast.success("Sucesso!", {
        description: isEditingProduct 
          ? "Produto e unidades atualizados com sucesso. Preço preservado." 
          : "Produto criado e unidades configuradas com sucesso. Defina o preço de venda na seção Precificação."
      });
      
      setIsProductFormOpen(false);
      setEditingProduct(null);
      
      // Force immediate refresh of data
      await refreshData();
      
      // Dispatch event to notify all components of product update
      window.dispatchEvent(new CustomEvent('productsUpdated', { 
        detail: { 
          action: isEditingProduct ? 'update' : 'add',
          productId: productId
        } 
      }));
      
    } catch (error: any) {
      const errorMessage = error.message || "Erro desconhecido ao salvar produto";
      
      toast.error("Erro ao salvar", {
        description: errorMessage
      });
    }
  };
  
  const handleNewProduct = () => {
    setEditingProduct(null);
    setIsProductFormOpen(true);
  };

  // Check if any classification data is still loading
  const isClassificationLoading = isLoadingCategories || isLoadingGroups || isLoadingBrands;
  
  return (
    <PageLayout title="Gerenciar Produtos" subtitle="Cadastre e gerencie seus produtos" description="Controle seu estoque, preços e informações dos produtos">
      <div className="space-y-6">
        {/* Action Buttons */}
        <ProductsActionButtons onAddProduct={handleNewProduct} />

        {/* Header Actions */}
        <EnhancedCard variant="glass">
          <EnhancedCardHeader>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <EnhancedCardTitle className="text-xl">
                  <Search className="h-5 w-5 text-blue-500" />
                  Produtos
                </EnhancedCardTitle>
                <EnhancedCardDescription>
                  {filteredProducts.length} produto(s) encontrado(s)
                </EnhancedCardDescription>
              </div>
              <div className="flex flex-col sm:flex-row gap-2">
                <Button variant="outline" onClick={() => setIsBulkUploadOpen(true)} className="flex items-center gap-2">
                  <Upload className="h-4 w-4" />
                  Importar
                </Button>
                <Button onClick={handleNewProduct} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700" disabled={isClassificationLoading}>
                  <Plus className="h-4 w-4" />
                  Novo Produto
                </Button>
              </div>
            </div>
          </EnhancedCardHeader>
          <EnhancedCardContent>
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <Input 
                  placeholder="Buscar por nome ou código do produto..." 
                  value={searchTerm} 
                  onChange={e => setSearchTerm(e.target.value)} 
                  className="pl-10 h-10 border-gray-200 focus:border-blue-500 focus:ring-blue-500" 
                />
              </div>
              <Button variant="outline" className="flex items-center gap-2">
                <Filter className="h-4 w-4" />
                Filtros
              </Button>
            </div>
          </EnhancedCardContent>
        </EnhancedCard>

        {/* Products Table */}
        <EnhancedCard variant="default">
          <EnhancedCardContent className="p-0">
            <EnhancedProductsTable 
              products={filteredProducts} 
              isLoading={isLoading} 
              onEdit={handleEditProduct} 
              onDelete={id => {
                const product = products.find(p => p.id === id);
                if (product) handleDeleteProduct(product);
              }} 
            />
          </EnhancedCardContent>
        </EnhancedCard>

        {/* Dialogs */}
        <ProductForm 
          open={isProductFormOpen} 
          onOpenChange={open => {
            setIsProductFormOpen(open);
            if (!open) {
              setEditingProduct(null);
            }
          }} 
          onSubmit={handleProductSaved} 
          isEditing={!!editingProduct} 
          selectedProduct={editingProduct} 
          products={products} 
          productCategories={productCategories || []} 
          productGroups={productGroups || []} 
          productBrands={productBrands || []} 
        />

        <EnhancedDeleteConfirmationDialog
          open={deleteDialogOpen}
          onOpenChange={setDeleteDialogOpen}
          onConfirm={handleConfirmDelete}
          product={productToDelete}
        />

        <BulkProductUpload 
          open={isBulkUploadOpen} 
          onOpenChange={setIsBulkUploadOpen} 
          onSuccess={refreshData} 
        />
      </div>
    </PageLayout>
  );
}
