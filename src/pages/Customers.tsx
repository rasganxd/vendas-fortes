import { useState, useEffect } from 'react';
import { useAppData } from '@/context/providers/AppDataProvider';
import PageLayout from '@/components/layout/PageLayout';
import { Button } from '@/components/ui/button';
import { Plus, Search, Upload } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import CustomersTable from '@/components/customers/CustomersTable';
import NewCustomerDialog from '@/components/customers/NewCustomerDialog';
import EditCustomerDialog from '@/components/customers/EditCustomerDialog';
import ViewCustomerDialog from '@/components/customers/ViewCustomerDialog';
import DeleteCustomerDialog from '@/components/customers/DeleteCustomerDialog';
import BulkCustomerImportDialog from '@/components/customers/BulkCustomerImportDialog';
import { Customer } from '@/types';

export default function Customers() {
  const {
    customers,
    isLoading,
    updateCustomer,
    deleteCustomer,
    generateNextCustomerCode
  } = useAppData();
  
  const [filteredCustomers, setFilteredCustomers] = useState<Customer[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isNewCustomerDialogOpen, setIsNewCustomerDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isBulkImportDialogOpen, setIsBulkImportDialogOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [newCustomerCode, setNewCustomerCode] = useState<number>(1);

  // Debug logs
  console.log('🔍 [Customers Page] Current state:', {
    customersCount: customers.length,
    isLoading,
    hasCustomers: customers.length > 0
  });

  // Load new customer code on component mount
  useEffect(() => {
    const loadCustomerCode = async () => {
      try {
        console.log('🔄 [Customers Page] Generating next customer code...');
        const nextCode = await generateNextCustomerCode();
        console.log('✅ [Customers Page] Next customer code:', nextCode);
        setNewCustomerCode(nextCode);
      } catch (error) {
        console.error('❌ [Customers Page] Error generating customer code:', error);
        // Fallback to current max + 1
        const maxCode = customers.length > 0 ? Math.max(...customers.map(c => c.code || 0)) : 0;
        setNewCustomerCode(maxCode + 1);
      }
    };
    loadCustomerCode();
  }, [customers, generateNextCustomerCode]);

  useEffect(() => {
    console.log('🔄 [Customers Page] Filtering customers with search term:', searchTerm);
    if (searchTerm) {
      const filtered = customers.filter(customer => 
        customer.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        customer.email.toLowerCase().includes(searchTerm.toLowerCase()) || 
        customer.phone.includes(searchTerm) || 
        customer.city.toLowerCase().includes(searchTerm.toLowerCase()) || 
        customer.code?.toString().includes(searchTerm)
      );
      console.log('📊 [Customers Page] Filtered customers:', filtered.length);
      setFilteredCustomers(filtered);
    } else {
      console.log('📊 [Customers Page] Showing all customers:', customers.length);
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
  const handleViewCustomer = (customer: Customer) => {
    setSelectedCustomer(customer);
    setIsViewDialogOpen(true);
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
    setIsViewDialogOpen(false);
    setIsDeleteDialogOpen(false);
    setIsBulkImportDialogOpen(false);
    setSelectedCustomer(null);
  };
  const handleEditFromView = () => {
    setIsViewDialogOpen(false);
    setIsEditDialogOpen(true);
  };
  const handleDeleteFromView = () => {
    setIsViewDialogOpen(false);
    setIsDeleteDialogOpen(true);
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

  if (isLoading) {
    console.log('⏳ [Customers Page] Still loading customers...');
    return (
      <PageLayout title="Clientes">
        <div className="flex justify-center items-center py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p>Carregando clientes...</p>
          </div>
        </div>
      </PageLayout>
    );
  }

  console.log('✅ [Customers Page] Rendering customers page with', filteredCustomers.length, 'customers');

  return (
    <PageLayout title="Clientes">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h2 className="text-lg font-medium">Gerencie os clientes da sua empresa</h2>
          <p className="text-sm text-muted-foreground">
            {customers.length} clientes carregados
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            onClick={() => setIsBulkImportDialogOpen(true)}
            variant="outline"
            className="border-blue-600 text-blue-600 hover:bg-blue-50"
          >
            <Upload size={16} className="mr-2" /> Importação em Massa
          </Button>
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
              <Input
                placeholder="Buscar clientes..."
                value={searchTerm}
                onChange={handleSearchChange}
                className="pl-8"
              />
            </div>
            {customers.length > 0 && (
              <Badge variant="outline">
                {filteredCustomers.length} de {customers.length}
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {customers.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>Nenhum cliente encontrado. Adicione o primeiro cliente!</p>
            </div>
          ) : (
            <CustomersTable
              customers={filteredCustomers}
              onEdit={handleEditCustomer}
              onDelete={handleDeleteCustomer}
              onView={handleViewCustomer}
            />
          )}
        </CardContent>
      </Card>

      <NewCustomerDialog
        open={isNewCustomerDialogOpen}
        onOpenChange={setIsNewCustomerDialogOpen}
        initialCode={newCustomerCode}
        onSubmit={handleNewCustomerSubmit}
      />

      <ViewCustomerDialog
        open={isViewDialogOpen}
        onOpenChange={setIsViewDialogOpen}
        customer={selectedCustomer}
        onEdit={handleEditFromView}
        onDelete={handleDeleteFromView}
      />

      <EditCustomerDialog
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        customer={selectedCustomer}
        onSubmit={handleEditCustomerSubmit}
      />

      <DeleteCustomerDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        customer={selectedCustomer}
        onDelete={handleDeleteConfirm}
      />

      <BulkCustomerImportDialog
        open={isBulkImportDialogOpen}
        onOpenChange={setIsBulkImportDialogOpen}
      />
    </PageLayout>
  );
}
