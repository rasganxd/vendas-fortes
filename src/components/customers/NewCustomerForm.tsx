
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
      sales_rep_id: '',
      createdAt: new Date(),
      updatedAt: new Date(),
      visitSequence: 1
    }
  });

  const handleSubmit = (data: CustomerFormValues) => {
    // Ensure zip and zipCode are consistent
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
          <Button type="submit">Adicionar Cliente</Button>
        </DialogFooter>
      </form>
    </Form>
  );
};

export default NewCustomerForm;
