
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import { toast } from "sonner";
import { Product } from '@/types';
import { useAppData } from '@/context/providers/AppDataProvider';
import PageLayout from '@/components/layout/PageLayout';
import ProductsTable from '@/components/products/ProductsTable';
import ProductForm from '@/components/products/ProductForm';
import { useConnection } from '@/context/providers/ConnectionProvider';
import { useProductBrands } from '@/hooks/useProductBrands';
import { useProductCategories } from '@/hooks/useProductCategories';
import { useProductGroups } from '@/hooks/useProductGroups';
import { Link } from 'react-router-dom';
import { Plus, DollarSign, Tags } from 'lucide-react';

export default function Products() {
  // Use centralized products from AppData
  const {
    products,
    isLoadingProducts,
    addProduct,
    updateProduct,
    deleteProduct,
    refreshProducts,
    productBrands,
    productCategories,
    productGroups
  } = useAppData();
  
  const { connectionStatus } = useConnection();
  
  // Get direct access to classification hooks for additional data
  const { productBrands: hookProductBrands } = useProductBrands();
  const { productGroups: hookProductGroups } = useProductGroups();
  const { productCategories: hookProductCategories } = useProductCategories();
  
  const [open, setOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);

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

  // Use the most complete dataset available
  const safeProductGroups = Array.isArray(productGroups) && productGroups.length > 0 
    ? productGroups 
    : Array.isArray(hookProductGroups) ? hookProductGroups : [];
    
  const safeProductCategories = Array.isArray(productCategories) && productCategories.length > 0 
    ? productCategories 
    : Array.isArray(hookProductCategories) ? hookProductCategories : [];
    
  const safeProductBrands = Array.isArray(productBrands) && productBrands.length > 0 
    ? productBrands 
    : Array.isArray(hookProductBrands) ? hookProductBrands : [];

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
      const productData: Partial<Product> = {
        code: data.code,
        name: data.name,
        cost: data.cost,
        price: data.cost,
        unit: data.unit,
        categoryId: data.categoryId && data.categoryId !== "none" ? data.categoryId : null,
        groupId: data.groupId && data.groupId !== "none" ? data.groupId : null,
        brandId: data.brandId && data.brandId !== "none" ? data.brandId : null,
        stock: data.stock || 0,
        minStock: 0,
        hasSubunit: data.hasSubunit || false,
        subunit: data.hasSubunit && data.subunit ? data.subunit : null,
        subunitRatio: data.hasSubunit && data.subunitRatio ? data.subunitRatio : 1
      };

      if (isEditing && selectedProduct) {
        await updateProduct(selectedProduct.id, productData);
        toast("Produto atualizado", {
          description: "O produto foi atualizado com sucesso"
        });
      } else {
        const newProductId = await addProduct(productData as Omit<Product, 'id'>);
        console.log("Product added with ID:", newProductId);
        toast("Produto adicionado", {
          description: "O produto foi adicionado com sucesso"
        });
      }
      setOpen(false);
    } catch (error) {
      console.error("Erro ao salvar produto:", error);
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
      <div className="flex justify-between items-center mb-4">
        <div>
          <h2 className="text-lg font-medium">Gerencie os produtos da sua empresa</h2>
          <p className="text-sm text-gray-600">
            {filteredProducts.length} produtos {searchTerm ? 'encontrados' : 'cadastrados'}
          </p>
        </div>
        <div className="flex gap-2">
          <Link to="/produtos/precificacao">
            <Button variant="outline">
              <DollarSign size={16} className="mr-2" />
              Precificação
            </Button>
          </Link>
          
          <Link to="/produtos/classificacoes">
            <Button variant="outline">
              <Tags size={16} className="mr-2" />
              Classificações
            </Button>
          </Link>
          
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
      
      <ProductForm 
        open={open} 
        onOpenChange={setOpen} 
        isEditing={isEditing} 
        selectedProduct={selectedProduct} 
        products={products} 
        productCategories={safeProductCategories} 
        productGroups={safeProductGroups} 
        productBrands={safeProductBrands} 
        onSubmit={handleSubmit} 
      />
    </PageLayout>
  );
}
