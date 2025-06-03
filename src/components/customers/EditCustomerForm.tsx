
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
    // Ensure zip is set
    zip: customer.zip || customer.zipCode || '',
    // Ensure zipCode is also set for backward compatibility
    zipCode: customer.zipCode || customer.zip || '',
    // Ensure visitDays is an array
    visitDays: Array.isArray(customer.visitDays) ? customer.visitDays : (customer.visitDays ? [customer.visitDays] : []),
    // Ensure salesRepId is properly set (use camelCase)
    salesRepId: customer.salesRepId || '',
    // Ensure companyName is set
    companyName: customer.companyName || ''
  };

  console.log("📝 Editing customer with standardized data:", standardizedCustomer);

  const form = useForm<CustomerFormValues>({
    defaultValues: {
      code: standardizedCustomer.code || 0,
      name: standardizedCustomer.name,
      companyName: standardizedCustomer.companyName,
      document: standardizedCustomer.document || '',
      phone: standardizedCustomer.phone,
      address: standardizedCustomer.address || '',
      city: standardizedCustomer.city || '',
      state: standardizedCustomer.state || '',
      zip: standardizedCustomer.zip,
      zipCode: standardizedCustomer.zipCode,
      notes: standardizedCustomer.notes || '',
      visitDays: standardizedCustomer.visitDays || [],
      visitFrequency: standardizedCustomer.visitFrequency || 'weekly',
      visitSequence: standardizedCustomer.visitSequence || 1,
      salesRepId: standardizedCustomer.salesRepId,
      createdAt: standardizedCustomer.createdAt,
      updatedAt: standardizedCustomer.updatedAt || new Date()
    }
  });

  const handleSubmit = (data: CustomerFormValues) => {
    // Ensure data consistency before submitting
    const processedData = {
      ...data,
      zipCode: data.zip, // Keep backward compatibility
      
      // Ensure code is a number
      code: typeof data.code === 'string' ? parseInt(data.code, 10) : data.code,
      
      // Ensure visitDays is an array
      visitDays: Array.isArray(data.visitDays) ? data.visitDays : (data.visitDays ? [data.visitDays as unknown as string] : []),
      
      // Ensure visitSequence is a number
      visitSequence: typeof data.visitSequence === 'string' ? parseInt(data.visitSequence, 10) : data.visitSequence,
      
      // Set updatedAt
      updatedAt: new Date()
    };
    
    console.log("📝 Submitting customer edit with processed data:", processedData);
    onSubmit(processedData);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <div className="max-h-[70vh] overflow-y-auto pr-4 pb-4">
          <CustomerFormFields form={form} />
        </div>
        
        <DialogFooter className="mt-6 bg-background pt-4 pb-1 border-t">
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
