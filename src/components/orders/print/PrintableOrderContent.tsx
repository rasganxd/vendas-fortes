
import React from 'react';
import { Order, Customer, PaymentStatus } from '@/types';
import { formatDateToBR } from '@/lib/date-utils';
import { useAppContext } from '@/hooks/useAppContext';
import { formatCurrency } from '@/lib/format-utils';

interface PrintableOrderContentProps {
  orders: Order[];
  customers: Customer[];
  formatCurrency: (value: number | undefined) => string;
}

// Este componente não é mais necessário para a impressão em nova janela,
// mas mantemos para compatibilidade com outros componentes que possam utilizá-lo
const PrintableOrderContent: React.FC<PrintableOrderContentProps> = ({
  orders,
  customers,
  formatCurrency
}) => {
  const { settings } = useAppContext();
  const companyData = settings?.company;

  // Como agora usamos uma janela separada para impressão,
  // este componente não precisa renderizar o conteúdo para impressão
  return null;
};

export default PrintableOrderContent;
