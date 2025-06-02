
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
import { DeleteConfirmationDialog } from '@/components/products/DeleteConfirmationDialog';
import BulkProductUpload from '@/components/products/BulkProductUpload';
import { Product } from '@/types';
import { toast } from "sonner";

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

  useEffect(() => {
    console.log("🔍 Products page - Dados de classificação:", {
      categories: productCategories?.length || 0,
      groups: productGroups?.length || 0,
      brands: productBrands?.length || 0,
      loadingCategories: isLoadingCategories,
      loadingGroups: isLoadingGroups,
      loadingBrands: isLoadingBrands
    });
  }, [productCategories, productGroups, productBrands, isLoadingCategories, isLoadingGroups, isLoadingBrands]);
  
  const filteredProducts = products.filter(product => 
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    product.code.toString().toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  const handleEditProduct = (product: Product) => {
    console.log("✏️ Editando produto:", product.name);
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
        toast("Produto excluído com sucesso!");
        refreshData();
      } catch (error) {
        console.error('Erro ao excluir produto:', error);
        toast("Erro ao excluir produto", {
          description: "Houve um problema ao excluir o produto."
        });
      }
    }
    setDeleteDialogOpen(false);
    setProductToDelete(null);
  };
  
  const handleProductSaved = async (data: any) => {
    try {
      console.log("💾 Salvando produto:", data);

      const productData = {
        ...data,
        description: data.description || "",
        minStock: data.minStock || 0,
        price: 0,
        syncStatus: 'synced'
      };
      
      if (editingProduct) {
        console.log("🔄 Atualizando produto existente");
        await updateProduct(editingProduct.id, productData);
        toast("Produto atualizado com sucesso!");
      } else {
        console.log("➕ Criando novo produto");
        await addProduct(productData);
        toast("Produto criado com sucesso!", {
          description: "Configure o preço de venda na seção Precificação."
        });
      }
      
      setIsProductFormOpen(false);
      setEditingProduct(null);
      refreshData();
      
    } catch (error) {
      console.error('❌ Erro ao salvar produto:', error);
      toast("Erro ao salvar produto", {
        description: "Houve um problema ao salvar o produto."
      });
    }
  };
  
  const handleNewProduct = () => {
    console.log("➕ Criando novo produto");
    setEditingProduct(null);
    setIsProductFormOpen(true);
  };

  const isClassificationLoading = isLoadingCategories || isLoadingGroups || isLoadingBrands;
  
  return (
    <PageLayout title="Gerenciar Produtos" subtitle="Cadastre e gerencie seus produtos" description="Controle seu estoque, preços e informações dos produtos">
      <div className="space-y-6">
        {/* Botões de ação */}
        <ProductsActionButtons onAddProduct={handleNewProduct} />

        {/* Header com busca */}
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
                <Button 
                  onClick={handleNewProduct} 
                  className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700" 
                  disabled={isClassificationLoading}
                >
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

        {/* Tabela de produtos */}
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
            if (!open) setEditingProduct(null);
          }} 
          onSubmit={handleProductSaved} 
          isEditing={!!editingProduct} 
          selectedProduct={editingProduct} 
          products={products} 
          productCategories={productCategories || []} 
          productGroups={productGroups || []} 
          productBrands={productBrands || []} 
        />

        <DeleteConfirmationDialog 
          open={deleteDialogOpen} 
          onOpenChange={setDeleteDialogOpen} 
          onConfirm={handleConfirmDelete} 
          title="Excluir Produto" 
          description={`Tem certeza que deseja excluir o produto "${productToDelete?.name || ''}"? Esta ação não pode ser desfeita.`} 
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
