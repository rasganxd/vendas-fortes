import React, { useState, useEffect } from 'react';
import PageLayout from '@/components/layout/PageLayout';
import { EnhancedCard, EnhancedCardContent, EnhancedCardDescription, EnhancedCardHeader, EnhancedCardTitle } from '@/components/ui/enhanced-card';
import { Button } from '@/components/ui/button';
import { Plus, Search, Filter, Download, Upload, DollarSign } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useProducts } from '@/hooks/useProducts';
import { useAppContext } from '@/hooks/useAppContext';
import { useProductClassification } from '@/hooks/useProductClassification';
import ProductForm from '@/components/products/ProductForm';
import EnhancedProductsTable from '@/components/products/EnhancedProductsTable';
import ProductsActionButtons from '@/components/products/ProductsActionButtons';
import { DeleteConfirmationDialog } from '@/components/products/DeleteConfirmationDialog';
import BulkProductUpload from '@/components/products/BulkProductUpload';
import { Product } from '@/types';
import { toast } from "sonner";
import { productUnitsMappingService } from '@/services/supabase/productUnitsMapping';

export default function Products() {
  const {
    products,
    isLoading,
    deleteProduct,
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

  // Debug log to verify data loading
  useEffect(() => {
    console.log("Products page - Classification data loaded:", {
      categories: productCategories?.length || 0,
      groups: productGroups?.length || 0,
      brands: productBrands?.length || 0,
      loadingCategories: isLoadingCategories,
      loadingGroups: isLoadingGroups,
      loadingBrands: isLoadingBrands
    });
  }, [productCategories, productGroups, productBrands, isLoadingCategories, isLoadingGroups, isLoadingBrands]);
  
  const filteredProducts = products.filter(product => product.name.toLowerCase().includes(searchTerm.toLowerCase()) || product.code.toString().toLowerCase().includes(searchTerm.toLowerCase()));
  
  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setIsProductFormOpen(true);
  };
  
  const handleDeleteProduct = (product: Product) => {
    setProductToDelete(product);
    setDeleteDialogOpen(true);
  };
  
  const handleConfirmDelete = async () => {
    if (productToDelete) {
      try {
        await deleteProduct(productToDelete.id);
        toast("Produto excluído", {
          description: "O produto foi excluído com sucesso"
        });
        refreshData();
      } catch (error) {
        console.error('Erro ao excluir produto:', error);
        toast("Erro", {
          description: "Erro ao excluir produto",
          style: {
            backgroundColor: 'rgb(239, 68, 68)',
            color: 'white'
          }
        });
      }
    }
    setDeleteDialogOpen(false);
    setProductToDelete(null);
  };
  
  const handleProductSaved = async (data: any) => {
    const isEditingProduct = !!editingProduct;
    
    try {
      console.log("💾 Iniciando salvamento do produto:", data);

      // Validar dados de unidades
      if (!data.selectedUnits || data.selectedUnits.length === 0) {
        throw new Error("Produto deve ter pelo menos uma unidade");
      }

      if (!data.mainUnitId) {
        throw new Error("Produto deve ter uma unidade principal");
      }

      const mainUnits = data.selectedUnits.filter((u: any) => u.isMainUnit);
      if (mainUnits.length !== 1) {
        throw new Error("Produto deve ter exatamente uma unidade principal");
      }

      // CORRIGIDO: Preserve o preço existente ao atualizar produto
      const productData = {
        ...data,
        description: data.description || "",
        minStock: data.minStock || 0,
        // IMPORTANTE: Não resetar o preço ao editar - preservar o preço existente
        price: isEditingProduct && editingProduct ? editingProduct.price : 0,
        syncStatus: 'synced'
      };
      
      console.log("💰 Preço sendo preservado:", {
        isEditingProduct,
        originalPrice: editingProduct?.price,
        preservedPrice: productData.price
      });
      
      let productId: string;
      
      if (isEditingProduct) {
        console.log("✏️ Atualizando produto existente:", editingProduct.id);
        
        // Updating existing product - preserve all existing data not being changed
        const updateData = {
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
          // IMPORTANTE: Não incluir 'price' aqui para não sobrescrever
        };
        
        console.log("📝 Dados de atualização (sem alterar preço):", updateData);
        
        await updateProduct(editingProduct.id, updateData);
        productId = editingProduct.id;
        
        toast("Produto atualizado", {
          description: "Produto atualizado com sucesso. Sincronizando unidades..."
        });
      } else {
        console.log("🆕 Criando novo produto");
        
        // Creating new product
        productId = await addProduct(productData);
        
        toast("Produto criado", {
          description: "Produto criado com sucesso. Configurando unidades..."
        });
      }

      // Sincronizar unidades usando operações individuais
      console.log("🔄 Sincronizando unidades do produto...");
      
      // Primeiro, buscar unidades existentes
      const existingUnits = isEditingProduct 
        ? await productUnitsMappingService.getProductUnits(productId)
        : [];
      
      console.log("📋 Unidades existentes:", existingUnits);
      console.log("📋 Unidades selecionadas:", data.selectedUnits);
      
      // Remover unidades que não estão mais selecionadas
      for (const existingUnit of existingUnits) {
        const stillSelected = data.selectedUnits.find((u: any) => u.unitId === existingUnit.id);
        if (!stillSelected) {
          console.log("🗑️ Removendo unidade não selecionada:", existingUnit.value);
          await productUnitsMappingService.removeUnitFromProduct(productId, existingUnit.id);
        }
      }
      
      // Adicionar novas unidades e atualizar status de principal
      for (const selectedUnit of data.selectedUnits) {
        const alreadyExists = existingUnits.find(u => u.id === selectedUnit.unitId);
        if (!alreadyExists) {
          console.log("➕ Adicionando nova unidade:", selectedUnit.unitValue);
          await productUnitsMappingService.addUnitToProduct(
            productId, 
            selectedUnit.unitId, 
            selectedUnit.isMainUnit
          );
        } else if (selectedUnit.isMainUnit !== alreadyExists.isMainUnit) {
          // Atualizar se mudou o status de unidade principal
          if (selectedUnit.isMainUnit) {
            console.log("👑 Atualizando unidade principal:", selectedUnit.unitValue);
            await productUnitsMappingService.setMainUnit(productId, selectedUnit.unitId);
          }
        }
      }
      
      console.log("✅ Produto e unidades salvos com sucesso");
      
      toast("Sucesso!", {
        description: isEditingProduct 
          ? "Produto e unidades atualizados com sucesso. Preço preservado." 
          : "Produto criado e unidades configuradas com sucesso. Defina o preço de venda na seção Precificação."
      });
      
      setIsProductFormOpen(false);
      setEditingProduct(null);
      
      // Force immediate refresh of data
      console.log("🔄 Refreshing product data after save...");
      await refreshData();
      
      // Dispatch event to notify all components of product update
      window.dispatchEvent(new CustomEvent('productsUpdated', { 
        detail: { 
          action: isEditingProduct ? 'update' : 'add',
          productId: productId
        } 
      }));
      
    } catch (error: any) {
      console.error('❌ Erro ao salvar produto:', error);
      
      const errorMessage = error.message || "Erro desconhecido ao salvar produto";
      
      toast("Erro ao salvar", {
        description: errorMessage,
        style: {
          backgroundColor: 'rgb(239, 68, 68)',
          color: 'white'
        }
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
                <Input placeholder="Buscar por nome ou código do produto..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="pl-10 h-10 border-gray-200 focus:border-blue-500 focus:ring-blue-500" />
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
            <EnhancedProductsTable products={filteredProducts} isLoading={isLoading} onEdit={handleEditProduct} onDelete={id => {
            const product = products.find(p => p.id === id);
            if (product) handleDeleteProduct(product);
          }} />
          </EnhancedCardContent>
        </EnhancedCard>

        {/* Dialogs */}
        <ProductForm open={isProductFormOpen} onOpenChange={open => {
        setIsProductFormOpen(open);
        if (!open) setEditingProduct(null);
      }} onSubmit={handleProductSaved} isEditing={!!editingProduct} selectedProduct={editingProduct} products={products} productCategories={productCategories || []} productGroups={productGroups || []} productBrands={productBrands || []} />

        <DeleteConfirmationDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen} onConfirm={handleConfirmDelete} title="Excluir Produto" description={`Tem certeza que deseja excluir o produto "${productToDelete?.name || ''}"? Esta ação não pode ser desfeita.`} />

        <BulkProductUpload open={isBulkUploadOpen} onOpenChange={setIsBulkUploadOpen} onSuccess={refreshData} />
      </div>
    </PageLayout>
  );
}
