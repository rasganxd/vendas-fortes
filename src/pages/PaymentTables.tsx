
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "@/components/ui/use-toast";
import { Plus } from 'lucide-react';
import PageLayout from '@/components/layout/PageLayout';
import { useAppData } from '@/context/providers/AppDataProvider';
import { PaymentTableForm } from '@/components/payments/PaymentTableForm';
import { PaymentTablesList } from '@/components/payments/PaymentTablesList';
import { ConfirmationDialog } from '@/components/ui/ConfirmationDialog';

export default function PaymentTables() {
  const {
    paymentTables,
    isLoadingPaymentTables,
    addPaymentTable,
    updatePaymentTable,
    deletePaymentTable
  } = useAppData();
  
  const [openNewTableDialog, setOpenNewTableDialog] = useState(false);
  const [editTableId, setEditTableId] = useState<string | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [tableToDelete, setTableToDelete] = useState<string | null>(null);

  // Debug logging
  useEffect(() => {
    console.log('📊 [PaymentTables] Component state:', {
      paymentTablesCount: paymentTables.length,
      isLoadingPaymentTables,
      tables: paymentTables.map(t => ({ id: t.id, name: t.name }))
    });
  }, [paymentTables, isLoadingPaymentTables]);

  const handleOpenNewTable = () => {
    setEditTableId(null);
    setOpenNewTableDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenNewTableDialog(false);
    setEditTableId(null);
  };

  const handleEditTable = (tableId: string) => {
    setEditTableId(tableId);
    setOpenNewTableDialog(true);
  };

  const handleDeleteTable = (tableId: string) => {
    setTableToDelete(tableId);
    setDeleteConfirmOpen(true);
  };

  const confirmDeleteTable = async () => {
    if (!tableToDelete) return;
    
    try {
      await deletePaymentTable(tableToDelete);
      toast({
        title: "Tabela excluída",
        description: "A tabela foi excluída com sucesso."
      });
    } catch (error) {
      console.error("Erro ao excluir tabela:", error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Ocorreu um erro ao excluir a tabela."
      });
    } finally {
      setTableToDelete(null);
    }
  };

  const handleFormSuccess = () => {
    setOpenNewTableDialog(false);
    setEditTableId(null);
  };

  const tableToDeleteName = tableToDelete 
    ? paymentTables.find(t => t.id === tableToDelete)?.name 
    : '';

  return (
    <PageLayout title="Tabelas de Pagamento">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Tabelas de Pagamento</CardTitle>
              <CardDescription>
                Gerencie as tabelas de pagamento da sua empresa
              </CardDescription>
            </div>
            <Button onClick={handleOpenNewTable}>
              <Plus className="mr-2 h-4 w-4" /> Adicionar Tabela
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <PaymentTablesList
            paymentTables={paymentTables}
            isLoading={isLoadingPaymentTables}
            onEdit={handleEditTable}
            onDelete={handleDeleteTable}
          />

          <Dialog open={openNewTableDialog} onOpenChange={setOpenNewTableDialog}>
            <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editTableId ? "Editar Tabela" : "Adicionar Tabela"}</DialogTitle>
                <DialogDescription>
                  {editTableId ? "Altere as informações da tabela de pagamento." : "Crie uma nova tabela de pagamento para sua empresa."}
                </DialogDescription>
              </DialogHeader>
              <PaymentTableForm
                paymentTables={paymentTables}
                addPaymentTable={addPaymentTable}
                updatePaymentTable={updatePaymentTable}
                editTableId={editTableId}
                onClose={handleCloseDialog}
                onSuccess={handleFormSuccess}
              />
            </DialogContent>
          </Dialog>

          <ConfirmationDialog
            open={deleteConfirmOpen}
            onOpenChange={setDeleteConfirmOpen}
            onConfirm={confirmDeleteTable}
            title="Excluir Tabela de Pagamento"
            description="Tem certeza que deseja excluir a tabela"
            itemName={tableToDeleteName}
            actionLabel="Excluir"
            cancelLabel="Cancelar"
          />
        </CardContent>
      </Card>
    </PageLayout>
  );
}
