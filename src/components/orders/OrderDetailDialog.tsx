
import React from 'react';
import { Order } from '@/types';
import { Customer } from '@/types';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { OrderTypeBadge } from './OrderTypeBadge';
import { RejectionReasonBadge } from './RejectionReasonBadge';
import { PrintOrderDetail } from './PrintOrderDetail';
import { formatDateToBR } from '@/lib/date-utils';
import { Calendar, User, CreditCard, Package, MessageSquare, FileText } from 'lucide-react';

interface OrderDetailDialogProps {
  selectedOrder: Order;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  selectedCustomer: Customer | null;
  formatCurrency: (value: number) => string;
}

const OrderDetailDialog: React.FC<OrderDetailDialogProps> = ({
  selectedOrder,
  isOpen,
  onOpenChange,
  selectedCustomer,
  formatCurrency
}) => {
  const isNegativeOrder = selectedOrder.total === 0 && selectedOrder.rejectionReason;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <DialogTitle>Detalhes do Pedido #{selectedOrder.code}</DialogTitle>
              <OrderTypeBadge order={selectedOrder} />
            </div>
            <PrintOrderDetail order={selectedOrder} />
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Informações Básicas */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex items-center space-x-2 text-sm">
                <User className="w-4 h-4 text-gray-500" />
                <span className="font-medium">Cliente:</span>
                <span>{selectedOrder.customerName}</span>
              </div>
              <div className="flex items-center space-x-2 text-sm">
                <User className="w-4 h-4 text-gray-500" />
                <span className="font-medium">Vendedor:</span>
                <span>{selectedOrder.salesRepName}</span>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center space-x-2 text-sm">
                <Calendar className="w-4 h-4 text-gray-500" />
                <span className="font-medium">Data:</span>
                <span>{formatDateToBR(selectedOrder.date)}</span>
              </div>
            </div>
          </div>

          <Separator />

          {/* Informações específicas do tipo de pedido */}
          {isNegativeOrder ? (
            <div className="space-y-4">
              <h3 className="font-semibold text-lg flex items-center">
                <MessageSquare className="w-5 h-5 mr-2" />
                Informações da Visita
              </h3>
              
              <div className="bg-orange-50 p-4 rounded-lg space-y-3">
                <div>
                  <span className="font-medium text-sm text-orange-800">Motivo da Recusa:</span>
                  <div className="mt-1">
                    <RejectionReasonBadge reason={selectedOrder.rejectionReason} />
                  </div>
                </div>
                
                {selectedOrder.visitNotes && (
                  <div>
                    <span className="font-medium text-sm text-orange-800">Observações da Visita:</span>
                    <div className="mt-1 p-3 bg-white rounded border border-orange-200 text-sm">
                      {selectedOrder.visitNotes}
                    </div>
                  </div>
                )}
                
                <div className="text-sm text-orange-700">
                  <span className="font-medium">Projeto:</span> {selectedOrder.sourceProject || 'N/A'}
                </div>
              </div>
            </div>
          ) : (
            <>
              {/* Informações de Pagamento */}
              <div className="space-y-3">
                <h3 className="font-semibold text-lg flex items-center">
                  <CreditCard className="w-5 h-5 mr-2" />
                  Informações de Pagamento
                </h3>
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium">Método:</span> {selectedOrder.paymentMethod || 'N/A'}
                  </div>
                  <div>
                    <span className="font-medium">Status:</span> 
                    <Badge variant="outline" className="ml-2">
                      {selectedOrder.paymentStatus || 'N/A'}
                    </Badge>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Itens do Pedido */}
              <div className="space-y-3">
                <h3 className="font-semibold text-lg flex items-center">
                  <Package className="w-5 h-5 mr-2" />
                  Itens do Pedido
                </h3>
                
                {selectedOrder.items && selectedOrder.items.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="text-left p-2">Produto</th>
                          <th className="text-center p-2">Qtd</th>
                          <th className="text-right p-2">Preço Unit.</th>
                          <th className="text-right p-2">Total</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedOrder.items.map((item, index) => (
                          <tr key={index} className="border-b">
                            <td className="p-2">{item.productName}</td>
                            <td className="text-center p-2">{item.quantity}</td>
                            <td className="text-right p-2">{formatCurrency(item.unitPrice || item.price)}</td>
                            <td className="text-right p-2">{formatCurrency(item.total)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-gray-500 text-sm">Nenhum item encontrado</p>
                )}
              </div>

              <Separator />

              {/* Resumo Financeiro */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-lg">Total do Pedido:</span>
                  <span className="font-bold text-xl text-green-600">
                    {formatCurrency(selectedOrder.total)}
                  </span>
                </div>
              </div>
            </>
          )}

          {/* Observações Gerais */}
          {selectedOrder.notes && (
            <>
              <Separator />
              <div className="space-y-2">
                <h3 className="font-semibold text-lg flex items-center">
                  <FileText className="w-5 h-5 mr-2" />
                  Observações
                </h3>
                <div className="p-3 bg-gray-50 rounded-lg text-sm">
                  {selectedOrder.notes}
                </div>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default OrderDetailDialog;
