
import { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableCaption,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { cn, generateId } from "@/lib/utils"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { toast } from "@/components/ui/use-toast"
import { Trash } from 'lucide-react';
import { PaymentTable, PaymentTableInstallment, PaymentTableTerm } from '@/types';
import PageLayout from '@/components/layout/PageLayout';

const formSchema = z.object({
  name: z.string().min(2, {
    message: "Nome deve ter pelo menos 2 caracteres.",
  }),
  description: z.string().optional(),
  type: z.string().optional(),
  payableTo: z.string().optional(),
  paymentLocation: z.string().optional(),
  active: z.boolean().default(true),
})

export default function PaymentTables() {
  const [open, setOpen] = useState(false);
  const [days, setDays] = useState(0);
  const [percentage, setPercentage] = useState(0);
  const [description, setDescription] = useState('');
  const [currentTerms, setCurrentTerms] = useState<PaymentTableTerm[]>([]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
      type: "boleto",
      payableTo: "",
      paymentLocation: "",
      active: true,
    },
  })

  function onSubmit(values: z.infer<typeof formSchema>) {
    // Do something with the form values.
    // ✅ This will be type-safe and validated.
    console.log(values)
  }

  // Add the installment property when creating terms
  const handleAddTerm = () => {
    if (days > 0 && percentage > 0) {
      const newTerm: PaymentTableTerm = {
        id: generateId(),
        days,
        percentage,
        description,
        installment: currentTerms.length + 1 // Add installment property
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

  const handleRemoveTerm = (id: string) => {
    setCurrentTerms(prevTerms => prevTerms.filter(term => term.id !== id));
  };

  return (
    <PageLayout title="Tabelas de Pagamento">
      <Card>
        <CardHeader>
          <CardTitle>Tabelas de Pagamento</CardTitle>
          <CardDescription>
            Gerencie as tabelas de pagamento da sua empresa
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Dialog>
            <DialogTrigger asChild>
              <Button>Adicionar Tabela</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Adicionar Tabela</DialogTitle>
                <DialogDescription>
                  Crie uma nova tabela de pagamento
                </DialogDescription>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
                  <Button type="submit">Criar Tabela</Button>
                </form>
              </Form>
              <div className="mt-8">
                <h3 className="text-lg font-semibold mb-4">Condições de Pagamento</h3>
                <div className="grid grid-cols-3 gap-4 mb-4">
                  <div>
                    <Label htmlFor="days">Dias</Label>
                    <Input
                      type="number"
                      id="days"
                      value={days}
                      onChange={(e) => setDays(Number(e.target.value))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="percentage">Percentagem</Label>
                    <Input
                      type="number"
                      id="percentage"
                      value={percentage}
                      onChange={(e) => setPercentage(Number(e.target.value))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="description">Descrição</Label>
                    <Input
                      type="text"
                      id="description"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                    />
                  </div>
                </div>
                <Button onClick={handleAddTerm}>Adicionar Condição</Button>
                {currentTerms.length > 0 && (
                  <div className="mt-4">
                    <h4 className="text-md font-semibold mb-2">Condições Adicionadas</h4>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Dias</TableHead>
                          <TableHead>Percentagem</TableHead>
                          <TableHead>Descrição</TableHead>
                          <TableHead className="text-right">Ações</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {currentTerms.map(term => (
                          <TableRow key={term.id}>
                            <TableCell>{term.days}</TableCell>
                            <TableCell>{term.percentage}</TableCell>
                            <TableCell>{term.description}</TableCell>
                            <TableCell className="text-right">
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                onClick={() => handleRemoveTerm(term.id)}
                              >
                                <Trash size={16} className="text-destructive" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </div>
              <DialogFooter>
                <Button type="submit">Salvar</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </CardContent>
      </Card>
    </PageLayout>
  )
}
