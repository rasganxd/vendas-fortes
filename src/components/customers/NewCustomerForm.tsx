import React from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Form } from '@/components/ui/form';
import { DialogFooter } from '@/components/ui/dialog';
import { Customer, CustomerFormValues } from '@/types/customer';
import CustomerFormFields from './CustomerFormFields';

interface NewCustomerFormProps {
  initialCode: number;
  onSubmit: (data: Omit<Customer, 'id'>) => void;
  onCancel: () => void;
}

const NewCustomerForm: React.FC<NewCustomerFormProps> = ({ initialCode, onSubmit, onCancel }) => {
  const form = useForm<CustomerFormValues>({
    defaultValues: {
      code: initialCode,
      name: '',
      companyName: '',
      document: '',
      phone: '',
      address: '',
      city: '',
      state: '',
      zip: '',
      zipCode: '',
      notes: '',
      visitDays: [] as string[],
      visitFrequency: 'weekly',
      email: '',
      salesRepId: '',
      createdAt: new Date(),
      updatedAt: new Date(),
      visitSequence: 1,
      active: true
    }
  });

  const handleSubmit = (data: CustomerFormValues) => {
    // Convert form values to Customer format
    const customerData: Omit<Customer, 'id'> = {
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
      createdAt: data.createdAt,
      updatedAt: data.updatedAt
    };
    
    onSubmit(customerData);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-2">
        <div className="max-h-[70vh] overflow-y-auto pr-4 pb-2">
          <CustomerFormFields form={form} />
        </div>
        
        <DialogFooter className="mt-3 bg-background pt-2 pb-1">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancelar
          </Button>
          <Button type="submit">Adicionar Cliente</Button>
        </DialogFooter>
      </form>
    </Form>
  );
};

export default NewCustomerForm;
