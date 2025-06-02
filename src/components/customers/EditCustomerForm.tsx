import React from 'react';
import { useForm } from 'react-hook-form';
import { Customer, CustomerFormValues } from '@/types/customer';
import { Button } from '@/components/ui/button';
import { 
  Form,
} from '@/components/ui/form';
import { DialogFooter } from '@/components/ui/dialog';
import CustomerFormFields from './CustomerFormFields';

interface EditCustomerFormProps {
  customer: Customer;
  onSubmit: (data: Partial<Customer>) => void;
  onCancel: () => void;
}

const EditCustomerForm: React.FC<EditCustomerFormProps> = ({ customer, onSubmit, onCancel }) => {
  // Standardize the customer data before setting form defaults
  const standardizedCustomer = {
    ...customer,
    // Convert database fields to form fields
    zip: customer.zip_code || '',
    zipCode: customer.zip_code || '',
    visitDays: Array.isArray(customer.visit_days) ? customer.visit_days : (customer.visit_days ? [customer.visit_days] : []),
    salesRepId: customer.sales_rep_id || '',
    companyName: customer.company_name || '',
    visitFrequency: customer.visit_frequency || 'weekly',
    visitSequence: customer.visit_sequence || 1
  };

  console.log("📝 Editing customer with standardized data:", standardizedCustomer);

  const form = useForm<CustomerFormValues>({
    defaultValues: {
      code: standardizedCustomer.code || 0,
      name: standardizedCustomer.name,
      companyName: standardizedCustomer.companyName,
      document: standardizedCustomer.document || '',
      phone: standardizedCustomer.phone || '',
      address: standardizedCustomer.address || '',
      city: standardizedCustomer.city || '',
      state: standardizedCustomer.state || '',
      zip: standardizedCustomer.zip,
      zipCode: standardizedCustomer.zipCode,
      notes: standardizedCustomer.notes || '',
      visitDays: standardizedCustomer.visitDays || [],
      visitFrequency: standardizedCustomer.visitFrequency,
      visitSequence: standardizedCustomer.visitSequence,
      email: standardizedCustomer.email || '',
      salesRepId: standardizedCustomer.salesRepId,
      createdAt: standardizedCustomer.createdAt,
      updatedAt: standardizedCustomer.updatedAt || new Date(),
      active: standardizedCustomer.active
    }
  });

  const handleSubmit = (data: CustomerFormValues) => {
    // Convert form values back to Customer database format
    const processedData: Partial<Customer> = {
      code: data.code,
      name: data.name,
      company_name: data.companyName,
      document: data.document,
      phone: data.phone,
      email: data.email,
      address: data.address,
      city: data.city,
      state: data.state,
      zip_code: data.zip,
      notes: data.notes,
      visit_days: data.visitDays,
      visit_frequency: data.visitFrequency,
      visit_sequence: data.visitSequence,
      sales_rep_id: data.salesRepId,
      active: data.active,
      updatedAt: new Date()
    };
    
    console.log("📝 Submitting customer edit with processed data:", processedData);
    onSubmit(processedData);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <div className="max-h-[60vh] overflow-y-auto pr-4 pb-4">
          <CustomerFormFields form={form} />
        </div>
        
        <DialogFooter className="mt-6 bg-background pt-2 pb-1">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancelar
          </Button>
          <Button type="submit" variant="sales">
            Salvar Alterações
          </Button>
        </DialogFooter>
      </form>
    </Form>
  );
};

export default EditCustomerForm;
