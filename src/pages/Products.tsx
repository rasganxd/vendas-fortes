
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
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import { Plus, Search, Edit, Trash, Check } from 'lucide-react';
import { Product } from '@/types';
import { formatCurrency } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/components/ui/use-toast';

interface FormErrors {
  code?: string;
  name?: string;
  stock?: string;
  costPrice?: string;
}

export default function Products() {
  const { products, addProduct, updateProduct, deleteProduct, productCategories } = useAppContext();
  const [search, setSearch] = useState('');
  const [pricingSearch, setPricingSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [pricingCategory, setPricingCategory] = useState('');
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
    unit: '',
    stock: 0,
    minStock: 0,
    category: '',
    costPrice: 0,
  });
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [editPrice, setEditPrice] = useState<{id: string, price: number} | null>(null);
  const [editDiscount, setEditDiscount] = useState<{id: string, discount: number} | null>(null);

  // Define current tab state
  const [currentTab, setCurrentTab] = useState('list');

  const filterProducts = () => {
    return products.filter(product => {
      const nameMatch = product.name.toLowerCase().includes(search.toLowerCase());
      const codeMatch = product.code.toString().includes(search);
      const categoryMatch = selectedCategory ? (product.categoryId === selectedCategory) : true;
      return (nameMatch || codeMatch) && categoryMatch;
    });
  };

  const filterPricingProducts = () => {
    return products.filter(product => {
      const nameMatch = product.name.toLowerCase().includes(pricingSearch.toLowerCase());
      const codeMatch = product.code.toString().includes(pricingSearch);
      const categoryMatch = pricingCategory ? (product.categoryId === pricingCategory) : true;
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
    if (formData.stock === undefined || formData.stock === null) {
      errors.stock = 'Estoque é obrigatório';
    }
    if (!formData.costPrice) {
      errors.costPrice = 'Preço de custo é obrigatório';
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
          price: 0, // Price will be set in pricing tab
          unit: formData.unit,
          stock: Number(formData.stock),
          minStock: Number(formData.minStock || 0),
          categoryId: formData.category,
          cost: Number(formData.costPrice || 0),
          maxDiscountPercentage: 0, // Will be set in pricing tab
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
          unit: formData.unit,
          stock: Number(formData.stock),
          minStock: Number(formData.minStock || 0),
          categoryId: formData.category,
          cost: Number(formData.costPrice || 0),
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
      unit: '',
      stock: 0,
      minStock: 0,
      category: '',
      costPrice: 0,
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
      unit: product.unit || '',
      stock: product.stock,
      minStock: product.minStock || 0,
      category: product.categoryId || '',
      costPrice: product.cost || 0,
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

  const handleUpdatePrice = async (product: Product, newPrice: number) => {
    try {
      await updateProduct(product.id, {
        price: newPrice,
        updatedAt: new Date()
      });
      setEditPrice(null);
      toast({
        title: "Preço atualizado",
        description: `O preço de ${product.name} foi atualizado com sucesso.`
      });
    } catch (error) {
      console.error("Error updating price:", error);
      toast({
        title: "Erro na atualização",
        description: "Não foi possível atualizar o preço.",
        variant: "destructive"
      });
    }
  };

  const handleUpdateDiscount = async (product: Product, newDiscount: number) => {
    try {
      await updateProduct(product.id, {
        maxDiscountPercentage: newDiscount,
        updatedAt: new Date()
      });
      setEditDiscount(null);
      toast({
        title: "Desconto máximo atualizado",
        description: `O desconto máximo de ${product.name} foi atualizado com sucesso.`
      });
    } catch (error) {
      console.error("Error updating discount:", error);
      toast({
        title: "Erro na atualização",
        description: "Não foi possível atualizar o desconto máximo.",
        variant: "destructive"
      });
    }
  };

  // Calculate profit margin
  const calculateProfitMargin = (price: number, cost: number): number => {
    if (!price || !cost || cost === 0) return 0;
    return ((price - cost) / price) * 100;
  };

  // Calculate minimum price based on discount
  const calculateMinPrice = (price: number, maxDiscount: number): number => {
    if (!price || maxDiscount === undefined || maxDiscount === null) return 0;
    return price * (1 - (maxDiscount / 100));
  };

  // Get margin color based on percentage
  const getMarginColor = (margin: number): string => {
    if (margin < 15) return "bg-red-100 text-red-800 border-red-300";
    if (margin < 30) return "bg-yellow-100 text-yellow-800 border-yellow-300";
    return "bg-green-100 text-green-800 border-green-300";
  };

  return (
    <PageLayout title="Produtos">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Produtos</CardTitle>
              <CardDescription>
                Gerencie seu catálogo de produtos
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs 
            defaultValue="list" 
            value={currentTab}
            onValueChange={setCurrentTab}
            className="w-full"
          >
            <TabsList className="mb-4">
              <TabsTrigger value="list">Lista</TabsTrigger>
              <TabsTrigger value="pricing">Precificação</TabsTrigger>
            </TabsList>
            
            {/* Lista de Produtos Tab */}
            <TabsContent value="list" className="space-y-4">
              <div className="flex justify-between items-center">
                <div className="space-y-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" size={18} />
                    <Input
                      placeholder="Buscar produtos..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      className="pl-10 w-[300px]"
                    />
                  </div>
                  <div>
                    <Label htmlFor="category-filter">Filtrar por Categoria:</Label>
                    <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Todas as Categorias" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">Todas as Categorias</SelectItem>
                        {productCategories.map(category => (
                          <SelectItem key={category.id} value={category.id}>{category.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
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
                        <Label htmlFor="new-costPrice">Preço de Custo</Label>
                        <Input
                          id="new-costPrice"
                          type="number"
                          value={formData.costPrice}
                          onChange={(e) => setFormData({ ...formData, costPrice: Number(e.target.value) })}
                        />
                        {formErrors.costPrice && <p className="text-red-500 text-sm">{formErrors.costPrice}</p>}
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

              <div className="relative overflow-x-auto rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Código</TableHead>
                      <TableHead>Nome</TableHead>
                      <TableHead>Categoria</TableHead>
                      <TableHead>Preço de Custo</TableHead>
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
                        <TableCell>{formatCurrency(product.cost)}</TableCell>
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
            </TabsContent>
            
            {/* Precificação Tab */}
            <TabsContent value="pricing" className="space-y-4">
              <div className="flex justify-between items-center">
                <div className="space-y-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" size={18} />
                    <Input
                      placeholder="Buscar produtos..."
                      value={pricingSearch}
                      onChange={(e) => setPricingSearch(e.target.value)}
                      className="pl-10 w-[300px]"
                    />
                  </div>
                  <div>
                    <Label htmlFor="pricing-category-filter">Filtrar por Categoria:</Label>
                    <Select value={pricingCategory} onValueChange={setPricingCategory}>
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Todas as Categorias" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">Todas as Categorias</SelectItem>
                        {productCategories.map(category => (
                          <SelectItem key={category.id} value={category.id}>{category.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
              
              <div className="relative overflow-x-auto rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Código</TableHead>
                      <TableHead>Nome</TableHead>
                      <TableHead>Custo</TableHead>
                      <TableHead>Preço de Venda</TableHead>
                      <TableHead>Margem (%)</TableHead>
                      <TableHead>Desconto Máx.(%)</TableHead>
                      <TableHead>Preço Mínimo</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filterPricingProducts().map((product) => {
                      const margin = calculateProfitMargin(product.price, product.cost);
                      const minPrice = calculateMinPrice(product.price, product.maxDiscountPercentage || 0);
                      return (
                        <TableRow key={product.id}>
                          <TableCell className="font-medium">{product.code}</TableCell>
                          <TableCell>{product.name}</TableCell>
                          <TableCell>{formatCurrency(product.cost)}</TableCell>
                          <TableCell>
                            {editPrice && editPrice.id === product.id ? (
                              <div className="flex">
                                <Input 
                                  type="number" 
                                  value={editPrice.price} 
                                  onChange={(e) => setEditPrice({
                                    ...editPrice, 
                                    price: parseFloat(e.target.value)
                                  })} 
                                  className="w-24 h-8 mr-2" 
                                />
                                <Button 
                                  size="sm" 
                                  variant="ghost"
                                  onClick={() => handleUpdatePrice(product, editPrice.price)}
                                  className="h-8 p-1"
                                >
                                  <Check size={16} />
                                </Button>
                              </div>
                            ) : (
                              <div 
                                className="cursor-pointer hover:bg-gray-100 px-2 py-1 rounded"
                                onClick={() => setEditPrice({id: product.id, price: product.price})}
                              >
                                {formatCurrency(product.price)}
                              </div>
                            )}
                          </TableCell>
                          <TableCell>
                            <Badge className={getMarginColor(margin)}>
                              {margin.toFixed(1)}%
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {editDiscount && editDiscount.id === product.id ? (
                              <div className="flex">
                                <Input 
                                  type="number" 
                                  value={editDiscount.discount} 
                                  onChange={(e) => setEditDiscount({
                                    ...editDiscount, 
                                    discount: parseFloat(e.target.value)
                                  })} 
                                  className="w-24 h-8 mr-2" 
                                />
                                <Button 
                                  size="sm" 
                                  variant="ghost"
                                  onClick={() => handleUpdateDiscount(product, editDiscount.discount)}
                                  className="h-8 p-1"
                                >
                                  <Check size={16} />
                                </Button>
                              </div>
                            ) : (
                              <div 
                                className="cursor-pointer hover:bg-gray-100 px-2 py-1 rounded"
                                onClick={() => setEditDiscount({id: product.id, discount: product.maxDiscountPercentage || 0})}
                              >
                                {product.maxDiscountPercentage?.toFixed(1) || 0}%
                              </div>
                            )}
                          </TableCell>
                          <TableCell>{formatCurrency(minPrice)}</TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>
          </Tabs>
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
              <Label htmlFor="edit-costPrice">Preço de Custo</Label>
              <Input
                id="edit-costPrice"
                type="number"
                value={formData.costPrice}
                onChange={(e) => setFormData({ ...formData, costPrice: Number(e.target.value) })}
              />
              {formErrors.costPrice && <p className="text-red-500 text-sm">{formErrors.costPrice}</p>}
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
