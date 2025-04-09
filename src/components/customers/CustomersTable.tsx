
import React from 'react';
import { Customer } from '@/types';
import { Edit, Trash2, Eye, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface CustomersTableProps {
  customers: Customer[];
  onView: (customer: Customer) => void;
  onEdit: (customer: Customer) => void;
  onDelete: (id: string) => void;
}

const CustomersTable: React.FC<CustomersTableProps> = ({ customers, onView, onEdit, onDelete }) => {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-16">Código</TableHead>
          <TableHead>Nome</TableHead>
          <TableHead className="hidden md:table-cell">Documento</TableHead>
          <TableHead className="hidden md:table-cell">Telefone</TableHead>
          <TableHead className="hidden lg:table-cell">Endereço</TableHead>
          <TableHead className="text-right">Ações</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {customers.length > 0 ? (
          customers.map((customer) => (
            <TableRow key={customer.id} className="hover:bg-muted/50">
              <TableCell className="font-medium">{customer.code || 'N/A'}</TableCell>
              <TableCell>{customer.name}</TableCell>
              <TableCell className="hidden md:table-cell">{customer.document || 'Não informado'}</TableCell>
              <TableCell className="hidden md:table-cell">{customer.phone}</TableCell>
              <TableCell className="hidden lg:table-cell">
                {customer.address ? (
                  <div className="flex items-center">
                    <MapPin className="h-3 w-3 mr-1 text-gray-500" />
                    <span className="truncate max-w-[200px]">
                      {customer.address}, {customer.city}/{customer.state}
                    </span>
                  </div>
                ) : (
                  'Não informado'
                )}
              </TableCell>
              <TableCell className="text-right">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => onView(customer)}
                  className="h-8 w-8 p-0"
                >
                  <Eye className="h-4 w-4" />
                  <span className="sr-only">Detalhes</span>
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => onEdit(customer)}
                  className="h-8 w-8 p-0"
                >
                  <Edit className="h-4 w-4" />
                  <span className="sr-only">Editar</span>
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => onDelete(customer.id)}
                  className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                  <span className="sr-only">Excluir</span>
                </Button>
              </TableCell>
            </TableRow>
          ))
        ) : (
          <TableRow>
            <TableCell colSpan={6} className="h-24 text-center">
              Nenhum cliente encontrado.
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
};

export default CustomersTable;
