
import { useState } from 'react';
import { useAppContext } from '@/context/AppContext';
import { Customer, Order } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { formatDateToBR } from '@/lib/date-utils';
import { 
  ShoppingBag, 
  Phone, 
  Mail, 
  MapPin, 
  Calendar, 
  ArrowRight, 
  Package 
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface CustomerDetailsProps {
  customer: Customer;
}

export default function CustomerDetails({ customer }: CustomerDetailsProps) {
  const { orders } = useAppContext();
  const [showAllOrders, setShowAllOrders] = useState(false);
  
  const customerOrders = orders.filter(order => order.customerId === customer.id);
  const recentOrders = showAllOrders ? customerOrders : customerOrders.slice(0, 5);
  
  // Calculate total purchases amount
  const totalPurchases = customerOrders.reduce((sum, order) => sum + order.total, 0);
  
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'draft':
        return <Badge variant="outline">Rascunho</Badge>;
      case 'confirmed':
        return <Badge className="bg-blue-500">Confirmado</Badge>;
      case 'delivered':
        return <Badge className="bg-green-500">Entregue</Badge>;
      case 'cancelled':
        return <Badge variant="destructive">Cancelado</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getPaymentStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="border-yellow-500 text-yellow-500">Pendente</Badge>;
      case 'partial':
        return <Badge className="bg-blue-500">Parcial</Badge>;
      case 'paid':
        return <Badge className="bg-green-500">Pago</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Customer Info */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Informações do Cliente</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Phone className="text-gray-500" size={16} />
                <div>
                  <p className="text-sm font-medium">Telefone</p>
                  <p className="text-sm text-gray-700">{customer.phone}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="text-gray-500" size={16} />
                <div>
                  <p className="text-sm font-medium">Email</p>
                  <p className="text-sm text-gray-700">{customer.email}</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <MapPin className="text-gray-500" size={16} />
                <div>
                  <p className="text-sm font-medium">Endereço</p>
                  <p className="text-sm text-gray-700">{customer.address}</p>
                  <p className="text-sm text-gray-700">{customer.city} - {customer.state}, {customer.zipCode}</p>
                </div>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Calendar className="text-gray-500" size={16} />
                <div>
                  <p className="text-sm font-medium">Cliente desde</p>
                  <p className="text-sm text-gray-700">{formatDateToBR(customer.createdAt)}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <ShoppingBag className="text-gray-500" size={16} />
                <div>
                  <p className="text-sm font-medium">Total de pedidos</p>
                  <p className="text-sm text-gray-700">{customerOrders.length} pedidos</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Package className="text-gray-500" size={16} />
                <div>
                  <p className="text-sm font-medium">Total de compras</p>
                  <p className="text-sm font-semibold text-green-700">
                    {totalPurchases.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          {customer.notes && (
            <div className="mt-4 p-3 bg-gray-50 rounded-md">
              <p className="text-sm font-medium">Observações</p>
              <p className="text-sm text-gray-700">{customer.notes}</p>
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Purchase History */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Histórico de Compras</CardTitle>
        </CardHeader>
        <CardContent>
          {customerOrders.length > 0 ? (
            <div className="space-y-4">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left font-medium py-2 px-2">Nº Pedido</th>
                      <th className="text-left font-medium py-2 px-2">Data</th>
                      <th className="text-left font-medium py-2 px-2">Valor</th>
                      <th className="text-left font-medium py-2 px-2">Status</th>
                      <th className="text-left font-medium py-2 px-2">Pagamento</th>
                      <th className="text-left font-medium py-2 px-2"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentOrders.map((order: Order) => (
                      <tr key={order.id} className="border-b">
                        <td className="py-2 px-2 font-medium">{order.id}</td>
                        <td className="py-2 px-2">{formatDateToBR(order.createdAt)}</td>
                        <td className="py-2 px-2">
                          {order.total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                        </td>
                        <td className="py-2 px-2">{getStatusBadge(order.status)}</td>
                        <td className="py-2 px-2">{getPaymentStatusBadge(order.paymentStatus)}</td>
                        <td className="py-2 px-2">
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <ArrowRight size={16} />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              {customerOrders.length > 5 && (
                <div className="text-center">
                  <Button 
                    variant="outline" 
                    onClick={() => setShowAllOrders(!showAllOrders)}
                  >
                    {showAllOrders ? 'Mostrar menos' : `Ver todos os ${customerOrders.length} pedidos`}
                  </Button>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8">
              <ShoppingBag className="mx-auto text-gray-300 mb-2" size={40} />
              <p className="text-gray-500 mb-2">Este cliente ainda não realizou compras</p>
              <Button>Criar Novo Pedido</Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
