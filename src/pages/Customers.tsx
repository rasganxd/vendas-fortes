
import React, { useState } from 'react';
import PageLayout from '@/components/layout/PageLayout';
import { useCustomers } from '@/hooks/useCustomers';
import { Customer } from '@/types';

// Refactored components
import CustomerSearchBar from '@/components/customers/CustomerSearchBar';
import CustomersList from '@/components/customers/CustomersList';
import EditCustomerDialog from '@/components/customers/EditCustomerDialog';
import NewCustomerDialog from '@/components/customers/NewCustomerDialog';
import CustomerDetailsDialog from '@/components/customers/CustomerDetailsDialog';
import DeleteCustomerDialog from '@/components/customers/DeleteCustomerDialog';

const Customers = () => {
  // Use the full hook with all the operations it provides
  const { customers, addCustomer, updateCustomer, deleteCustomer, generateNextCustomerCode: generateNextCode } = useCustomers();
  const [searchTerm, setSearchTerm] = useState('');
  const [editingCustomer, setEditingCustomer] = useState<null | Customer>(null);
  const [selectedCustomer, setSelectedCustomer] = useState<null | Customer>(null);
  const [customerToDelete, setCustomerToDelete] = useState<null | Customer>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isNewCustomerDialogOpen, setIsNewCustomerDialogOpen] = useState(false);
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [sortBy, setSortBy] = useState<string>('name');
  
  const handleEditCustomer = (customer: Customer) => {
    setEditingCustomer(customer);
    setIsDialogOpen(true);
  };

  const handleViewCustomerDetails = (customer: Customer) => {
    setSelectedCustomer(customer);
    setIsDetailsDialogOpen(true);
  };

  const handleDeleteCustomer = (id: string, customer: Customer) => {
    setCustomerToDelete(customer);
    setIsDeleteDialogOpen(true);
  };

  const onDeleteCustomer = async (id: string) => {
    await deleteCustomer(id);
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
    setIsNewCustomerDialogOpen(true);
  };

  // Filter customers based on search term - adding null checks to prevent toLowerCase error
  const filteredCustomers = customers.filter(customer => {
    // Only filter if searchTerm is not empty
    if (!searchTerm) return true;
    
    // Add null checks for each property before calling toLowerCase()
    return (
      (customer.name && customer.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (customer.document && customer.document.includes(searchTerm)) ||
      (customer.phone && customer.phone.includes(searchTerm)) ||
      (customer.code !== undefined && customer.code !== null && customer.code.toString().includes(searchTerm))
    );
  });

  // Sort customers based on selected sort option
  const sortedCustomers = [...filteredCustomers].sort((a, b) => {
    switch (sortBy) {
      case 'name':
        return (a.name || '').localeCompare(b.name || '');
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
      case 'salesRep':
        return (a.sales_rep_name || '').localeCompare(b.sales_rep_name || '');
      default:
        return (a.name || '').localeCompare(b.name || '');
    }
  });

  return (
    <PageLayout 
      title="Clientes" 
      subtitle="Gerencie seus clientes e suas informações"
    >
      <CustomerSearchBar 
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        sortBy={sortBy}
        setSortBy={setSortBy}
        onAddCustomer={handleNewCustomer}
      />

      <CustomersList 
        customers={sortedCustomers}
        onView={handleViewCustomerDetails}
        onEdit={handleEditCustomer}
        onDelete={handleDeleteCustomer}
      />

      {/* Dialogs */}
      <EditCustomerDialog 
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        customer={editingCustomer}
        onSubmit={onSubmit}
      />

      <NewCustomerDialog 
        open={isNewCustomerDialogOpen}
        onOpenChange={setIsNewCustomerDialogOpen}
        initialCode={generateNextCode()}
        onSubmit={onAddCustomer}
      />

      <CustomerDetailsDialog 
        open={isDetailsDialogOpen}
        onOpenChange={setIsDetailsDialogOpen}
        customer={selectedCustomer}
        onEdit={() => {
          setIsDetailsDialogOpen(false);
          if (selectedCustomer) handleEditCustomer(selectedCustomer);
        }}
        onDelete={() => {
          setIsDetailsDialogOpen(false);
          if (selectedCustomer) handleDeleteCustomer(selectedCustomer.id, selectedCustomer);
        }}
      />

      <DeleteCustomerDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        customer={customerToDelete}
        onDelete={onDeleteCustomer}
      />
    </PageLayout>
  );
};

export default Customers;
