
import { useState, useEffect } from 'react';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "@/components/ui/use-toast";
import { PaymentTable } from '@/types';

const paymentTableFormSchema = z.object({
  name: z.string().min(2, {
    message: "Nome deve ter pelo menos 2 caracteres."
  }),
  description: z.string().optional(),
  type: z.string().default("boleto"),
  payable_to: z.string().optional(),
  payment_location: z.string().optional(),
  active: z.boolean().default(true)
});

type PaymentTableFormValues = z.infer<typeof paymentTableFormSchema>;

export const usePaymentTableForm = (
  paymentTables: PaymentTable[],
  addPaymentTable: (table: Omit<PaymentTable, 'id'>) => Promise<string>,
  updatePaymentTable: (id: string, table: Partial<PaymentTable>) => Promise<void>,
  editTableId: string | null,
  onSuccess?: () => void
) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<PaymentTableFormValues>({
    resolver: zodResolver(paymentTableFormSchema),
    defaultValues: {
      name: "",
      description: "",
      type: "boleto",
      payable_to: "",
      payment_location: "",
      active: true
    }
  });

  const onSubmit = async (values: PaymentTableFormValues) => {
    try {
      setIsSubmitting(true);

      const paymentTable: Omit<PaymentTable, 'id'> = {
        name: values.name,
        description: values.description || "",
        type: values.type,
        payableTo: values.payable_to || "",
        paymentLocation: values.payment_location || "",
        active: values.active,
        installments: [],
        terms: [],
        notes: "",
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      if (editTableId) {
        await updatePaymentTable(editTableId, paymentTable);
        toast({
          title: "Tabela atualizada",
          description: "A tabela foi atualizada com sucesso."
        });
      } else {
        await addPaymentTable(paymentTable);
        toast({
          title: "Tabela criada",
          description: "A tabela foi criada com sucesso."
        });
        form.reset();
      }

      onSuccess?.();
    } catch (error) {
      console.error("Erro ao salvar tabela:", error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Ocorreu um erro ao salvar a tabela de pagamento."
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    if (editTableId) {
      const tableToEdit = paymentTables.find(table => table.id === editTableId);
      if (tableToEdit) {
        form.reset({
          name: tableToEdit.name,
          description: tableToEdit.description,
          type: tableToEdit.type || "boleto",
          payable_to: tableToEdit.payableTo,
          payment_location: tableToEdit.paymentLocation,
          active: tableToEdit.active !== undefined ? tableToEdit.active : true
        });
      }
    } else {
      form.reset({
        name: "",
        description: "",
        type: "boleto",
        payable_to: "",
        payment_location: "",
        active: true
      });
    }
  }, [editTableId, form, paymentTables]);

  return {
    form,
    onSubmit: form.handleSubmit(onSubmit),
    isSubmitting
  };
};
