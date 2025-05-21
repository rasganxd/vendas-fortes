
import React from 'react';
import { Customer } from '@/types';
import { Card } from '@/components/ui/card';
import CustomersTable from './CustomersTable';

interface CustomersListProps {
  customers: Customer[];
  onView: (customer: Customer) => void;
  onEdit: (customer: Customer) => void;
  onDelete: (id: string, customer: Customer) => void;
}

const CustomersList: React.FC<CustomersListProps> = ({
  customers,
  onView,
  onEdit,
  onDelete
}) => {
  return (
    <Card className="overflow-hidden">
      <CustomersTable 
        customers={customers}
        onView={onView}
        onEdit={onEdit}
        onDelete={onDelete}
      />
    </Card>
  );
};

export default CustomersList;
