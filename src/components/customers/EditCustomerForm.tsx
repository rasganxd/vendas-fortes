
import React from 'react';
import { useForm } from 'react-hook-form';
import { Customer, CustomerFormValues } from '@/types';
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
  const form = useForm<CustomerFormValues>({
    defaultValues: {
      code: customer.code || 0,
      name: customer.name,
      document: customer.document || '',
      phone: customer.phone,
      address: customer.address || '',
      city: customer.city || '',
      state: customer.state || '',
      zipCode: customer.zipCode || '',
      notes: customer.notes || '',
      visitDays: customer.visitDays || [],
      visitFrequency: customer.visitFrequency || 'weekly',
      visitSequence: customer.visitSequence || 1,
      email: customer.email || '',
      zip: customer.zip || '',
      createdAt: customer.createdAt,
      updatedAt: customer.updatedAt
    }
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
