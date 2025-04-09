
import React, { useRef } from 'react';
import { useReactToPrint } from 'react-to-print';
import { Order, Customer } from '@/types';
import { formatDateToBR } from '@/lib/date-utils';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';
import { Printer } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from '@/components/ui/checkbox';

interface PrintOrdersDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  orders: Order[];
  customers: Customer[];
  selectedOrderIds: string[];
  setSelectedOrderIds: (ids: string[]) => void;
  filteredOrders: Order[];
  formatCurrency: (value: number | undefined) => string;
}

const PrintOrdersDialog: React.FC<PrintOrdersDialogProps> = ({
  isOpen,
  onOpenChange,
  orders,
  customers,
  selectedOrderIds,
  setSelectedOrderIds,
  filteredOrders,
  formatCurrency,
}) => {
  const [selectedCustomerId, setSelectedCustomerId] = React.useState<string>('all');
  const bulkPrintRef = useRef<HTMLDivElement>(null);
  
  const handleBulkPrint = useReactToPrint({
    content: () => bulkPrintRef.current,
    documentTitle: 'Pedidos',
  });

  const handleSelectAllOrders = () => {
    if (selectedOrderIds.length === filteredOrders.length) {
      setSelectedOrderIds([]);
    } else {
      setSelectedOrderIds(filteredOrders.map(order => order.id));
    }
  };

  const getOrdersBySelection = () => {
    if (selectedCustomerId === 'all') {
      return selectedOrderIds.length > 0 
        ? orders.filter(order => selectedOrderIds.includes(order.id))
        : filteredOrders;
    } else {
      return orders.filter(order => order.customerId === selectedCustomerId);
    }
  };

  const printableOrders = getOrdersBySelection();

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle className="mb-6">Imprimir Pedidos</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 mb-6">
          <div>
            <label className="text-sm font-medium mb-1 block">Filtrar por Cliente</label>
            <Select
              value={selectedCustomerId}
              onValueChange={(value) => setSelectedCustomerId(value)}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Selecionar Cliente" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os Clientes</SelectItem>
                {customers.map((customer) => (
                  <SelectItem key={customer.id} value={customer.id}>{customer.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          {selectedCustomerId === 'all' && (
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="selectAll" 
                checked={filteredOrders.length > 0 && selectedOrderIds.length === filteredOrders.length}
                onCheckedChange={handleSelectAllOrders}
              />
              <label htmlFor="selectAll" className="text-sm cursor-pointer">
                Selecionar todos os pedidos
              </label>
            </div>
          )}
          
          <div className="bg-gray-50 rounded-md p-3">
            <p className="font-medium">Serão impressos:</p>
            <p className="text-sm text-gray-600">
              {printableOrders.length} pedido(s) 
              {selectedCustomerId !== 'all' && ` do cliente ${customers.find(c => c.id === selectedCustomerId)?.name || ""}`}
            </p>
          </div>
        </div>
        
        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button 
            onClick={handleBulkPrint} 
            className="bg-sales-800 hover:bg-sales-700"
            disabled={printableOrders.length === 0}
          >
            <Printer size={16} className="mr-2" /> Imprimir
          </Button>
        </div>
        
        <div className="hidden">
          <div ref={bulkPrintRef} className="p-4">
            {printableOrders.map((order, orderIndex) => {
              const orderCustomer = customers.find(c => c.id === order.customerId);
              
              const needsPageBreak = (orderIndex + 1) % 2 === 0 && orderIndex < printableOrders.length - 1;
              
              return (
                <div key={order.id}>
                  <div className="print-order">
                    <div className="text-center mb-4">
                      <h2 className="font-bold text-lg">PEDIDO #{order.id.substring(0, 8).toUpperCase()}</h2>
                      <p className="text-gray-600">
                        Data: {formatDateToBR(order.createdAt)}
                      </p>
                    </div>
                    
                    <div className="grid grid-cols-1 gap-4 mb-4">
                      <div className="border rounded-md p-3">
                        <h3 className="font-semibold mb-1">Dados do Cliente</h3>
                        <p><span className="font-semibold">Nome:</span> {orderCustomer?.name}</p>
                        <p><span className="font-semibold">Telefone:</span> {orderCustomer?.phone}</p>
                        <p><span className="font-semibold">CPF/CNPJ:</span> {orderCustomer?.document}</p>
                        <p><span className="font-semibold">Endereço:</span> {orderCustomer?.address}</p>
                        <p>{orderCustomer?.city} - {orderCustomer?.state}, {orderCustomer?.zipCode}</p>
                      </div>
                    </div>
                    
                    <div className="mb-4">
                      <h3 className="font-semibold mb-1">Itens do Pedido</h3>
                      <div className="border rounded-md overflow-hidden">
                        <table className="w-full text-sm">
                          <thead className="bg-gray-50 text-gray-700">
                            <tr>
                              <th className="py-1 px-2 text-left">Produto</th>
                              <th className="py-1 px-2 text-center">Qtd.</th>
                              <th className="py-1 px-2 text-right">Preço</th>
                              <th className="py-1 px-2 text-right">Total</th>
                            </tr>
                          </thead>
                          <tbody>
                            {order.items.map((item, index) => (
                              <tr key={item.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                                <td className="py-1 px-2">{item.productName}</td>
                                <td className="py-1 px-2 text-center">{item.quantity}</td>
                                <td className="py-1 px-2 text-right">
                                  {formatCurrency(item.unitPrice)}
                                </td>
                                <td className="py-1 px-2 text-right font-medium">
                                  {formatCurrency(item.total)}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-center mb-2">
                      <div>
                        <p className="font-semibold">Pagamento: {order.paymentStatus}</p>
                        {order.paymentMethod && (
                          <p className="text-sm">Forma: {order.paymentMethod}</p>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="font-bold">Total: 
                          {formatCurrency(order.total)}
                        </p>
                      </div>
                    </div>
                    
                    {order.notes && (
                      <div className="mt-2">
                        <h3 className="font-semibold text-sm">Observações:</h3>
                        <p className="text-gray-700 text-sm">{order.notes}</p>
                      </div>
                    )}
                  </div>
                  
                  {needsPageBreak && <div className="print-page-break"></div>}
                </div>
              );
            })}
            
            <div className="print-footer">
              <p>ForcaVendas - Sistema de Gestão de Vendas</p>
              <p>Para qualquer suporte: (11) 9999-8888</p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PrintOrdersDialog;
