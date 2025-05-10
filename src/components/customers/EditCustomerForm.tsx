
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
    visitDays: Array.isArray(customer.visitDays) ? customer.visitDays : (customer.visitDays ? [customer.visitDays] : [])
  };

  const form = useForm<CustomerFormValues>({
    defaultValues: {
      code: standardizedCustomer.code || 0,
      name: standardizedCustomer.name,
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
      email: standardizedCustomer.email || '',
      createdAt: standardizedCustomer.createdAt,
      updatedAt: standardizedCustomer.updatedAt || new Date()
    }
  });

  const handleSubmit = (data: CustomerFormValues) => {
    // Ensure data consistency before submitting
    data.zipCode = data.zip;
    
    // Ensure code is a number
    if (typeof data.code === 'string') {
      data.code = parseInt(data.code, 10);
    }
    
    // Ensure visitDays is an array
    if (!Array.isArray(data.visitDays)) {
      data.visitDays = data.visitDays ? [data.visitDays as unknown as string] : [];
    }
    
    onSubmit(data);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <CustomerFormFields form={form} />
        
        <DialogFooter className="mt-6">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancelar
          </Button>
          <Button type="submit">Salvar Alterações</Button>
        </DialogFooter>
      </form>
    </Form>
  );
};

export default EditCustomerForm;
