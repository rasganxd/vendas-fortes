
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
  if (customers.length === 0) {
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
          <TableRow className="h-8">
            <TableHead className="w-14 py-2">Código</TableHead>
            <TableHead className="py-2">Nome</TableHead>
            <TableHead className="py-2">Telefone</TableHead>
            <TableHead className="w-20 text-right py-2">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody className="max-h-[600px]">
          {customers.map((customer) => (
            <TableRow key={customer.id} className="h-10">
              <TableCell className="font-medium py-1.5">
                {customer.code || "—"}
              </TableCell>
              <TableCell className="py-1.5">{customer.name}</TableCell>
              <TableCell className="py-1.5">{customer.phone || "—"}</TableCell>
              <TableCell className="text-right py-1.5">
                <div className="flex justify-end space-x-1">
                  <Button 
                    variant="ghost"
                    size="sm"
                    className="h-7 px-2"
                    onClick={() => onView(customer)}
                  >
                    <Eye size={16} />
                  </Button>
                  <Button 
                    variant="ghost"
                    size="sm"
                    className="h-7 px-2"
                    onClick={() => onEdit(customer)}
                  >
                    <ExternalLink size={16} />
                  </Button>
                  <Button 
                    variant="ghost"
                    size="sm"
                    className="h-7 px-2 text-destructive hover:text-destructive/90" 
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
