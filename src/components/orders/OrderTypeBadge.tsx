
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Order } from '@/types';
import { ShoppingCart, MessageSquareX } from 'lucide-react';

interface OrderTypeBadgeProps {
  order: Order;
  showText?: boolean;
}

export const OrderTypeBadge: React.FC<OrderTypeBadgeProps> = ({ order, showText = true }) => {
  const isNegativeOrder = order.total === 0 && order.rejectionReason;
  
  if (isNegativeOrder) {
    return (
      <Badge variant="secondary" className="bg-orange-100 text-orange-800 border-orange-200">
        <MessageSquareX className="w-3 h-3 mr-1" />
        {showText && "VISITA"}
      </Badge>
    );
  }
  
  return (
    <Badge variant="default" className="bg-green-100 text-green-800 border-green-200">
      <ShoppingCart className="w-3 h-3 mr-1" />
      {showText && "VENDA"}
    </Badge>
  );
};

export default OrderTypeBadge;
