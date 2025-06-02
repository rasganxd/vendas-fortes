
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
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
import { useProducts } from '@/hooks/useProducts';
import { Plus, Search, Edit, Trash2, Package } from 'lucide-react';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import ProductForm from '@/components/products/ProductForm';
import DeleteProductDialog from '@/components/products/DeleteProductDialog';
import { Product } from '@/types/product';

const ProductsPage = () => {
  const { products, isLoading, createProduct, updateProduct, deleteProduct } = useProducts();
  const [searchTerm, setSearchTerm] = useState('');
  const [showNewProductDialog, setShowNewProductDialog] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deletingProduct, setDeletingProduct] = useState<Product | null>(null);

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.code.toString().includes(searchTerm)
  );

  const handleCreateProduct = async (productData: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      await createProduct(productData);
      setShowNewProductDialog(false);
    } catch (error) {
      console.error('Erro ao criar produto:', error);
    }
  };

  const handleUpdateProduct = async (productData: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (!editingProduct) return;
    
    try {
      await updateProduct(editingProduct.id, productData);
      setEditingProduct(null);
    } catch (error) {
      console.error('Erro ao atualizar produto:', error);
    }
  };

  const handleDeleteProduct = async () => {
    if (!deletingProduct) return;
    
    try {
      await deleteProduct(deletingProduct.id);
      setDeletingProduct(null);
    } catch (error) {
      console.error('Erro ao excluir produto:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex justify-center items-center h-64">
          <LoadingSpinner size="lg" />
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Produtos</h1>
          <p className="text-gray-600">Gerencie o catálogo de produtos</p>
        </div>
        
        <Dialog open={showNewProductDialog} onOpenChange={setShowNewProductDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Novo Produto
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden">
            <DialogHeader>
              <DialogTitle>Cadastrar Novo Produto</DialogTitle>
            </DialogHeader>
            <ProductForm
              onSubmit={handleCreateProduct}
              onCancel={() => setShowNewProductDialog(false)}
            />
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="w-5 h-5" />
            Lista de Produtos
            <Badge variant="secondary" className="ml-2">{products.length}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nome ou código..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Código</TableHead>
                  <TableHead>Nome</TableHead>
                  <TableHead>Unidade Principal</TableHead>
                  <TableHead>Preço de Custo</TableHead>
                  <TableHead>Estoque</TableHead>
                  <TableHead>Categoria</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProducts.length > 0 ? (
                  filteredProducts.map((product) => (
                    <TableRow key={product.id}>
                      <TableCell className="font-medium">{product.code}</TableCell>
                      <TableCell>{product.name}</TableCell>
                      <TableCell>{product.main_unit_id}</TableCell>
                      <TableCell>
                        {product.cost_price.toLocaleString('pt-BR', { 
                          style: 'currency', 
                          currency: 'BRL' 
                        })}
                      </TableCell>
                      <TableCell>{product.stock}</TableCell>
                      <TableCell>{product.category_id || '—'}</TableCell>
                      <TableCell>
                        <Badge variant={product.active ? "default" : "secondary"}>
                          {product.active ? "Ativo" : "Inativo"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end space-x-2">
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => setEditingProduct(product)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => setDeletingProduct(product)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={8} className="h-24 text-center">
                      {searchTerm ? 'Nenhum produto encontrado.' : 'Nenhum produto cadastrado.'}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Edit Product Dialog */}
      <Dialog open={!!editingProduct} onOpenChange={() => setEditingProduct(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle>Editar Produto</DialogTitle>
          </DialogHeader>
          {editingProduct && (
            <ProductForm
              product={editingProduct}
              onSubmit={handleUpdateProduct}
              onCancel={() => setEditingProduct(null)}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Product Dialog */}
      <DeleteProductDialog
        product={deletingProduct}
        open={!!deletingProduct}
        onConfirm={handleDeleteProduct}
        onCancel={() => setDeletingProduct(null)}
      />
    </div>
  );
};

export default ProductsPage;
