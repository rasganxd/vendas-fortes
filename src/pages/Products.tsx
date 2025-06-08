import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, DollarSign, Upload } from 'lucide-react';
import { toast } from "sonner";
import { Product } from '@/types';
import { useAppData } from '@/context/providers/AppDataProvider';
import PageLayout from '@/components/layout/PageLayout';
import ProductsTable from '@/components/products/ProductsTable';
import ProductForm from '@/components/products/ProductForm';
import BulkProductUpload from '@/components/products/BulkProductUpload';
import { useConnection } from '@/context/providers/ConnectionProvider';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, Tags, Ruler } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import UnitsPanel from '@/components/settings/UnitsPanel';
import { CategoryTable } from '@/components/products/CategoryTable';
import { GroupTable } from '@/components/products/GroupTable';
import { BrandTable } from '@/components/products/BrandTable';
import { CategoryDialog } from '@/components/products/CategoryDialog';
import { GroupDialog } from '@/components/products/GroupDialog';
import { BrandDialog } from '@/components/products/BrandDialog';
import { DeleteConfirmationDialog } from '@/components/products/DeleteConfirmationDialog';
import { useProductClassification } from '@/hooks/useProductClassification';
import { ProductCategory, ProductGroup, ProductBrand } from '@/types';
import ProductPricing from '@/components/products/ProductPricing';

export default function Products() {
  const navigate = useNavigate();
  
  // Use centralized products and classifications from AppData
  const {
    products,
    isLoadingProducts,
    addProduct,
    updateProduct,
    deleteProduct,
    refreshProducts,
    productBrands,
    productCategories,
    productGroups,
    isLoadingProductBrands,
    isLoadingProductCategories,
    isLoadingProductGroups
  } = useAppData();
  
  const { connectionStatus } = useConnection();
  
  // Use product classification hook for classifications tab
  const {
    productCategories: classificationCategories,
    productGroups: classificationGroups,
    productBrands: classificationBrands,
    isLoadingCategories,
    isLoadingGroups,
    isLoadingBrands,
    handleAddCategory,
    handleUpdateCategory,
    handleDeleteCategory,
    handleAddGroup,
    handleUpdateGroup,
    handleDeleteGroup,
    handleAddBrand,
    handleUpdateBrand,
    handleDeleteBrand
  } = useProductClassification();
  
  const [open, setOpen] = useState(false);
  const [bulkUploadOpen, setBulkUploadOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);

  // Classification dialog states
  const [categoryDialogOpen, setCategoryDialogOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<ProductCategory | null>(null);
  const [deleteCategoryDialogOpen, setDeleteCategoryDialogOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<ProductCategory | null>(null);

  const [groupDialogOpen, setGroupDialogOpen] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<ProductGroup | null>(null);
  const [deleteGroupDialogOpen, setDeleteGroupDialogOpen] = useState(false);
  const [groupToDelete, setGroupToDelete] = useState<ProductGroup | null>(null);

  const [brandDialogOpen, setBrandDialogOpen] = useState(false);
  const [selectedBrand, setSelectedBrand] = useState<ProductBrand | null>(null);
  const [deleteBrandDialogOpen, setDeleteBrandDialogOpen] = useState(false);
  const [brandToDelete, setBrandToDelete] = useState<ProductBrand | null>(null);

  // Filter products based on search term
  useEffect(() => {
    if (searchTerm) {
      const filtered = products.filter(product => 
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.code.toString().toLowerCase().includes(searchTerm.toLowerCase()) ||
        (product.unit && product.unit.toLowerCase().includes(searchTerm.toLowerCase()))
      );
      setFilteredProducts(filtered);
    } else {
      setFilteredProducts(products);
    }
  }, [products, searchTerm]);

  // Listen for product updates to refresh the list
  useEffect(() => {
    const handleProductsUpdated = () => {
      console.log("Products updated event received in Products page");
      // The products will be automatically updated via the centralized hook
    };

    window.addEventListener('productsUpdated', handleProductsUpdated);
    
    return () => {
      window.removeEventListener('productsUpdated', handleProductsUpdated);
    };
  }, []);

  // Debug log for classification data
  useEffect(() => {
    console.log("🔍 Products page - Classification data from AppData:");
    console.log("📂 Categories:", productCategories?.length || 0, "items");
    console.log("📦 Groups:", productGroups?.length || 0, "items");
    console.log("🏷️ Brands:", productBrands?.length || 0, "items");
    console.log("⏳ Loading states:", {
      categories: isLoadingProductCategories,
      groups: isLoadingProductGroups,
      brands: isLoadingProductBrands
    });
  }, [productCategories, productGroups, productBrands, isLoadingProductCategories, isLoadingProductGroups, isLoadingProductBrands]);

  // Category handlers
  const openAddCategoryDialog = () => {
    setSelectedCategory(null);
    setCategoryDialogOpen(true);
  };

  const openEditCategoryDialog = (category: ProductCategory) => {
    setSelectedCategory(category);
    setCategoryDialogOpen(true);
  };

  const openDeleteCategoryDialog = (category: ProductCategory) => {
    setCategoryToDelete(category);
    setDeleteCategoryDialogOpen(true);
  };

  const handleSaveCategory = async (category: Omit<ProductCategory, 'id'>) => {
    if (selectedCategory) {
      await handleUpdateCategory(selectedCategory.id, category);
    } else {
      await handleAddCategory(category);
    }
    setCategoryDialogOpen(false);
  };

  // Group handlers
  const openAddGroupDialog = () => {
    setSelectedGroup(null);
    setGroupDialogOpen(true);
  };

  const openEditGroupDialog = (group: ProductGroup) => {
    setSelectedGroup(group);
    setGroupDialogOpen(true);
  };

  const openDeleteGroupDialog = (group: ProductGroup) => {
    setGroupToDelete(group);
    setDeleteGroupDialogOpen(true);
  };

  const handleSaveGroup = async (group: Omit<ProductGroup, 'id'>) => {
    if (selectedGroup) {
      await handleUpdateGroup(selectedGroup.id, group);
    } else {
      await handleAddGroup(group);
    }
    setGroupDialogOpen(false);
  };

  // Brand handlers
  const openAddBrandDialog = () => {
    setSelectedBrand(null);
    setBrandDialogOpen(true);
  };

  const openEditBrandDialog = (brand: ProductBrand) => {
    setSelectedBrand(brand);
    setBrandDialogOpen(true);
  };

  const openDeleteBrandDialog = (brand: ProductBrand) => {
    setBrandToDelete(brand);
    setDeleteBrandDialogOpen(true);
  };

  const handleSaveBrand = async (brand: Omit<ProductBrand, 'id'>) => {
    if (selectedBrand) {
      await handleUpdateBrand(selectedBrand.id, brand);
    } else {
      await handleAddBrand(brand);
    }
    setBrandDialogOpen(false);
  };

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
    setIsEditing(false);
    setSelectedProduct(null);
    setOpen(true);
  };

  const handleSubmit = async (data: any) => {
    try {
      console.log("🚀 [Products] Submitting product with data:", data);
      console.log("💰 [Products] Cost value received:", data.cost, "Type:", typeof data.cost);
      
      const productData: Partial<Product> = {
        code: data.code,
        name: data.name,
        cost: Number(data.cost), // Ensure it's a number
        price: Number(data.cost) || 0, // Set price equal to cost initially
        unit: data.unit,
        hasSubunit: data.hasSubunit || false,
        subunit: data.hasSubunit ? data.subunit : null,
        subunitRatio: data.hasSubunit ? (data.subunitRatio || 1) : 1,
        categoryId: data.categoryId && data.categoryId !== "" ? data.categoryId : null,
        groupId: data.groupId && data.groupId !== "" ? data.groupId : null,
        brandId: data.brandId && data.brandId !== "" ? data.brandId : null,
        stock: data.stock || 0,
        minStock: 0
      };

      console.log("📝 [Products] Final product data to save:", productData);
      console.log("💰 [Products] Final cost value:", productData.cost, "Type:", typeof productData.cost);

      if (isEditing && selectedProduct) {
        console.log("🔄 [Products] Updating existing product:", selectedProduct.id);
        await updateProduct(selectedProduct.id, productData);
        toast("Produto atualizado", {
          description: "O produto foi atualizado com sucesso"
        });
      } else {
        console.log("➕ [Products] Creating new product");
        const newProductId = await addProduct(productData as Omit<Product, 'id'>);
        console.log("✅ [Products] Product created with ID:", newProductId);
        toast("Produto adicionado", {
          description: "O produto foi adicionado com sucesso"
        });
      }
      setOpen(false);
    } catch (error) {
      console.error("❌ [Products] Error saving product:", error);
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
    return await refreshProducts();
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  return (
    <PageLayout title="Produtos">
      <div className="space-y-4">
        <Tabs defaultValue="products" className="w-full">
          <TabsList className="grid w-full grid-cols-4 md:w-auto md:inline-flex">
            <TabsTrigger value="products">Lista de Produtos</TabsTrigger>
            <TabsTrigger value="units">Unidades</TabsTrigger>
            <TabsTrigger value="pricing">Precificação</TabsTrigger>
            <TabsTrigger value="classifications">Classificações</TabsTrigger>
          </TabsList>
          
          <TabsContent value="products" className="mt-4">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h2 className="text-lg font-medium">Gerencie os produtos da sua empresa</h2>
                <p className="text-sm text-gray-600">
                  {filteredProducts.length} produtos {searchTerm ? 'encontrados' : 'cadastrados'}
                </p>
              </div>
              <div className="flex gap-2">
                <Button onClick={() => setBulkUploadOpen(true)} variant="outline" className="bg-green-50 hover:bg-green-100 border-green-200">
                  <Upload size={16} className="mr-2" />
                  Importar em Massa
                </Button>
                <Button onClick={handleAdd} className="bg-blue-600 hover:bg-blue-700">
                  <Plus size={16} className="mr-2" />
                  Novo Produto
                </Button>
              </div>
            </div>
            
            <Card>
              <CardHeader>
                <div className="flex items-center space-x-4">
                  <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Buscar produtos..."
                      value={searchTerm}
                      onChange={handleSearchChange}
                      className="pl-8"
                    />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <ProductsTable 
                  products={filteredProducts} 
                  isLoading={isLoadingProducts} 
                  onEdit={handleEdit} 
                  onDelete={handleDelete} 
                />
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="units" className="mt-4">
            <UnitsPanel />
          </TabsContent>
          
          <TabsContent value="pricing" className="mt-4">
            <ProductPricing />
          </TabsContent>
          
          <TabsContent value="classifications" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Classificações de Produtos</CardTitle>
                <CardDescription>
                  Gerencie categorias, grupos e marcas de produtos
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="categories" className="w-full">
                  <TabsList className="mb-4">
                    <TabsTrigger value="categories">Categorias</TabsTrigger>
                    <TabsTrigger value="groups">Grupos</TabsTrigger>
                    <TabsTrigger value="brands">Marcas</TabsTrigger>
                  </TabsList>

                  {/* Categories Tab */}
                  <TabsContent value="categories">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg font-medium">Categorias</h3>
                      <Button onClick={openAddCategoryDialog}>
                        <Plus className="mr-2 h-4 w-4" />
                        Nova Categoria
                      </Button>
                    </div>
                    {isLoadingCategories ? (
                      <p>Carregando categorias...</p>
                    ) : (
                      <CategoryTable 
                        categories={classificationCategories}
                        onEdit={openEditCategoryDialog}
                        onDelete={openDeleteCategoryDialog}
                      />
                    )}
                  </TabsContent>

                  {/* Groups Tab */}
                  <TabsContent value="groups">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg font-medium">Grupos</h3>
                      <Button onClick={openAddGroupDialog}>
                        <Plus className="mr-2 h-4 w-4" />
                        Novo Grupo
                      </Button>
                    </div>
                    {isLoadingGroups ? (
                      <p>Carregando grupos...</p>
                    ) : (
                      <GroupTable 
                        groups={classificationGroups}
                        onEdit={openEditGroupDialog}
                        onDelete={openDeleteGroupDialog}
                      />
                    )}
                  </TabsContent>

                  {/* Brands Tab */}
                  <TabsContent value="brands">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg font-medium">Marcas</h3>
                      <Button onClick={openAddBrandDialog}>
                        <Plus className="mr-2 h-4 w-4" />
                        Nova Marca
                      </Button>
                    </div>
                    {isLoadingBrands ? (
                      <p>Carregando marcas...</p>
                    ) : (
                      <BrandTable 
                        brands={classificationBrands}
                        onEdit={openEditBrandDialog}
                        onDelete={openDeleteBrandDialog}
                      />
                    )}
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
      
      <ProductForm 
        open={open} 
        onOpenChange={setOpen} 
        isEditing={isEditing} 
        selectedProduct={selectedProduct} 
        products={products} 
        productCategories={productCategories || []} 
        productGroups={productGroups || []} 
        productBrands={productBrands || []} 
        onSubmit={handleSubmit} 
      />

      <BulkProductUpload 
        open={bulkUploadOpen} 
        onOpenChange={setBulkUploadOpen} 
      />

      {/* Classification Dialogs */}
      <CategoryDialog
        open={categoryDialogOpen}
        onOpenChange={setCategoryDialogOpen}
        category={selectedCategory}
        onSave={handleSaveCategory}
      />

      <GroupDialog
        open={groupDialogOpen}
        onOpenChange={setGroupDialogOpen}
        group={selectedGroup}
        onSave={handleSaveGroup}
      />

      <BrandDialog
        open={brandDialogOpen}
        onOpenChange={setBrandDialogOpen}
        brand={selectedBrand}
        onSave={handleSaveBrand}
      />
      
      {/* Confirmation dialogs for deletion */}
      <DeleteConfirmationDialog
        open={deleteCategoryDialogOpen}
        onOpenChange={setDeleteCategoryDialogOpen}
        onConfirm={() => categoryToDelete && handleDeleteCategory(categoryToDelete.id)}
        title="Excluir Categoria"
        description={`Tem certeza que deseja excluir a categoria "${categoryToDelete?.name}"?`}
      />

      <DeleteConfirmationDialog
        open={deleteGroupDialogOpen}
        onOpenChange={setDeleteGroupDialogOpen}
        onConfirm={() => groupToDelete && handleDeleteGroup(groupToDelete.id)}
        title="Excluir Grupo"
        description={`Tem certeza que deseja excluir o grupo "${groupToDelete?.name}"?`}
      />

      <DeleteConfirmationDialog
        open={deleteBrandDialogOpen}
        onOpenChange={setDeleteBrandDialogOpen}
        onConfirm={() => brandToDelete && handleDeleteBrand(brandToDelete.id)}
        title="Excluir Marca"
        description={`Tem certeza que deseja excluir a marca "${brandToDelete?.name}"?`}
      />
    </PageLayout>
  );
}
