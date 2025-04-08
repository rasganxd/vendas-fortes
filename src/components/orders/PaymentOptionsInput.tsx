
import React from 'react';
import { PaymentTable } from '@/types';
import { Label } from "@/components/ui/label";
import { CreditCard } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface PaymentOptionsInputProps {
  paymentTables: PaymentTable[];
  selectedPaymentTable: string;
  setSelectedPaymentTable: (id: string) => void;
  paymentMethod: string;
  setPaymentMethod: (method: string) => void;
}

export default function PaymentOptionsInput({
  paymentTables,
  selectedPaymentTable,
  setSelectedPaymentTable,
  paymentMethod,
  setPaymentMethod
}: PaymentOptionsInputProps) {
  // Payment methods
  const paymentMethods = [
    { value: 'cash', label: 'Dinheiro' },
    { value: 'credit', label: 'Cartão de Crédito' },
    { value: 'debit', label: 'Cartão de Débito' },
    { value: 'transfer', label: 'Transferência' },
    { value: 'check', label: 'Cheque' },
    { value: 'custom', label: 'Personalizado' }
  ];

  return (
    <div className="pt-4 border-t">
      <h3 className="font-medium flex items-center mb-3">
        <CreditCard size={18} className="mr-2" /> Informações de Pagamento
      </h3>
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="paymentMethod">Forma de Pagamento</Label>
          <Select
            value={paymentMethod}
            onValueChange={setPaymentMethod}
          >
            <SelectTrigger id="paymentMethod">
              <SelectValue placeholder="Selecione..." />
            </SelectTrigger>
            <SelectContent>
              {paymentMethods.map(method => (
                <SelectItem key={method.value} value={method.value}>
                  {method.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="paymentTable">Tabela de Pagamento</Label>
          <Select
            value={selectedPaymentTable}
            onValueChange={setSelectedPaymentTable}
          >
            <SelectTrigger id="paymentTable">
              <SelectValue placeholder="Selecione..." />
            </SelectTrigger>
            <SelectContent>
              {paymentTables.filter(table => table.active).map(table => (
                <SelectItem key={table.id} value={table.id}>
                  {table.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}
