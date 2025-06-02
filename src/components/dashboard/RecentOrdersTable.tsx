
import { Order } from '@/types';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from '@/components/ui/badge';
import { formatDateToBR } from '@/lib/date-utils';

interface RecentOrdersTableProps {
  orders: Order[];
}

export default function RecentOrdersTable({ orders }: RecentOrdersTableProps) {
  const formatStatus = (status: string) => {
    switch (status) {
      case 'draft':
        return <Badge variant="outline" className="bg-slate-100 text-slate-600 hover:bg-slate-200">Rascunho</Badge>;
      case 'confirmed':
        return <Badge className="bg-blue-500 hover:bg-blue-600">Confirmado</Badge>;
      case 'delivered':
        return <Badge className="bg-green-500 hover:bg-green-600">Entregue</Badge>;
      case 'cancelled':
        return <Badge variant="destructive">Cancelado</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const formatPaymentStatus = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="border-amber-400 text-amber-600 hover:bg-amber-100">Pendente</Badge>;
      case 'partial':
        return <Badge className="bg-blue-500 hover:bg-blue-600">Parcial</Badge>;
      case 'paid':
        return <Badge className="bg-green-500 hover:bg-green-600">Pago</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead className="font-medium">Cliente</TableHead>
            <TableHead className="font-medium">Data</TableHead>
            <TableHead className="font-medium">Valor</TableHead>
            <TableHead className="font-medium">Status</TableHead>
            <TableHead className="font-medium">Pagamento</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {orders.length > 0 ? (
            orders.map((order) => (
              <TableRow key={order.id} className="hover:bg-slate-50">
                <TableCell className="font-medium">{order.customer_name}</TableCell>
                <TableCell>{formatDateToBR(order.createdAt)}</TableCell>
                <TableCell>
                  {order.total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                </TableCell>
                <TableCell>{formatStatus(order.status)}</TableCell>
                <TableCell>{formatPaymentStatus(order.payment_status || 'pending')}</TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                Nenhum pedido encontrado
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
};
