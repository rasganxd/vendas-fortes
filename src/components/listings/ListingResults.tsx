
import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { ChevronUp, ChevronDown } from 'lucide-react';
import { formatCurrency } from '@/lib/format-utils';
import { formatDateToBR } from '@/lib/date-utils';
import { ListingType } from './ListingFilters';

interface ListingResultsProps {
  type: ListingType;
  data: any[];
  loading: boolean;
  orderBy: string;
  orderDirection: 'asc' | 'desc';
  onSort: (field: string) => void;
}

export default function ListingResults({
  type,
  data,
  loading,
  orderBy,
  orderDirection,
  onSort
}: ListingResultsProps) {
  const SortIcon = ({ field }: { field: string }) => {
    if (orderBy !== field) return null;
    return orderDirection === 'asc' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />;
  };

  const SortableHeader = ({ field, children }: { field: string; children: React.ReactNode }) => (
    <TableHead 
      className="cursor-pointer hover:bg-gray-50 select-none"
      onClick={() => onSort(field)}
    >
      <div className="flex items-center gap-1">
        {children}
        <SortIcon field={field} />
      </div>
    </TableHead>
  );

  if (loading) {
    return (
      <div className="space-y-2">
        {[...Array(5)].map((_, i) => (
          <Skeleton key={i} className="h-12 w-full" />
        ))}
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        Nenhum registro encontrado com os filtros aplicados.
      </div>
    );
  }

  const renderCustomersTable = () => (
    <Table>
      <TableHeader>
        <TableRow>
          <SortableHeader field="code">Código</SortableHeader>
          <SortableHeader field="name">Nome</SortableHeader>
          <SortableHeader field="city">Cidade</SortableHeader>
          <TableHead>Vendedor</TableHead>
          <SortableHeader field="visitSequence">Seq. Visita</SortableHeader>
          <TableHead>Dias de Visita</TableHead>
          <TableHead>Status</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.map((customer) => (
          <TableRow key={customer.id}>
            <TableCell className="font-mono">{customer.code}</TableCell>
            <TableCell className="font-medium">{customer.name}</TableCell>
            <TableCell>{customer.city}</TableCell>
            <TableCell>{customer.salesRepName || '-'}</TableCell>
            <TableCell>{customer.visitSequence || '-'}</TableCell>
            <TableCell>
              {customer.visitDays?.length > 0 
                ? customer.visitDays.join(', ') 
                : '-'
              }
            </TableCell>
            <TableCell>
              <Badge variant={customer.active ? 'default' : 'secondary'}>
                {customer.active ? 'Ativo' : 'Inativo'}
              </Badge>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );

  const renderProductsTable = () => (
    <Table>
      <TableHeader>
        <TableRow>
          <SortableHeader field="code">Código</SortableHeader>
          <SortableHeader field="name">Nome</SortableHeader>
          <TableHead>Categoria</TableHead>
          <TableHead>Grupo</TableHead>
          <SortableHeader field="sale_price">Preço</SortableHeader>
          <SortableHeader field="stock">Estoque</SortableHeader>
          <TableHead>Status</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.map((product) => (
          <TableRow key={product.id}>
            <TableCell className="font-mono">{product.code}</TableCell>
            <TableCell className="font-medium">{product.name}</TableCell>
            <TableCell>{product.categoryName || '-'}</TableCell>
            <TableCell>{product.groupName || '-'}</TableCell>
            <TableCell>{formatCurrency(product.sale_price || 0)}</TableCell>
            <TableCell>
              <Badge variant={product.stock > 0 ? 'default' : 'destructive'}>
                {product.stock || 0}
              </Badge>
            </TableCell>
            <TableCell>
              <Badge variant={product.active ? 'default' : 'secondary'}>
                {product.active ? 'Ativo' : 'Inativo'}
              </Badge>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );

  const renderOrdersTable = () => (
    <Table>
      <TableHeader>
        <TableRow>
          <SortableHeader field="code">Código</SortableHeader>
          <SortableHeader field="date">Data</SortableHeader>
          <SortableHeader field="customerName">Cliente</SortableHeader>
          <TableHead>Vendedor</TableHead>
          <SortableHeader field="total">Total</SortableHeader>
          <SortableHeader field="status">Status</SortableHeader>
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.map((order) => (
          <TableRow key={order.id}>
            <TableCell className="font-mono">{order.code}</TableCell>
            <TableCell>{formatDateToBR(order.date)}</TableCell>
            <TableCell className="font-medium">{order.customerName}</TableCell>
            <TableCell>{order.salesRepName || '-'}</TableCell>
            <TableCell>{formatCurrency(order.total)}</TableCell>
            <TableCell>
              <Badge 
                variant={
                  order.status === 'completed' ? 'default' :
                  order.status === 'confirmed' ? 'secondary' :
                  order.status === 'canceled' ? 'destructive' : 'outline'
                }
              >
                {order.status === 'pending' && 'Pendente'}
                {order.status === 'confirmed' && 'Confirmado'}
                {order.status === 'processing' && 'Processando'}
                {order.status === 'completed' && 'Concluído'}
                {order.status === 'canceled' && 'Cancelado'}
              </Badge>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );

  const renderSalesRepsTable = () => (
    <Table>
      <TableHeader>
        <TableRow>
          <SortableHeader field="code">Código</SortableHeader>
          <SortableHeader field="name">Nome</SortableHeader>
          <TableHead>Email</TableHead>
          <TableHead>Telefone</TableHead>
          <TableHead>Status</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.map((salesRep) => (
          <TableRow key={salesRep.id}>
            <TableCell className="font-mono">{salesRep.code}</TableCell>
            <TableCell className="font-medium">{salesRep.name}</TableCell>
            <TableCell>{salesRep.email || '-'}</TableCell>
            <TableCell>{salesRep.phone || '-'}</TableCell>
            <TableCell>
              <Badge variant={salesRep.active ? 'default' : 'secondary'}>
                {salesRep.active ? 'Ativo' : 'Inativo'}
              </Badge>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );

  return (
    <div className="border rounded-md">
      {type === 'customers' && renderCustomersTable()}
      {type === 'products' && renderProductsTable()}
      {type === 'orders' && renderOrdersTable()}
      {type === 'sales_reps' && renderSalesRepsTable()}
    </div>
  );
}
