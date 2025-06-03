
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
import { Loader2, Trash } from 'lucide-react';
import { Product } from '@/types';
import { formatCurrency } from "@/lib/utils";

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
  console.log("🔍 [ProductsTable] Rendering with data:", { 
    productsCount: products?.length || 0, 
    isLoading,
    productsArray: products
  });

  // Log first few products for debugging
  if (products && products.length > 0) {
    console.log("📦 [ProductsTable] First product details:", {
      id: products[0].id,
      code: products[0].code,
      name: products[0].name,
      price: products[0].price,
      cost: products[0].cost,
      stock: products[0].stock
    });
    
    if (products.length > 1) {
      console.log("📦 [ProductsTable] Second product details:", {
        id: products[1].id,
        code: products[1].code,
        name: products[1].name,
        price: products[1].price,
        cost: products[1].cost
      });
    }
  }

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
            price: product.price,
            cost: product.cost,
            stock: product.stock
          });
          
          return (
            <TableRow key={product.id}>
              <TableCell>{product.code}</TableCell>
              <TableCell>{product.name}</TableCell>
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
