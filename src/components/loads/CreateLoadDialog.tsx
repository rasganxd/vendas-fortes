
import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus } from 'lucide-react';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

const loadFormSchema = z.object({
  name: z.string().min(2, {
    message: "Nome deve ter pelo menos 2 caracteres.",
  }),
  notes: z.string().optional(),
  includePending: z.boolean().default(false).optional(),
});

type CreateLoadFormValues = z.infer<typeof loadFormSchema>;

interface CreateLoadDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onCreateLoad: (values: CreateLoadFormValues) => void;
  isDisabled: boolean;
}

const CreateLoadDialog: React.FC<CreateLoadDialogProps> = ({
  isOpen,
  onOpenChange,
  onCreateLoad,
  isDisabled
}) => {
  const form = useForm<z.infer<typeof loadFormSchema>>({
    resolver: zodResolver(loadFormSchema),
    defaultValues: {
      name: "",
      notes: "",
      includePending: false,
    },
  });

  const handleSubmit = (values: CreateLoadFormValues) => {
    onCreateLoad(values);
    form.reset();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button className="bg-sales-800 hover:bg-sales-700" disabled={isDisabled}>
          <Plus size={16} className="mr-2" /> Criar Carga
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Criar Carga</DialogTitle>
          <DialogDescription>
            Preencha os detalhes da carga.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-8">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome da Carga</FormLabel>
                  <FormControl>
                    <Input placeholder="Nome da Carga" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Observações</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Observações sobre a carga"
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="bg-sales-800 hover:bg-sales-700">Criar Carga</Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateLoadDialog;
