
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Plus } from 'lucide-react';
import { ProductCategory, ProductGroup, ProductBrand } from '@/types';
import PageLayout from '@/components/layout/PageLayout';
import { CategoryTable } from '@/components/products/CategoryTable';
import { GroupTable } from '@/components/products/GroupTable';
import { BrandTable } from '@/components/products/BrandTable';
import { CategoryDialog } from '@/components/products/CategoryDialog';
import { GroupDialog } from '@/components/products/GroupDialog';
import { BrandDialog } from '@/components/products/BrandDialog';
import { DeleteConfirmationDialog } from '@/components/products/DeleteConfirmationDialog';
import { useProductClassification } from '@/hooks/useProductClassification';

export default function ProductClassifications() {
  console.log("=== ProductClassifications component rendering ===");
  
  const navigate = useNavigate();
  const {
    productCategories,
    productGroups,
    productBrands,
    isLoadingCategories,
    isLoadingGroups,
    isLoadingBrands,
    activeTab,
    setActiveTab,
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

  console.log("ProductClassifications - dados recebidos do hook:", {
    productCategories: productCategories?.length || 0,
    productGroups: productGroups?.length || 0,
    productBrands: productBrands?.length || 0,
    loadingStates: { isLoadingCategories, isLoadingGroups, isLoadingBrands }
  });

  // Category state
  const [categoryDialogOpen, setCategoryDialogOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<ProductCategory | null>(null);
  const [deleteCategoryDialogOpen, setDeleteCategoryDialogOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<ProductCategory | null>(null);

  // Group state
  const [groupDialogOpen, setGroupDialogOpen] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<ProductGroup | null>(null);
  const [deleteGroupDialogOpen, setDeleteGroupDialogOpen] = useState(false);
  const [groupToDelete, setGroupToDelete] = useState<ProductGroup | null>(null);

  // Brand state
  const [brandDialogOpen, setBrandDialogOpen] = useState(false);
  const [selectedBrand, setSelectedBrand] = useState<ProductBrand | null>(null);
  const [deleteBrandDialogOpen, setDeleteBrandDialogOpen] = useState(false);
  const [brandToDelete, setBrandToDelete] = useState<ProductBrand | null>(null);

  // Category handlers
  const openAddCategoryDialog = () => {
    console.log("Abrindo dialog para adicionar categoria");
    setSelectedCategory(null);
    setCategoryDialogOpen(true);
  };

  const openEditCategoryDialog = (category: ProductCategory) => {
    console.log("Abrindo dialog para editar categoria:", category);
    setSelectedCategory(category);
    setCategoryDialogOpen(true);
  };

  const openDeleteCategoryDialog = (category: ProductCategory) => {
    console.log("Abrindo dialog para deletar categoria:", category);
    setCategoryToDelete(category);
    setDeleteCategoryDialogOpen(true);
  };

  const handleSaveCategory = async (category: Omit<ProductCategory, 'id'>) => {
    console.log("Salvando categoria:", category);
    if (selectedCategory) {
      await handleUpdateCategory(selectedCategory.id, category);
    } else {
      await handleAddCategory(category);
    }
  };

  // Group handlers
  const openAddGroupDialog = () => {
    console.log("Abrindo dialog para adicionar grupo");
    setSelectedGroup(null);
    setGroupDialogOpen(true);
  };

  const openEditGroupDialog = (group: ProductGroup) => {
    console.log("Abrindo dialog para editar grupo:", group);
    setSelectedGroup(group);
    setGroupDialogOpen(true);
  };

  const openDeleteGroupDialog = (group: ProductGroup) => {
    console.log("Abrindo dialog para deletar grupo:", group);
    setGroupToDelete(group);
    setDeleteGroupDialogOpen(true);
  };

  const handleSaveGroup = async (group: Omit<ProductGroup, 'id'>) => {
    console.log("Salvando grupo:", group);
    if (selectedGroup) {
      await handleUpdateGroup(selectedGroup.id, group);
    } else {
      await handleAddGroup(group);
    }
  };

  // Brand handlers
  const openAddBrandDialog = () => {
    console.log("Abrindo dialog para adicionar marca");
    setSelectedBrand(null);
    setBrandDialogOpen(true);
  };

  const openEditBrandDialog = (brand: ProductBrand) => {
    console.log("Abrindo dialog para editar marca:", brand);
    setSelectedBrand(brand);
    setBrandDialogOpen(true);
  };

  const openDeleteBrandDialog = (brand: ProductBrand) => {
    console.log("Abrindo dialog para deletar marca:", brand);
    setBrandToDelete(brand);
    setDeleteBrandDialogOpen(true);
  };

  const handleSaveBrand = async (brand: Omit<ProductBrand, 'id'>) => {
    console.log("Salvando marca:", brand);
    if (selectedBrand) {
      await handleUpdateBrand(selectedBrand.id, brand);
    } else {
      await handleAddBrand(brand);
    }
  };

  console.log("ProductClassifications - renderizando interface...");

  return (
    <PageLayout title="Classificações de Produtos">
      <div className="mb-4 flex justify-between">
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => navigate('/produtos')}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Voltar para Produtos
        </Button>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Classificações de Produtos</CardTitle>
          <CardDescription>
            Gerencie categorias, grupos e marcas de produtos
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'categories' | 'groups' | 'brands')}>
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
                <div>
                  <p className="text-sm text-gray-600 mb-2">
                    DEBUG: {productCategories?.length || 0} categorias carregadas
                  </p>
                  <CategoryTable 
                    categories={productCategories || []}
                    onEdit={openEditCategoryDialog}
                    onDelete={openDeleteCategoryDialog}
                  />
                </div>
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
                <div>
                  <p className="text-sm text-gray-600 mb-2">
                    DEBUG: {productGroups?.length || 0} grupos carregados
                  </p>
                  <GroupTable 
                    groups={productGroups || []}
                    onEdit={openEditGroupDialog}
                    onDelete={openDeleteGroupDialog}
                  />
                </div>
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
                <div>
                  <p className="text-sm text-gray-600 mb-2">
                    DEBUG: {productBrands?.length || 0} marcas carregadas
                  </p>
                  <BrandTable 
                    brands={productBrands || []}
                    onEdit={openEditBrandDialog}
                    onDelete={openDeleteBrandDialog}
                  />
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Dialogs for editing/creating items */}
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
