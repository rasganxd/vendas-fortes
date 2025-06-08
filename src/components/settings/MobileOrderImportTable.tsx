
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
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
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { 
  ChevronDown, 
  ChevronRight, 
  User, 
  Calendar,
  DollarSign,
  Package
} from "lucide-react";
import { MobileOrderGroup, ImportSelectionState } from '@/types';
import { useState } from 'react';

interface MobileOrderImportTableProps {
  groupedOrders: MobileOrderGroup[];
  selection: ImportSelectionState;
  isLoading: boolean;
  onToggleOrder: (orderId: string) => void;
  onToggleSalesRep: (salesRepId: string) => void;
}

export function MobileOrderImportTable({
  groupedOrders,
  selection,
  isLoading,
  onToggleOrder,
  onToggleSalesRep
}: MobileOrderImportTableProps) {
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());

  const toggleGroup = (salesRepId: string) => {
    setExpandedGroups(prev => {
      const newExpanded = new Set(prev);
      if (newExpanded.has(salesRepId)) {
        newExpanded.delete(salesRepId);
      } else {
        newExpanded.add(salesRepId);
      }
      return newExpanded;
    });
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="text-gray-500">Carregando pedidos pendentes...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (groupedOrders.length === 0) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-gray-500">
            <Package className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-medium mb-2">Nenhum pedido pendente</h3>
            <p>Não há pedidos mobile aguardando importação.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {groupedOrders.map((group) => {
        const isGroupExpanded = expandedGroups.has(group.salesRepId);
        const isGroupSelected = selection.selectedSalesReps.has(group.salesRepId);
        const selectedOrdersInGroup = group.orders.filter(order => 
          selection.selectedOrders.has(order.id)
        ).length;

        return (
          <Card key={group.salesRepId}>
            <Collapsible>
              <CollapsibleTrigger asChild>
                <CardHeader 
                  className="cursor-pointer hover:bg-gray-50 transition-colors p-4"
                  onClick={() => toggleGroup(group.salesRepId)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Checkbox
                        checked={isGroupSelected}
                        onCheckedChange={() => onToggleSalesRep(group.salesRepId)}
                        onClick={(e) => e.stopPropagation()}
                      />
                      
                      {isGroupExpanded ? (
                        <ChevronDown className="h-4 w-4 text-gray-500" />
                      ) : (
                        <ChevronRight className="h-4 w-4 text-gray-500" />
                      )}
                      
                      <div className="flex items-center gap-2">
                        <User className="h-5 w-5 text-blue-500" />
                        <CardTitle className="text-base">{group.salesRepName}</CardTitle>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <Package className="h-4 w-4 text-gray-500" />
                        <Badge variant="outline">
                          {selectedOrdersInGroup > 0 ? `${selectedOrdersInGroup}/` : ''}{group.count} pedidos
                        </Badge>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4 text-green-500" />
                        <span className="font-medium">
                          R$ {group.totalValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </span>
                      </div>
                    </div>
                  </div>
                </CardHeader>
              </CollapsibleTrigger>

              <CollapsibleContent>
                <CardContent className="pt-0">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-12"></TableHead>
                        <TableHead>Código</TableHead>
                        <TableHead>Cliente</TableHead>
                        <TableHead>Data</TableHead>
                        <TableHead>Itens</TableHead>
                        <TableHead className="text-right">Total</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {group.orders.map((order) => {
                        const isSelected = selection.selectedOrders.has(order.id);
                        
                        return (
                          <TableRow key={order.id} className={isSelected ? 'bg-blue-50' : ''}>
                            <TableCell>
                              <Checkbox
                                checked={isSelected}
                                onCheckedChange={() => onToggleOrder(order.id)}
                              />
                            </TableCell>
                            <TableCell className="font-medium">#{order.code}</TableCell>
                            <TableCell>{order.customerName}</TableCell>
                            <TableCell>
                              <div className="flex items-center gap-1">
                                <Calendar className="h-3 w-3 text-gray-400" />
                                {order.date.toLocaleDateString('pt-BR')}
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant="secondary">
                                {order.items.length} {order.items.length === 1 ? 'item' : 'itens'}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right font-medium">
                              R$ {order.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </CardContent>
              </CollapsibleContent>
            </Collapsible>
          </Card>
        );
      })}
    </div>
  );
}
