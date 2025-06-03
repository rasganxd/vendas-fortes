
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "@/components/ui/use-toast";
import { Trash, Plus, Loader2 } from 'lucide-react';
import { PaymentTable, PaymentTableTerm } from '@/types';
import { generateId } from "@/lib/utils";

interface PaymentTableTermsManagerProps {
  tableId: string;
  paymentTables: PaymentTable[];
  updatePaymentTable: (id: string, table: Partial<PaymentTable>) => Promise<void>;
}

export const PaymentTableTermsManager: React.FC<PaymentTableTermsManagerProps> = ({
  tableId,
  paymentTables,
  updatePaymentTable
}) => {
  const [days, setDays] = useState(0);
  const [percentage, setPercentage] = useState(0);
  const [description, setDescription] = useState('');
  const [currentTerms, setCurrentTerms] = useState<PaymentTableTerm[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  const currentTable = paymentTables.find(t => t.id === tableId);

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

  const handleRemoveTerm = (id: string) => {
    setCurrentTerms(prevTerms => prevTerms.filter(term => term.id !== id));
  };

  const handleSaveTerms = async () => {
    try {
      setIsSaving(true);

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

  return (
    <Card className="mt-4">
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
            <Input
              type="number"
              id="days"
              value={days || ''}
              onChange={e => setDays(Number(e.target.value))}
            />
          </div>
          <div>
            <Label htmlFor="percentage">Percentagem</Label>
            <Input
              type="number"
              id="percentage"
              value={percentage || ''}
              onChange={e => setPercentage(Number(e.target.value))}
            />
          </div>
          <div>
            <Label htmlFor="description">Descrição</Label>
            <Input
              type="text"
              id="description"
              value={description}
              onChange={e => setDescription(e.target.value)}
            />
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
        
        {currentTerms.length > 0 ? (
          <div className="mt-4">
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
                {currentTerms.map(term => (
                  <TableRow key={term.id}>
                    <TableCell>{term.installment}</TableCell>
                    <TableCell>{term.days}</TableCell>
                    <TableCell>{term.percentage}%</TableCell>
                    <TableCell>{term.description || '-'}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm" onClick={() => handleRemoveTerm(term.id)}>
                        <Trash size={16} className="text-destructive" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="text-center py-6 text-muted-foreground">
            Nenhuma condição de pagamento adicionada.
          </div>
        )}
      </CardContent>
    </Card>
  );
};
