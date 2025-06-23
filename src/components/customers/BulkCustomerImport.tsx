
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Customer } from '@/types/customer';
import { toast } from '@/components/ui/use-toast';
import { Upload, AlertCircle, CheckCircle, XCircle } from 'lucide-react';
import { parseCustomerSpreadsheet, validateCustomerData } from '@/utils/customerSpreadsheetParser';
import { useSalesReps } from '@/hooks/useSalesReps';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { VISIT_DAYS_OPTIONS } from './constants';

interface BulkCustomerImportProps {
  onImportCustomers: (customers: Omit<Customer, 'id'>[]) => Promise<string[]>;
  isImporting?: boolean;
}

const BulkCustomerImport: React.FC<BulkCustomerImportProps> = ({
  onImportCustomers,
  isImporting = false
}) => {
  const [rawText, setRawText] = useState<string>('');
  const [parsedCustomers, setParsedCustomers] = useState<Omit<Customer, 'id'>[]>([]);
  const [validationResults, setValidationResults] = useState<{
    valid: Omit<Customer, 'id'>[];
    invalid: {
      customer: Omit<Customer, 'id'>;
      errors: string[];
    }[];
  }>({
    valid: [],
    invalid: []
  });
  const [selectedSalesRepId, setSelectedSalesRepId] = useState<string>('');
  const [selectedWeekday, setSelectedWeekday] = useState<string>('');
  const {
    salesReps
  } = useSalesReps();

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setRawText(e.target.value);
    // Clear previous results when text changes
    setParsedCustomers([]);
    setValidationResults({
      valid: [],
      invalid: []
    });
  };

  const handleParseCustomers = () => {
    try {
      if (!rawText.trim()) {
        toast({
          title: "Texto vazio",
          description: "Por favor, insira os dados dos clientes.",
          variant: "destructive"
        });
        return;
      }
      console.log(`[BulkImport] Parsing customers with spreadsheet format`);
      const customers = parseCustomerSpreadsheet(rawText);
      if (customers.length === 0) {
        toast({
          title: "Nenhum cliente encontrado",
          description: "Não foi possível encontrar clientes no texto fornecido. Verifique o formato dos dados.",
          variant: "destructive"
        });
        return;
      }

      // Apply the selected sales rep to all customers if one is selected
      if (selectedSalesRepId) {
        const selectedSalesRep = salesReps.find(rep => rep.id === selectedSalesRepId);
        if (selectedSalesRep) {
          customers.forEach(customer => {
            customer.salesRepId = selectedSalesRep.id;
            customer.salesRepName = selectedSalesRep.name;
          });
        }
      }

      // Apply the selected weekday to all customers if one is selected
      if (selectedWeekday) {
        customers.forEach(customer => {
          customer.visitDays = [selectedWeekday];
        });
      }

      // Validate customers
      const validation = validateCustomerData(customers);
      setValidationResults(validation);
      setParsedCustomers([...validation.valid, ...validation.invalid.map(item => item.customer)]);
      console.log(`[BulkImport] Parsed ${customers.length} customers: ${validation.valid.length} valid, ${validation.invalid.length} invalid`);
      toast({
        title: "Análise concluída",
        description: `${customers.length} clientes encontrados. ${validation.valid.length} válidos, ${validation.invalid.length} com problemas.`
      });
    } catch (error) {
      console.error("[BulkImport] Error parsing customers:", error);
      toast({
        title: "Erro ao analisar dados",
        description: "Ocorreu um erro ao processar os dados. Verifique o formato e tente novamente.",
        variant: "destructive"
      });
    }
  };

  const handleImportCustomers = async () => {
    console.log('🚀 [BulkImport] Import button clicked');
    console.log('📊 [BulkImport] Current state:', {
      validCustomersCount: validationResults.valid.length,
      invalidCustomersCount: validationResults.invalid.length,
      isImporting
    });
    if (validationResults.valid.length === 0) {
      console.warn('⚠️ [BulkImport] No valid customers to import');
      toast({
        title: "Nenhum cliente válido para importar",
        description: "Corrija os problemas encontrados antes de importar.",
        variant: "destructive"
      });
      return;
    }
    if (validationResults.invalid.length > 0) {
      console.log(`⚠️ [BulkImport] There are ${validationResults.invalid.length} invalid customers`);
      const proceed = confirm(`Existem ${validationResults.invalid.length} clientes com problemas que não serão importados. Deseja continuar importando apenas os ${validationResults.valid.length} clientes válidos?`);
      if (!proceed) {
        console.log('🚫 [BulkImport] User cancelled import due to invalid customers');
        return;
      }
    }
    try {
      console.log('🔄 [BulkImport] Starting import process...');
      console.log('📝 [BulkImport] Valid customers to import:', validationResults.valid);
      const results = await onImportCustomers(validationResults.valid);
      console.log('✅ [BulkImport] Import completed with results:', results);
      toast({
        title: "Importação concluída",
        description: `${results.length} clientes importados com sucesso.`
      });

      // Clear the form after successful import
      console.log('🧹 [BulkImport] Clearing form after successful import');
      setRawText('');
      setParsedCustomers([]);
      setValidationResults({
        valid: [],
        invalid: []
      });
    } catch (error) {
      console.error("[BulkImport] Error importing customers:", error);
      console.error("[BulkImport] Error details:", {
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      });
      toast({
        title: "Erro na importação",
        description: "Ocorreu um erro ao importar os clientes. Verifique o console para mais detalhes.",
        variant: "destructive"
      });
    }
  };

  const handleSalesRepChange = (value: string) => {
    setSelectedSalesRepId(value);

    // If we already have parsed customers, update them with the new sales rep
    if (parsedCustomers.length > 0) {
      const selectedSalesRep = salesReps.find(rep => rep.id === value);
      if (selectedSalesRep) {
        const updatedCustomers = parsedCustomers.map(customer => ({
          ...customer,
          salesRepId: selectedSalesRep.id,
          salesRepName: selectedSalesRep.name
        }));
        setParsedCustomers(updatedCustomers);

        // Re-validate with updated data
        const validation = validateCustomerData(updatedCustomers);
        setValidationResults(validation);
      }
    }
  };

  const handleWeekdayChange = (value: string) => {
    setSelectedWeekday(value);

    // If we already have parsed customers, update them with the new weekday
    if (parsedCustomers.length > 0) {
      const updatedCustomers = parsedCustomers.map(customer => ({
        ...customer,
        visitDays: value ? [value] : []
      }));
      setParsedCustomers(updatedCustomers);

      // Re-validate with updated data
      const validation = validateCustomerData(updatedCustomers);
      setValidationResults(validation);
    }
  };

  const getCustomerValidationStatus = (customer: Omit<Customer, 'id'>) => {
    const invalidItem = validationResults.invalid.find(item => item.customer.code === customer.code);
    if (invalidItem) {
      return {
        status: 'invalid',
        errors: invalidItem.errors
      };
    }
    return {
      status: 'valid',
      errors: []
    };
  };

  const getDayLabel = (dayId: string): string => {
    const day = VISIT_DAYS_OPTIONS.find(d => d.id === dayId);
    return day ? day.label : dayId;
  };

  return (
    <div className="space-y-6">
      <Card className="p-4">
        <h3 className="text-lg font-semibold mb-4">Importação de Clientes</h3>
        
        <div className="space-y-4">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Formato de importação</AlertTitle>
            <AlertDescription>CÓDIGO, RAZAO SOCIAL, NOME FANTASIA, ENDEREÇO, NUMERO, BAIRRO, CEP, CIDADE, TELEFONE, CPF/CNPJ, COD VEN, SEQ DE VISITA, ESTADO</AlertDescription>
          </Alert>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Vendedor (aplicado a todos os clientes importados)</Label>
              <Select value={selectedSalesRepId} onValueChange={handleSalesRepChange}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Selecione um vendedor" />
                </SelectTrigger>
                <SelectContent>
                  {salesReps.map(salesRep => (
                    <SelectItem key={salesRep.id} value={salesRep.id}>
                      {salesRep.name} {salesRep.code ? `(${salesRep.code})` : ''}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Dia da semana para visitas (aplicado a todos os clientes)</Label>
              <Select value={selectedWeekday} onValueChange={handleWeekdayChange}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Selecione um dia da semana" />
                </SelectTrigger>
                <SelectContent>
                  {VISIT_DAYS_OPTIONS.map(weekday => (
                    <SelectItem key={weekday.id} value={weekday.id}>
                      {weekday.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div>
            <Label htmlFor="importText">
              Cole aqui os dados dos clientes da planilha
            </Label>
            <Textarea 
              id="importText" 
              value={rawText} 
              onChange={handleTextChange} 
              rows={10} 
              className="font-mono text-sm" 
              placeholder="Cole os dados da planilha aqui..." 
            />
          </div>
          
          <div className="flex flex-wrap gap-2">
            <Button onClick={handleParseCustomers} type="button" variant="outline">
              Analisar Dados
            </Button>
            <Button 
              onClick={handleImportCustomers} 
              type="button" 
              disabled={validationResults.valid.length === 0 || isImporting} 
              className={isImporting ? "opacity-75" : ""}
            >
              <Upload className="w-4 h-4 mr-2" />
              {isImporting ? "Importando..." : `Importar ${validationResults.valid.length} Clientes`}
            </Button>
          </div>
          
          {validationResults.invalid.length > 0 && (
            <Alert variant="destructive">
              <XCircle className="h-4 w-4" />
              <AlertTitle>Problemas encontrados</AlertTitle>
              <AlertDescription>
                {validationResults.invalid.length} clientes têm problemas e não serão importados. Verifique a tabela abaixo.
              </AlertDescription>
            </Alert>
          )}
          
          {validationResults.valid.length > 0 && (
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertTitle>Clientes válidos</AlertTitle>
              <AlertDescription>
                {validationResults.valid.length} clientes estão prontos para importação.
              </AlertDescription>
            </Alert>
          )}
        </div>
      </Card>

      {parsedCustomers.length > 0 && (
        <Card className="p-4">
          <h3 className="text-lg font-semibold mb-4">
            Clientes encontrados ({parsedCustomers.length})
          </h3>
          <div className="max-h-96 overflow-y-auto border rounded-md">
            <table className="w-full text-sm">
              <thead className="sticky top-0 bg-background border-b">
                <tr>
                  <th className="p-2 text-left font-medium">Status</th>
                  <th className="p-2 text-left font-medium">Código</th>
                  <th className="p-2 text-left font-medium">Nome Fantasia</th>
                  <th className="p-2 text-left font-medium">Razão Social</th>
                  <th className="p-2 text-left font-medium">Cidade</th>
                  <th className="p-2 text-left font-medium">UF</th>
                  <th className="p-2 text-left font-medium">Vendedor</th>
                  <th className="p-2 text-left font-medium">Dia da Semana</th>
                  <th className="p-2 text-left font-medium">Seq. Visita</th>
                  <th className="p-2 text-left font-medium">Problemas</th>
                </tr>
              </thead>
              <tbody>
                {parsedCustomers.map((customer, index) => {
                  const validation = getCustomerValidationStatus(customer);
                  return (
                    <tr key={index} className="border-b hover:bg-muted/50">
                      <td className="p-2">
                        {validation.status === 'valid' ? (
                          <Badge variant="default" className="bg-green-100 text-green-800">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Válido
                          </Badge>
                        ) : (
                          <Badge variant="destructive">
                            <XCircle className="w-3 h-3 mr-1" />
                            Erro
                          </Badge>
                        )}
                      </td>
                      <td className="p-2">{customer.code}</td>
                      <td className="p-2">{customer.name}</td>
                      <td className="p-2">{customer.companyName || '-'}</td>
                      <td className="p-2">{customer.city}</td>
                      <td className="p-2">{customer.state}</td>
                      <td className="p-2">{customer.salesRepName || '-'}</td>
                      <td className="p-2">{customer.visitDays?.[0] ? getDayLabel(customer.visitDays[0]) : '-'}</td>
                      <td className="p-2">{customer.visitSequence}</td>
                      <td className="p-2">
                        {validation.errors.length > 0 && (
                          <div className="text-sm text-red-600">
                            {validation.errors.join(', ')}
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
};

export default BulkCustomerImport;
