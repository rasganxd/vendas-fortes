import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { TabsList, TabsTrigger, TabsContent, Tabs } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Check, X, Plus, FileSpreadsheet, Download, Search } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from '@/components/ui/use-toast';
import { useAppContext } from '@/hooks/useAppContext';
import BulkProductUpload from '@/components/products/BulkProductUpload';
import { formatCurrency } from '@/lib/format-utils';
import { Product } from '@/types';

const Products = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { 
    products, 
    addProduct, 
    updateProduct, 
    deleteProduct, 
    productCategories, 
    isLoadingProducts, 
    isLoadingProductCategories 
  } = useAppContext();

  // State
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isBulkUploadOpen, setIsBulkUploadOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  
  // Form state
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [cost, setCost] = useState('');
  const [displayCost, setDisplayCost] = useState('');
  const [stock, setStock] = useState('');
  const [unit, setUnit] = useState('un'); // Default to unit
  const [categoryId, setCategoryId] = useState('');
  
  // List filtering
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  
  // Pricing tab
  const [pricingSearch, setPricingSearch] = useState('');
  const [pricingCategory, setPricingCategory] = useState<string>('todas');

  // On mount, get next available product code
  useEffect(() => {
    if (products.length > 0) {
      const maxCode = Math.max(...products.map(product => product.code || 0));
      setCode((maxCode + 1).toString());
    } else {
      setCode('1');
    }
  }, [products]);

  // Helper function to format currency input
  const formatCurrencyInput = (value: string): number => {
    // Remove all non-numeric characters
    const numericValue = value.replace(/[^\d]/g, '');
    // Convert to number and divide by 100 to get decimal value
    return parseFloat(numericValue || '0') / 100;
  };

  // Handle cost price change
  const handleCostPriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newCostPrice = formatCurrencyInput(e.target.value);
    setCost(newCostPrice.toString());
    setDisplayCost(newCostPrice.toLocaleString('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }));
  };

  const filterProducts = () => {
    return products.filter(product => {
      const nameMatch = product.name.toLowerCase().includes(search.toLowerCase());
      const codeMatch = product.code.toString().includes(search);
      const categoryMatch = selectedCategory ? (selectedCategory === "all" ? true : product.categoryId === selectedCategory) : true;
      return (nameMatch || codeMatch) && categoryMatch;
    });
  };

  const filterPricingProducts = () => {
    return products.filter(product => {
      const nameMatch = product.name.toLowerCase().includes(pricingSearch.toLowerCase());
      const codeMatch = product.code.toString().includes(pricingSearch);
      const categoryMatch = pricingCategory ? (pricingCategory === "todas" ? true : product.categoryId === pricingCategory) : true;
      return (nameMatch || codeMatch) && categoryMatch;
    });
  };

  const resetForm = () => {
    // Get next available product code
    if (products.length > 0) {
      const maxCode = Math.max(...products.map(product => product.code || 0));
      setCode((maxCode + 1).toString());
    } else {
      setCode('1');
    }
    setName('');
    setCost('');
    setDisplayCost('');
    setStock('');
    setUnit('un');
    setCategoryId('');
  };

  const handleAddProduct = async () => {
    if (!name) {
      toast({
        title: "Campo obrigatório",
        description: "Nome do produto não pode estar vazio",
        variant: "destructive"
      });
      return;
    }

    const currentDate = new Date();
    const costValue = parseFloat(cost) || 0;
    
    try {
      await addProduct({
        code: parseInt(code, 10),
        name,
        description: '', // Campo removido
        price: costValue * 1.5, // Definir preço de venda com markup padrão
        unit,
        stock: parseInt(stock, 10) || 0,
        minStock: 0, // Default to 0
        categoryId,
        cost: costValue,
        maxDiscountPercentage: 0, // Campo removido, valor padrão
        createdAt: currentDate,
        updatedAt: currentDate
      });
      
      setIsAddDialogOpen(false);
      resetForm();
      
    } catch (error) {
      console.error("Error adding product:", error);
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao adicionar o produto",
        variant: "destructive"
      });
    }
  };

  const handleEditProduct = async () => {
    if (!selectedProduct) return;
    
    try {
      const costValue = parseFloat(cost) || 0;
      
      await updateProduct(selectedProduct.id, {
        code: parseInt(code, 10),
        name,
        description: selectedProduct.description || '',
        price: costValue * 1.5, // Atualizar preço de venda com base no custo
        unit,
        stock: parseInt(stock, 10) || 0,
        minStock: 0, // Set default value
        categoryId,
        cost: costValue,
        maxDiscountPercentage: selectedProduct.maxDiscountPercentage || 0,
        updatedAt: new Date()
      });
      
      setIsEditDialogOpen(false);
      setSelectedProduct(null);
      
    } catch (error) {
      console.error("Error updating product:", error);
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao atualizar o produto",
        variant: "destructive"
      });
    }
  };

  const handleDeleteProduct = async () => {
    if (!selectedProduct) return;
    
    try {
      await deleteProduct(selectedProduct.id);
      setIsDeleteDialogOpen(false);
      setSelectedProduct(null);
      
    } catch (error) {
      console.error("Error deleting product:", error);
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao excluir o produto",
        variant: "destructive"
      });
    }
  };

  const handleEditClick = (product: Product) => {
    setSelectedProduct(product);
    setCode(product.code.toString());
    setName(product.name);
    setDescription(product.description || '');
    setPrice(product.price.toString());
    setCost((product.cost || 0).toString());
    setStock((product.stock || 0).toString());
    setUnit(product.unit || 'un');
    setCategoryId(product.categoryId || '');
    setMaxDiscountPercentage((product.maxDiscountPercentage || '').toString());
    setIsEditDialogOpen(true);
  };

  const handleDeleteClick = (product: Product) => {
    setSelectedProduct(product);
    setIsDeleteDialogOpen(true);
  };

  // Filter products based on search and category
  const filteredProducts = filterProducts();
  const filteredPricingProducts = filterPricingProducts();

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Produtos</h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setIsBulkUploadOpen(true)}>
            <FileSpreadsheet className="mr-2 h-4 w-4" />
            Importar Produtos
          </Button>
          <Button onClick={() => {
            resetForm();
            setIsAddDialogOpen(true);
          }}>
            <Plus className="mr-2 h-4 w-4" />
            Adicionar Produto
          </Button>
        </div>
      </div>

      <Tabs defaultValue="products">
        <TabsList className="mb-4">
          <TabsTrigger value="products">Produtos</TabsTrigger>
          <TabsTrigger value="pricing">Precificação</TabsTrigger>
        </TabsList>
        
        <TabsContent value="products">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Lista de Produtos</CardTitle>
                <div className="flex gap-2 items-center">
                  <div className="relative w-64">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Buscar produtos..."
                      className="pl-8"
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                    />
                  </div>
                  <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="Categoria" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todas Categorias</SelectItem>
                      {productCategories.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Código</TableHead>
                    <TableHead>Nome</TableHead>
                    <TableHead>Categoria</TableHead>
                    <TableHead className="text-right">Estoque</TableHead>
                    <TableHead className="text-right">Preço</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredProducts.length > 0 ? (
                    filteredProducts.map((product) => (
                      <TableRow key={product.id}>
                        <TableCell>{product.code}</TableCell>
                        <TableCell>{product.name}</TableCell>
                        <TableCell>
                          {productCategories.find(c => c.id === product.categoryId)?.name || '-'}
                        </TableCell>
                        <TableCell className="text-right">{product.stock || 0}</TableCell>
                        <TableCell className="text-right">{formatCurrency(product.price)}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEditClick(product)}
                            >
                              Editar
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-red-500 hover:text-red-700"
                              onClick={() => handleDeleteClick(product)}
                            >
                              Excluir
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-4">
                        Nenhum produto encontrado
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="pricing">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Tabela de Preços</CardTitle>
                <div className="flex gap-2 items-center">
                  <div className="relative w-64">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Buscar produtos..."
                      className="pl-8"
                      value={pricingSearch}
                      onChange={(e) => setPricingSearch(e.target.value)}
                    />
                  </div>
                  <Select value={pricingCategory} onValueChange={setPricingCategory}>
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="Categoria" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="todas">Todas Categorias</SelectItem>
                      {productCategories.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button variant="outline">
                    <Download className="mr-2 h-4 w-4" />
                    Exportar
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Código</TableHead>
                    <TableHead>Nome</TableHead>
                    <TableHead>Categoria</TableHead>
                    <TableHead className="text-right">Custo</TableHead>
                    <TableHead className="text-right">Preço</TableHead>
                    <TableHead className="text-right">Margem</TableHead>
                    <TableHead className="text-right">Desc. Máx.</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPricingProducts.length > 0 ? (
                    filteredPricingProducts.map((product) => {
                      const margin = product.cost && product.cost > 0 
                        ? ((product.price - product.cost) / product.price * 100).toFixed(1) 
                        : '-';
                      return (
                        <TableRow key={product.id}>
                          <TableCell>{product.code}</TableCell>
                          <TableCell>{product.name}</TableCell>
                          <TableCell>
                            {productCategories.find(c => c.id === product.categoryId)?.name || '-'}
                          </TableCell>
                          <TableCell className="text-right">{formatCurrency(product.cost || 0)}</TableCell>
                          <TableCell className="text-right">{formatCurrency(product.price)}</TableCell>
                          <TableCell className="text-right">
                            {margin !== '-' ? `${margin}%` : '-'}
                          </TableCell>
                          <TableCell className="text-right">
                            {product.maxDiscountPercentage ? `${product.maxDiscountPercentage}%` : '-'}
                          </TableCell>
                        </TableRow>
                      );
                    })
                  ) : (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-4">
                        Nenhum produto encontrado
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Add Product Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Adicionar Produto</DialogTitle>
            <DialogDescription>
              Preencha os campos abaixo para adicionar um novo produto ao catálogo.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="code">Código</Label>
                <Input
                  id="code"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  disabled
                />
              </div>
              <div>
                <Label htmlFor="category">Categoria</Label>
                <Select value={categoryId} onValueChange={setCategoryId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione uma categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    {productCategories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div>
              <Label htmlFor="name">Nome do Produto</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            
            <div>
              <Label htmlFor="cost">Custo (R$)</Label>
              <Input
                id="cost"
                value={displayCost}
                onChange={handleCostPriceChange}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="stock">Estoque</Label>
                <Input
                  id="stock"
                  type="number"
                  min="0"
                  value={stock}
                  onChange={(e) => setStock(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="unit">Unidade</Label>
                <Select value={unit} onValueChange={setUnit}>
                  <SelectTrigger>
                    <SelectValue placeholder="Unidade" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="un">Unidade (un)</SelectItem>
                    <SelectItem value="kg">Quilograma (kg)</SelectItem>
                    <SelectItem value="g">Grama (g)</SelectItem>
                    <SelectItem value="l">Litro (l)</SelectItem>
                    <SelectItem value="ml">Mililitro (ml)</SelectItem>
                    <SelectItem value="cx">Caixa (cx)</SelectItem>
                    <SelectItem value="pct">Pacote (pct)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>Cancelar</Button>
            <Button onClick={handleAddProduct}>Adicionar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Product Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Editar Produto</DialogTitle>
            <DialogDescription>
              Edite as informações do produto selecionado.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-code">Código</Label>
                <Input
                  id="edit-code"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="edit-category">Categoria</Label>
                <Select value={categoryId} onValueChange={setCategoryId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione uma categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    {productCategories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div>
              <Label htmlFor="edit-name">Nome do Produto</Label>
              <Input
                id="edit-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            
            <div>
              <Label htmlFor="edit-cost">Custo (R$)</Label>
              <Input
                id="edit-cost"
                value={displayCost}
                onChange={handleCostPriceChange}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-stock">Estoque</Label>
                <Input
                  id="edit-stock"
                  type="number"
                  min="0"
                  value={stock}
                  onChange={(e) => setStock(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="edit-unit">Unidade</Label>
                <Select value={unit} onValueChange={setUnit}>
                  <SelectTrigger>
                    <SelectValue placeholder="Unidade" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="un">Unidade (un)</SelectItem>
                    <SelectItem value="kg">Quilograma (kg)</SelectItem>
                    <SelectItem value="g">Grama (g)</SelectItem>
                    <SelectItem value="l">Litro (l)</SelectItem>
                    <SelectItem value="ml">Mililitro (ml)</SelectItem>
                    <SelectItem value="cx">Caixa (cx)</SelectItem>
                    <SelectItem value="pct">Pacote (pct)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>Cancelar</Button>
            <Button onClick={handleEditProduct}>Salvar Alterações</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Product Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Excluir Produto</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja excluir este produto? Esta ação não pode ser desfeita.
            </DialogDescription>
          </DialogHeader>
          
          {selectedProduct && (
            <div className="py-4">
              <p><strong>Código:</strong> {selectedProduct.code}</p>
              <p><strong>Nome:</strong> {selectedProduct.name}</p>
              <p><strong>Preço:</strong> {formatCurrency(selectedProduct.price)}</p>
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>Cancelar</Button>
            <Button variant="destructive" onClick={handleDeleteProduct}>Excluir</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Bulk Upload Dialog */}
      <BulkProductUpload
        open={isBulkUploadOpen}
        onOpenChange={setIsBulkUploadOpen}
      />
    </div>
  );
};

export default Products;
