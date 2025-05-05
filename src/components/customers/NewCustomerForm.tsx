
import React from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Form } from '@/components/ui/form';
import { DialogFooter } from '@/components/ui/dialog';
import { Customer, CustomerFormValues } from '@/types';
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
      zipCode: '',
      notes: '',
      visitDays: [] as string[],
      visitFrequency: 'weekly',
      email: '',
      zip: '',
      createdAt: new Date(),
      updatedAt: new Date(),
      visitSequence: 1
    }
  });

  const handleSubmit = (data: CustomerFormValues) => {
    onSubmit({
      ...data,
      // Ensure zip is set from zipCode for backward compatibility
      zip: data.zipCode
    });
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
