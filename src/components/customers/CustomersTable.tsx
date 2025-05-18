
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
  onDelete: (id: string) => void;
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
          <TableRow className="h-6">
            <TableHead className="w-14 py-1">Código</TableHead>
            <TableHead className="py-1">Nome</TableHead>
            <TableHead className="py-1">Telefone</TableHead>
            <TableHead className="w-20 text-right py-1">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody className="max-h-[600px]">
          {customers.map((customer) => (
            <TableRow key={customer.id} className="h-8">
              <TableCell className="font-medium py-1">
                {customer.code || "—"}
              </TableCell>
              <TableCell className="py-1">{customer.name}</TableCell>
              <TableCell className="py-1">{customer.phone || "—"}</TableCell>
              <TableCell className="text-right py-1">
                <div className="flex justify-end space-x-0.5">
                  <Button 
                    variant="ghost"
                    size="sm"
                    className="h-6 px-1.5"
                    onClick={() => onView(customer)}
                  >
                    <Eye size={15} />
                  </Button>
                  <Button 
                    variant="ghost"
                    size="sm"
                    className="h-6 px-1.5"
                    onClick={() => onEdit(customer)}
                  >
                    <ExternalLink size={15} />
                  </Button>
                  <Button 
                    variant="ghost"
                    size="sm"
                    className="h-6 px-1.5 text-red-500 hover:text-red-700"
                    onClick={() => onDelete(customer.id)}
                  >
                    <Trash2 size={15} />
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
