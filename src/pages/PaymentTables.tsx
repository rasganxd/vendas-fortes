import { useState } from 'react';
import PageLayout from '@/components/layout/PageLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter 
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { PlusCircle, Trash, Edit, Plus, Info, Calendar, CreditCard, Banknote, FileText, Check } from 'lucide-react';
import { formatDateToBR } from '@/lib/date-utils';
import { toast } from "@/components/ui/use-toast";
import { PaymentTable, PaymentTableTerm } from '@/types';
import { usePaymentTables } from '@/hooks/usePaymentTables';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export default function PaymentTables() {
  const { paymentTables, addPaymentTable, updatePaymentTable, deletePaymentTable } = usePaymentTables();

  const [isTableDialogOpen, setIsTableDialogOpen] = useState(false);
  const [isTermDialogOpen, setIsTermDialogOpen] = useState(false);
  const [isDeleteTableDialogOpen, setIsDeleteTableDialogOpen] = useState(false);
  const [isDeleteTermDialogOpen, setIsDeleteTermDialogOpen] = useState(false);
  
  const [editingTable, setEditingTable] = useState<PaymentTable | null>(null);
  const [editingTerm, setEditingTerm] = useState<PaymentTableTerm | null>(null);
  const [selectedTable, setSelectedTable] = useState<PaymentTable | null>(null);
  const [deletingItemId, setDeletingItemId] = useState<string | null>(null);
  
  // Form for payment table
  const [tableForm, setTableForm] = useState({
    name: '',
    description: '',
    type: 'standard' as PaymentTable['type'],
    active: true
  });
  
  // Form for payment term
  const [termForm, setTermForm] = useState({
    days: 0,
    percentage: 0,
    description: ''
  });

  const handleOpenTableDialog = (table?: PaymentTable) => {
    if (table) {
      setEditingTable(table);
      setTableForm({
        name: table.name,
        description: table.description || '',
        type: table.type || 'standard',
        active: table.active !== false // default to true if undefined
      });
    } else {
      setEditingTable(null);
      setTableForm({
        name: '',
        description: '',
        type: 'standard',
        active: true
      });
    }
    setIsTableDialogOpen(true);
  };

  const handleOpenTermDialog = (term?: PaymentTableTerm) => {
    if (!selectedTable) return;
    
    if (term) {
      setEditingTerm(term);
      setTermForm({
        days: term.days,
        percentage: term.percentage,
        description: term.description || ''
      });
    } else {
      setEditingTerm(null);
      setTermForm({
        days: 0,
        percentage: 0,
        description: ''
      });
    }
    setIsTermDialogOpen(true);
  };

  const handleOpenDeleteTableDialog = (tableId: string) => {
    setDeletingItemId(tableId);
    setIsDeleteTableDialogOpen(true);
  };

  const handleOpenDeleteTermDialog = (termId: string) => {
    setDeletingItemId(termId);
    setIsDeleteTermDialogOpen(true);
  };

  const handleTableFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setTableForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleTermFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setTermForm(prev => ({
      ...prev,
      [name]: name === 'days' || name === 'percentage' ? parseFloat(value) : value
    }));
  };

  const handleTableTypeChange = (value: PaymentTable['type']) => {
    setTableForm(prev => ({
      ...prev,
      type: value
    }));
  };

  const handleSubmitTable = async () => {
    if (!tableForm.name) {
      toast({
        title: "Erro",
        description: "Nome da tabela é obrigatório",
        variant: "destructive"
      });
      return;
    }

    try {
      if (editingTable) {
        // Update existing table
        await updatePaymentTable(editingTable.id, {
          name: tableForm.name,
          description: tableForm.description,
          type: tableForm.type,
          active: tableForm.active
        });
        toast({ title: "Tabela atualizada com sucesso" });
      } else {
        // Create new table
        const tableId = await addPaymentTable({
          name: tableForm.name,
          description: tableForm.description,
          type: tableForm.type,
          active: tableForm.active,
          terms: []
        });
        
        // Find the new table in paymentTables and set it as selected
        const newTable = paymentTables.find(t => t.id === tableId);
        if (newTable) {
          setSelectedTable(newTable);
        }
        toast({ title: "Tabela criada com sucesso" });
      }
      setIsTableDialogOpen(false);
    } catch (error) {
      console.error("Erro ao salvar tabela:", error);
      toast({ 
        title: "Erro ao salvar tabela", 
        description: "Ocorreu um erro ao salvar a tabela de pagamento.", 
        variant: "destructive" 
      });
    }
  };

  const handleSubmitTerm = async () => {
    if (!selectedTable) return;

    if (termForm.percentage <= 0) {
      toast({
        title: "Erro",
        description: "Percentual deve ser maior que zero",
        variant: "destructive"
      });
      return;
    }

    try {
      let updatedTerms: PaymentTableTerm[];
      
      if (editingTerm) {
        // Update existing term
        updatedTerms = selectedTable.terms.map(term => 
          term.id === editingTerm.id 
            ? {
                ...term,
                days: termForm.days,
                percentage: termForm.percentage,
                description: termForm.description
              }
            : term
        );
      } else {
        // Create new term
        const newTerm: PaymentTableTerm = {
          id: `${selectedTable.id}-${Date.now()}`,
          days: termForm.days,
          percentage: termForm.percentage,
          description: termForm.description
        };
        updatedTerms = [...selectedTable.terms, newTerm];
      }

      // Sort terms by days
      updatedTerms.sort((a, b) => a.days - b.days);

      // Update the payment table with new terms
      await updatePaymentTable(selectedTable.id, {
        terms: updatedTerms
      });

      setIsTermDialogOpen(false);
      toast({ 
        title: editingTerm ? "Prazo atualizado com sucesso" : "Prazo adicionado com sucesso" 
      });
    } catch (error) {
      console.error("Erro ao salvar prazo:", error);
      toast({ 
        title: "Erro ao salvar prazo", 
        description: "Ocorreu um erro ao salvar o prazo de pagamento.", 
        variant: "destructive" 
      });
    }
  };

  const handleDeleteTable = async () => {
    if (!deletingItemId) return;
    
    try {
      await deletePaymentTable(deletingItemId);
      
      if (selectedTable && selectedTable.id === deletingItemId) {
        setSelectedTable(paymentTables.filter(t => t.id !== deletingItemId)[0] || null);
      }
      
      toast({ title: "Tabela excluída com sucesso" });
    } catch (error) {
      console.error("Erro ao excluir tabela:", error);
      toast({ 
        title: "Erro ao excluir tabela", 
        description: "Ocorreu um erro ao excluir a tabela de pagamento.", 
        variant: "destructive" 
      });
    } finally {
      setIsDeleteTableDialogOpen(false);
      setDeletingItemId(null);
    }
  };

  const handleDeleteTerm = async () => {
    if (!deletingItemId || !selectedTable) return;
    
    try {
      const updatedTerms = selectedTable.terms.filter(term => term.id !== deletingItemId);
      
      await updatePaymentTable(selectedTable.id, {
        terms: updatedTerms
      });
      
      toast({ title: "Prazo excluído com sucesso" });
    } catch (error) {
      console.error("Erro ao excluir prazo:", error);
      toast({ 
        title: "Erro ao excluir prazo", 
        description: "Ocorreu um erro ao excluir o prazo de pagamento.", 
        variant: "destructive" 
      });
    } finally {
      setIsDeleteTermDialogOpen(false);
      setDeletingItemId(null);
    }
  };

  const calculateTotal = (terms: PaymentTableTerm[]) => {
    return terms.reduce((sum, term) => sum + term.percentage, 0);
  };

  const getPaymentTypeIcon = (type?: string) => {
    switch (type) {
      case 'card':
        return <CreditCard size={16} className="mr-2 text-blue-500" />;
      case 'cash':
        return <Banknote size={16} className="mr-2 text-green-500" />;
      case 'check':
        return <Check size={16} className="mr-2 text-purple-500" />;
      case 'promissory_note':
        return <FileText size={16} className="mr-2 text-amber-500" />;
      case 'bank_slip':
        return <FileText size={16} className="mr-2 text-gray-500" />;
      default:
        return <Info size={16} className="mr-2 text-gray-400" />;
    }
  };

  const getPaymentTypeDisplayName = (type?: string) => {
    switch (type) {
      case 'card':
        return 'Cartão';
      case 'cash':
        return 'À Vista';
      case 'check':
        return 'Cheque';
      case 'promissory_note':
        return 'Nota Promissória';
      case 'bank_slip':
        return 'Boleto';
      default:
        return 'Padrão';
    }
  };

  return (
    <PageLayout title="Tabelas de Pagamento">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-1">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Tabelas</CardTitle>
              <Button 
                onClick={() => handleOpenTableDialog()} 
                variant="outline" 
                size="sm"
              >
                <PlusCircle size={16} className="mr-2" />
                Nova Tabela
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {paymentTables.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p>Nenhuma tabela de pagamento cadastrada</p>
                <Button 
                  onClick={() => handleOpenTableDialog()}
                  variant="outline" 
                  className="mt-2"
                >
                  Cadastrar Tabela
                </Button>
              </div>
            ) : (
              <div className="space-y-2">
                {paymentTables.map(table => (
                  <div
                    key={table.id}
                    className={`p-3 border rounded-md cursor-pointer ${
                      selectedTable?.id === table.id ? 'bg-blue-50 border-blue-200' : ''
                    }`}
                    onClick={() => setSelectedTable(table)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        {getPaymentTypeIcon(table.type)}
                        <div>
                          <p className="font-medium">{table.name}</p>
                          <p className="text-sm text-gray-500">
                            {getPaymentTypeDisplayName(table.type)} • {table.terms.length} prazos
                          </p>
                        </div>
                      </div>
                      <div>
                        {table.active !== false ? (
                          <Badge className="bg-green-600">Ativo</Badge>
                        ) : (
                          <Badge variant="outline">Inativo</Badge>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                {selectedTable && (
                  <div className="flex items-center">
                    {getPaymentTypeIcon(selectedTable.type)}
                    <CardTitle>{selectedTable.name}</CardTitle>
                  </div>
                )}
                {!selectedTable && <CardTitle>Detalhes da Tabela</CardTitle>}
                {selectedTable && (
                  <CardDescription className="mt-1">
                    {selectedTable.description} • {getPaymentTypeDisplayName(selectedTable.type)}
                  </CardDescription>
                )}
              </div>
              {selectedTable && (
                <div className="flex space-x-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleOpenTableDialog(selectedTable)}
                  >
                    <Edit size={16} className="mr-2" />
                    Editar
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleOpenDeleteTableDialog(selectedTable.id)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <Trash size={16} className="mr-2" />
                    Excluir
                  </Button>
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {!selectedTable ? (
              <div className="text-center py-12 text-gray-500">
                <Info size={40} className="mx-auto text-gray-300 mb-4" />
                <p>Selecione uma tabela de pagamento para visualizar os detalhes</p>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-sm text-gray-500">
                      Criado em: {formatDateToBR(selectedTable.createdAt)}
                    </p>
                    {selectedTable.updatedAt && (
                      <p className="text-sm text-gray-500">
                        Atualizado em: {formatDateToBR(selectedTable.updatedAt)}
                      </p>
                    )}
                  </div>
                  <Button 
                    onClick={() => handleOpenTermDialog()} 
                    className="bg-sales-800 hover:bg-sales-700"
                  >
                    <Plus size={16} className="mr-2" />
                    Adicionar Prazo
                  </Button>
                </div>

                <div className="border rounded-md">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Dias</TableHead>
                        <TableHead>Percentual</TableHead>
                        <TableHead>Descrição</TableHead>
                        <TableHead className="text-right">Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {selectedTable.terms.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={4} className="text-center py-4 text-gray-500">
                            Nenhum prazo cadastrado para esta tabela
                          </TableCell>
                        </TableRow>
                      ) : (
                        selectedTable.terms.map(term => (
                          <TableRow key={term.id}>
                            <TableCell>
                              <div className="flex items-center">
                                <Calendar size={16} className="mr-2 text-gray-400" />
                                {term.days}
                              </div>
                            </TableCell>
                            <TableCell>{term.percentage}%</TableCell>
                            <TableCell>{term.description}</TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end space-x-2">
                                <Button 
                                  variant="ghost" 
                                  size="sm"
                                  onClick={() => handleOpenTermDialog(term)}
                                >
                                  <Edit size={16} />
                                </Button>
                                <Button 
                                  variant="ghost" 
                                  size="sm"
                                  onClick={() => handleOpenDeleteTermDialog(term.id)}
                                  className="text-red-500 hover:text-red-700"
                                >
                                  <Trash size={16} />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                      {selectedTable.terms.length > 0 && (
                        <TableRow>
                          <TableCell colSpan={1} className="font-bold">
                            Total
                          </TableCell>
                          <TableCell className="font-bold">
                            {calculateTotal(selectedTable.terms).toFixed(2)}%
                          </TableCell>
                          <TableCell colSpan={2}></TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
                
                {calculateTotal(selectedTable.terms) !== 100 && (
                  <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md text-yellow-800">
                    <p className="flex items-center">
                      <Info size={16} className="mr-2" />
                      O total dos percentuais deve ser igual a 100%. Atualmente: {calculateTotal(selectedTable.terms).toFixed(2)}%
                    </p>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Dialog for adding/editing payment table */}
      <Dialog open={isTableDialogOpen} onOpenChange={setIsTableDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingTable ? 'Editar Tabela de Pagamento' : 'Nova Tabela de Pagamento'}
            </DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome</Label>
              <Input
                id="name"
                name="name"
                placeholder="Nome da tabela de pagamento"
                value={tableForm.name}
                onChange={handleTableFormChange}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="type">Tipo de Pagamento</Label>
              <Select
                value={tableForm.type}
                onValueChange={handleTableTypeChange}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o tipo de pagamento" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="standard">Padrão</SelectItem>
                  <SelectItem value="promissory_note">Nota Promissória</SelectItem>
                  <SelectItem value="card">Cartão</SelectItem>
                  <SelectItem value="check">Cheque</SelectItem>
                  <SelectItem value="cash">À Vista</SelectItem>
                  <SelectItem value="bank_slip">Boleto</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">Descrição (opcional)</Label>
              <Input
                id="description"
                name="description"
                placeholder="Descrição da tabela de pagamento"
                value={tableForm.description}
                onChange={handleTableFormChange}
              />
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="active"
                name="active"
                checked={tableForm.active}
                onCheckedChange={(checked) => 
                  setTableForm(prev => ({ ...prev, active: checked }))
                }
              />
              <Label htmlFor="active">Tabela Ativa</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsTableDialogOpen(false)}>
              Cancelar
            </Button>
            <Button className="bg-sales-800 hover:bg-sales-700" onClick={handleSubmitTable}>
              {editingTable ? 'Atualizar' : 'Cadastrar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog for adding/editing payment term */}
      <Dialog open={isTermDialogOpen} onOpenChange={setIsTermDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingTerm ? 'Editar Prazo de Pagamento' : 'Novo Prazo de Pagamento'}
            </DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="days">Dias</Label>
              <Input
                id="days"
                name="days"
                type="number"
                min="0"
                placeholder="Dias para pagamento"
                value={termForm.days}
                onChange={handleTermFormChange}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="percentage">Percentual (%)</Label>
              <Input
                id="percentage"
                name="percentage"
                type="number"
                step="0.01"
                min="0"
                max="100"
                placeholder="Percentual do valor total"
                value={termForm.percentage}
                onChange={handleTermFormChange}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="termDescription">Descrição (opcional)</Label>
              <Input
                id="termDescription"
                name="description"
                placeholder="Ex: Entrada, 1ª parcela, etc"
                value={termForm.description}
                onChange={handleTermFormChange}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsTermDialogOpen(false)}>
              Cancelar
            </Button>
            <Button className="bg-sales-800 hover:bg-sales-700" onClick={handleSubmitTerm}>
              {editingTerm ? 'Atualizar' : 'Adicionar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Alert dialog for deleting payment table */}
      <AlertDialog open={isDeleteTableDialogOpen} onOpenChange={setIsDeleteTableDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir tabela de pagamento</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir esta tabela de pagamento? Esta ação n��o pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteTable}
              className="bg-red-600 hover:bg-red-700"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Alert dialog for deleting payment term */}
      <AlertDialog open={isDeleteTermDialogOpen} onOpenChange={setIsDeleteTermDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir prazo de pagamento</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir este prazo de pagamento? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteTerm}
              className="bg-red-600 hover:bg-red-700"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </PageLayout>
  );
}
