
import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "@/components/ui/use-toast";
import { PaymentTable } from '@/types';
import { usePaymentTables } from '@/hooks/usePaymentTables';
import { Loader2 } from 'lucide-react';

interface PaymentOptionsInputProps {
  paymentTables: PaymentTable[];
  selectedPaymentTable: string;
  setSelectedPaymentTable: (id: string) => void;
  paymentMethod?: string;
  setPaymentMethod?: (method: string) => void;
  simplifiedView?: boolean;
  buttonRef?: React.RefObject<HTMLButtonElement>;
  onSelectComplete?: () => void;
  customerId?: string;
  customerName?: string;
  orderTotal?: number;
}

const PaymentOptionsInput: React.FC<PaymentOptionsInputProps> = ({
  paymentTables,
  selectedPaymentTable,
  setSelectedPaymentTable,
  simplifiedView = false,
  buttonRef,
  onSelectComplete,
  customerId,
  customerName,
  orderTotal,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const { addPaymentTable } = usePaymentTables();
  
  // Add useEffect to log payment tables for debugging
  useEffect(() => {
    console.log("Payment tables in PaymentOptionsInput:", paymentTables);
  }, [paymentTables]);

  const handlePaymentTableSelect = (tableId: string) => {
    console.log("Selected payment table ID:", tableId);
    setSelectedPaymentTable(tableId);
    if (onSelectComplete) {
      onSelectComplete();
    }
  };

  const handleAddPaymentTable = async (newTableName: string) => {
    if (!newTableName) {
      toast({
        title: "Erro",
        description: "O nome da tabela de pagamento não pode estar vazio.",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      // Create a default payment table with empty installments array
      const newTableId = await addPaymentTable({
        name: newTableName,
        description: `Tabela de pagamento criada para ${customerName} (${customerId})`,
        installments: [], // Adding the required empty installments array
        terms: [], // Adding required empty terms array
        notes: `Condições especiais para o cliente ${customerName}.`,
        createdAt: new Date(),
        updatedAt: new Date()
      });

      setSelectedPaymentTable(newTableId);
      toast({
        title: "Tabela de pagamento criada",
        description: `Tabela "${newTableName}" criada com sucesso! Agora você pode adicionar condições de pagamento na seção de Tabelas de Pagamento.`
      });
      
      if (onSelectComplete) {
        onSelectComplete();
      }
    } catch (error) {
      console.error("Erro ao adicionar tabela de pagamento:", error);
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao criar a tabela de pagamento.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Filter out inactive payment tables
  const activePaymentTables = Array.isArray(paymentTables) 
    ? paymentTables.filter(table => table && table.active !== false)
    : [];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Opções de Pagamento</CardTitle>
        <CardDescription>
          Selecione a tabela de pagamento para este pedido.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4">
          <Label htmlFor="paymentTable">Tabela de Pagamento</Label>
          {isLoading ? (
            <div className="flex items-center space-x-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Carregando...</span>
            </div>
          ) : (
            <Select
              onValueChange={handlePaymentTableSelect}
              value={selectedPaymentTable}
            >
              <SelectTrigger id="paymentTable" ref={buttonRef}>
                <SelectValue placeholder="Selecione uma tabela" />
              </SelectTrigger>
              <SelectContent>
                {activePaymentTables.length > 0 ? (
                  activePaymentTables.map((table) => (
                    <SelectItem key={table.id} value={table.id}>
                      {table.name}
                    </SelectItem>
                  ))
                ) : (
                  <SelectItem value="none" disabled>
                    Nenhuma tabela disponível
                  </SelectItem>
                )}
              </SelectContent>
            </Select>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default PaymentOptionsInput;
