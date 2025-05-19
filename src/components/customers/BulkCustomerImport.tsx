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
import { toast } from '@/hooks/use-toast';
import { Upload, AlertCircle } from 'lucide-react';
import { parseCustomerReportText } from '@/utils/customerParser';
import { useSalesReps } from '@/hooks/useSalesReps';
import { SalesRep } from '@/types/personnel';
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
  const [selectedSalesRepId, setSelectedSalesRepId] = useState<string>('');
  const [formatType, setFormatType] = useState<string>('simple'); // 'simple' or 'multiline'
  const { salesReps } = useSalesReps();
  
  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setRawText(e.target.value);
  };

  const handleParseCustomers = () => {
    try {
      if (!rawText.trim()) {
        toast.error("Texto vazio", { 
          description: "Por favor, insira o relatório de clientes." 
        });
        return;
      }

      const customers = parseCustomerReportText(rawText);
      
      if (customers.length === 0) {
        toast.error("Nenhum cliente encontrado", { 
          description: "Não foi possível encontrar clientes no texto fornecido. Verifique o formato do relatório." 
        });
        return;
      }
      
      // Apply the selected sales rep to all customers if one is selected
      if (selectedSalesRepId) {
        const selectedSalesRep = salesReps.find(rep => rep.id === selectedSalesRepId);
        if (selectedSalesRep) {
          customers.forEach(customer => {
            customer.sales_rep_id = selectedSalesRep.id;
            customer.sales_rep_name = selectedSalesRep.name;
          });
        }
      }
      
      setParsedCustomers(customers);
      
      toast("Análise concluída", {
        description: `${customers.length} clientes encontrados no relatório.`
      });
    } catch (error) {
      console.error("Erro ao analisar clientes:", error);
      toast.error("Erro ao analisar relatório", {
        description: "Ocorreu um erro ao processar o texto. Verifique o formato e tente novamente."
      });
    }
  };

  const handleImportCustomers = async () => {
    if (parsedCustomers.length === 0) {
      toast.error("Nenhum cliente para importar", {
        description: "Analise o relatório antes de importar os clientes."
      });
      return;
    }

    try {
      const results = await onImportCustomers(parsedCustomers);
      toast("Importação concluída", {
        description: `${results.length} clientes importados com sucesso.`
      });
      // Clear the form after successful import
      setRawText('');
      setParsedCustomers([]);
    } catch (error) {
      console.error("Erro ao importar clientes:", error);
      toast.error("Erro na importação", {
        description: "Ocorreu um erro ao importar os clientes. Verifique o console para mais detalhes."
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
          sales_rep_id: selectedSalesRep.id,
          sales_rep_name: selectedSalesRep.name,
        }));
        setParsedCustomers(updatedCustomers);
      }
    }
  };

  const handleFormatChange = (value: string) => {
    setFormatType(value);
    // Clear any previously parsed customers when changing format
    setParsedCustomers([]);
  };

  const getFormatPlaceholder = () => {
    if (formatType === 'simple') {
      return `CLIEN RAZAO SOCIAL                   NOME FANTASIA        COMPRADOR        ENDERECO                       BAIRRO       CIDADE
        3 JOSE MARIA RODRIGUES DOS SANTO CATADOR INDIVIDUAL                    RUA ALBINO CAMPOS COLETTI318D  SANTO ANTONIOCHAPECO`;
    } else {
      return `CLIEN RAZAO SOCIAL                CANAL                          EMP
ENDERECO                        BAIRRO              CEP         EXCL ESP
CIDADE                      UF  COMPRADOR           FONE        ANIVER.
CGC                  INSCRICAO EST.      VEN  ROTA  SEQ-VI  SEQ-EN  FREQ.`;
    }
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
              Selecione o formato do relatório que você deseja importar.
            </AlertDescription>
          </Alert>

          <RadioGroup 
            value={formatType} 
            onValueChange={handleFormatChange}
            className="flex space-x-4"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="simple" id="simple" />
              <Label htmlFor="simple">Formato Simplificado (Uma linha por cliente)</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="multiline" id="multiline" />
              <Label htmlFor="multiline">Formato Original (Várias linhas por cliente)</Label>
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
              Cole aqui o conteúdo do relatório de clientes ({formatType === 'simple' ? 'uma linha por cliente' : 'múltiplas linhas por cliente'})
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
              Analisar Relatório
            </Button>
            <Button
              onClick={handleImportCustomers}
              type="button"
              disabled={parsedCustomers.length === 0 || isImporting}
            >
              <Upload className="w-4 h-4 mr-2" />
              {isImporting ? "Importando..." : "Importar Clientes"}
            </Button>
          </div>
        </div>
      </Card>

      {parsedCustomers.length > 0 && (
        <Card className="p-4">
          <h3 className="text-lg font-semibold mb-4">
            Clientes encontrados ({parsedCustomers.length})
          </h3>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Código</TableHead>
                  <TableHead>Nome</TableHead>
                  <TableHead>Cidade</TableHead>
                  <TableHead>UF</TableHead>
                  <TableHead>Vendedor</TableHead>
                  <TableHead>Seq. Visita</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {parsedCustomers.map((customer, index) => (
                  <TableRow key={index}>
                    <TableCell>{customer.code}</TableCell>
                    <TableCell>{customer.name}</TableCell>
                    <TableCell>{customer.city}</TableCell>
                    <TableCell>{customer.state}</TableCell>
                    <TableCell>{customer.sales_rep_name}</TableCell>
                    <TableCell>{customer.visitSequence}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </Card>
      )}
    </div>
  );
};

export default BulkCustomerImport;
