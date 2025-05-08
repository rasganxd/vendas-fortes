
import React, { useState, useEffect, useRef } from 'react';
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
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import { PaymentTable } from '@/types';
import { usePaymentTables } from '@/hooks/usePaymentTables';

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
  const [isPaymentTableDialogOpen, setIsPaymentTableDialogOpen] = useState(false);
  const { addPaymentTable } = usePaymentTables();

  const handlePaymentTableSelect = (tableId: string) => {
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

    try {
      // Create a default payment table with empty installments array
      const newTableId = await addPaymentTable({
        name: newTableName,
        description: `Tabela de pagamento criada para ${customerName} (${customerId})`,
        installments: [], // Adding the required installments array
        notes: `Condições especiais para o cliente ${customerName}.`,
        createdAt: new Date(),
        updatedAt: new Date()
      });

      setSelectedPaymentTable(newTableId);
      setIsPaymentTableDialogOpen(false);
      toast({
        title: "Tabela de pagamento criada",
        description: `Tabela "${newTableName}" criada com sucesso!`
      });
    } catch (error) {
      console.error("Erro ao adicionar tabela de pagamento:", error);
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao criar a tabela de pagamento.",
        variant: "destructive"
      });
    }
  };

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
          <Select
            onValueChange={handlePaymentTableSelect}
            defaultValue={selectedPaymentTable}
          >
            <SelectTrigger id="paymentTable" ref={buttonRef}>
              <SelectValue placeholder="Padrão" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="default-table">Padrão</SelectItem>
              {(Array.isArray(paymentTables) ? paymentTables : []).map((table) => (
                <SelectItem key={table.id} value={table.id}>
                  {table.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  );
};

export default PaymentOptionsInput;
