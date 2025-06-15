import { useState, useEffect } from 'react';
import { useAppData } from '@/context/providers/AppDataProvider';
import PageLayout from '@/components/layout/PageLayout';
import { Button } from '@/components/ui/button';
import { Upload } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import CustomersTable from '@/components/customers/CustomersTable';
import NewCustomerDialog from '@/components/customers/NewCustomerDialog';
import EditCustomerDialog from '@/components/customers/EditCustomerDialog';
import ViewCustomerDialog from '@/components/customers/ViewCustomerDialog';
import DeleteCustomerDialog from '@/components/customers/DeleteCustomerDialog';
import BulkCustomerImportDialog from '@/components/customers/BulkCustomerImportDialog';
import { Customer } from '@/types';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useSalesReps } from '@/hooks/useSalesReps';
import { useCustomerFilters } from '@/hooks/useCustomerFilters';
import CustomerSearchBar from '@/components/customers/CustomerSearchBar';

export default function Customers() {
  const {
    customers,
    isLoading,
    updateCustomer,
    deleteCustomer,
    generateNextCustomerCode
  } = useAppData();

  const { salesReps } = useSalesReps();

  const {
    filteredCustomers,
    searchTerm,
    setSearchTerm,
    sortBy,
    setSortBy,
    salesRepFilter,
    setSalesRepFilter
  } = useCustomerFilters(customers);
  
  const [isNewCustomerDialogOpen, setIsNewCustomerDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isBulkImportDialogOpen, setIsBulkImportDialogOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [newCustomerCode, setNewCustomerCode] = useState<number>(1);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(25);
  
  // Calculate pagination data
  const totalItems = filteredCustomers.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentCustomers = filteredCustomers.slice(startIndex, endIndex);

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
    setCurrentPage(1);
  }, [searchTerm, sortBy, salesRepFilter, itemsPerPage]);

  // Pagination handlers
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleItemsPerPageChange = (value: string) => {
    setItemsPerPage(parseInt(value));
    setCurrentPage(1); // Reset to first page
  };

  const renderPaginationLinks = () => {
    const links = [];
    const maxVisiblePages = 5;
    
    if (totalPages <= maxVisiblePages) {
      // Show all pages if total is small
      for (let i = 1; i <= totalPages; i++) {
        links.push(
          <PaginationItem key={i}>
            <PaginationLink
              onClick={() => handlePageChange(i)}
              isActive={currentPage === i}
              className="cursor-pointer"
            >
              {i}
            </PaginationLink>
          </PaginationItem>
        );
      }
    } else {
      // Show smart pagination with ellipsis
      links.push(
        <PaginationItem key={1}>
          <PaginationLink
            onClick={() => handlePageChange(1)}
            isActive={currentPage === 1}
            className="cursor-pointer"
          >
            1
          </PaginationLink>
        </PaginationItem>
      );

      if (currentPage > 3) {
        links.push(
          <PaginationItem key="ellipsis1">
            <PaginationEllipsis />
          </PaginationItem>
        );
      }

      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);

      for (let i = start; i <= end; i++) {
        links.push(
          <PaginationItem key={i}>
            <PaginationLink
              onClick={() => handlePageChange(i)}
              isActive={currentPage === i}
              className="cursor-pointer"
            >
              {i}
            </PaginationLink>
          </PaginationItem>
        );
      }

      if (currentPage < totalPages - 2) {
        links.push(
          <PaginationItem key="ellipsis2">
            <PaginationEllipsis />
          </PaginationItem>
        );
      }

      if (totalPages > 1) {
        links.push(
          <PaginationItem key={totalPages}>
            <PaginationLink
              onClick={() => handlePageChange(totalPages)}
              isActive={currentPage === totalPages}
              className="cursor-pointer"
            >
              {totalPages}
            </PaginationLink>
          </PaginationItem>
        );
      }
    }

    return links;
  };

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
      <div className="flex justify-between items-start mb-4">
        <div>
          <h2 className="text-lg font-medium">Gerencie os clientes da sua empresa</h2>
          <p className="text-sm text-muted-foreground">
            {totalItems} clientes {searchTerm || salesRepFilter !== 'all' ? 'encontrados' : 'cadastrados'}
            {totalItems > 0 && ` • Mostrando ${startIndex + 1}-${Math.min(endIndex, totalItems)} de ${totalItems}`}
          </p>
        </div>
        <div className="flex-shrink-0">
          <Button 
            onClick={() => setIsBulkImportDialogOpen(true)}
            variant="outline"
            className="border-blue-600 text-blue-600 hover:bg-blue-50"
          >
            <Upload size={16} className="mr-2" /> Importação em Massa
          </Button>
        </div>
      </div>
      
      <CustomerSearchBar
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        sortBy={sortBy}
        setSortBy={setSortBy}
        onAddCustomer={handleNewCustomer}
        salesReps={salesReps}
        selectedSalesRep={salesRepFilter}
        onSalesRepChange={setSalesRepFilter}
      />

      <Card className="mt-4">
        <CardContent className="pt-6">
          {customers.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>Nenhum cliente encontrado. Adicione o primeiro cliente!</p>
            </div>
          ) : (
            <>
              <CustomersTable
                customers={currentCustomers}
                onEdit={handleEditCustomer}
                onDelete={handleDeleteCustomer}
                onView={handleViewCustomer}
              />
              
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-4">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">Itens por página:</span>
                    <Select value={itemsPerPage.toString()} onValueChange={handleItemsPerPageChange}>
                      <SelectTrigger className="w-20">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="10">10</SelectItem>
                        <SelectItem value="25">25</SelectItem>
                        <SelectItem value="50">50</SelectItem>
                        <SelectItem value="100">100</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Pagination>
                    <PaginationContent>
                      <PaginationItem>
                        <PaginationPrevious 
                          onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                          className={currentPage === 1 ? "pointer-events-none opacity-50 cursor-not-allowed" : "cursor-pointer"}
                        />
                      </PaginationItem>
                      {renderPaginationLinks()}
                      <PaginationItem>
                        <PaginationNext 
                          onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                          className={currentPage === totalPages ? "pointer-events-none opacity-50 cursor-not-allowed" : "cursor-pointer"}
                        />
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                </div>
              )}
            </>
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
