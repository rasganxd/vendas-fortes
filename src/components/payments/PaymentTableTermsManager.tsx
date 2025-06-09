
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
    console.log('🔄 [PaymentTableTermsManager] Loading terms for table:', tableId);
    console.log('🔄 [PaymentTableTermsManager] Current table:', currentTable);
    
    if (tableId && currentTable) {
      // Try to load from terms first, then fallback to installments
      let termsToLoad: PaymentTableTerm[] = [];
      
      if (currentTable.terms && Array.isArray(currentTable.terms) && currentTable.terms.length > 0) {
        console.log('📋 [PaymentTableTermsManager] Loading from terms field:', currentTable.terms);
        termsToLoad = currentTable.terms;
      } else if (currentTable.installments && Array.isArray(currentTable.installments) && currentTable.installments.length > 0) {
        console.log('📋 [PaymentTableTermsManager] Converting from installments field:', currentTable.installments);
        // Convert installments to terms format
        termsToLoad = currentTable.installments.map((installment, index) => ({
          id: installment.id || generateId(),
          days: installment.days,
          percentage: installment.percentage,
          description: installment.description || '',
          installment: installment.installment || index + 1
        }));
      }
      
      console.log('✅ [PaymentTableTermsManager] Setting current terms:', termsToLoad);
      setCurrentTerms(termsToLoad);
    } else {
      console.log('❌ [PaymentTableTermsManager] No table found or invalid tableId');
      setCurrentTerms([]);
    }
  }, [tableId, currentTable]);

  const handleAddTerm = () => {
    console.log('➕ [PaymentTableTermsManager] Adding new term:', { days, percentage, description });
    
    if (days > 0 && percentage > 0) {
      const newTerm: PaymentTableTerm = {
        id: generateId(),
        days,
        percentage,
        description,
        installment: currentTerms.length + 1
      };
      
      console.log('✅ [PaymentTableTermsManager] New term created:', newTerm);
      const updatedTerms = [...currentTerms, newTerm];
      setCurrentTerms(updatedTerms);
      
      // Clear form
      setDays(0);
      setPercentage(0);
      setDescription('');
      
      console.log('📝 [PaymentTableTermsManager] Updated terms list:', updatedTerms);
    } else {
      console.log('❌ [PaymentTableTermsManager] Invalid term data:', { days, percentage });
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Os campos de dias e percentagem são obrigatórios e devem ser maiores que zero."
      });
    }
  };

  const handleRemoveTerm = (id: string) => {
    console.log('🗑️ [PaymentTableTermsManager] Removing term with id:', id);
    const updatedTerms = currentTerms.filter(term => term.id !== id);
    console.log('📝 [PaymentTableTermsManager] Updated terms after removal:', updatedTerms);
    setCurrentTerms(updatedTerms);
  };

  const handleSaveTerms = async () => {
    try {
      setIsSaving(true);
      
      console.log('💾 [PaymentTableTermsManager] Starting save process...');
      console.log('📊 [PaymentTableTermsManager] Current table before save:', currentTable);
      console.log('📋 [PaymentTableTermsManager] Terms to save:', currentTerms);

      // Validate terms
      if (currentTerms.length === 0) {
        toast({
          variant: "destructive",
          title: "Erro",
          description: "Adicione pelo menos uma condição de pagamento antes de salvar."
        });
        return;
      }

      // Validate percentage total
      const totalPercentage = currentTerms.reduce((sum, term) => sum + term.percentage, 0);
      console.log('📊 [PaymentTableTermsManager] Total percentage:', totalPercentage);
      
      if (totalPercentage !== 100) {
        toast({
          variant: "destructive",
          title: "Erro",
          description: `A soma das percentagens deve ser 100%. Atual: ${totalPercentage.toFixed(1)}%`
        });
        return;
      }

      // Convert terms to installments format for compatibility
      const installments = currentTerms.map(term => ({
        installment: term.installment,
        percentage: term.percentage,
        days: term.days,
        description: term.description,
        id: term.id
      }));

      console.log('🔄 [PaymentTableTermsManager] Converted installments:', installments);

      const updateData: Partial<PaymentTable> = {
        terms: currentTerms,
        installments: installments,
        // Ensure type is preserved if it's a promissory note table
        ...(currentTable?.type === 'promissoria' && { type: 'promissoria' })
      };

      console.log('📤 [PaymentTableTermsManager] Update data to send:', updateData);

      await updatePaymentTable(tableId, updateData);
      
      console.log('✅ [PaymentTableTermsManager] Terms saved successfully');
      toast({
        title: "Condições salvas",
        description: "As condições de pagamento foram salvas com sucesso."
      });
    } catch (error) {
      console.error("❌ [PaymentTableTermsManager] Error saving terms:", error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Ocorreu um erro ao salvar as condições de pagamento."
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Calculate remaining percentage
  const usedPercentage = currentTerms.reduce((sum, term) => sum + term.percentage, 0);
  const remainingPercentage = 100 - usedPercentage;

  return (
    <Card className="mt-4">
      <CardHeader>
        <CardTitle>Condições de Pagamento</CardTitle>
        <CardDescription>
          {currentTable ? `Gerenciar condições para: ${currentTable.name} (${currentTable.type || 'tipo não definido'})` : 'Condições de pagamento'}
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
              min="0"
            />
          </div>
          <div>
            <Label htmlFor="percentage">Percentagem (%)</Label>
            <Input
              type="number"
              id="percentage"
              value={percentage || ''}
              onChange={e => setPercentage(Number(e.target.value))}
              min="0"
              max={remainingPercentage}
              step="0.1"
            />
            {remainingPercentage < 100 && (
              <p className="text-sm text-muted-foreground mt-1">
                Restante: {remainingPercentage.toFixed(1)}%
              </p>
            )}
          </div>
          <div>
            <Label htmlFor="description">Descrição</Label>
            <Input
              type="text"
              id="description"
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Ex: Entrada, 30 dias, etc."
            />
          </div>
        </div>
        
        <div className="flex justify-between mb-6">
          <Button 
            onClick={handleAddTerm}
            disabled={!days || !percentage || percentage <= 0 || days <= 0}
          >
            <Plus className="mr-2 h-4 w-4" /> Adicionar Condição
          </Button>
          <Button 
            onClick={handleSaveTerms} 
            disabled={isSaving || currentTerms.length === 0} 
            variant="outline"
          >
            {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Salvar Todas as Condições
          </Button>
        </div>
        
        {currentTerms.length > 0 ? (
          <div className="mt-4">
            <div className="flex justify-between items-center mb-2">
              <h4 className="text-md font-semibold">Condições Adicionadas</h4>
              <span className={`text-sm font-medium ${usedPercentage === 100 ? 'text-green-600' : 'text-orange-600'}`}>
                Total: {usedPercentage.toFixed(1)}% / 100%
              </span>
            </div>
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
