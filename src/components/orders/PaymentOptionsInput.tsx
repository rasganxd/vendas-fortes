
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { FilePenLine, Printer } from "lucide-react";
import PromissoryNoteView from '@/components/payments/PromissoryNoteView';

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

export default function PaymentOptionsInput({
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
  orderTotal
}: PaymentOptionsInputProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [showPromissoryNote, setShowPromissoryNote] = useState(false);
  
  const selectedTable = paymentTables.find(pt => pt.id === selectedPaymentTable);
  const isPromissoryNoteType = selectedTable?.type === 'promissory_note';
  
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
            {paymentTables.length === 0 && (
              <div className="p-2 text-sm text-gray-500">
                Nenhuma tabela de pagamento cadastrada
              </div>
            )}
          </SelectContent>
        </Select>
      </div>
    );
  }

  // Original layout
  return (
    <div className="space-y-4">
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
            {paymentTables.length === 0 && (
              <div className="p-2 text-sm text-gray-500">
                Nenhuma tabela de pagamento cadastrada
              </div>
            )}
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
            {isPromissoryNoteType && (
              <SelectItem value="promissoria">Nota Promissória</SelectItem>
            )}
          </SelectContent>
        </Select>
      </div>
      
      {selectedPaymentTable && (
        <div className="p-3 bg-gray-50 rounded-md">
          <p className="font-medium">Detalhes do Parcelamento</p>
          <div className="mt-2 space-y-1">
            {selectedTable?.terms.map((term, index) => (
              <div key={term.id} className="flex justify-between text-sm">
                <span>{term.description || `Parcela ${index + 1}`}</span>
                <span className="font-medium">{term.days} dias ({term.percentage}%)</span>
              </div>
            ))}
          </div>
          
          {isPromissoryNoteType && paymentMethod === "promissoria" && customerId && (
            <div className="mt-3">
              <Dialog open={showPromissoryNote} onOpenChange={setShowPromissoryNote}>
                <DialogTrigger asChild>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full mt-2 flex items-center justify-center gap-2"
                  >
                    <FilePenLine size={16} />
                    Gerar Nota Promissória
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Nota Promissória</DialogTitle>
                  </DialogHeader>
                  
                  <PromissoryNoteView 
                    customerName={customerName || ""}
                    customerId={customerId}
                    paymentTable={selectedTable}
                    total={orderTotal || 0}
                  />
                </DialogContent>
              </Dialog>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
