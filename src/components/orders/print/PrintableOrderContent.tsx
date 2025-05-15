
import React from 'react';
import { Order, Customer, PaymentStatus } from '@/types';

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
  // Como agora usamos uma janela separada para impressão,
  // este componente não precisa renderizar o conteúdo para impressão
  return null;
};

export default PrintableOrderContent;
