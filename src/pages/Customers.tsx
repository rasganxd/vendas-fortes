import { useState, useEffect } from 'react';
import { useAppData } from '@/context/providers/AppDataProvider';
import PageLayout from '@/components/layout/PageLayout';
import { Button } from '@/components/ui/button';
import { Plus, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import CustomersTable from '@/components/customers/CustomersTable';
import NewCustomerDialog from '@/components/customers/NewCustomerDialog';
import EditCustomerDialog from '@/components/customers/EditCustomerDialog';
import DeleteCustomerDialog from '@/components/customers/DeleteCustomerDialog';
import { Customer } from '@/types';
export default function Customers() {
  const {
    customers,
    updateCustomer,
    deleteCustomer,
    generateNextCustomerCode
  } = useAppData();
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
      const filtered = customers.filter(customer => customer.name.toLowerCase().includes(searchTerm.toLowerCase()) || customer.email.toLowerCase().includes(searchTerm.toLowerCase()) || customer.phone.includes(searchTerm) || customer.city.toLowerCase().includes(searchTerm.toLowerCase()) || customer.code?.toString().includes(searchTerm));
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
  const handleDeleteCustomer = (id: string, customer: Customer) => {
    setSelectedCustomer(customer);
    setIsDeleteDialogOpen(true);
  };
  const handleCloseDialogs = () => {
    setIsNewCustomerDialogOpen(false);
    setIsEditDialogOpen(false);
    setIsDeleteDialogOpen(false);
    setSelectedCustomer(null);
  };
  const handleNewCustomerSubmit = (data: any) => {
    console.log('✅ New customer submitted successfully:', data);
    setIsNewCustomerDialogOpen(false);
  };
  const handleEditCustomerSubmit = async (data: any) => {
    if (selectedCustomer) {
      await updateCustomer(selectedCustomer.id, data);
      setIsEditDialogOpen(false);
    }
  };
  const handleDeleteConfirm = async (id: string) => {
    await deleteCustomer(id);
    setIsDeleteDialogOpen(false);
  };
  return <PageLayout title="Clientes">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h2 className="text-lg font-medium">Gerencie os clientes da sua empresa</h2>
          
        </div>
        <div className="flex gap-2">
          <Button onClick={handleNewCustomer} className="bg-blue-600 hover:bg-blue-700">
            <Plus size={16} className="mr-2" /> Novo Cliente
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center space-x-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Buscar clientes..." value={searchTerm} onChange={handleSearchChange} className="pl-8" />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <CustomersTable customers={filteredCustomers} onEdit={handleEditCustomer} onDelete={handleDeleteCustomer} onView={handleEditCustomer} />
        </CardContent>
      </Card>

      <NewCustomerDialog open={isNewCustomerDialogOpen} onOpenChange={setIsNewCustomerDialogOpen} initialCode={newCustomerCode} onSubmit={handleNewCustomerSubmit} />

      <EditCustomerDialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen} customer={selectedCustomer} onSubmit={handleEditCustomerSubmit} />

      <DeleteCustomerDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen} customer={selectedCustomer} onDelete={handleDeleteConfirm} />
    </PageLayout>;
}