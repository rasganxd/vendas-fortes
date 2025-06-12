
import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, Trash } from 'lucide-react';
import { Product } from '@/types';
import { formatCurrency } from "@/lib/utils";
import { useAppData } from '@/context/providers/AppDataProvider';

interface ProductsTableProps {
  products: Product[];
  isLoading: boolean;
  onEdit: (product: Product) => void;
  onDelete: (id: string) => void;
}

const ProductsTable: React.FC<ProductsTableProps> = ({
  products,
  isLoading,
  onEdit,
  onDelete
}) => {
  const { productCategories, productGroups, productBrands } = useAppData();

  console.log("🔍 [ProductsTable] Rendering with data:", { 
    productsCount: products?.length || 0, 
    isLoading,
    productsArray: products
  });

  // Helper functions to get classification names
  const getCategoryName = (categoryId?: string) => {
    if (!categoryId) return null;
    const category = productCategories?.find(c => c.id === categoryId);
    return category?.name;
  };

  const getGroupName = (groupId?: string) => {
    if (!groupId) return null;
    const group = productGroups?.find(g => g.id === groupId);
    return group?.name;
  };

  const getBrandName = (brandId?: string) => {
    if (!brandId) return null;
    const brand = productBrands?.find(b => b.id === brandId);
    return brand?.name;
  };

  if (isLoading) {
    console.log("⏳ [ProductsTable] Showing loading state");
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!products || products.length === 0) {
    console.log("📋 [ProductsTable] No products to display");
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">Nenhum produto encontrado. Adicione produtos utilizando o botão acima.</p>
      </div>
    );
  }

  console.log("📊 [ProductsTable] Displaying", products.length, "products");

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Código</TableHead>
          <TableHead>Nome</TableHead>
          <TableHead>Categoria</TableHead>
          <TableHead>Grupo</TableHead>
          <TableHead>Marca</TableHead>
          <TableHead>Custo</TableHead>
          <TableHead>Preço</TableHead>
          <TableHead>Estoque</TableHead>
          <TableHead className="text-right">Ações</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {products.map((product, index) => {
          console.log(`📦 [ProductsTable] Rendering product ${index + 1}:`, {
            id: product.id,
            code: product.code,
            name: product.name,
            categoryId: product.categoryId,
            groupId: product.groupId,
            brandId: product.brandId
          });
          
          const categoryName = getCategoryName(product.categoryId);
          const groupName = getGroupName(product.groupId);
          const brandName = getBrandName(product.brandId);
          
          return (
            <TableRow key={product.id}>
              <TableCell>{product.code}</TableCell>
              <TableCell>{product.name}</TableCell>
              <TableCell>
                {categoryName ? (
                  <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                    {categoryName}
                  </Badge>
                ) : (
                  <span className="text-gray-400 text-sm">Sem categoria</span>
                )}
              </TableCell>
              <TableCell>
                {groupName ? (
                  <Badge variant="secondary" className="bg-green-100 text-green-800">
                    {groupName}
                  </Badge>
                ) : (
                  <span className="text-gray-400 text-sm">Sem grupo</span>
                )}
              </TableCell>
              <TableCell>
                {brandName ? (
                  <Badge variant="secondary" className="bg-purple-100 text-purple-800">
                    {brandName}
                  </Badge>
                ) : (
                  <span className="text-gray-400 text-sm">Sem marca</span>
                )}
              </TableCell>
              <TableCell>{formatCurrency(product.cost || 0)}</TableCell>
              <TableCell>{formatCurrency(product.price || 0)}</TableCell>
              <TableCell>{product.stock || 0}</TableCell>
              <TableCell className="text-right">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="ghost" size="sm" onClick={() => onEdit(product)}>
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="20"
                          height="20"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="lucide lucide-edit"
                        >
                          <path d="M11 4H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-5" />
                          <path d="M15 3h6v6M10 14L21.5 2.5" />
                        </svg>
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
                      <Button variant="ghost" size="sm" onClick={() => onDelete(product.id)}>
                        <Trash size={16} className="text-destructive" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Excluir</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
};

export default ProductsTable;
