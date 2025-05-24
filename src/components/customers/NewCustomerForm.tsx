
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
