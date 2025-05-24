import { useState, useEffect } from 'react';
import { useAppContext } from '@/hooks/useAppContext';
import PageLayout from '@/components/layout/PageLayout';
import { Button } from '@/components/ui/button';
import { Plus, Search, Download, Upload } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import CustomersTable from '@/components/customers/CustomersTable';
import NewCustomerDialog from '@/components/customers/NewCustomerDialog';
import EditCustomerDialog from '@/components/customers/EditCustomerDialog';
import DeleteCustomerDialog from '@/components/customers/DeleteCustomerDialog';
import { Customer } from '@/types';
import { ProductsActionButtons } from '@/components/products/ProductsActionButtons';
import { useCustomers } from '@/hooks/useCustomers';

export default function Customers() {
  const { customers, isLoadingCustomers } = useAppContext();
  const { generateNextCustomerCode } = useCustomers();
  const [filteredCustomers, setFilteredCustomers] = useState<Customer[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isNewCustomerDialogOpen, setIsNewCustomerDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [newCustomerCode, setNewCustomerCode] = useState<number>(1);

  // Load new customer code on component mount
  useEffect(() => {
    const loadCustomerCode = async () => {
      try {
        const nextCode = await generateNextCustomerCode();
        setNewCustomerCode(nextCode);
      } catch (error) {
        console.error('Error generating customer code:', error);
        // Fallback to current max + 1
        const maxCode = customers.length > 0 ? Math.max(...customers.map(c => c.code || 0)) : 0;
        setNewCustomerCode(maxCode + 1);
      }
    };
    
    loadCustomerCode();
  }, [customers, generateNextCustomerCode]);

  useEffect(() => {
    if (searchTerm) {
      const filtered = customers.filter(customer =>
        customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.phone.includes(searchTerm) ||
        customer.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.code?.toString().includes(searchTerm)
      );
      setFilteredCustomers(filtered);
    } else {
      setFilteredCustomers(customers);
    }
  }, [customers, searchTerm]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleNewCustomer = async () => {
    const nextCode = await generateNextCustomerCode();
    setNewCustomerCode(nextCode);
    setIsNewCustomerDialogOpen(true);
  };

  const handleEditCustomer = (customer: Customer) => {
    setSelectedCustomer(customer);
    setIsEditDialogOpen(true);
  };

  const handleDeleteCustomer = (customer: Customer) => {
    setSelectedCustomer(customer);
    setIsDeleteDialogOpen(true);
  };

  const handleCloseDialogs = () => {
    setIsNewCustomerDialogOpen(false);
    setIsEditDialogOpen(false);
    setIsDeleteDialogOpen(false);
    setSelectedCustomer(null);
  };

  return (
    <PageLayout title="Clientes">
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h2 className="text-lg font-semibold">Gerenciar Clientes</h2>
          <p className="text-gray-500">
            Total: <Badge variant="outline">{customers.length}</Badge> clientes
          </p>
        </div>
        <div className="flex gap-2">
          <ProductsActionButtons />
          <Button onClick={handleNewCustomer} className="bg-sales-800 hover:bg-sales-700">
            <Plus size={16} className="mr-2" /> Novo Cliente
          </Button>
        </div>
      </div>

      <div className="mb-4 flex items-center space-x-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar clientes..."
            value={searchTerm}
            onChange={handleSearchChange}
            className="pl-8"
          />
        </div>
      </div>

      <CustomersTable
        customers={filteredCustomers}
        isLoading={isLoadingCustomers}
        onEdit={handleEditCustomer}
        onDelete={handleDeleteCustomer}
      />

      <NewCustomerDialog
        open={isNewCustomerDialogOpen}
        onOpenChange={setIsNewCustomerDialogOpen}
        customerCode={newCustomerCode}
      />

      <EditCustomerDialog
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        customer={selectedCustomer}
        onClose={handleCloseDialogs}
      />

      <DeleteCustomerDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        customer={selectedCustomer}
        onClose={handleCloseDialogs}
      />
    </PageLayout>
  );
}
