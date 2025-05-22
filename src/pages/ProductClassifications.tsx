
import React, { useState, useEffect } from 'react';
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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  TooltipProvider,
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from '@/components/ui/tooltip';
import { toast } from '@/hooks/use-toast';
import { ArrowLeft, Pencil, Trash, Plus, RefreshCw } from 'lucide-react';
import { useAppContext } from '@/hooks/useAppContext';
import { ProductCategory, ProductGroup, ProductBrand } from '@/types';
import PageLayout from '@/components/layout/PageLayout';
import { DeleteCategoryDialog } from '@/components/products/DeleteCategoryDialog';
import { DeleteGroupDialog } from '@/components/products/DeleteGroupDialog';
import { DeleteBrandDialog } from '@/components/products/DeleteBrandDialog';
import { cleanupUtils } from '@/utils/cleanupUtils';

export default function ProductClassifications() {
  const navigate = useNavigate();
  const {
    productCategories,
    productGroups,
    productBrands,
    addProductCategory,
    updateProductCategory,
    deleteProductCategory,
    addProductGroup,
    updateProductGroup,
    deleteProductGroup,
    addProductBrand,
    updateProductBrand,
    deleteProductBrand
  } = useAppContext();

  const [activeTab, setActiveTab] = useState('categories');
  const [isRefreshing, setIsRefreshing] = useState(false);

  // State for categories
  const [categoryDialogOpen, setCategoryDialogOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<ProductCategory | null>(null);
  const [categoryName, setCategoryName] = useState('');
  const [categoryDescription, setCategoryDescription] = useState('');
  const [categoryToDelete, setCategoryToDelete] = useState<ProductCategory | null>(null);
  const [deleteCategoryDialogOpen, setDeleteCategoryDialogOpen] = useState(false);
  
  // State for groups
  const [groupDialogOpen, setGroupDialogOpen] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<ProductGroup | null>(null);
  const [groupName, setGroupName] = useState('');
  const [groupDescription, setGroupDescription] = useState('');
  const [groupToDelete, setGroupToDelete] = useState<ProductGroup | null>(null);
  const [deleteGroupDialogOpen, setDeleteGroupDialogOpen] = useState(false);
  
  // State for brands
  const [brandDialogOpen, setBrandDialogOpen] = useState(false);
  const [selectedBrand, setSelectedBrand] = useState<ProductBrand | null>(null);
  const [brandName, setBrandName] = useState('');
  const [brandDescription, setBrandDescription] = useState('');
  const [brandToDelete, setBrandToDelete] = useState<ProductBrand | null>(null);
  const [deleteBrandDialogOpen, setDeleteBrandDialogOpen] = useState(false);

  // Category handlers
  const openAddCategoryDialog = () => {
    setSelectedCategory(null);
    setCategoryName('');
    setCategoryDescription('');
    setCategoryDialogOpen(true);
  };

  const openEditCategoryDialog = (category: ProductCategory) => {
    setSelectedCategory(category);
    setCategoryName(category.name);
    setCategoryDescription(category.description);
    setCategoryDialogOpen(true);
  };

  const openDeleteCategoryDialog = (category: ProductCategory) => {
    setCategoryToDelete(category);
    setDeleteCategoryDialogOpen(true);
  };

  const handleSaveCategory = async () => {
    if (!categoryName.trim()) {
      toast({
        title: "Nome obrigatório",
        description: "Por favor, informe o nome da categoria",
        variant: "destructive"
      });
      return;
    }

    try {
      if (selectedCategory) {
        // Update existing category
        await updateProductCategory(selectedCategory.id, {
          ...selectedCategory,
          name: categoryName,
          description: categoryDescription
        });
        toast({ title: "Categoria atualizada com sucesso" });
      } else {
        // Create new category
        await addProductCategory({
          name: categoryName,
          description: categoryDescription,
          notes: '',
          createdAt: new Date(),
          updatedAt: new Date()
        });
        toast({ title: "Categoria adicionada com sucesso" });
      }
      setCategoryDialogOpen(false);
    } catch (error) {
      console.error("Erro ao salvar categoria:", error);
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao salvar a categoria",
        variant: "destructive"
      });
    }
  };

  const handleDeleteCategory = async (categoryId: string) => {
    try {
      // Find the category by ID to get its name
      const categoryToDelete = productCategories.find(c => c.id === categoryId);
      if (categoryToDelete) {
        // Delete all categories with the same name
        await deleteProductCategory(categoryId);
        
        toast({ title: "Categoria excluída com sucesso" });
      }
    } catch (error) {
      console.error("Erro ao excluir categoria:", error);
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao excluir a categoria",
        variant: "destructive"
      });
    }
  };

  // Group handlers
  const openAddGroupDialog = () => {
    setSelectedGroup(null);
    setGroupName('');
    setGroupDescription('');
    setGroupDialogOpen(true);
  };

  const openEditGroupDialog = (group: ProductGroup) => {
    setSelectedGroup(group);
    setGroupName(group.name);
    setGroupDescription(group.description);
    setGroupDialogOpen(true);
  };

  const openDeleteGroupDialog = (group: ProductGroup) => {
    setGroupToDelete(group);
    setDeleteGroupDialogOpen(true);
  };

  const handleSaveGroup = async () => {
    if (!groupName.trim()) {
      toast({
        title: "Nome obrigatório",
        description: "Por favor, informe o nome do grupo",
        variant: "destructive"
      });
      return;
    }

    try {
      if (selectedGroup) {
        // Update existing group
        await updateProductGroup(selectedGroup.id, {
          ...selectedGroup,
          name: groupName,
          description: groupDescription
        });
        toast({ title: "Grupo atualizado com sucesso" });
      } else {
        // Create new group
        await addProductGroup({
          name: groupName,
          description: groupDescription,
          notes: '',
          createdAt: new Date(),
          updatedAt: new Date()
        });
        toast({ title: "Grupo adicionado com sucesso" });
      }
      setGroupDialogOpen(false);
    } catch (error) {
      console.error("Erro ao salvar grupo:", error);
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao salvar o grupo",
        variant: "destructive"
      });
    }
  };

  const handleDeleteGroup = async (groupId: string) => {
    try {
      await deleteProductGroup(groupId);
      toast({ title: "Grupo excluído com sucesso" });
    } catch (error) {
      console.error("Erro ao excluir grupo:", error);
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao excluir o grupo",
        variant: "destructive"
      });
    }
  };

  // Brand handlers
  const openAddBrandDialog = () => {
    setSelectedBrand(null);
    setBrandName('');
    setBrandDescription('');
    setBrandDialogOpen(true);
  };

  const openEditBrandDialog = (brand: ProductBrand) => {
    setSelectedBrand(brand);
    setBrandName(brand.name);
    setBrandDescription(brand.description);
    setBrandDialogOpen(true);
  };

  const openDeleteBrandDialog = (brand: ProductBrand) => {
    setBrandToDelete(brand);
    setDeleteBrandDialogOpen(true);
  };

  const handleSaveBrand = async () => {
    if (!brandName.trim()) {
      toast({
        title: "Nome obrigatório",
        description: "Por favor, informe o nome da marca",
        variant: "destructive"
      });
      return;
    }

    try {
      if (selectedBrand) {
        // Update existing brand
        await updateProductBrand(selectedBrand.id, {
          ...selectedBrand,
          name: brandName,
          description: brandDescription
        });
        toast({ title: "Marca atualizada com sucesso" });
      } else {
        // Create new brand
        await addProductBrand({
          name: brandName,
          description: brandDescription,
          notes: '',
          createdAt: new Date(),
          updatedAt: new Date()
        });
        toast({ title: "Marca adicionada com sucesso" });
      }
      setBrandDialogOpen(false);
    } catch (error) {
      console.error("Erro ao salvar marca:", error);
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao salvar a marca",
        variant: "destructive"
      });
    }
  };

  const handleDeleteBrand = async (brandId: string) => {
    try {
      await deleteProductBrand(brandId);
      toast({ title: "Marca excluída com sucesso" });
    } catch (error) {
      console.error("Erro ao excluir marca:", error);
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao excluir a marca",
        variant: "destructive"
      });
    }
  };
  
  // Clean up duplicates manually
  const handleCleanupDuplicates = async () => {
    try {
      setIsRefreshing(true);
      toast({
        title: "Limpando duplicatas",
        description: "Aguarde enquanto removemos registros duplicados..."
      });
      
      await cleanupUtils.cleanupAllProductClassifications();
      
      // Force a page reload to refresh all data
      window.location.reload();
    } catch (error) {
      console.error("Error cleaning up duplicates:", error);
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao limpar duplicatas",
        variant: "destructive"
      });
      setIsRefreshing(false);
    }
  };

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
        
        <Button 
          variant="outline" 
          size="sm"
          onClick={handleCleanupDuplicates}
          disabled={isRefreshing}
        >
          <RefreshCw className={`mr-2 h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          Limpar Duplicatas
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
          <Tabs defaultValue="categories" value={activeTab} onValueChange={setActiveTab}>
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
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Descrição</TableHead>
                    <TableHead className="w-[100px] text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {productCategories.map((category) => (
                    <TableRow key={category.id}>
                      <TableCell className="font-medium">{category.name}</TableCell>
                      <TableCell>{category.description}</TableCell>
                      <TableCell className="text-right">
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => openEditCategoryDialog(category)}
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Editar</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => openDeleteCategoryDialog(category)}
                              >
                                <Trash className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Excluir</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
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
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Descrição</TableHead>
                    <TableHead className="w-[100px] text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {productGroups.map((group) => (
                    <TableRow key={group.id}>
                      <TableCell className="font-medium">{group.name}</TableCell>
                      <TableCell>{group.description}</TableCell>
                      <TableCell className="text-right">
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => openEditGroupDialog(group)}
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Editar</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => openDeleteGroupDialog(group)}
                              >
                                <Trash className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Excluir</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
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
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Descrição</TableHead>
                    <TableHead className="w-[100px] text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {productBrands.map((brand) => (
                    <TableRow key={brand.id}>
                      <TableCell className="font-medium">{brand.name}</TableCell>
                      <TableCell>{brand.description}</TableCell>
                      <TableCell className="text-right">
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => openEditBrandDialog(brand)}
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Editar</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => openDeleteBrandDialog(brand)}
                              >
                                <Trash className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Excluir</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Category Dialog */}
      <Dialog open={categoryDialogOpen} onOpenChange={setCategoryDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selectedCategory ? 'Editar' : 'Nova'} Categoria</DialogTitle>
            <DialogDescription>
              {selectedCategory
                ? 'Altere os dados da categoria selecionada'
                : 'Preencha os dados para criar uma nova categoria'}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="categoryName" className="text-right">
                Nome
              </Label>
              <Input
                id="categoryName"
                value={categoryName}
                onChange={(e) => setCategoryName(e.target.value)}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="categoryDescription" className="text-right">
                Descrição
              </Label>
              <Textarea
                id="categoryDescription"
                value={categoryDescription}
                onChange={(e) => setCategoryDescription(e.target.value)}
                className="col-span-3"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCategoryDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSaveCategory}>Salvar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Group Dialog */}
      <Dialog open={groupDialogOpen} onOpenChange={setGroupDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selectedGroup ? 'Editar' : 'Novo'} Grupo</DialogTitle>
            <DialogDescription>
              {selectedGroup
                ? 'Altere os dados do grupo selecionado'
                : 'Preencha os dados para criar um novo grupo'}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="groupName" className="text-right">
                Nome
              </Label>
              <Input
                id="groupName"
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="groupDescription" className="text-right">
                Descrição
              </Label>
              <Textarea
                id="groupDescription"
                value={groupDescription}
                onChange={(e) => setGroupDescription(e.target.value)}
                className="col-span-3"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setGroupDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSaveGroup}>Salvar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Brand Dialog */}
      <Dialog open={brandDialogOpen} onOpenChange={setBrandDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selectedBrand ? 'Editar' : 'Nova'} Marca</DialogTitle>
            <DialogDescription>
              {selectedBrand
                ? 'Altere os dados da marca selecionada'
                : 'Preencha os dados para criar uma nova marca'}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="brandName" className="text-right">
                Nome
              </Label>
              <Input
                id="brandName"
                value={brandName}
                onChange={(e) => setBrandName(e.target.value)}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="brandDescription" className="text-right">
                Descrição
              </Label>
              <Textarea
                id="brandDescription"
                value={brandDescription}
                onChange={(e) => setBrandDescription(e.target.value)}
                className="col-span-3"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setBrandDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSaveBrand}>Salvar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Delete Dialogs */}
      <DeleteCategoryDialog
        category={categoryToDelete}
        open={deleteCategoryDialogOpen}
        onOpenChange={setDeleteCategoryDialogOpen}
        onConfirm={handleDeleteCategory}
      />
      
      <DeleteGroupDialog
        group={groupToDelete}
        open={deleteGroupDialogOpen}
        onOpenChange={setDeleteGroupDialogOpen}
        onConfirm={handleDeleteGroup}
      />
      
      <DeleteBrandDialog
        brand={brandToDelete}
        open={deleteBrandDialogOpen}
        onOpenChange={setDeleteBrandDialogOpen}
        onConfirm={handleDeleteBrand}
      />
    </PageLayout>
  );
}
