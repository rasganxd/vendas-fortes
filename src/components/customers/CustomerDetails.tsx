
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
    <Card className="col-span-2 border-none shadow-lg bg-white/80 backdrop-blur-sm animate-fade-in hover:shadow-xl transition-all">
      <CardHeader className="bg-gradient-to-r from-sales-800 to-teal-600 text-white rounded-t-lg">
        <div className="flex justify-between items-center">
          <CardTitle className="text-2xl font-bold text-white">{customer.name}</CardTitle>
          <div className="space-x-2">
            <Button variant="secondary" size="sm" onClick={onEdit} className="bg-white/20 hover:bg-white/40 transition-colors">
              <Edit size={16} className="mr-2" /> Editar
            </Button>
            <Button variant="destructive" size="sm" onClick={onDelete} className="hover:bg-red-600 transition-colors">
              <Trash2 size={16} className="mr-2" /> Excluir
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4 p-6">
        <Tabs defaultValue="info" className="space-y-4">
          <TabsList className="bg-blue-50 p-1">
            <TabsTrigger value="info" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-sales-800 data-[state=active]:to-teal-600 data-[state=active]:text-white transition-all">Informações</TabsTrigger>
            <TabsTrigger value="history" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-sales-800 data-[state=active]:to-teal-600 data-[state=active]:text-white transition-all">Histórico de Pedidos</TabsTrigger>
          </TabsList>
          <TabsContent value="info" className="space-y-4 animate-fade-in">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div className="flex items-center text-gray-600 hover:text-sales-800 transition-colors">
                  <MapPin className="mr-2 h-4 w-4 text-teal-600" />
                  {customer.address}, {customer.city}, {customer.state} {customer.zipCode}
                </div>
                <div className="flex items-center text-gray-600 hover:text-sales-800 transition-colors">
                  <Phone className="mr-2 h-4 w-4 text-teal-600" />
                  {customer.phone}
                </div>
                <div className="flex items-center text-gray-600 hover:text-sales-800 transition-colors">
                  <Mail className="mr-2 h-4 w-4 text-teal-600" />
                  {customer.email}
                </div>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg hover:scale-[1.02] transition-transform">
                <p className="text-gray-700 flex items-center">
                  <Calendar className="mr-2 h-4 w-4 text-sales-800" />
                  <span className="font-semibold">Data de Cadastro:</span> {formatDateToBR(customer.createdAt)}
                </p>
                <p className="text-gray-700 flex items-center mt-2">
                  <DollarSign className="mr-2 h-4 w-4 text-green-600" />
                  <span className="font-semibold">Total Gasto:</span> 
                  <span className="font-bold ml-1 text-green-600">R$ {totalSpent.toFixed(2)}</span>
                </p>
              </div>
            </div>
            <div className="bg-blue-50/50 p-4 rounded-lg border-l-4 border-teal-600">
              <h4 className="text-lg font-semibold text-sales-800">Observações</h4>
              <p className="text-gray-700 mt-1">{customer.notes || 'Nenhuma observação.'}</p>
            </div>
          </TabsContent>
          <TabsContent value="history" className="animate-fade-in">
            {customerOrders.length > 0 ? (
              <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                {customerOrders.map((order) => (
                  <Card key={order.id} className="overflow-hidden hover:shadow-md hover:scale-[1.02] transition-all duration-300">
                    <CardHeader className="bg-gradient-to-r from-sales-700 to-sales-800 text-white py-3 px-4">
                      <CardTitle className="text-base font-medium">
                        Pedido #{order.id.substring(0, 8)}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-4">
                      <div className="flex items-center space-x-2 my-1">
                        <Calendar className="h-4 w-4 text-sales-600" />
                        <span>{formatDateToBR(order.createdAt)}</span>
                      </div>
                      <div className="flex items-center space-x-2 my-1">
                        <DollarSign className="h-4 w-4 text-green-500" />
                        <span>Total: <span className="font-bold">R$ {order.total.toFixed(2)}</span></span>
                      </div>
                      <div className="flex items-center space-x-2 my-1">
                        <Package className="h-4 w-4 text-teal-500" />
                        <span>{order.items.length} itens</span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center p-8 bg-gray-50 rounded-lg">
                <Package className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-500">Nenhum pedido encontrado para este cliente.</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default CustomerDetails;
