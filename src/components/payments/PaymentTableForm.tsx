
import React from 'react';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { DialogFooter } from "@/components/ui/dialog";
import { Loader2, Plus, Trash2 } from 'lucide-react';
import { usePaymentTableForm } from '@/hooks/usePaymentTableForm';
import { PaymentTable } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface PaymentTableFormProps {
  paymentTables: PaymentTable[];
  addPaymentTable: (table: Omit<PaymentTable, 'id'>) => Promise<string>;
  updatePaymentTable: (id: string, table: Partial<PaymentTable>) => Promise<void>;
  editTableId: string | null;
  onClose: () => void;
  onSuccess?: () => void;
}

export const PaymentTableForm: React.FC<PaymentTableFormProps> = ({
  paymentTables,
  addPaymentTable,
  updatePaymentTable,
  editTableId,
  onClose,
  onSuccess
}) => {
  const { 
    form, 
    onSubmit, 
    isSubmitting, 
    watchedType,
    addTerm,
    removeTerm,
    updateTerm
  } = usePaymentTableForm(
    paymentTables,
    addPaymentTable,
    updatePaymentTable,
    editTableId,
    onSuccess
  );

  const terms = form.watch("terms") || [];
  const isPromissoryType = watchedType === "promissoria";

  return (
    <Form {...form}>
      <form onSubmit={onSubmit} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nome</FormLabel>
              <FormControl>
                <Input placeholder="Nome da tabela" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Descrição</FormLabel>
              <FormControl>
                <Textarea placeholder="Descrição da tabela" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tipo</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um tipo" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="boleto">Boleto</SelectItem>
                  <SelectItem value="cartao">Cartão</SelectItem>
                  <SelectItem value="pix">PIX</SelectItem>
                  <SelectItem value="dinheiro">Dinheiro</SelectItem>
                  <SelectItem value="promissoria">Nota Promissória</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {isPromissoryType && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Condições de Pagamento</CardTitle>
              <p className="text-sm text-gray-600">
                Configure os prazos e percentuais para nota promissória
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              {terms.map((term, index) => (
                <div key={index} className="flex gap-2 items-end p-3 border rounded-lg">
                  <div className="flex-1">
                    <label className="text-sm font-medium">Dias</label>
                    <Input
                      type="number"
                      min="0"
                      placeholder="0"
                      value={term.days}
                      onChange={(e) => updateTerm(index, 'days', parseInt(e.target.value) || 0)}
                    />
                  </div>
                  <div className="flex-1">
                    <label className="text-sm font-medium">Percentual (%)</label>
                    <Input
                      type="number"
                      min="0"
                      max="100"
                      step="0.01"
                      placeholder="0"
                      value={term.percentage}
                      onChange={(e) => updateTerm(index, 'percentage', parseFloat(e.target.value) || 0)}
                    />
                  </div>
                  <div className="flex-2">
                    <label className="text-sm font-medium">Descrição</label>
                    <Input
                      placeholder="Descrição da condição"
                      value={term.description}
                      onChange={(e) => updateTerm(index, 'description', e.target.value)}
                    />
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => removeTerm(index)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              
              <Button
                type="button"
                variant="outline"
                onClick={addTerm}
                className="w-full"
              >
                <Plus className="h-4 w-4 mr-2" />
                Adicionar Condição
              </Button>
              
              {terms.length > 0 && (
                <div className="text-sm text-gray-600">
                  Total: {terms.reduce((sum, term) => sum + term.percentage, 0).toFixed(2)}%
                  {Math.abs(terms.reduce((sum, term) => sum + term.percentage, 0) - 100) > 0.01 && (
                    <span className="text-red-600 ml-2">
                      (deve somar 100%)
                    </span>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        )}
        
        <FormField
          control={form.control}
          name="payable_to"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Pagável a</FormLabel>
              <FormControl>
                <Input placeholder="Nome do beneficiário" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="payment_location"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Local de pagamento</FormLabel>
              <FormControl>
                <Input placeholder="Local de pagamento" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="active"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-md border p-4">
              <div className="space-y-0.5">
                <FormLabel>Ativo</FormLabel>
                <FormDescription>
                  Essa tabela está ativa?
                </FormDescription>
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
            </FormItem>
          )}
        />
        
        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {editTableId ? "Atualizar" : "Criar Tabela"}
          </Button>
        </DialogFooter>
      </form>
    </Form>
  );
};
