
import React, { useState } from 'react';
import PageLayout from '@/components/layout/PageLayout';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Users, Edit, Trash2, Key, Smartphone } from 'lucide-react';
import { useSalesReps } from '@/hooks/useSalesReps';
import { SalesRep } from '@/types';
import EditSalesRepDialog from '@/components/personnel/EditSalesRepDialog';
import DeleteSalesRepDialog from '@/components/personnel/DeleteSalesRepDialog';
import SalesRepCredentialsDialog from '@/components/personnel/SalesRepCredentialsDialog';
import MobileSyncStatus from '@/components/personnel/MobileSyncStatus';

export default function SalesReps() {
  const {
    salesReps,
    isLoading,
    addSalesRep,
    updateSalesRep,
    deleteSalesRep,
    generateNextSalesRepCode,
    refreshSalesReps
  } = useSalesReps();

  const [editingSalesRep, setEditingSalesRep] = useState<SalesRep | null>(null);
  const [deletingSalesRep, setDeletingSalesRep] = useState<SalesRep | null>(null);
  const [credentialsSalesRep, setCredentialsSalesRep] = useState<SalesRep | null>(null);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showCredentialsDialog, setShowCredentialsDialog] = useState(false);

  const handleEdit = (salesRep: SalesRep) => {
    setEditingSalesRep(salesRep);
    setShowEditDialog(true);
  };

  const handleDelete = (salesRep: SalesRep) => {
    setDeletingSalesRep(salesRep);
    setShowDeleteDialog(true);
  };

  const handleCredentials = (salesRep: SalesRep) => {
    setCredentialsSalesRep(salesRep);
    setShowCredentialsDialog(true);
  };

  const handleCreateNew = async () => {
    const nextCode = await generateNextSalesRepCode();
    const newSalesRep: SalesRep = {
      id: '',
      code: nextCode,
      name: '',
      phone: '',
      email: '',
      active: true,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    setEditingSalesRep(newSalesRep);
    setShowEditDialog(true);
  };

  if (isLoading) {
    return (
      <PageLayout title="Vendedores">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout title="Vendedores">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Users className="h-6 w-6 text-blue-600" />
            <h2 className="text-xl font-semibold">Gestão de Vendedores</h2>
          </div>
          <Button onClick={handleCreateNew}>
            <Plus className="mr-2 h-4 w-4" />
            Novo Vendedor
          </Button>
        </div>

        {salesReps.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <Users className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Nenhum vendedor cadastrado
              </h3>
              <p className="text-gray-500 mb-4">
                Comece adicionando seu primeiro vendedor ao sistema.
              </p>
              <Button onClick={handleCreateNew}>
                <Plus className="mr-2 h-4 w-4" />
                Adicionar Vendedor
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {salesReps.map((salesRep) => (
              <Card key={salesRep.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">{salesRep.name}</CardTitle>
                      <p className="text-sm text-gray-500">Código: {salesRep.code}</p>
                    </div>
                    <Badge variant={salesRep.active ? "default" : "secondary"}>
                      {salesRep.active ? "Ativo" : "Inativo"}
                    </Badge>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-3">
                  <div className="text-sm space-y-1">
                    {salesRep.phone && (
                      <p><span className="font-medium">Telefone:</span> {salesRep.phone}</p>
                    )}
                    {salesRep.email && (
                      <p><span className="font-medium">Email:</span> {salesRep.email}</p>
                    )}
                  </div>

                  <MobileSyncStatus salesRepId={salesRep.id} />

                  <div className="flex gap-2 pt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(salesRep)}
                      className="flex-1"
                    >
                      <Edit className="mr-1 h-3 w-3" />
                      Editar
                    </Button>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleCredentials(salesRep)}
                    >
                      <Key className="h-3 w-3" />
                    </Button>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(salesRep)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <EditSalesRepDialog
          open={showEditDialog}
          onOpenChange={setShowEditDialog}
          salesRep={editingSalesRep}
          onSave={editingSalesRep?.id ? updateSalesRep : addSalesRep}
          onRefresh={refreshSalesReps}
        />

        <DeleteSalesRepDialog
          open={showDeleteDialog}
          onOpenChange={setShowDeleteDialog}
          salesRep={deletingSalesRep}
          onDelete={deleteSalesRep}
        />

        <SalesRepCredentialsDialog
          open={showCredentialsDialog}
          onOpenChange={setShowCredentialsDialog}
          salesRep={credentialsSalesRep}
        />
      </div>
    </PageLayout>
  );
}
