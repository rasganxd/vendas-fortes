
import React from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Form } from '@/components/ui/form';
import { DialogFooter } from '@/components/ui/dialog';
import { Customer, CustomerFormValues } from '@/types/customer';
import { CustomerFormFields } from './CustomerFormFields';

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
      email: '',
      address: '',
      neighborhood: '', // Novo campo bairro
      city: '',
      state: '',
      zip: '',
      zipCode: '',
      notes: '',
      visitDays: [] as string[],
      visitFrequency: 'weekly',
      salesRepId: '',
      createdAt: new Date(),
      updatedAt: new Date(),
      visitSequence: 1
    }
  });

  const handleSubmit = (data: CustomerFormValues) => {
    console.log('📝 [NewCustomerForm] Form submitted with data:', data);
    
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

  // Log validation errors for debugging
  React.useEffect(() => {
    if (Object.keys(form.formState.errors).length > 0) {
      console.log('⚠️ [NewCustomerForm] Validation errors:', form.formState.errors);
    }
  }, [form.formState.errors]);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-2">
        <div className="max-h-[75vh] overflow-y-auto pr-4 pb-2">
          <CustomerFormFields 
            form={form}
            isSubmitting={form.formState.isSubmitting}
            nextCustomerCode={initialCode}
          />
        </div>
        
        <DialogFooter className="mt-4 bg-background pt-4 pb-1 border-t">
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
