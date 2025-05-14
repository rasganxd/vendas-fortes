
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
import { useToast } from '@/components/ui/use-toast';
import { Check, X, Upload } from 'lucide-react';
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
import { Label } from '@/components/ui/label';

interface BulkCustomerImportProps {
  onImportCustomers: (customers: Omit<Customer, 'id'>[]) => Promise<string[]>;
  isImporting?: boolean;
}

const BulkCustomerImport: React.FC<BulkCustomerImportProps> = ({
  onImportCustomers,
  isImporting = false,
}) => {
  const { toast } = useToast();
  const [rawText, setRawText] = useState<string>('');
  const [parsedCustomers, setParsedCustomers] = useState<Omit<Customer, 'id'>[]>([]);
  const [selectedSalesRepId, setSelectedSalesRepId] = useState<string>('');
  const { salesReps } = useSalesReps();
  
  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setRawText(e.target.value);
  };

  const handleParseCustomers = () => {
    try {
      if (!rawText.trim()) {
        toast({
          variant: "destructive",
          title: "Texto vazio",
          description: "Por favor, insira o relatório de clientes.",
        });
        return;
      }

      const customers = parseCustomerReportText(rawText);
      
      if (customers.length === 0) {
        toast({
          variant: "destructive",
          title: "Nenhum cliente encontrado",
          description: "Não foi possível encontrar clientes no texto fornecido. Verifique o formato do relatório.",
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
      
      toast({
        title: "Análise concluída",
        description: `${customers.length} clientes encontrados no relatório.`,
      });
    } catch (error) {
      console.error("Erro ao analisar clientes:", error);
      toast({
        variant: "destructive",
        title: "Erro ao analisar relatório",
        description: "Ocorreu um erro ao processar o texto. Verifique o formato e tente novamente.",
      });
    }
  };

  const handleImportCustomers = async () => {
    if (parsedCustomers.length === 0) {
      toast({
        variant: "destructive",
        title: "Nenhum cliente para importar",
        description: "Analise o relatório antes de importar os clientes.",
      });
      return;
    }

    try {
      const results = await onImportCustomers(parsedCustomers);
      toast({
        title: "Importação concluída",
        description: `${results.length} clientes importados com sucesso.`,
      });
      // Clear the form after successful import
      setRawText('');
      setParsedCustomers([]);
    } catch (error) {
      console.error("Erro ao importar clientes:", error);
      toast({
        variant: "destructive",
        title: "Erro na importação",
        description: "Ocorreu um erro ao importar os clientes. Verifique o console para mais detalhes.",
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

  return (
    <div className="space-y-6">
      <Card className="p-4">
        <h3 className="text-lg font-semibold mb-4">Importação de Clientes</h3>
        
        <div className="space-y-4">
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
            <Label htmlFor="importText">Cole aqui o conteúdo do relatório de clientes</Label>
            <Textarea
              id="importText"
              value={rawText}
              onChange={handleTextChange}
              rows={10}
              className="font-mono text-sm"
              placeholder="CLIEN RAZAO SOCIAL                CANAL                          EMP
          ENDERECO                        BAIRRO              CEP         EXCL ESP
          CIDADE                      UF  COMPRADOR           FONE        ANIVER.
          CGC                  INSCRICAO EST.      VEN  ROTA  SEQ-VI  SEQ-EN  FREQ."
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
