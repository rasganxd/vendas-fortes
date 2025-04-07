import { useState } from 'react';
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
import { Textarea } from '@/components/ui/textarea';
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
import { Badge } from '@/components/ui/badge';
import { Plus, Search, Edit, Trash, CloudUpload } from 'lucide-react';
import { Product } from '@/types';
import { toast } from '@/components/ui/use-toast';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function Products() {
  const { products, addProduct, updateProduct, deleteProduct } = useAppContext();
  const [search, setSearch] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [firestoreStatus, setFirestoreStatus] = useState<{ success: boolean; message: string } | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: 0,
    unit: '',
    stock: 0,
    category: ''
  });

  const categories = ['Grãos', 'Mercearia', 'Massas', 'Bebidas', 'Higiene', 'Limpeza', 'Outros'];
  const units = ['kg', 'litro', 'pacote', 'unidade', 'caixa', 'fardo'];

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(search.toLowerCase()) ||
    product.description.toLowerCase().includes(search.toLowerCase()) ||
    product.category.toLowerCase().includes(search.toLowerCase())
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    if (name === 'price' || name === 'stock') {
      setFormData(prev => ({ ...prev, [name]: Number(value) }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setFirestoreStatus(null);
    
    try {
      await addProduct(formData);
      
      setFirestoreStatus({
        success: true,
        message: "Produto salvo com sucesso"
      });
      
      // Resetar o formulário
      setFormData({
        name: '',
        description: '',
        price: 0,
        unit: '',
        stock: 0,
        category: ''
      });
      
      // Fechamos o diálogo após um breve atraso para mostrar o feedback
      setTimeout(() => {
        setIsAddDialogOpen(false);
        setFirestoreStatus(null);
      }, 2000);
    } catch (error) {
      console.error("Erro ao salvar produto:", error);
      setFirestoreStatus({
        success: false,
        message: `Erro ao salvar: ${(error as Error).message}`
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditClick = (product: Product) => {
    setSelectedProduct(product);
    setFormData({
      name: product.name,
      description: product.description,
      price: product.price,
      unit: product.unit,
      stock: product.stock,
      category: product.category
    });
    setIsEditDialogOpen(true);
  };

  const handleEditProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedProduct) {
      setIsSubmitting(true);
      setFirestoreStatus(null);
      
      try {
        await updateProduct(selectedProduct.id, formData);
        setFirestoreStatus({
          success: true,
          message: "Produto atualizado com sucesso"
        });
        
        // Fechamos o diálogo após um breve atraso para mostrar o feedback
        setTimeout(() => {
          setIsEditDialogOpen(false);
          setFirestoreStatus(null);
        }, 2000);
      } catch (error) {
        console.error("Erro ao atualizar produto:", error);
        setFirestoreStatus({
          success: false,
          message: `Erro ao atualizar: ${(error as Error).message}`
        });
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const handleDeleteClick = (product: Product) => {
    setSelectedProduct(product);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteProduct = async () => {
    if (selectedProduct) {
      setIsSubmitting(true);
      
      try {
        await deleteProduct(selectedProduct.id);
        toast({
          title: "Produto excluído",
          description: `Produto ${selectedProduct.name} foi excluído do Firebase com sucesso.`,
        });
      } catch (error) {
        toast({
          title: "Erro ao excluir",
          description: `Erro ao excluir do Firebase: ${(error as Error).message}`,
          variant: "destructive"
        });
      } finally {
        setIsSubmitting(false);
        setIsDeleteDialogOpen(false);
      }
    }
  };

  return (
    <PageLayout title="Produtos">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Catálogo de Produtos</CardTitle>
              <CardDescription>
                Gerencie seu estoque e preços - Integração com Firebase Firestore ativa
              </CardDescription>
            </div>
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-sales-800 hover:bg-sales-700">
                  <Plus size={16} className="mr-2" /> Novo Produto
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Adicionar Produto</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleAddProduct}>
                  {firestoreStatus && (
                    <Alert className={firestoreStatus.success ? "bg-green-50 border-green-200 text-green-800" : "bg-red-50 border-red-200 text-red-800"}>
                      {firestoreStatus.success ? (
                        <CloudUpload className="h-4 w-4 text-green-600" />
                      ) : (
                        <CloudUpload className="h-4 w-4 text-red-600" />
                      )}
                      <AlertTitle>
                        {firestoreStatus.success ? "Sucesso!" : "Erro!"}
                      </AlertTitle>
                      <AlertDescription>
                        {firestoreStatus.message}
                      </AlertDescription>
                    </Alert>
                  )}
                  
                  <div className="grid gap-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Nome do Produto</Label>
                      <Input
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="description">Descrição</Label>
                      <Textarea
                        id="description"
                        name="description"
                        value={formData.description}
                        onChange={handleInputChange}
                        rows={3}
                        required
                      />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="price">Preço</Label>
                        <Input
                          id="price"
                          name="price"
                          type="number"
                          step="0.01"
                          min="0"
                          value={formData.price}
                          onChange={handleInputChange}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="stock">Estoque</Label>
                        <Input
                          id="stock"
                          name="stock"
                          type="number"
                          min="0"
                          value={formData.stock}
                          onChange={handleInputChange}
                          required
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="unit">Unidade</Label>
                        <Select
                          value={formData.unit}
                          onValueChange={(value) => handleSelectChange('unit', value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione" />
                          </SelectTrigger>
                          <SelectContent>
                            {units.map(unit => (
                              <SelectItem key={unit} value={unit}>{unit}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="category">Categoria</Label>
                        <Select
                          value={formData.category}
                          onValueChange={(value) => handleSelectChange('category', value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione" />
                          </SelectTrigger>
                          <SelectContent>
                            {categories.map(category => (
                              <SelectItem key={category} value={category}>{category}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                      Cancelar
                    </Button>
                    <Button 
                      type="submit" 
                      className="bg-sales-800 hover:bg-sales-700"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? "Salvando..." : "Salvar"}
                    </Button>
                  </div>
                </form>
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
          </div>
          <div className="relative overflow-x-auto rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Categoria</TableHead>
                  <TableHead>Preço</TableHead>
                  <TableHead>Unidade</TableHead>
                  <TableHead>Estoque</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProducts.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{product.name}</div>
                        <div className="text-xs text-gray-500">{product.description}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{product.category}</Badge>
                    </TableCell>
                    <TableCell>
                      {product.price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </TableCell>
                    <TableCell>{product.unit}</TableCell>
                    <TableCell>
                      <span className={`font-medium ${
                        product.stock < 50 ? 'text-red-600' : 
                        product.stock < 100 ? 'text-yellow-600' : 'text-green-600'
                      }`}>
                        {product.stock}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditClick(product)}
                        >
                          <Edit size={16} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteClick(product)}
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
          <form onSubmit={handleEditProduct}>
            {firestoreStatus && (
              <Alert className={firestoreStatus.success ? "bg-green-50 border-green-200 text-green-800" : "bg-red-50 border-red-200 text-red-800"}>
                {firestoreStatus.success ? (
                  <CloudUpload className="h-4 w-4 text-green-600" />
                ) : (
                  <CloudUpload className="h-4 w-4 text-red-600" />
                )}
                <AlertTitle>
                  {firestoreStatus.success ? "Sucesso!" : "Erro!"}
                </AlertTitle>
                <AlertDescription>
                  {firestoreStatus.message}
                </AlertDescription>
              </Alert>
            )}
            
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="edit-name">Nome do Produto</Label>
                <Input
                  id="edit-name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-description">Descrição</Label>
                <Textarea
                  id="edit-description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={3}
                  required
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-price">Preço</Label>
                  <Input
                    id="edit-price"
                    name="price"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.price}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-stock">Estoque</Label>
                  <Input
                    id="edit-stock"
                    name="stock"
                    type="number"
                    min="0"
                    value={formData.stock}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-unit">Unidade</Label>
                  <Select
                    value={formData.unit}
                    onValueChange={(value) => handleSelectChange('unit', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      {units.map(unit => (
                        <SelectItem key={unit} value={unit}>{unit}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-category">Categoria</Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) => handleSelectChange('category', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map(category => (
                        <SelectItem key={category} value={category}>{category}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                Cancelar
              </Button>
              <Button 
                type="submit" 
                className="bg-sales-800 hover:bg-sales-700"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Atualizando..." : "Atualizar"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Product Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmação de exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir o produto {selectedProduct?.name}? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteProduct} 
              className="bg-red-600 hover:bg-red-700"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Excluindo..." : "Excluir"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </PageLayout>
  );
}
