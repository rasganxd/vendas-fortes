
import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Trash, Pencil, Loader2 } from 'lucide-react';
import { PaymentTable } from '@/types';

interface PaymentTablesListProps {
  paymentTables: PaymentTable[];
  isLoading: boolean;
  onEdit: (tableId: string) => void;
  onDelete: (tableId: string) => void;
}

export const PaymentTablesList: React.FC<PaymentTablesListProps> = ({
  paymentTables,
  isLoading,
  onEdit,
  onDelete
}) => {
  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Carregando tabelas de pagamento...</span>
      </div>
    );
  }

  if (paymentTables.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">Nenhuma tabela de pagamento cadastrada.</p>
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Nome</TableHead>
          <TableHead>Tipo</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="text-right">Ações</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {paymentTables.map(table => (
          <TableRow key={table.id}>
            <TableCell className="font-medium">{table.name}</TableCell>
            <TableCell>{table.type || "-"}</TableCell>
            <TableCell>
              {table.active ? (
                <span className="text-green-600 font-medium">Ativo</span>
              ) : (
                <span className="text-red-600 font-medium">Inativo</span>
              )}
            </TableCell>
            <TableCell className="text-right">
              <div className="flex justify-end space-x-2">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="outline" size="sm" onClick={() => onEdit(table.id)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Editar tabela</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="outline" size="sm" onClick={() => onDelete(table.id)}>
                        <Trash className="h-4 w-4 text-destructive" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Excluir tabela</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};
