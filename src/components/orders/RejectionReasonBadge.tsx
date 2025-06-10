
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { RejectionReason } from '@/types';

interface RejectionReasonBadgeProps {
  reason?: RejectionReason;
}

const rejectionReasonLabels: Record<RejectionReason, string> = {
  sem_interesse: 'Sem Interesse',
  fechado: 'Fechado',
  sem_dinheiro: 'Sem Dinheiro',
  produto_indisponivel: 'Produto Indisponível',
  cliente_ausente: 'Cliente Ausente',
  outro: 'Outro'
};

export const RejectionReasonBadge: React.FC<RejectionReasonBadgeProps> = ({ reason }) => {
  if (!reason) return null;
  
  return (
    <Badge variant="outline" className="text-xs bg-red-50 text-red-700 border-red-200">
      {rejectionReasonLabels[reason] || reason}
    </Badge>
  );
};

export default RejectionReasonBadge;
