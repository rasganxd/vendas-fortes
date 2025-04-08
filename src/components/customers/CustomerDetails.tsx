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
  DollarSign,
  User,
  ShoppingBag
} from 'lucide-react';

interface CustomerDetailsProps {
  customer: Customer;
  onEdit: () => void;
  onDelete: () => void;
}

interface FrequentProduct {
  id: string;
  name: string;
  quantity: number;
  unitPrice: number;
  totalQuantity: number;
  occurrences: number;
}

const CustomerDetails: React.FC<CustomerDetailsProps> = ({ customer, onEdit, onDelete }) => {
  const { orders } = useAppContext();
  const customerOrders = orders.filter(order => order.customerId === customer.id);
  const totalSpent = customerOrders.reduce((acc, order) => acc + order.total, 0);

  const getFrequentProducts = (): FrequentProduct[] => {
    if (customerOrders.length === 0) return [];
    
    const allProducts = customerOrders.flatMap(order => 
      order.items.map(item => ({
        id: item.productId,
        name: item.productName,
        quantity: item.quantity,
        unitPrice: item.unitPrice
      }))
    );
    
    const productMap: Record<string, FrequentProduct> = allProducts.reduce((acc, product) => {
      if (!acc[product.id]) {
        acc[product.id] = { 
          ...product, 
          totalQuantity: 0, 
          occurrences: 0 
        };
      }
      acc[product.id].totalQuantity += product.quantity;
      acc[product.id].occurrences += 1;
      return acc;
    }, {} as Record<string, FrequentProduct>);
    
    return Object.values(productMap)
      .sort((a, b) => b.totalQuantity - a.totalQuantity)
      .slice(0, 5);
  };

  const sortedOrders = [...customerOrders].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

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
            <TabsTrigger value="purchases">Compras Frequentes</TabsTrigger>
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
                  <User className="mr-2 h-4 w-4" />
                  {customer.document || 'Não informado'}
                </div>
              </div>
              <div>
                <p className="text-gray-700">
                  <span className="font-semibold">Data de Cadastro:</span> {formatDateToBR(customer.createdAt)}
                </p>
                <p className="text-gray-700">
                  <span className="font-semibold">Total Gasto:</span> {totalSpent.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                </p>
                <p className="text-gray-700">
                  <span className="font-semibold">Número de Pedidos:</span> {customerOrders.length}
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
                {sortedOrders.map((order) => (
                  <Card key={order.id}>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base">
                        Pedido #{order.id.substring(0, 8)}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pb-4">
                      <div className="flex items-center space-x-2 text-sm">
                        <Calendar className="h-4 w-4 text-gray-500" />
                        <span>{formatDateToBR(order.createdAt)}</span>
                      </div>
                      <div className="flex items-center space-x-2 text-sm">
                        <DollarSign className="h-4 w-4 text-gray-500" />
                        <span>Total: {order.total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
                      </div>
                      <div className="flex items-center space-x-2 text-sm">
                        <Package className="h-4 w-4 text-gray-500" />
                        <span>{order.items.length} itens</span>
                      </div>
                      
                      <div className="mt-3 pt-3 border-t">
                        <h6 className="text-xs font-semibold mb-1">Itens:</h6>
                        <div className="max-h-28 overflow-y-auto">
                          {order.items.slice(0, 5).map((item, index) => (
                            <div key={index} className="text-xs flex justify-between py-0.5 text-gray-700">
                              <div>{item.quantity}x {item.productName}</div>
                              <div>{item.unitPrice.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</div>
                            </div>
                          ))}
                          {order.items.length > 5 && (
                            <div className="text-xs text-gray-500 italic pt-1">
                              + {order.items.length - 5} mais itens...
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <p>Nenhum pedido encontrado para este cliente.</p>
            )}
          </TabsContent>
          <TabsContent value="purchases">
            <div className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
                <h4 className="font-medium flex items-center mb-2">
                  <ShoppingBag size={18} className="mr-2 text-blue-600" />
                  Produtos Mais Comprados
                </h4>
                {getFrequentProducts().length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="px-3 py-2 text-left">Produto</th>
                          <th className="px-3 py-2 text-right">Quantidade Total</th>
                          <th className="px-3 py-2 text-right">Preço</th>
                          <th className="px-3 py-2 text-right">Ocorrências</th>
                        </tr>
                      </thead>
                      <tbody>
                        {getFrequentProducts().map(product => (
                          <tr key={product.id} className="border-b">
                            <td className="px-3 py-2">{product.name}</td>
                            <td className="px-3 py-2 text-right">{product.totalQuantity}</td>
                            <td className="px-3 py-2 text-right">
                              {product.unitPrice.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                            </td>
                            <td className="px-3 py-2 text-right">{product.occurrences}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-gray-500">Nenhuma compra registrada para este cliente.</p>
                )}
              </div>
              
              <div className="bg-gray-50 border rounded-md p-4">
                <h4 className="font-medium mb-2">Resumo de Compras</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <dl className="space-y-2">
                      <div className="flex justify-between">
                        <dt className="font-medium text-gray-600">Total gasto:</dt>
                        <dd>{totalSpent.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="font-medium text-gray-600">Número de pedidos:</dt>
                        <dd>{customerOrders.length}</dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="font-medium text-gray-600">Média por pedido:</dt>
                        <dd>
                          {customerOrders.length > 0
                            ? (totalSpent / customerOrders.length).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
                            : 'R$ 0,00'}
                        </dd>
                      </div>
                    </dl>
                  </div>
                  <div>
                    <dl className="space-y-2">
                      <div className="flex justify-between">
                        <dt className="font-medium text-gray-600">Primeira compra:</dt>
                        <dd>
                          {customerOrders.length > 0
                            ? formatDateToBR(
                                customerOrders.reduce(
                                  (oldest, order) => 
                                    new Date(order.createdAt) < new Date(oldest.createdAt) 
                                      ? order 
                                      : oldest, 
                                  customerOrders[0]
                                ).createdAt
                              )
                            : 'N/A'}
                        </dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="font-medium text-gray-600">Última compra:</dt>
                        <dd>
                          {customerOrders.length > 0
                            ? formatDateToBR(
                                customerOrders.reduce(
                                  (newest, order) => 
                                    new Date(order.createdAt) > new Date(newest.createdAt) 
                                      ? order 
                                      : newest, 
                                  customerOrders[0]
                                ).createdAt
                              )
                            : 'N/A'}
                        </dd>
                      </div>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default CustomerDetails;
