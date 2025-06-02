
import React from 'react';
import { Order } from '@/types';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { Lock } from 'lucide-react';

interface BuildLoadOrdersTableProps {
  filteredOrders: Order[];
  selectedOrderIds: string[];
  handleOrderSelect: (order: Order, isChecked: boolean) => void;
  selectAll: boolean;
  handleSelectAll: (checked: boolean) => void;
  blockedOrders: Order[];
}

const BuildLoadOrdersTable: React.FC<BuildLoadOrdersTableProps> = ({
  filteredOrders,
  selectedOrderIds,
  handleOrderSelect,
  selectAll,
  handleSelectAll,
  blockedOrders
}) => {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-10">
            <div className="flex items-center">
              <Checkbox 
                checked={selectAll && filteredOrders.length > 0} 
                onCheckedChange={handleSelectAll}
                disabled={filteredOrders.length === 0}
              />
              <span className="ml-2">Todos</span>
            </div>
          </TableHead>
          <TableHead>Pedido</TableHead>
          <TableHead>Cliente</TableHead>
          <TableHead>Status</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {filteredOrders.map((order) => (
          <TableRow key={order.id}>
            <TableCell>
              <Checkbox 
                checked={selectedOrderIds.includes(order.id)}
                onCheckedChange={(checked) => handleOrderSelect(order, !!checked)}
              />
            </TableCell>
            <TableCell className="font-medium">{order.id.substring(0, 8)}</TableCell>
            <TableCell>{order.customer_name}</TableCell>
            <TableCell>Disponível</TableCell>
          </TableRow>
        ))}
        {blockedOrders.map((order) => (
          <TableRow key={order.id} className="bg-gray-50">
            <TableCell>
              <div className="text-amber-600">
                <Lock size={16} />
              </div>
            </TableCell>
            <TableCell className="font-medium text-gray-500">{order.id.substring(0, 8)}</TableCell>
            <TableCell className="text-gray-500">{order.customer_name}</TableCell>
            <TableCell>
              <span className="text-amber-600 flex items-center gap-1">
                <Lock size={14} /> Bloqueado
              </span>
            </TableCell>
          </TableRow>
        ))}
        {filteredOrders.length === 0 && blockedOrders.length === 0 && (
          <TableRow>
            <TableCell colSpan={4} className="text-center py-4">
              Não há pedidos disponíveis para seleção
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
};

export default BuildLoadOrdersTable;
