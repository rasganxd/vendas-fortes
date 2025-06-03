
import React from 'react';
import { Customer, SalesRep, PaymentTable } from '@/types';
import CustomerSearchInput from './CustomerSearchInput';
import SalesRepSearchInput from './SalesRepSearchInput';
import PaymentOptionsInput from './PaymentOptionsInput';

interface OrderFormFieldsProps {
  customers: Customer[];
  salesReps: SalesRep[];
  paymentTables: PaymentTable[];
  selectedCustomer: Customer | null;
  setSelectedCustomer: (customer: Customer | null) => void;
  selectedSalesRep: SalesRep | null;
  setSelectedSalesRep: (salesRep: SalesRep | null) => void;
  selectedPaymentTable: string;
  setSelectedPaymentTable: (id: string) => void;
  customerInputValue: string;
  salesRepInputValue: string;
  isEditMode: boolean;
  salesRepInputRef: React.RefObject<HTMLInputElement>;
  customerInputRef: React.RefObject<HTMLInputElement>;
  paymentTableRef: React.RefObject<HTMLButtonElement>;
  onSalesRepNext: () => void;
  onCustomerNext: () => void;
  onPaymentNext: () => void;
}

export default function OrderFormFields({
  customers,
  salesReps,
  paymentTables,
  selectedCustomer,
  setSelectedCustomer,
  selectedSalesRep,
  setSelectedSalesRep,
  selectedPaymentTable,
  setSelectedPaymentTable,
  customerInputValue,
  salesRepInputValue,
  isEditMode,
  salesRepInputRef,
  customerInputRef,
  paymentTableRef,
  onSalesRepNext,
  onCustomerNext,
  onPaymentNext
}: OrderFormFieldsProps) {
  const getPaymentTableName = () => {
    const table = paymentTables.find(pt => pt.id === selectedPaymentTable);
    return table?.name || 'Não selecionado';
  };

  if (!isEditMode) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <SalesRepSearchInput
            salesReps={salesReps}
            selectedSalesRep={selectedSalesRep}
            setSelectedSalesRep={setSelectedSalesRep}
            inputRef={salesRepInputRef}
            onEnterPress={onSalesRepNext}
            initialInputValue={salesRepInputValue}
            compact={true}
          />

          <CustomerSearchInput
            customers={customers}
            selectedCustomer={selectedCustomer}
            setSelectedCustomer={setSelectedCustomer}
            inputRef={customerInputRef}
            onEnterPress={onCustomerNext}
            initialInputValue={customerInputValue}
            compact={true}
          />

          <PaymentOptionsInput
            paymentTables={paymentTables}
            selectedPaymentTable={selectedPaymentTable}
            setSelectedPaymentTable={setSelectedPaymentTable}
            buttonRef={paymentTableRef}
            onSelectComplete={onPaymentNext}
            simplifiedView={true}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Vendedor</label>
          <div className="text-sm text-gray-900 font-medium bg-white p-2 rounded border">
            {salesRepInputValue || 'Não selecionado'}
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Cliente</label>
          <div className="text-sm text-gray-900 font-medium bg-white p-2 rounded border">
            {customerInputValue || 'Não selecionado'}
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Forma de Pagamento</label>
          <div className="text-sm text-gray-900 font-medium bg-white p-2 rounded border">
            {getPaymentTableName()}
          </div>
        </div>
      </div>
    </div>
  );
}
