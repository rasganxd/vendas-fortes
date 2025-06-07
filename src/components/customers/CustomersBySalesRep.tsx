
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Customer, SalesRep } from '@/types';
import { customerService } from '@/services';
import { Users, MapPin, RefreshCw, AlertCircle } from 'lucide-react';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { toast } from '@/components/ui/use-toast';

interface CustomersBySalesRepProps {
  salesRep: SalesRep;
}

const CustomersBySalesRep: React.FC<CustomersBySalesRepProps> = ({ salesRep }) => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadCustomers();
  }, [salesRep.id]);

  const loadCustomers = async () => {
    try {
      setIsLoading(true);
      setError(null);
      console.log(`🔍 [CustomersBySalesRep] Loading customers for sales rep: ${salesRep.name} (ID: ${salesRep.id})`);
      
      const allCustomers = await customerService.getAll();
      console.log(`📋 [CustomersBySalesRep] Total customers loaded: ${allCustomers.length}`);
      
      // Filter customers that belong to this specific sales rep
      const salesRepCustomers = allCustomers.filter(customer => {
        const match = customer.salesRepId === salesRep.id;
        console.log(`🔍 [CustomersBySalesRep] Customer ${customer.name} - salesRepId: ${customer.salesRepId}, target: ${salesRep.id}, match: ${match}`);
        return match;
      });
      
      console.log(`✅ [CustomersBySalesRep] Found ${salesRepCustomers.length} customers for sales rep ${salesRep.name} (ID: ${salesRep.id})`);
      
      if (salesRepCustomers.length > 0) {
        console.log(`📋 [CustomersBySalesRep] Customer list:`, salesRepCustomers.map(c => ({
          id: c.id,
          code: c.code,
          name: c.name,
          salesRepId: c.salesRepId,
          salesRepName: c.salesRepName
        })));
      }
      
      setCustomers(salesRepCustomers);
      
      // Show success message
      toast({
        title: "Clientes carregados",
        description: `${salesRepCustomers.length} cliente(s) encontrado(s) para ${salesRep.name}`,
      });
      
    } catch (error) {
      console.error('❌ [CustomersBySalesRep] Error loading customers:', error);
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      setError(errorMessage);
      
      toast({
        title: "Erro ao carregar clientes",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = () => {
    console.log(`🔄 [CustomersBySalesRep] Manual refresh requested for ${salesRep.name}`);
    loadCustomers();
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex justify-center items-center h-32">
          <LoadingSpinner size="md" />
          <span className="ml-2">Carregando clientes...</span>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="flex flex-col justify-center items-center h-32 space-y-4">
          <AlertCircle className="h-8 w-8 text-red-500" />
          <p className="text-red-600 text-center">{error}</p>
          <Button onClick={handleRefresh} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Tentar novamente
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Clientes de {salesRep.name}
            <Badge variant="secondary">{customers.length}</Badge>
          </CardTitle>
          <Button onClick={handleRefresh} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Atualizar
          </Button>
        </div>
        <div className="text-sm text-gray-500">
          Vendedor ID: {salesRep.id} | Código: {salesRep.code}
        </div>
      </CardHeader>
      <CardContent>
        {customers.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Users className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p className="font-medium">Nenhum cliente associado</p>
            <p className="text-sm">Este vendedor ainda não possui clientes cadastrados</p>
          </div>
        ) : (
          <div className="space-y-3">
            {customers.map((customer) => (
              <div key={customer.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
                <div className="flex-1">
                  <div className="font-medium">{customer.name}</div>
                  {customer.companyName && (
                    <div className="text-sm text-gray-600">{customer.companyName}</div>
                  )}
                  <div className="text-sm text-gray-500 flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    {customer.neighborhood && `${customer.neighborhood}, `}
                    {customer.city}, {customer.state}
                  </div>
                  {customer.phone && (
                    <div className="text-sm text-gray-500">{customer.phone}</div>
                  )}
                  <div className="text-xs text-blue-600 mt-1">
                    ID: {customer.id} | Sales Rep ID: {customer.salesRepId}
                  </div>
                </div>
                <div className="text-right">
                  <Badge variant="outline">#{customer.code}</Badge>
                  {customer.salesRepName && (
                    <div className="text-xs text-gray-500 mt-1">
                      {customer.salesRepName}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default CustomersBySalesRep;
