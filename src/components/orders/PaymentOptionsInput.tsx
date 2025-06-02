
import React, { useState, useEffect } from 'react';
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { PaymentTable } from '@/types';
import { usePaymentTables } from '@/hooks/usePaymentTables';
import { Loader2, CreditCard } from 'lucide-react';

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
  orderTotal
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
        description: "O nome da tabela de pagamento não pode estar vazio."
      });
      return;
    }

    setIsLoading(true);
    try {
      const newTableId = await addPaymentTable({
        name: newTableName,
        description: `Tabela de pagamento criada para ${customerName} (${customerId})`,
        installments: [],
        terms: {},
        notes: `Condições especiais para o cliente ${customerName}.`,
        active: true, // Add the missing active property
        createdAt: new Date(),
        updatedAt: new Date()
      });

      setSelectedPaymentTable(newTableId);
      toast({
        title: "Tabela de pagamento criada",
        description: `Tabela "${newTableName}" criada com sucesso!`
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
  const activePaymentTables = Array.isArray(paymentTables) ? paymentTables.filter(table => table && table.active !== false) : [];

  return (
    <div className="space-y-2">
      <Label htmlFor="paymentTable" className="text-xs font-medium text-gray-700 flex items-center gap-1">
        <CreditCard size={12} />
        Forma de Pagamento
      </Label>
      
      {isLoading ? (
        <div className="flex items-center space-x-2 p-2">
          <Loader2 className="h-3 w-3 animate-spin" />
          <span className="text-xs">Carregando...</span>
        </div>
      ) : (
        <Select onValueChange={handlePaymentTableSelect} value={selectedPaymentTable}>
          <SelectTrigger id="paymentTable" ref={buttonRef} className="h-9 text-sm">
            <SelectValue placeholder="Selecione uma tabela" />
          </SelectTrigger>
          <SelectContent>
            {activePaymentTables.length > 0 ? (
              activePaymentTables.map(table => (
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
  );
};

export default PaymentOptionsInput;
