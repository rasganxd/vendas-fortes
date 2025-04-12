
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
import { FilePenLine, Printer, FileText, CreditCard, Check, Banknote } from "lucide-react";
import PromissoryNoteView from '@/components/payments/PromissoryNoteView';
import { Badge } from '@/components/ui/badge';

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
      if (selected) {
        // Set payment method based on table type
        switch (selected.type) {
          case 'promissory_note':
            setPaymentMethod('promissoria');
            break;
          case 'card':
            setPaymentMethod('cartao');
            break;
          case 'check':
            setPaymentMethod('cheque');
            break;
          case 'cash':
            setPaymentMethod('dinheiro');
            break;
          case 'bank_slip':
            setPaymentMethod('boleto');
            break;
          default:
            setPaymentMethod('dinheiro'); // Default
        }
      }
    }
    
    // Call onSelectComplete callback when done
    if (onSelectComplete) {
      setTimeout(onSelectComplete, 50);
    }
  };

  // Helper function to get payment type badge
  const getPaymentTypeBadge = (type?: string) => {
    switch (type) {
      case 'card':
        return <Badge className="ml-2 bg-blue-500 flex gap-1 items-center"><CreditCard size={12} className="mr-1" />Cartão</Badge>;
      case 'cash':
        return <Badge className="ml-2 bg-green-500 flex gap-1 items-center"><Banknote size={12} className="mr-1" />À Vista</Badge>;
      case 'check':
        return <Badge className="ml-2 bg-purple-500 flex gap-1 items-center"><Check size={12} className="mr-1" />Cheque</Badge>;
      case 'promissory_note':
        return <Badge className="ml-2 bg-amber-500 flex gap-1 items-center"><FileText size={12} className="mr-1" />Promissória</Badge>;
      case 'bank_slip':
        return <Badge className="ml-2 bg-gray-500 flex gap-1 items-center"><FileText size={12} className="mr-1" />Boleto</Badge>;
      default:
        return <Badge className="ml-2 bg-blue-500">Padrão</Badge>;
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
                <div className="flex items-center">
                  {table.name} 
                  {getPaymentTypeBadge(table.type)}
                </div>
              </SelectItem>
            ))}
            {paymentTables.length === 0 && (
              <div className="p-2 text-sm text-gray-500">
                Nenhuma tabela de pagamento cadastrada
              </div>
            )}
          </SelectContent>
        </Select>
        
        {isPromissoryNoteType && (
          <div className="mt-2 text-xs text-blue-600 flex items-center">
            <FileText size={14} className="mr-1" />
            Nota promissória será gerada automaticamente
          </div>
        )}
      </div>
    );
  }

  // Original layout
  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="paymentTable">Tabela de Pagamento</Label>
        <Select value={selectedPaymentTable} onValueChange={handleSelectPaymentTable}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Selecione uma tabela" />
          </SelectTrigger>
          <SelectContent>
            {paymentTables.map(table => (
              <SelectItem key={table.id} value={table.id}>
                <div className="flex items-center">
                  {table.name}
                  {getPaymentTypeBadge(table.type)}
                </div>
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
        <Select 
          value={paymentMethod} 
          onValueChange={setPaymentMethod}
          disabled={!!selectedTable?.type && selectedTable.type !== 'standard'} // Auto-select based on table type
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Selecione uma forma de pagamento" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="dinheiro">Dinheiro</SelectItem>
            <SelectItem value="cartao">Cartão</SelectItem>
            <SelectItem value="cheque">Cheque</SelectItem>
            <SelectItem value="boleto">Boleto</SelectItem>
            <SelectItem value="pix">PIX</SelectItem>
            <SelectItem value="promissoria">Nota Promissória</SelectItem>
          </SelectContent>
        </Select>
        
        {isPromissoryNoteType && (
          <p className="mt-1 text-sm text-blue-600">
            Pagamento com nota promissória será gerado automaticamente
          </p>
        )}
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
          
          {isPromissoryNoteType && customerId && (
            <div className="mt-3">
              <Dialog open={showPromissoryNote} onOpenChange={setShowPromissoryNote}>
                <DialogTrigger asChild>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full mt-2 flex items-center justify-center gap-2"
                  >
                    <FilePenLine size={16} />
                    Visualizar Nota Promissória
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
