import React, { useState, useEffect } from 'react';
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
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Order } from '@/types';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { formatDateToBR } from '@/lib/date-utils';
import { Badge } from '@/components/ui/badge';

export default function Payments() {
  const { orders } = useAppContext();
  const [search, setSearch] = useState('');
  const [showArchived, setShowArchived] = useState(false);

  const filteredOrders = orders.filter(order => {
    if (!showArchived && order.archived) return false;
    return order.customerName.toLowerCase().includes(search.toLowerCase()) ||
      order.id.toLowerCase().includes(search.toLowerCase());
  });

  return (
    <PageLayout title="Pagamentos">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Lista de Pedidos</CardTitle>
              <CardDescription>
                Gerencie os pagamentos dos seus pedidos
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" size={18} />
              <Input
                placeholder="Buscar pedidos..."
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
                  <TableHead>Código</TableHead>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Data</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredOrders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-medium">{order.code}</TableCell>
                    <TableCell>{order.customerName}</TableCell>
                    <TableCell>{formatDateToBR(order.date)}</TableCell>
                    <TableCell>R$ {order.total.toFixed(2)}</TableCell>
                    <TableCell>
                      {order.status === "pending" && <Badge variant="outline">Pendente</Badge>}
                      {order.status === "processing" && <Badge className="bg-blue-500">Processando</Badge>}
                      {order.status === "completed" && <Badge className="bg-green-500">Concluído</Badge>}
                      {order.status === "canceled" && <Badge variant="destructive">Cancelado</Badge>}
                      {order.status === "confirmed" && <Badge className="bg-green-600">Confirmado</Badge>}
                      {order.status === "draft" && <Badge variant="secondary">Rascunho</Badge>}
                    </TableCell>
                    <TableCell className="text-right">
                      <Link to={`/pedidos/${order.id}/pagamentos`}>
                        <Button variant="ghost" size="sm">
                          Gerenciar Pagamentos
                        </Button>
                      </Link>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </PageLayout>
  );
}
