
// I need to fix the SelectItem components in the Products.tsx file
// Since it's a large file, I'll only update the relevant parts

import React, { useState, useEffect } from 'react';
import { useAppContext } from '@/hooks/useAppContext';
import PageLayout from '@/components/layout/PageLayout';
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
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Plus, Search, Edit, Trash } from 'lucide-react';
import { Product } from '@/types';
import { toast } from '@/components/ui/use-toast';

interface FormErrors {
  code?: string;
  name?: string;
  price?: string;
  stock?: string;
}

export default function Products() {
  const { products, addProduct, updateProduct, deleteProduct, productCategories } = useAppContext();
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product>({
    id: '',
    code: 0,
    name: '',
    description: '',
    price: 0,
    cost: 0,
    stock: 0,
    minStock: 0,
    createdAt: new Date(),
    updatedAt: new Date()
  });
  const [formData, setFormData] = useState({
    code: 0,
    name: '',
    description: '',
    price: 0,
    unit: '',
    stock: 0,
    minStock: 0,
    category: '',
    costPrice: 0,
    maxDiscountPercentage: 0
  });
  const [formErrors, setFormErrors] = useState<FormErrors>({});

  const filterProducts = () => {
    return products.filter(product => {
      const nameMatch = product.name.toLowerCase().includes(search.toLowerCase());
      const codeMatch = product.code.toString().includes(search);
      const categoryMatch = selectedCategory ? (product.categoryId === selectedCategory) : true;
      return (nameMatch || codeMatch) && categoryMatch;
    });
  };

  const validateForm = (): boolean => {
    let errors: FormErrors = {};
    if (!formData.code) {
      errors.code = 'Código é obrigatório';
    }
    if (!formData.name) {
      errors.name = 'Nome é obrigatório';
    }
    if (!formData.price) {
      errors.price = 'Preço é obrigatório';
    }
    if (!formData.stock) {
      errors.stock = 'Estoque é obrigatório';
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleAddProduct = async () => {
    if (validateForm()) {
      try {
        const newProduct = {
          code: Number(formData.code),
          name: formData.name,
          description: formData.description,
          price: Number(formData.price),
          unit: formData.unit,
          stock: Number(formData.stock),
          minStock: Number(formData.minStock || 0),
          categoryId: formData.category, // Use categoryId instead of category
          cost: Number(formData.costPrice || 0), // Use cost instead of costPrice
          maxDiscountPercentage: Number(formData.maxDiscountPercentage || 0),
          createdAt: new Date(),
          updatedAt: new Date()
        };
        
        await addProduct(newProduct);
        setIsAddDialogOpen(false);
      } catch (error) {
        console.error("Error adding product:", error);
      }
    }
  };

  const handleUpdateProduct = async () => {
    if (validateForm()) {
      try {
        await updateProduct(editingProduct.id, {
          code: Number(formData.code),
          name: formData.name,
          description: formData.description,
          price: Number(formData.price),
          unit: formData.unit,
          stock: Number(formData.stock),
          minStock: Number(formData.minStock || 0),
          categoryId: formData.category, // Use categoryId instead of category
          cost: Number(formData.costPrice || 0), // Use cost instead of costPrice
          maxDiscountPercentage: Number(formData.maxDiscountPercentage || 0),
          updatedAt: new Date()
        });
        setIsEditDialogOpen(false);
      } catch (error) {
        console.error("Error updating product:", error);
      }
    }
  };

  const handleDeleteProduct = async () => {
    try {
      await deleteProduct(editingProduct.id);
      setIsDeleteDialogOpen(false);
    } catch (error) {
      console.error("Error deleting product:", error);
    }
  };

  const handleOpenAddDialog = () => {
    setFormData({
      code: 0,
      name: '',
      description: '',
      price: 0,
      unit: '',
      stock: 0,
      minStock: 0,
      category: '',
      costPrice: 0,
      maxDiscountPercentage: 0
    });
    setFormErrors({});
    setIsAddDialogOpen(true);
  };

  const handleOpenEditDialog = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      code: product.code,
      name: product.name,
      description: product.description,
      price: product.price,
      unit: product.unit || '',
      stock: product.stock,
      minStock: product.minStock || 0,
      category: product.categoryId || '',
      costPrice: product.cost || 0,
      maxDiscountPercentage: product.maxDiscountPercentage || 0
    });
    setFormErrors({});
    setIsEditDialogOpen(true);
  };

  const handleOpenDeleteDialog = (product: Product) => {
    setEditingProduct(product);
    setIsDeleteDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsAddDialogOpen(false);
    setIsEditDialogOpen(false);
    setIsDeleteDialogOpen(false);
    setFormErrors({});
  };

  const renderCategoryName = (product: Product) => {
    if (!product.categoryId) return "-";
    const category = productCategories.find(c => c.id === product.categoryId);
    return category ? category.name : "-";
  };

  const renderCostPrice = (product: Product) => {
    return formatCurrency(product.cost); // Use cost instead of costPrice
  };

  const formatCurrency = (value: number | undefined) => {
    if (value === undefined || value === null) return 'R$ 0,00';
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  return (
    <PageLayout title="Produtos">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Lista de Produtos</CardTitle>
              <CardDescription>
                Gerencie seus produtos
              </CardDescription>
            </div>
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-sales-800 hover:bg-sales-700" onClick={handleOpenAddDialog}>
                  <Plus size={16} className="mr-2" /> Novo Produto
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Adicionar Produto</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="new-code">Código</Label>
                    <Input
                      id="new-code"
                      type="number"
                      value={formData.code}
                      onChange={(e) => setFormData({ ...formData, code: Number(e.target.value) })}
                    />
                    {formErrors.code && <p className="text-red-500 text-sm">{formErrors.code}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="new-name">Nome</Label>
                    <Input
                      id="new-name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    />
                    {formErrors.name && <p className="text-red-500 text-sm">{formErrors.name}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="new-description">Descrição</Label>
                    <Input
                      id="new-description"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="new-price">Preço</Label>
                    <Input
                      id="new-price"
                      type="number"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                    />
                    {formErrors.price && <p className="text-red-500 text-sm">{formErrors.price}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="new-unit">Unidade</Label>
                    <Input
                      id="new-unit"
                      value={formData.unit}
                      onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="new-stock">Estoque</Label>
                    <Input
                      id="new-stock"
                      type="number"
                      value={formData.stock}
                      onChange={(e) => setFormData({ ...formData, stock: Number(e.target.value) })}
                    />
                    {formErrors.stock && <p className="text-red-500 text-sm">{formErrors.stock}</p>}
                  </div>
                   <div className="space-y-2">
                    <Label htmlFor="new-minStock">Estoque Mínimo</Label>
                    <Input
                      id="new-minStock"
                      type="number"
                      value={formData.minStock}
                      onChange={(e) => setFormData({ ...formData, minStock: Number(e.target.value) })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="new-category">Categoria</Label>
                    <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione uma categoria" />
                      </SelectTrigger>
                      <SelectContent>
                        {productCategories.map(category => (
                          <SelectItem key={category.id} value={category.id}>{category.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="new-costPrice">Preço de Custo</Label>
                    <Input
                      id="new-costPrice"
                      type="number"
                      value={formData.costPrice}
                      onChange={(e) => setFormData({ ...formData, costPrice: Number(e.target.value) })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="new-maxDiscountPercentage">Máximo % de Desconto</Label>
                    <Input
                      id="new-maxDiscountPercentage"
                      type="number"
                      value={formData.maxDiscountPercentage}
                      onChange={(e) => setFormData({ ...formData, maxDiscountPercentage: Number(e.target.value) })}
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={handleCloseDialog}>
                    Cancelar
                  </Button>
                  <Button type="submit" className="bg-sales-800 hover:bg-sales-700" onClick={handleAddProduct}>
                    Adicionar
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" size={18} />
              <Input
                placeholder="Buscar produtos..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="mt-2">
              <Label htmlFor="category-filter">Filtrar por Categoria:</Label>
              <Select onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Todas as Categorias" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all-categories">Todas as Categorias</SelectItem>
                  {productCategories.map(category => (
                    <SelectItem key={category.id} value={category.id}>{category.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="relative overflow-x-auto rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Código</TableHead>
                  <TableHead>Nome</TableHead>
                  <TableHead>Categoria</TableHead>
                  <TableHead>Preço</TableHead>
                  <TableHead>Estoque</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filterProducts().map((product) => (
                  <TableRow key={product.id}>
                    <TableCell className="font-medium">{product.code}</TableCell>
                    <TableCell>{product.name}</TableCell>
                    <TableCell>{renderCategoryName(product)}</TableCell>
                    <TableCell>{formatCurrency(product.price)}</TableCell>
                    <TableCell>{product.stock}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleOpenEditDialog(product)}
                        >
                          <Edit size={16} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleOpenDeleteDialog(product)}
                        >
                          <Trash size={16} />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Edit Product Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Editar Produto</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-code">Código</Label>
              <Input
                id="edit-code"
                type="number"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: Number(e.target.value) })}
              />
              {formErrors.code && <p className="text-red-500 text-sm">{formErrors.code}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-name">Nome</Label>
              <Input
                id="edit-name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
              {formErrors.name && <p className="text-red-500 text-sm">{formErrors.name}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-description">Descrição</Label>
              <Input
                id="edit-description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-price">Preço</Label>
              <Input
                id="edit-price"
                type="number"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
              />
              {formErrors.price && <p className="text-red-500 text-sm">{formErrors.price}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-unit">Unidade</Label>
              <Input
                id="edit-unit"
                value={formData.unit}
                onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-stock">Estoque</Label>
              <Input
                id="edit-stock"
                type="number"
                value={formData.stock}
                onChange={(e) => setFormData({ ...formData, stock: Number(e.target.value) })}
              />
              {formErrors.stock && <p className="text-red-500 text-sm">{formErrors.stock}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-minStock">Estoque Mínimo</Label>
              <Input
                id="edit-minStock"
                type="number"
                value={formData.minStock}
                onChange={(e) => setFormData({ ...formData, minStock: Number(e.target.value) })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-category">Categoria</Label>
              <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione uma categoria" />
                </SelectTrigger>
                <SelectContent>
                  {productCategories.map(category => (
                    <SelectItem key={category.id} value={category.id}>{category.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-costPrice">Preço de Custo</Label>
              <Input
                id="edit-costPrice"
                type="number"
                value={formData.costPrice}
                onChange={(e) => setFormData({ ...formData, costPrice: Number(e.target.value) })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-maxDiscountPercentage">Máximo % de Desconto</Label>
              <Input
                id="edit-maxDiscountPercentage"
                type="number"
                value={formData.maxDiscountPercentage}
                onChange={(e) => setFormData({ ...formData, maxDiscountPercentage: Number(e.target.value) })}
              />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={handleCloseDialog}>
              Cancelar
            </Button>
            <Button type="submit" className="bg-sales-800 hover:bg-sales-700" onClick={handleUpdateProduct}>
              Atualizar
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Product Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmação de exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir o produto {editingProduct.name}? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleCloseDialog}>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteProduct} className="bg-red-600 hover:bg-red-700">
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </PageLayout>
  );
}
