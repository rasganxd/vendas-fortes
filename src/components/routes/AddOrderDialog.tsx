
import { Order } from '@/types';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter 
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Package } from 'lucide-react';

interface AddOrderDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  orders: Order[];
  onAddOrder: (orderId: string) => void;
}

export const AddOrderDialog = ({ open, onOpenChange, orders, onAddOrder }: AddOrderDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Adicionar Pedido à Rota</DialogTitle>
        </DialogHeader>
        
        <div className="py-4">
          <h3 className="font-medium mb-3">Selecione um pedido para adicionar à rota:</h3>
          {orders.length > 0 ? (
            <div className="space-y-3 max-h-[300px] overflow-y-auto">
              {orders.map(order => (
                <Card key={order.id} className="cursor-pointer hover:bg-gray-50" onClick={() => onAddOrder(order.id)}>
                  <CardContent className="p-3">
                    <div className="flex justify-between">
                      <div>
                        <div className="font-medium">{order.customerName}</div>
                        <div className="text-sm text-gray-500">Pedido #{order.id.substring(0, 6)}</div>
                      </div>
                      <div>
                        <Package size={18} />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-6">
              <p className="text-gray-500">Não há pedidos disponíveis para adicionar à rota.</p>
            </div>
          )}
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
