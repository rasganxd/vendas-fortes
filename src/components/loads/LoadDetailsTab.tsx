
import { useState } from 'react';
import { Load, LoadItem } from '@/types';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { useAppContext } from '@/hooks/useAppContext';

interface LoadDetailsTabProps {
  name: string;
  setName: (name: string) => void;
  status: string;
  setStatus: (status: string) => void;
  notes: string;
  setNotes: (notes: string) => void;
  currentItems: LoadItem[];
}

export const LoadDetailsTab = ({
  name,
  setName,
  status,
  setStatus,
  notes,
  setNotes,
  currentItems
}: LoadDetailsTabProps) => {
  const { orders, customers } = useAppContext();
  
  // Get customer code and order total
  const getOrderInfo = (orderId: string) => {
    const order = orders.find(o => o.id === orderId);
    if (!order) return { customerCode: "-", orderTotal: 0 };
    
    const customer = customers.find(c => c.id === order.customerId);
    const customerCode = customer?.code || "-";
    const orderTotal = order.total;
    
    return { customerCode, orderTotal };
  };
  
  return (
    <div className="space-y-4">
      <div className="grid gap-2">
        <Label htmlFor="name">Nome da Carga</Label>
        <Input
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Nome da carga"
        />
      </div>
      
      <div className="grid gap-2">
        <Label htmlFor="status">Status</Label>
        <Select value={status} onValueChange={(value: string) => setStatus(value)}>
          <SelectTrigger>
            <SelectValue placeholder="Selecione o status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="planning">Planejamento</SelectItem>
            <SelectItem value="loading">Carregando</SelectItem>
            <SelectItem value="loaded">Carregado</SelectItem>
            <SelectItem value="in-transit">Em Trânsito</SelectItem>
            <SelectItem value="delivered">Entregue</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div className="grid gap-2">
        <Label htmlFor="notes">Observações</Label>
        <Textarea
          id="notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Observações sobre a carga"
          rows={3}
        />
      </div>
      
      {currentItems.length > 0 && (
        <div className="grid gap-2 mt-4">
          <Label>Itens da carga</Label>
          <div className="border rounded-md overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Produto</TableHead>
                  <TableHead className="text-right">Quantidade</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {currentItems.map((item, index) => {
                  const { customerCode } = item.orderId ? getOrderInfo(item.orderId) : { customerCode: "-" };
                  return (
                    <TableRow key={index}>
                      <TableCell>{customerCode}</TableCell>
                      <TableCell>{item.productName}</TableCell>
                      <TableCell className="text-right">{item.quantity}</TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
          <p className="text-sm text-gray-500 mt-2">
            Para adicionar ou remover pedidos, use a aba "Gerenciar Pedidos".
          </p>
        </div>
      )}
    </div>
  );
};
