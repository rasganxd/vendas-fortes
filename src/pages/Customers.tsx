
import React from 'react';
import PageLayout from '@/components/layout/PageLayout';
import { useAppContext } from '@/context/AppContext';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';

const Customers = () => {
  const { customers } = useAppContext();

  return (
    <PageLayout 
      title="Clientes" 
      subtitle="Gerencie seus clientes e suas informações"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {customers.map((customer) => (
          <Card key={customer.id} className="p-6 shadow-md hover:shadow-lg transition-shadow">
            <h3 className="text-xl font-medium text-gray-800">{customer.name}</h3>
            <p className="text-gray-600 mt-2">{customer.email}</p>
            <p className="text-gray-600">{customer.phone}</p>
            <div className="flex justify-end mt-4">
              <Button variant="outline" className="mr-2">Editar</Button>
              <Button variant="destructive">Excluir</Button>
            </div>
          </Card>
        ))}
      </div>

      <div className="mt-8">
        <Button className="bg-sales-800 hover:bg-sales-700">
          Adicionar Novo Cliente
        </Button>
      </div>
    </PageLayout>
  );
};

export default Customers;
