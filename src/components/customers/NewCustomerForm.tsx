
import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Form } from '@/components/ui/form';
import { DialogFooter } from '@/components/ui/dialog';
import { Customer, CustomerFormValues } from '@/types/customer';
import { CustomerFormFields } from './CustomerFormFields';
import { Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { SalesRep } from '@/types';

interface NewCustomerFormProps {
  initialCode: number;
  onSubmit: (data: Omit<Customer, 'id'>) => void;
  onCancel: () => void;
}

const NewCustomerForm: React.FC<NewCustomerFormProps> = ({ initialCode, onSubmit, onCancel }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [salesReps, setSalesReps] = useState<SalesRep[]>([]);
  
  useEffect(() => {
    const loadSalesReps = async () => {
      const { data, error } = await supabase
        .from('sales_reps')
        .select('id, code, name, phone, email, active, created_at, updated_at')
        .eq('active', true)
        .order('name');
      
      if (!error && data) {
        setSalesReps(data.map(rep => ({
          id: rep.id,
          code: rep.code,
          name: rep.name,
          phone: rep.phone || '',
          email: rep.email || '',
          active: rep.active ?? true,
          createdAt: new Date(rep.created_at),
          updatedAt: new Date(rep.updated_at)
        })));
      }
    };
    loadSalesReps();
  }, []);
  
  const form = useForm<CustomerFormValues>({
    defaultValues: {
      code: initialCode,
      name: '',
      companyName: '',
      document: '',
      phone: '',
      email: '',
      address: '',
      neighborhood: '',
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

  const handleSubmit = async (data: CustomerFormValues) => {
    console.log('📝 [NewCustomerForm] Form submitted with data:', data);
    
    if (isSubmitting) {
      console.log('⚠️ [NewCustomerForm] Already submitting, ignoring...');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
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
      
      console.log('🔄 [NewCustomerForm] Calling onSubmit...');
      await onSubmit(data);
      console.log('✅ [NewCustomerForm] onSubmit completed');
    } catch (error) {
      console.error('❌ [NewCustomerForm] Error in handleSubmit:', error);
    } finally {
      setIsSubmitting(false);
    }
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
            isSubmitting={isSubmitting}
            nextCustomerCode={initialCode}
            salesReps={salesReps}
          />
        </div>
        
        <DialogFooter className="mt-4 bg-background pt-4 pb-1 border-t">
          <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
            Cancelar
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Salvando...
              </>
            ) : (
              'Adicionar Cliente'
            )}
          </Button>
        </DialogFooter>
      </form>
    </Form>
  );
};

export default NewCustomerForm;
