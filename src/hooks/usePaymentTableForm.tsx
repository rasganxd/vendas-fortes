
import { useState, useEffect } from 'react';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "@/components/ui/use-toast";
import { PaymentTable, PaymentTableTerm } from '@/types';

const paymentTermSchema = z.object({
  days: z.number().min(0, "Dias deve ser maior ou igual a 0"),
  percentage: z.number().min(0, "Percentual deve ser maior que 0").max(100, "Percentual deve ser menor ou igual a 100"),
  description: z.string().optional(),
});

const paymentTableFormSchema = z.object({
  name: z.string().min(2, {
    message: "Nome deve ter pelo menos 2 caracteres."
  }),
  description: z.string().optional(),
  type: z.string().default("boleto"),
  payable_to: z.string().optional(),
  payment_location: z.string().optional(),
  active: z.boolean().default(true),
  terms: z.array(paymentTermSchema).optional().refine((terms, ctx) => {
    // Se o tipo for promissória e houver termos, validar que a soma seja 100%
    const formData = ctx.parent as any;
    if (formData.type === "promissoria" && terms && terms.length > 0) {
      const totalPercentage = terms.reduce((sum, term) => sum + term.percentage, 0);
      return Math.abs(totalPercentage - 100) < 0.01; // Tolerância para erros de ponto flutuante
    }
    return true;
  }, "Para notas promissórias, a soma dos percentuais deve ser 100%")
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
      active: true,
      terms: []
    }
  });

  const watchedType = form.watch("type");

  // Limpar termos quando mudar o tipo para não promissória
  useEffect(() => {
    if (watchedType !== "promissoria") {
      form.setValue("terms", []);
    }
  }, [watchedType, form]);

  const addTerm = () => {
    const currentTerms = form.getValues("terms") || [];
    const newTerm = {
      days: 0,
      percentage: 0,
      description: ""
    };
    form.setValue("terms", [...currentTerms, newTerm]);
  };

  const removeTerm = (index: number) => {
    const currentTerms = form.getValues("terms") || [];
    const updatedTerms = currentTerms.filter((_, i) => i !== index);
    form.setValue("terms", updatedTerms);
  };

  const updateTerm = (index: number, field: keyof typeof paymentTermSchema._type, value: any) => {
    const currentTerms = form.getValues("terms") || [];
    const updatedTerms = [...currentTerms];
    updatedTerms[index] = { ...updatedTerms[index], [field]: value };
    form.setValue("terms", updatedTerms);
  };

  const onSubmit = async (values: PaymentTableFormValues) => {
    try {
      setIsSubmitting(true);

      // Validação adicional para notas promissórias
      if (values.type === "promissoria") {
        if (!values.terms || values.terms.length === 0) {
          toast({
            variant: "destructive",
            title: "Erro de validação",
            description: "Tabelas do tipo 'Nota Promissória' devem ter pelo menos uma condição de pagamento."
          });
          return;
        }

        const totalPercentage = values.terms.reduce((sum, term) => sum + term.percentage, 0);
        if (Math.abs(totalPercentage - 100) > 0.01) {
          toast({
            variant: "destructive",
            title: "Erro de validação",
            description: "A soma dos percentuais deve ser exatamente 100%."
          });
          return;
        }
      }

      // Converter os termos para o formato esperado
      const terms: PaymentTableTerm[] = (values.terms || []).map((term, index) => ({
        id: `term-${index}`,
        days: term.days,
        percentage: term.percentage,
        description: term.description || "",
        installment: index + 1
      }));

      const paymentTable: Omit<PaymentTable, 'id'> = {
        name: values.name,
        description: values.description || "",
        type: values.type,
        payableTo: values.payable_to || "",
        paymentLocation: values.payment_location || "",
        active: values.active,
        installments: [], // Manter vazio por compatibilidade
        terms: terms,
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
        // Converter os termos existentes para o formato do formulário
        const formTerms = (tableToEdit.terms || []).map(term => ({
          days: term.days,
          percentage: term.percentage,
          description: term.description || ""
        }));

        form.reset({
          name: tableToEdit.name,
          description: tableToEdit.description,
          type: tableToEdit.type || "boleto",
          payable_to: tableToEdit.payableTo,
          payment_location: tableToEdit.paymentLocation,
          active: tableToEdit.active !== undefined ? tableToEdit.active : true,
          terms: formTerms
        });
      }
    } else {
      form.reset({
        name: "",
        description: "",
        type: "boleto",
        payable_to: "",
        payment_location: "",
        active: true,
        terms: []
      });
    }
  }, [editTableId, form, paymentTables]);

  return {
    form,
    onSubmit: form.handleSubmit(onSubmit),
    isSubmitting,
    watchedType,
    addTerm,
    removeTerm,
    updateTerm
  };
};
