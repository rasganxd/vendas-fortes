
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Customer } from '@/types/customer';
import { toast } from '@/components/ui/use-toast';
import { Upload, AlertCircle, CheckCircle, XCircle } from 'lucide-react';
import { parseCustomerSpreadsheet, validateCustomerData } from '@/utils/customerSpreadsheetParser';
import { parseCustomerReportText } from '@/utils/customerParser';
import { useSalesReps } from '@/hooks/useSalesReps';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  RadioGroup,
  RadioGroupItem
} from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';

interface BulkCustomerImportProps {
  onImportCustomers: (customers: Omit<Customer, 'id'>[]) => Promise<string[]>;
  isImporting?: boolean;
}

const BulkCustomerImport: React.FC<BulkCustomerImportProps> = ({
  onImportCustomers,
  isImporting = false,
}) => {
  const [rawText, setRawText] = useState<string>('');
  const [parsedCustomers, setParsedCustomers] = useState<Omit<Customer, 'id'>[]>([]);
  const [validationResults, setValidationResults] = useState<{
    valid: Omit<Customer, 'id'>[];
    invalid: { customer: Omit<Customer, 'id'>; errors: string[] }[];
  }>({ valid: [], invalid: [] });
  const [selectedSalesRepId, setSelectedSalesRepId] = useState<string>('');
  const [formatType, setFormatType] = useState<string>('spreadsheet'); // 'spreadsheet' or 'report'
  const { salesReps } = useSalesReps();
  
  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setRawText(e.target.value);
    // Clear previous results when text changes
    setParsedCustomers([]);
    setValidationResults({ valid: [], invalid: [] });
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

      console.log(`[BulkImport] Parsing customers with format: ${formatType}`);
      
      let customers: Omit<Customer, 'id'>[];
      
      if (formatType === 'spreadsheet') {
        customers = parseCustomerSpreadsheet(rawText);
      } else {
        customers = parseCustomerReportText(rawText);
      }
      
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
      const proceed = confirm(
        `Existem ${validationResults.invalid.length} clientes com problemas que não serão importados. Deseja continuar importando apenas os ${validationResults.valid.length} clientes válidos?`
      );
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
      setValidationResults({ valid: [], invalid: [] });
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
          salesRepName: selectedSalesRep.name,
        }));
        setParsedCustomers(updatedCustomers);
        
        // Re-validate with updated data
        const validation = validateCustomerData(updatedCustomers);
        setValidationResults(validation);
      }
    }
  };

  const handleFormatChange = (value: string) => {
    setFormatType(value);
    // Clear any previously parsed customers when changing format
    setParsedCustomers([]);
    setValidationResults({ valid: [], invalid: [] });
  };

  const getFormatPlaceholder = () => {
    if (formatType === 'spreadsheet') {
      return `CLIEN	RAZÃO SOCIAL	NOME FANTASIA	ENDEREÇO	NÚMERO	BAIRRO	CEP	CIDADE	FONE	CPF/CNPJ	VEN	SEQ DE VISITA	ESTADO
1	JOSE MARIA RODRIGUES	CATADOR INDIVIDUAL	RUA ALBINO CAMPOS	318D	SANTO ANTONIO	89800-000	CHAPECO	(49) 99999-9999	123.456.789-00	001	1	SC`;
    } else {
      return `CLIEN RAZAO SOCIAL                CANAL                          EMP
ENDERECO                        BAIRRO              CEP         EXCL ESP
CIDADE                      UF  COMPRADOR           FONE        ANIVER.
CGC                  INSCRICAO EST.      VEN  ROTA  SEQ-VI  SEQ-EN  FREQ.`;
    }
  };

  const getCustomerValidationStatus = (customer: Omit<Customer, 'id'>) => {
    const invalidItem = validationResults.invalid.find(item => item.customer.code === customer.code);
    if (invalidItem) {
      return { status: 'invalid', errors: invalidItem.errors };
    }
    return { status: 'valid', errors: [] };
  };

  return (
    <div className="space-y-6">
      <Card className="p-4">
        <h3 className="text-lg font-semibold mb-4">Importação de Clientes</h3>
        
        <div className="space-y-4">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Formato de importação</AlertTitle>
            <AlertDescription>
              Selecione o formato dos dados que você deseja importar.
            </AlertDescription>
          </Alert>

          <RadioGroup 
            value={formatType} 
            onValueChange={handleFormatChange}
            className="flex space-x-4"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="spreadsheet" id="spreadsheet" />
              <Label htmlFor="spreadsheet">Planilha (Excel/CSV com colunas separadas)</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="report" id="report" />
              <Label htmlFor="report">Relatório de sistema (formato texto)</Label>
            </div>
          </RadioGroup>
          
          <div className="space-y-2">
            <Label>Vendedor (aplicado a todos os clientes importados)</Label>
            <Select
              value={selectedSalesRepId}
              onValueChange={handleSalesRepChange}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Selecione um vendedor" />
              </SelectTrigger>
              <SelectContent>
                {salesReps.map((salesRep) => (
                  <SelectItem key={salesRep.id} value={salesRep.id}>
                    {salesRep.name} {salesRep.code ? `(${salesRep.code})` : ''}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label htmlFor="importText">
              Cole aqui os dados dos clientes ({formatType === 'spreadsheet' ? 'dados da planilha' : 'relatório do sistema'})
            </Label>
            <Textarea
              id="importText"
              value={rawText}
              onChange={handleTextChange}
              rows={10}
              className="font-mono text-sm"
              placeholder={getFormatPlaceholder()}
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
          <div className="overflow-x-auto">
            <Table maxHeight="400px">
              <TableHeader>
                <TableRow>
                  <TableHead>Status</TableHead>
                  <TableHead>Código</TableHead>
                  <TableHead>Nome</TableHead>
                  <TableHead>Cidade</TableHead>
                  <TableHead>UF</TableHead>
                  <TableHead>Vendedor</TableHead>
                  <TableHead>Seq. Visita</TableHead>
                  <TableHead>Problemas</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {parsedCustomers.map((customer, index) => {
                  const validation = getCustomerValidationStatus(customer);
                  return (
                    <TableRow key={index}>
                      <TableCell>
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
                      </TableCell>
                      <TableCell>{customer.code}</TableCell>
                      <TableCell>{customer.name}</TableCell>
                      <TableCell>{customer.city}</TableCell>
                      <TableCell>{customer.state}</TableCell>
                      <TableCell>{customer.salesRepName || '-'}</TableCell>
                      <TableCell>{customer.visitSequence}</TableCell>
                      <TableCell>
                        {validation.errors.length > 0 && (
                          <div className="text-sm text-red-600">
                            {validation.errors.join(', ')}
                          </div>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </Card>
      )}
    </div>
  );
};

export default BulkCustomerImport;
