
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Order, Customer } from '@/types';

interface RecentPurchasesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  customer: Customer | null;
  recentOrders: Order[];
}

export default function RecentPurchasesDialog({ 
  open, 
  onOpenChange, 
  customer, 
  recentOrders 
}: RecentPurchasesDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px]">
        <DialogHeader>
          <DialogTitle>
            Compras Recentes - {customer?.name}
          </DialogTitle>
        </DialogHeader>
        <div className="mt-2 max-h-[60vh] overflow-auto">
          {customer && (
            <>
              {recentOrders.length > 0 ? (
                <div className="space-y-4">
                  {recentOrders.map((order) => (
                    <div key={order.id} className="border rounded-md p-3">
                      <div className="flex justify-between items-center mb-2">
                        <div>
                          <span className="font-medium text-lg">Pedido #{order.id.substring(0, 8)}</span>
                          <span className="text-sm text-gray-500 ml-2">
                            {new Date(order.createdAt).toLocaleDateString('pt-BR')}
                          </span>
                        </div>
                        <span className="font-semibold">
                          {order.total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                        </span>
                      </div>
                      <table className="w-full text-sm">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-2 py-1 text-left">Produto</th>
                            <th className="px-2 py-1 text-center">Qtd</th>
                            <th className="px-2 py-1 text-right">Valor</th>
                          </tr>
                        </thead>
                        <tbody>
                          {order.items.map((item) => (
                            <tr key={item.id} className="border-t">
                              <td className="px-2 py-1">{item.productName}</td>
                              <td className="px-2 py-1 text-center">{item.quantity}</td>
                              <td className="px-2 py-1 text-right">
                                {item.unitPrice.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  Este cliente não tem compras registradas.
                </div>
              )}
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
