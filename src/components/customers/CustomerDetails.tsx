
import { useState } from 'react';
import { useAppContext } from '@/hooks/useAppContext';
import { Customer, Order } from '@/types';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { formatDateToBR } from '@/lib/date-utils';
import { 
  MapPin, 
  Phone, 
  Mail, 
  Edit, 
  Trash2, 
  Calendar, 
  Package, 
  DollarSign 
} from 'lucide-react';

interface CustomerDetailsProps {
  customer: Customer;
  onEdit: () => void;
  onDelete: () => void;
}

const CustomerDetails: React.FC<CustomerDetailsProps> = ({ customer, onEdit, onDelete }) => {
  const { orders } = useAppContext();
  const customerOrders = orders.filter(order => order.customerId === customer.id);
  const totalSpent = customerOrders.reduce((acc, order) => acc + order.total, 0);

  return (
    <Card className="col-span-2">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="text-2xl font-bold">{customer.name}</CardTitle>
          <div>
            <Button variant="secondary" size="sm" onClick={onEdit}>
              <Edit size={16} className="mr-2" /> Editar
            </Button>
            <Button variant="destructive" size="sm" onClick={onDelete} className="ml-2">
              <Trash2 size={16} className="mr-2" /> Excluir
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <Tabs defaultValue="info" className="space-y-4">
          <TabsList>
            <TabsTrigger value="info">Informações</TabsTrigger>
            <TabsTrigger value="history">Histórico de Pedidos</TabsTrigger>
          </TabsList>
          <TabsContent value="info" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <div className="flex items-center text-gray-600">
                  <MapPin className="mr-2 h-4 w-4" />
                  {customer.address}, {customer.city}, {customer.state} {customer.zipCode}
                </div>
                <div className="flex items-center text-gray-600">
                  <Phone className="mr-2 h-4 w-4" />
                  {customer.phone}
                </div>
                <div className="flex items-center text-gray-600">
                  <Mail className="mr-2 h-4 w-4" />
                  {customer.email}
                </div>
              </div>
              <div>
                <p className="text-gray-700">
                  <span className="font-semibold">Data de Cadastro:</span> {formatDateToBR(customer.createdAt)}
                </p>
                <p className="text-gray-700">
                  <span className="font-semibold">Total Gasto:</span> R$ {totalSpent.toFixed(2)}
                </p>
              </div>
            </div>
            <div>
              <h4 className="text-lg font-semibold">Observações</h4>
              <p className="text-gray-700">{customer.notes || 'Nenhuma observação.'}</p>
            </div>
          </TabsContent>
          <TabsContent value="history">
            {customerOrders.length > 0 ? (
              <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                {customerOrders.map((order) => (
                  <Card key={order.id}>
                    <CardHeader>
                      <CardTitle>
                        Pedido #{order.id.substring(0, 8)}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center space-x-2">
                        <Calendar className="h-4 w-4 text-gray-500" />
                        <span>{formatDateToBR(order.createdAt)}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <DollarSign className="h-4 w-4 text-gray-500" />
                        <span>Total: R$ {order.total.toFixed(2)}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Package className="h-4 w-4 text-gray-500" />
                        <span>{order.items.length} itens</span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <p>Nenhum pedido encontrado para este cliente.</p>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default CustomerDetails;
