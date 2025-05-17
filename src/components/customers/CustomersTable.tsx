
import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Eye, MoreHorizontal, ExternalLink, Trash2 } from "lucide-react";
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
      <div className="text-center py-10 text-gray-500">
        Nenhum cliente encontrado
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-16">Código</TableHead>
            <TableHead>Nome</TableHead>
            <TableHead>Telefone</TableHead>
            <TableHead>Cidade</TableHead>
            <TableHead>Vendedor</TableHead>
            <TableHead className="w-24 text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {customers.map((customer) => (
            <TableRow key={customer.id}>
              <TableCell className="font-medium">
                {customer.code || "—"}
              </TableCell>
              <TableCell>{customer.name}</TableCell>
              <TableCell>{customer.phone || "—"}</TableCell>
              <TableCell>
                {customer.city}
                {customer.state ? `, ${customer.state}` : ""}
              </TableCell>
              <TableCell>{customer.sales_rep_name || "—"}</TableCell>
              <TableCell className="text-right">
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
                  onClick={() => onDelete(customer.id)}
                  className="text-red-500 hover:text-red-700"
                >
                  <Trash2 size={16} />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default CustomersTable;
