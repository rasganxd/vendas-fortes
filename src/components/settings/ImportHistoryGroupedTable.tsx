
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  Calendar,
  User,
  CheckCircle,
  XCircle,
  History as HistoryIcon,
  FileText,
  Download,
  Eye
} from "lucide-react";
import { ImportHistoryRecord } from '@/types/importHistory';

interface ImportHistoryGroupedTableProps {
  importHistory: ImportHistoryRecord[];
  isLoading: boolean;
  onViewReport: (reportId: string) => void;
}

export function ImportHistoryGroupedTable({
  importHistory,
  isLoading,
  onViewReport
}: ImportHistoryGroupedTableProps) {
  const downloadReport = (record: ImportHistoryRecord) => {
    try {
      const reportContent = JSON.stringify(record.reportData, null, 2);
      const blob = new Blob([reportContent], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `relatorio-importacao-${record.operationType}-${record.timestamp.toISOString().slice(0, 10)}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading report:', error);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="text-gray-500">Carregando histórico...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (importHistory.length === 0) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-gray-500">
            <HistoryIcon className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-medium mb-2">Nenhum histórico</h3>
            <p>Ainda não foram realizadas importações ou rejeições.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Operação</TableHead>
              <TableHead>Data/Hora</TableHead>
              <TableHead>Operador</TableHead>
              <TableHead>Pedidos</TableHead>
              <TableHead>Vendedores</TableHead>
              <TableHead className="text-right">Valor Total</TableHead>
              <TableHead className="text-center">Relatório</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {importHistory.map((record) => (
              <TableRow key={record.id}>
                <TableCell>
                  <Badge 
                    variant={record.operationType === 'import' ? 'default' : 'destructive'}
                    className={record.operationType === 'import' ? 'bg-green-500' : ''}
                  >
                    {record.operationType === 'import' ? (
                      <>
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Importação
                      </>
                    ) : (
                      <>
                        <XCircle className="h-3 w-3 mr-1" />
                        Rejeição
                      </>
                    )}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3 w-3 text-gray-400" />
                    <div className="text-sm">
                      {record.timestamp.toLocaleDateString('pt-BR')}
                      <br />
                      <span className="text-gray-500">
                        {record.timestamp.toLocaleTimeString('pt-BR', { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </span>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    <User className="h-3 w-3 text-gray-400" />
                    {record.operator}
                  </div>
                </TableCell>
                <TableCell>
                  <span className="font-medium">{record.ordersCount}</span>
                </TableCell>
                <TableCell>
                  <span className="font-medium">{record.salesRepsCount}</span>
                </TableCell>
                <TableCell className="text-right font-medium">
                  R$ {record.totalValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onViewReport(record.id)}
                      className="flex items-center gap-1"
                    >
                      <Eye className="h-3 w-3" />
                      Ver
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => downloadReport(record)}
                      className="flex items-center gap-1"
                    >
                      <Download className="h-3 w-3" />
                      Baixar
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
