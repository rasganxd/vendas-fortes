
import React from 'react';
import { Customer } from '@/types';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Edit, Trash2 } from 'lucide-react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableRow 
} from '@/components/ui/table';
import { formatDateToBR } from '@/lib/date-utils';
import { Badge } from '@/components/ui/badge';
import { VisitFrequencyOptions, DaysOfWeekOptions } from './constants';

interface CustomerDetailsProps {
  customer: Customer;
  onEdit: () => void;
  onDelete: () => void;
}

const CustomerDetails: React.FC<CustomerDetailsProps> = ({
  customer,
  onEdit,
  onDelete
}) => {
  // Helper function to get frequency label
  const getFrequencyLabel = (value: string | undefined): string => {
    if (!value) return "Não definido";
    const option = VisitFrequencyOptions.find(opt => opt.value === value);
    return option ? option.label : "Não definido";
  };

  // Helper function to get day label
  const getDayLabel = (value: string): string => {
    const option = DaysOfWeekOptions.find(opt => opt.value === value);
    return option ? option.label : value;
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">{customer.name}</h2>
        <div className="flex space-x-2">
          <Button variant="outline" size="icon" onClick={onEdit}>
            <Edit className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" className="text-red-500" onClick={onDelete}>
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <h3 className="text-lg font-medium">Informações Básicas</h3>
          </CardHeader>
          <CardContent>
            <Table>
              <TableBody>
                <TableRow>
                  <TableCell className="font-medium">Código</TableCell>
                  <TableCell>{customer.code || '—'}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">CNPJ/CPF</TableCell>
                  <TableCell>{customer.document || '—'}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Telefone</TableCell>
                  <TableCell>{customer.phone || '—'}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Email</TableCell>
                  <TableCell>{customer.email || '—'}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Vendedor</TableCell>
                  <TableCell>{customer.sales_rep_name || '—'}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Criado em</TableCell>
                  <TableCell>{customer.createdAt ? formatDateToBR(customer.createdAt) : '—'}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Atualizado em</TableCell>
                  <TableCell>{customer.updatedAt ? formatDateToBR(customer.updatedAt) : '—'}</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <h3 className="text-lg font-medium">Endereço</h3>
          </CardHeader>
          <CardContent>
            <Table>
              <TableBody>
                <TableRow>
                  <TableCell className="font-medium">Endereço</TableCell>
                  <TableCell>{customer.address || '—'}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Cidade</TableCell>
                  <TableCell>{customer.city || '—'}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Estado</TableCell>
                  <TableCell>{customer.state || '—'}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">CEP</TableCell>
                  <TableCell>{customer.zip || customer.zipCode || '—'}</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <h3 className="text-lg font-medium">Programação de Visitas</h3>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:justify-between gap-4">
              <div>
                <div className="text-sm font-medium text-gray-500">Frequência</div>
                <div>{getFrequencyLabel(customer.visitFrequency)}</div>
              </div>
              <div>
                <div className="text-sm font-medium text-gray-500">Sequência</div>
                <div>{customer.visitSequence || '—'}</div>
              </div>
            </div>

            <div>
              <div className="text-sm font-medium text-gray-500 mb-2">Dias de Visita</div>
              <div className="flex flex-wrap gap-2">
                {customer.visitDays && customer.visitDays.length > 0 
                  ? customer.visitDays.map(day => (
                      <Badge key={day} variant="outline" className="bg-slate-100">{getDayLabel(day)}</Badge>
                    ))
                  : <span className="text-gray-500">Nenhum dia definido</span>
                }
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {customer.notes && (
        <Card>
          <CardHeader className="pb-2">
            <h3 className="text-lg font-medium">Observações</h3>
          </CardHeader>
          <CardContent>
            <p className="whitespace-pre-line">{customer.notes}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default CustomerDetails;
