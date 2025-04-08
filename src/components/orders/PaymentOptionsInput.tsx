import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { PaymentTable } from '@/types';

interface PaymentOptionsInputProps {
  paymentTables: PaymentTable[];
  selectedPaymentTable: string;
  setSelectedPaymentTable: (id: string) => void;
  paymentMethod: string;
  setPaymentMethod: (method: string) => void;
  simplifiedView?: boolean;
  buttonRef?: React.RefObject<HTMLButtonElement>;
  onSelectComplete?: () => void;
}

export default function PaymentOptionsInput({
  paymentTables,
  selectedPaymentTable,
  setSelectedPaymentTable,
  paymentMethod,
  setPaymentMethod,
  simplifiedView = false,
  buttonRef,
  onSelectComplete
}: PaymentOptionsInputProps) {
  const [isOpen, setIsOpen] = useState(false);
  
  const handleSelectPaymentTable = (value: string) => {
    setSelectedPaymentTable(value);
    
    // If payment table is selected, also set a default payment method
    if (value) {
      const selected = paymentTables.find(pt => pt.id === value);
      if (selected && !paymentMethod) {
        setPaymentMethod('dinheiro'); // Default to cash
      }
    }
    
    // Call onSelectComplete callback when done
    if (onSelectComplete) {
      setTimeout(onSelectComplete, 50);
    }
  };

  if (simplifiedView) {
    return (
      <div className="space-y-1">
        <Label className="text-xs text-gray-500">Condição de Pagamento</Label>
        <Select 
          value={selectedPaymentTable} 
          onValueChange={handleSelectPaymentTable}
          onOpenChange={setIsOpen}
        >
          <SelectTrigger 
            className="h-8 text-sm" 
            ref={buttonRef}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !isOpen && onSelectComplete) {
                e.preventDefault();
                onSelectComplete();
              }
            }}
          >
            <SelectValue placeholder="Selecione uma tabela" />
          </SelectTrigger>
          <SelectContent>
            {paymentTables.map(table => (
              <SelectItem key={table.id} value={table.id}>
                {table.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    );
  }

  // Original layout
  return (
    <div className="space-y-4">
      {/* This is the full non-simplified view with payment tables and methods,
          not relevant for our current changes */}
      <div>
        <Label htmlFor="paymentTable">Tabela de Pagamento</Label>
        <Select value={selectedPaymentTable} onValueChange={setSelectedPaymentTable}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Selecione uma tabela" />
          </SelectTrigger>
          <SelectContent>
            {paymentTables.map(table => (
              <SelectItem key={table.id} value={table.id}>
                {table.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      <div>
        <Label htmlFor="paymentMethod">Forma de Pagamento</Label>
        <Select value={paymentMethod} onValueChange={setPaymentMethod}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Selecione uma forma de pagamento" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="dinheiro">Dinheiro</SelectItem>
            <SelectItem value="cartao">Cartão</SelectItem>
            <SelectItem value="cheque">Cheque</SelectItem>
            <SelectItem value="boleto">Boleto</SelectItem>
            <SelectItem value="pix">PIX</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      {selectedPaymentTable && (
        <div className="p-3 bg-gray-50 rounded-md">
          <p className="font-medium">Detalhes do Parcelamento</p>
          <div className="mt-2 space-y-1">
            {paymentTables
              .find(table => table.id === selectedPaymentTable)
              ?.terms.map((term, index) => (
                <div key={term.id} className="flex justify-between text-sm">
                  <span>{term.description || `Parcela ${index + 1}`}</span>
                  <span className="font-medium">{term.days} dias ({term.percentage}%)</span>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}
