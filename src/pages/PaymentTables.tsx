import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableCaption, TableFooter, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { cn, generateId } from "@/lib/utils";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "@/components/ui/use-toast";
import { Trash, Pencil, Plus, Loader2 } from 'lucide-react';
import { PaymentTable, PaymentTableInstallment, PaymentTableTerm } from '@/types';
import PageLayout from '@/components/layout/PageLayout';
import { usePaymentTables } from '@/hooks/usePaymentTables';
import { useAppContext } from '@/hooks/useAppContext';
const paymentTableFormSchema = z.object({
  name: z.string().min(2, {
    message: "Nome deve ter pelo menos 2 caracteres."
  }),
  description: z.string().optional(),
  type: z.string().default("boleto"),
  payableTo: z.string().optional(),
  paymentLocation: z.string().optional(),
  active: z.boolean().default(true)
});
type PaymentTableFormValues = z.infer<typeof paymentTableFormSchema>;
export default function PaymentTables() {
  const {
    paymentTables,
    isLoadingPaymentTables,
    addPaymentTable,
    updatePaymentTable,
    deletePaymentTable
  } = useAppContext();
  const [openNewTableDialog, setOpenNewTableDialog] = useState(false);
  const [editTableId, setEditTableId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form for creating/editing a payment table
  const form = useForm<PaymentTableFormValues>({
    resolver: zodResolver(paymentTableFormSchema),
    defaultValues: {
      name: "",
      description: "",
      type: "boleto",
      payableTo: "",
      paymentLocation: "",
      active: true
    }
  });

  // Handle form submission for creating/editing payment tables
  const onSubmit = async (values: PaymentTableFormValues) => {
    try {
      setIsSubmitting(true);

      // Create a new PaymentTable object
      const paymentTable: Omit<PaymentTable, 'id'> = {
        name: values.name,
        description: values.description || "",
        type: values.type,
        payableTo: values.payableTo || "",
        paymentLocation: values.paymentLocation || "",
        active: values.active,
        // Empty arrays for the installments and terms
        installments: [],
        terms: [],
        notes: "",
        createdAt: new Date(),
        updatedAt: new Date()
      };
      if (editTableId) {
        // Update existing table
        await updatePaymentTable(editTableId, paymentTable);
        toast({
          title: "Tabela atualizada",
          description: "A tabela foi atualizada com sucesso."
        });
      } else {
        // Create new table
        const newTableId = await addPaymentTable(paymentTable);
        toast({
          title: "Tabela criada",
          description: "A tabela foi criada com sucesso."
        });

        // Optionally set the edit ID to the new table ID to go directly to editing it
        setEditTableId(newTableId);
      }

      // Close dialog and reset form if it's a new table
      if (!editTableId) {
        setOpenNewTableDialog(false);
        form.reset();
      }
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

  // Load payment table data for editing
  useEffect(() => {
    if (editTableId) {
      const tableToEdit = paymentTables.find(table => table.id === editTableId);
      if (tableToEdit) {
        form.reset({
          name: tableToEdit.name,
          description: tableToEdit.description,
          type: tableToEdit.type || "boleto",
          payableTo: tableToEdit.payableTo,
          paymentLocation: tableToEdit.paymentLocation,
          active: tableToEdit.active !== undefined ? tableToEdit.active : true
        });
      }
    } else {
      form.reset({
        name: "",
        description: "",
        type: "boleto",
        payableTo: "",
        paymentLocation: "",
        active: true
      });
    }
  }, [editTableId, form, paymentTables]);
  const handleOpenNewTable = () => {
    setEditTableId(null);
    form.reset();
    setOpenNewTableDialog(true);
  };
  const handleCloseDialog = () => {
    setOpenNewTableDialog(false);
  };
  const handleEditTable = (tableId: string) => {
    setEditTableId(tableId);
    setOpenNewTableDialog(true);
  };
  const handleDeleteTable = async (tableId: string) => {
    if (window.confirm("Tem certeza que deseja excluir esta tabela?")) {
      try {
        await deletePaymentTable(tableId);
        toast({
          title: "Tabela excluída",
          description: "A tabela foi excluída com sucesso."
        });
      } catch (error) {
        console.error("Erro ao excluir tabela:", error);
        toast({
          variant: "destructive",
          title: "Erro",
          description: "Ocorreu um erro ao excluir a tabela."
        });
      }
    }
  };
  return <PageLayout title="Tabelas de Pagamento">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Tabelas de Pagamento</CardTitle>
              <CardDescription>
                Gerencie as tabelas de pagamento da sua empresa
              </CardDescription>
            </div>
            <Button onClick={handleOpenNewTable}>
              <Plus className="mr-2 h-4 w-4" /> Adicionar Tabela
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {isLoadingPaymentTables ? <div className="flex justify-center items-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="ml-2">Carregando tabelas de pagamento...</span>
            </div> : paymentTables.length === 0 ? <div className="text-center py-8">
              <p className="text-muted-foreground">Nenhuma tabela de pagamento cadastrada.</p>
              
            </div> : <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paymentTables.map(table => <TableRow key={table.id}>
                    <TableCell className="font-medium">{table.name}</TableCell>
                    <TableCell>{table.type || "-"}</TableCell>
                    <TableCell>
                      {table.active ? <span className="text-green-600 font-medium">Ativo</span> : <span className="text-red-600 font-medium">Inativo</span>}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end space-x-2">
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button variant="outline" size="sm" onClick={() => handleEditTable(table.id)}>
                                <Pencil className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Editar tabela</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button variant="outline" size="sm" onClick={() => handleDeleteTable(table.id)}>
                                <Trash className="h-4 w-4 text-destructive" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Excluir tabela</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                    </TableCell>
                  </TableRow>)}
              </TableBody>
            </Table>}

          {/* Dialog for creating/editing a payment table */}
          <Dialog open={openNewTableDialog} onOpenChange={setOpenNewTableDialog}>
            <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editTableId ? "Editar Tabela" : "Adicionar Tabela"}</DialogTitle>
                <DialogDescription>
                  {editTableId ? "Altere as informações da tabela de pagamento." : "Crie uma nova tabela de pagamento para sua empresa."}
                </DialogDescription>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField control={form.control} name="name" render={({
                  field
                }) => <FormItem>
                        <FormLabel>Nome</FormLabel>
                        <FormControl>
                          <Input placeholder="Nome da tabela" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>} />
                  <FormField control={form.control} name="description" render={({
                  field
                }) => <FormItem>
                        <FormLabel>Descrição</FormLabel>
                        <FormControl>
                          <Textarea placeholder="Descrição da tabela" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>} />
                  <FormField control={form.control} name="type" render={({
                  field
                }) => <FormItem>
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
                      </FormItem>} />
                  <FormField control={form.control} name="payableTo" render={({
                  field
                }) => <FormItem>
                        <FormLabel>Pagável a</FormLabel>
                        <FormControl>
                          <Input placeholder="Nome do beneficiário" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>} />
                  <FormField control={form.control} name="paymentLocation" render={({
                  field
                }) => <FormItem>
                        <FormLabel>Local de pagamento</FormLabel>
                        <FormControl>
                          <Input placeholder="Local de pagamento" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>} />
                  <FormField control={form.control} name="active" render={({
                  field
                }) => <FormItem className="flex flex-row items-center justify-between rounded-md border p-4">
                        <div className="space-y-0.5">
                          <FormLabel>Ativo</FormLabel>
                          <FormDescription>
                            Essa tabela está ativa?
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch checked={field.value} onCheckedChange={field.onChange} />
                        </FormControl>
                      </FormItem>} />
                  <DialogFooter>
                    <Button type="button" variant="outline" onClick={handleCloseDialog}>
                      Cancelar
                    </Button>
                    <Button type="submit" disabled={isSubmitting}>
                      {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      {editTableId ? "Atualizar" : "Criar Tabela"}
                    </Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </CardContent>
      </Card>
      
      {/* We'll add the payment terms management component as a separate section */}
      {editTableId && <PaymentTableTermsManager tableId={editTableId} />}
    </PageLayout>;
}

// Add a new component for managing payment terms
interface PaymentTableTermsManagerProps {
  tableId: string;
}
function PaymentTableTermsManager({
  tableId
}: PaymentTableTermsManagerProps) {
  const {
    paymentTables,
    updatePaymentTable
  } = useAppContext();
  const [days, setDays] = useState(0);
  const [percentage, setPercentage] = useState(0);
  const [description, setDescription] = useState('');
  const [currentTerms, setCurrentTerms] = useState<PaymentTableTerm[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Load existing terms when the table ID changes
  useEffect(() => {
    if (tableId) {
      const table = paymentTables.find(t => t.id === tableId);
      if (table && Array.isArray(table.terms)) {
        setCurrentTerms(table.terms);
      } else {
        setCurrentTerms([]);
      }
    }
  }, [tableId, paymentTables]);

  // Add a new term to the list
  const handleAddTerm = () => {
    if (days > 0 && percentage > 0) {
      const newTerm: PaymentTableTerm = {
        id: generateId(),
        days,
        percentage,
        description,
        installment: currentTerms.length + 1
      };
      setCurrentTerms([...currentTerms, newTerm]);
      setDays(0);
      setPercentage(0);
      setDescription('');
    } else {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Os campos de dias e percentagem são obrigatórios."
      });
    }
  };

  // Remove a term from the list
  const handleRemoveTerm = (id: string) => {
    setCurrentTerms(prevTerms => prevTerms.filter(term => term.id !== id));
  };

  // Save all terms to the database
  const handleSaveTerms = async () => {
    try {
      setIsSaving(true);

      // Update the payment table with the new terms
      await updatePaymentTable(tableId, {
        terms: currentTerms,
        installments: currentTerms.map(term => ({
          installment: term.installment,
          percentage: term.percentage,
          days: term.days,
          description: term.description
        }))
      });
      toast({
        title: "Condições salvas",
        description: "As condições de pagamento foram salvas com sucesso."
      });
    } catch (error) {
      console.error("Erro ao salvar condições:", error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Ocorreu um erro ao salvar as condições de pagamento."
      });
    } finally {
      setIsSaving(false);
    }
  };
  const currentTable = paymentTables.find(t => t.id === tableId);
  return <Card className="mt-4">
      <CardHeader>
        <CardTitle>Condições de Pagamento</CardTitle>
        <CardDescription>
          {currentTable ? `Gerenciar condições para: ${currentTable.name}` : 'Condições de pagamento'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div>
            <Label htmlFor="days">Dias</Label>
            <Input type="number" id="days" value={days || ''} onChange={e => setDays(Number(e.target.value))} />
          </div>
          <div>
            <Label htmlFor="percentage">Percentagem</Label>
            <Input type="number" id="percentage" value={percentage || ''} onChange={e => setPercentage(Number(e.target.value))} />
          </div>
          <div>
            <Label htmlFor="description">Descrição</Label>
            <Input type="text" id="description" value={description} onChange={e => setDescription(e.target.value)} />
          </div>
        </div>
        <div className="flex justify-between mb-6">
          <Button onClick={handleAddTerm}>
            <Plus className="mr-2 h-4 w-4" /> Adicionar Condição
          </Button>
          <Button onClick={handleSaveTerms} disabled={isSaving} variant="outline">
            {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Salvar Todas as Condições
          </Button>
        </div>
        
        {currentTerms.length > 0 ? <div className="mt-4">
            <h4 className="text-md font-semibold mb-2">Condições Adicionadas</h4>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Parcela</TableHead>
                  <TableHead>Dias</TableHead>
                  <TableHead>Percentagem</TableHead>
                  <TableHead>Descrição</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {currentTerms.map(term => <TableRow key={term.id}>
                    <TableCell>{term.installment}</TableCell>
                    <TableCell>{term.days}</TableCell>
                    <TableCell>{term.percentage}%</TableCell>
                    <TableCell>{term.description || '-'}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm" onClick={() => handleRemoveTerm(term.id)}>
                        <Trash size={16} className="text-destructive" />
                      </Button>
                    </TableCell>
                  </TableRow>)}
              </TableBody>
            </Table>
          </div> : <div className="text-center py-6 text-muted-foreground">
            Nenhuma condição de pagamento adicionada.
          </div>}
      </CardContent>
    </Card>;
}