
import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Eye, ExternalLink, Trash2 } from "lucide-react";
import { Customer } from "@/types";

interface CustomersTableProps {
  customers: Customer[];
  onView: (customer: Customer) => void;
  onEdit: (customer: Customer) => void;
  onDelete: (id: string, customer: Customer) => void; 
}

const CustomersTable: React.FC<CustomersTableProps> = ({
  customers,
  onView,
  onEdit,
  onDelete,
}) => {
  // Filter out invalid customers (those without name or with empty data)
  const validCustomers = customers.filter(customer => 
    customer && customer.id && customer.name && customer.name.trim() !== ''
  );
  
  if (validCustomers.length === 0) {
    return (
      <div className="text-center py-4 text-gray-500 h-[600px] flex items-center justify-center">
        Nenhum cliente encontrado
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-14">Código</TableHead>
            <TableHead>Nome</TableHead>
            <TableHead>Vendedor</TableHead>
            <TableHead>Telefone</TableHead>
            <TableHead className="w-20 text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody className="max-h-[600px]">
          {validCustomers.map((customer) => (
            <TableRow key={customer.id}>
              <TableCell className="font-medium">
                {customer.code || "—"}
              </TableCell>
              <TableCell>{customer.name}</TableCell>
              <TableCell>{customer.salesRepName || "—"}</TableCell>
              <TableCell>{customer.phone || "—"}</TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end space-x-1">
                  <Button 
                    variant="ghost"
                    size="sm"
                    onClick={() => onView(customer)}
                  >
                    <Eye size={16} />
                  </Button>
                  <Button 
                    variant="ghost"
                    size="sm"
                    onClick={() => onEdit(customer)}
                  >
                    <ExternalLink size={16} />
                  </Button>
                  <Button 
                    variant="ghost"
                    size="sm"
                    className="text-destructive hover:text-destructive/90" 
                    onClick={() => onDelete(customer.id, customer)}
                  >
                    <Trash2 size={16} />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default CustomersTable;
