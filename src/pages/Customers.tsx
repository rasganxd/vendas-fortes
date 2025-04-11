
import React, { useState } from 'react';
import { Search, Plus, ClockIcon } from 'lucide-react';
import PageLayout from '@/components/layout/PageLayout';
import { useCustomers } from '@/hooks/useCustomers';
import { Customer } from '@/types';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogDescription
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Componentes importados
import CustomersTable from '@/components/customers/CustomersTable';
import EditCustomerForm from '@/components/customers/EditCustomerForm';
import NewCustomerForm from '@/components/customers/NewCustomerForm';
import CustomerDetails from '@/components/customers/CustomerDetails';

const Customers = () => {
  const { customers, addCustomer, updateCustomer, deleteCustomer, generateNextCode } = useCustomers();
  const [searchTerm, setSearchTerm] = useState('');
  const [editingCustomer, setEditingCustomer] = useState<null | Customer>(null);
  const [selectedCustomer, setSelectedCustomer] = useState<null | Customer>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isNewCustomerDialogOpen, setIsNewCustomerDialogOpen] = useState(false);
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
  const [sortBy, setSortBy] = useState<string>('name');
  
  const handleEditCustomer = (customer: Customer) => {
    setEditingCustomer(customer);
    setIsDialogOpen(true);
  };

  const handleViewCustomerDetails = (customer: Customer) => {
    setSelectedCustomer(customer);
    setIsDetailsDialogOpen(true);
  };

  const handleDeleteCustomer = (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir este cliente?')) {
      deleteCustomer(id);
    }
  };

  const onSubmit = (data: any) => {
    if (editingCustomer) {
      updateCustomer(editingCustomer.id, {
        ...data,
        createdAt: editingCustomer.createdAt
      });
      setIsDialogOpen(false);
    }
  };

  const onAddCustomer = async (data: any) => {
    await addCustomer({
      ...data,
      createdAt: new Date(),
    });
    setIsNewCustomerDialogOpen(false);
  };

  const handleNewCustomer = () => {
    const nextCode = generateNextCode();
    setIsNewCustomerDialogOpen(true);
  };

  // Filter customers based on search term
  const filteredCustomers = customers.filter(customer => 
    customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (customer.document || '').includes(searchTerm) ||
    customer.phone.includes(searchTerm) ||
    (customer.code?.toString() || '').includes(searchTerm)
  );

  // Sort customers based on selected sort option
  const sortedCustomers = [...filteredCustomers].sort((a, b) => {
    switch (sortBy) {
      case 'name':
        return a.name.localeCompare(b.name);
      case 'code':
        return (a.code || 0) - (b.code || 0);
      case 'visitFrequency':
        const frequencyOrder = {
          'weekly': 1,
          'biweekly': 2,
          'monthly': 3,
          'quarterly': 4,
          undefined: 5
        };
        return (frequencyOrder[a.visitFrequency as keyof typeof frequencyOrder] || 5) - 
               (frequencyOrder[b.visitFrequency as keyof typeof frequencyOrder] || 5);
      default:
        return a.name.localeCompare(b.name);
    }
  });

  return (
    <PageLayout 
      title="Clientes" 
      subtitle="Gerencie seus clientes e suas informações"
    >
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
        <div className="relative w-full sm:w-64 md:w-80">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
          <Input
            type="text"
            placeholder="Buscar clientes..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Select onValueChange={setSortBy} defaultValue={sortBy}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Ordenar por" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="name">Nome</SelectItem>
              <SelectItem value="code">Código</SelectItem>
              <SelectItem value="visitFrequency">
                <div className="flex items-center">
                  <ClockIcon className="mr-2 h-4 w-4" />
                  Frequência de Visita
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
          
          <Button 
            className="bg-sales-800 hover:bg-sales-700"
            onClick={handleNewCustomer}
          >
            <Plus size={16} className="mr-2" />
            Adicionar Cliente
          </Button>
        </div>
      </div>

      <Card className="overflow-hidden">
        <CustomersTable 
          customers={sortedCustomers}
          onView={handleViewCustomerDetails}
          onEdit={handleEditCustomer}
          onDelete={handleDeleteCustomer}
        />
      </Card>

      {/* Dialog para editar cliente */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Editar Cliente</DialogTitle>
            <DialogDescription>
              Atualize as informações e dias de visita do cliente
            </DialogDescription>
          </DialogHeader>
          
          {editingCustomer && (
            <EditCustomerForm 
              customer={editingCustomer}
              onSubmit={onSubmit}
              onCancel={() => setIsDialogOpen(false)}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Dialog para adicionar novo cliente */}
      <Dialog open={isNewCustomerDialogOpen} onOpenChange={setIsNewCustomerDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Adicionar Novo Cliente</DialogTitle>
            <DialogDescription>
              Preencha as informações do novo cliente
            </DialogDescription>
          </DialogHeader>
          
          <NewCustomerForm 
            initialCode={generateNextCode()}
            onSubmit={onAddCustomer}
            onCancel={() => setIsNewCustomerDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Dialog para visualizar detalhes do cliente */}
      <Dialog open={isDetailsDialogOpen} onOpenChange={setIsDetailsDialogOpen}>
        <DialogContent className="sm:max-w-4xl">
          <DialogHeader>
            <DialogTitle>Detalhes do Cliente</DialogTitle>
          </DialogHeader>
          
          {selectedCustomer && (
            <CustomerDetails 
              customer={selectedCustomer}
              onEdit={() => {
                setIsDetailsDialogOpen(false);
                handleEditCustomer(selectedCustomer);
              }}
              onDelete={() => {
                setIsDetailsDialogOpen(false);
                handleDeleteCustomer(selectedCustomer.id);
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </PageLayout>
  );
};

export default Customers;
