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
  paymentMethod: string;
  setPaymentMethod: (method: string) => void;
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
  paymentMethod,
  setPaymentMethod,
  simplifiedView = false,
  buttonRef,
  onSelectComplete,
  customerId,
  customerName,
  orderTotal,
}) => {
  const [installments, setInstallments] = useState<number>(1);
  const [installmentValue, setInstallmentValue] = useState<number>(0);
  const [totalWithInterest, setTotalWithInterest] = useState<number>(orderTotal || 0);
  const [interestRate, setInterestRate] = useState<number>(0);
  const [isCalculating, setIsCalculating] = useState(false);
  const [isManualValue, setIsManualValue] = useState(false);
  const [manualInstallmentValue, setManualInstallmentValue] = useState<number>(0);
  const [isPromissoryNote, setIsPromissoryNote] = useState(false);
  const [isPaymentTableDialogOpen, setIsPaymentTableDialogOpen] = useState(false);
  const { addPaymentTable } = usePaymentTables();
  const paymentMethodInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (orderTotal !== undefined) {
      calculateInstallment();
    }
  }, [orderTotal, installments, interestRate, isManualValue, manualInstallmentValue]);

  useEffect(() => {
    if (paymentMethod === 'promissoria') {
      setIsPromissoryNote(true);
    } else {
      setIsPromissoryNote(false);
    }
  }, [paymentMethod]);

  const calculateInstallment = () => {
    if (orderTotal === undefined) return;

    setIsCalculating(true);
    setTimeout(() => {
      let calculatedInstallmentValue = 0;
      let calculatedTotalWithInterest = orderTotal;

      if (interestRate > 0) {
        calculatedTotalWithInterest = orderTotal * (1 + (interestRate / 100));
        calculatedInstallmentValue = calculatedTotalWithInterest / installments;
      } else {
        calculatedInstallmentValue = orderTotal / installments;
      }

      setInstallmentValue(calculatedInstallmentValue);
      setTotalWithInterest(calculatedTotalWithInterest);
      setIsCalculating(false);
    }, 300);
  };

  const handlePaymentTableSelect = (tableId: string) => {
    setSelectedPaymentTable(tableId);
    if (onSelectComplete) {
      onSelectComplete();
    }
  };

  const handlePaymentMethodSelect = (method: string) => {
    setPaymentMethod(method);
    if (method === 'promissoria') {
      setIsPromissoryNote(true);
    } else {
      setIsPromissoryNote(false);
    }
    if (onSelectComplete) {
      onSelectComplete();
    }
  };

  const handleManualInstallmentChange = (value: string) => {
    const parsedValue = parseFloat(value);
    if (!isNaN(parsedValue)) {
      setManualInstallmentValue(parsedValue);
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

  const paymentMethods = [
    { value: 'dinheiro', label: 'Dinheiro' },
    { value: 'pix', label: 'PIX' },
    { value: 'cartao_credito', label: 'Cartão de Crédito' },
    { value: 'cartao_debito', label: 'Cartão de Débito' },
    { value: 'boleto', label: 'Boleto Bancário' },
    { value: 'transferencia', label: 'Transferência Bancária' },
    { value: 'cheque', label: 'Cheque' },
    { value: 'promissoria', label: 'Nota Promissória' },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Opções de Pagamento</CardTitle>
        <CardDescription>
          Selecione a forma de pagamento e condições.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4">
          <Label htmlFor="paymentMethod">Forma de Pagamento</Label>
          <Select
            onValueChange={(value) => handlePaymentMethodSelect(value)}
            defaultValue={paymentMethod}
          >
            <SelectTrigger id="paymentMethod">
              <SelectValue placeholder="Selecione a forma" />
            </SelectTrigger>
            <SelectContent>
              {paymentMethods.map((method) => (
                <SelectItem key={method.value} value={method.value}>
                  {method.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

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
