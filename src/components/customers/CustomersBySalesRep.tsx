
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Customer, SalesRep } from '@/types';
import { customerService } from '@/services';
import { Users, MapPin } from 'lucide-react';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

interface CustomersBySalesRepProps {
  salesRep: SalesRep;
}

const CustomersBySalesRep: React.FC<CustomersBySalesRepProps> = ({ salesRep }) => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadCustomers();
  }, [salesRep.id]);

  const loadCustomers = async () => {
    try {
      setIsLoading(true);
      console.log(`🔍 Loading customers for sales rep ID: ${salesRep.id}`);
      
      const allCustomers = await customerService.getAll();
      console.log(`📋 Total customers loaded: ${allCustomers.length}`);
      
      // Filter customers that belong to this specific sales rep
      const salesRepCustomers = allCustomers.filter(customer => {
        console.log(`Customer ${customer.name} - salesRepId: ${customer.salesRepId}, looking for: ${salesRep.id}`);
        return customer.salesRepId === salesRep.id;
      });
      
      console.log(`✅ Found ${salesRepCustomers.length} customers for sales rep ${salesRep.name} (ID: ${salesRep.id})`);
      setCustomers(salesRepCustomers);
    } catch (error) {
      console.error('❌ Error loading customers:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex justify-center items-center h-32">
          <LoadingSpinner size="md" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          Clientes de {salesRep.name} (ID: {salesRep.id})
          <Badge variant="secondary">{customers.length}</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {customers.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Users className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p>Nenhum cliente associado a este vendedor</p>
          </div>
        ) : (
          <div className="space-y-3">
            {customers.map((customer) => (
              <div key={customer.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex-1">
                  <div className="font-medium">{customer.name}</div>
                  <div className="text-sm text-gray-500 flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    {customer.city}, {customer.state}
                  </div>
                  {customer.phone && (
                    <div className="text-sm text-gray-500">{customer.phone}</div>
                  )}
                  <div className="text-xs text-blue-600 mt-1">
                    Sales Rep ID: {customer.salesRepId || 'Não definido'}
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
