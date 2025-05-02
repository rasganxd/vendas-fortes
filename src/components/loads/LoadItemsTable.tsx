
import React from 'react';
import { LoadItem } from '@/types';
import { formatCurrency } from '@/lib/format-utils';
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Trash } from 'lucide-react';

interface LoadItemsTableProps {
  items: LoadItem[];
  onRemoveItem?: (productId: string) => void;
  showActions?: boolean;
  isReadOnly?: boolean;
  calculateTotal?: () => number;
}

const LoadItemsTable: React.FC<LoadItemsTableProps> = ({
  items,
  onRemoveItem,
  showActions = true,
  isReadOnly = false,
  calculateTotal
}) => {
  const getTotal = () => {
    if (calculateTotal) {
      return calculateTotal();
    }
    return items.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  // Make sure items is always an array
  const displayItems = Array.isArray(items) ? items : [];

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="whitespace-nowrap">Produto</TableHead>
          <TableHead className="text-center whitespace-nowrap">Quantidade</TableHead>
          <TableHead className="text-center whitespace-nowrap">Preço</TableHead>
          <TableHead className="text-right whitespace-nowrap">Total</TableHead>
          {showActions && <TableHead className="w-[80px]"></TableHead>}
        </TableRow>
      </TableHeader>
      <TableBody>
        {displayItems.length > 0 ? (
          displayItems.map((item) => (
            <TableRow key={`${item.productId}-${item.id}`}>
              <TableCell className="font-medium">
                {item.productName}
                {item.productCode && <span className="text-xs ml-1 text-muted-foreground">#{item.productCode}</span>}
              </TableCell>
              <TableCell className="text-center">
                {item.quantity}
              </TableCell>
              <TableCell className="text-center">
                {formatCurrency(item.price)}
              </TableCell>
              <TableCell className="text-right font-medium">
                {formatCurrency(item.price * item.quantity)}
              </TableCell>
              {showActions && !isReadOnly && (
                <TableCell className="text-right">
                  {onRemoveItem && (
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => onRemoveItem(item.productId)}
                    >
                      <Trash size={16} className="text-destructive" />
                    </Button>
                  )}
                </TableCell>
              )}
            </TableRow>
          ))
        ) : (
          <TableRow>
            <TableCell colSpan={showActions ? 5 : 4} className="text-center py-6 text-gray-500">
              Nenhum item adicionado
            </TableCell>
          </TableRow>
        )}
      </TableBody>
      <TableFooter>
        <TableRow>
          <TableCell colSpan={showActions ? 3 : 2}></TableCell>
          <TableCell className="text-right">Total</TableCell>
          <TableCell className={`text-right font-semibold ${showActions ? "" : "text-lg"}`}>
            {formatCurrency(getTotal())}
          </TableCell>
          {showActions && <TableCell></TableCell>}
        </TableRow>
      </TableFooter>
    </Table>
  );
};

export default LoadItemsTable;
