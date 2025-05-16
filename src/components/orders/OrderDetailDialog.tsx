import React, { useRef } from 'react';
import { useReactToPrint } from 'react-to-print';
import { Order, Customer } from '@/types';
import { formatDateToBR } from '@/lib/date-utils';
import { useAppContext } from '@/hooks/useAppContext';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Archive, Printer, X } from 'lucide-react';

interface OrderDetailDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  selectedOrder: Order | null;
  selectedCustomer: Customer | null;
  formatCurrency: (value: number | undefined) => string;
}

const OrderDetailDialog: React.FC<OrderDetailDialogProps> = ({
  isOpen,
  onOpenChange,
  selectedOrder,
  selectedCustomer,
  formatCurrency,
}) => {
  const printRef = useRef<HTMLDivElement>(null);
  const { settings } = useAppContext();
  const companyData = settings?.company;
  
  const handlePrint = useReactToPrint({
    content: () => printRef.current,
    documentTitle: `Pedido-${selectedOrder?.customerName}`,
    removeAfterPrint: true,
  });

  if (!selectedOrder) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl">
        <DialogHeader>
          <div className="flex justify-between items-center">
            <DialogTitle className="flex items-center">
              <span>Detalhes do Pedido</span>
              {selectedOrder?.archived && (
                <Badge variant="outline" className="ml-2">
                  <Archive size={12} className="mr-1" /> Arquivado
                </Badge>
              )}
            </DialogTitle>
            <Button 
              variant="outline" 
              onClick={() => handlePrint()} 
              className="flex items-center gap-2 mr-8"
            >
              <Printer size={16} /> Imprimir
            </Button>
          </div>
        </DialogHeader>
        
        <div ref={printRef} className="p-4">
          {companyData?.name && (
            <div className="text-center mb-4">
              <h2 className="font-bold text-xl">{companyData.name}</h2>
              {companyData.document && (
                <p className="text-sm text-gray-600">CNPJ: {companyData.document}</p>
              )}
            </div>
          )}
          
          <div className="text-center mb-6">
            <p className="text-gray-600">
              Data: {selectedOrder ? formatDateToBR(selectedOrder.createdAt) : ''}
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="border rounded-md p-4">
              <h3 className="font-semibold mb-2">Dados do Cliente</h3>
              <p><span className="font-semibold">Nome:</span> {selectedCustomer?.name}</p>
              <p><span className="font-semibold">Telefone:</span> {selectedCustomer?.phone}</p>
              <p><span className="font-semibold">CPF/CNPJ:</span> {selectedCustomer?.document}</p>
            </div>
            <div className="border rounded-md p-4">
              <h3 className="font-semibold mb-2">Endereço de Entrega</h3>
              <p>{selectedCustomer?.address}</p>
              <p>{selectedCustomer?.city} - {selectedCustomer?.state}, {selectedCustomer?.zipCode}</p>
            </div>
          </div>
          
          <div className="mb-6">
            <h3 className="font-semibold mb-2">Itens do Pedido</h3>
            <div className="border rounded-md overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 text-gray-700">
                  <tr>
                    <th className="py-2 px-4 text-left">Produto</th>
                    <th className="py-2 px-4 text-center">Quantidade</th>
                    <th className="py-2 px-4 text-right">Preço Unit.</th>
                    <th className="py-2 px-4 text-right">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedOrder?.items.map((item, index) => (
                    <tr key={item.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      <td className="py-2 px-4">{item.productName}</td>
                      <td className="py-2 px-4 text-center">{item.quantity}</td>
                      <td className="py-2 px-4 text-right">
                        {formatCurrency(item.unitPrice)}
                      </td>
                      <td className="py-2 px-4 text-right font-medium">
                        {formatCurrency(item.total)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          
          <div className="flex justify-between items-center mb-6">
            <div>
              {selectedOrder.paymentStatus !== 'pending' && (
                <p className="font-semibold">{selectedOrder?.paymentStatus}</p>
              )}
              {selectedOrder.paymentMethod && (
                <p className="text-gray-700">{selectedOrder.paymentMethod}</p>
              )}
            </div>
            <div className="text-right">
              <p className="text-gray-600">Subtotal: 
                {formatCurrency(selectedOrder?.total)}
              </p>
              <p className="font-bold text-lg">Total: 
                {formatCurrency(selectedOrder?.total)}
              </p>
            </div>
          </div>
          
          {selectedOrder?.notes && (
            <div className="mt-4">
              <h3 className="font-semibold">Observações:</h3>
              <p className="text-gray-700">{selectedOrder.notes}</p>
            </div>
          )}
          
          <div className="mt-8 text-center text-gray-500 text-sm">
            {companyData?.footer ? (
              <p>{companyData.footer}</p>
            ) : (
              <>
                <p>{companyData?.name || 'ForcaVendas'} - Sistema de Gestão de Vendas</p>
                <p>Para qualquer suporte: {companyData?.phone || '(11) 9999-8888'}</p>
              </>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default OrderDetailDialog;
