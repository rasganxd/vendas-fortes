
import React, { useState } from 'react';
import PageLayout from '@/components/layout/PageLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Search, Edit, Trash2 } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useUnits } from '@/hooks/useUnits';
import { Unit } from '@/types/unit';
import UnitDialog from '@/components/units/UnitDialog';

export default function Units() {
  const { units, isLoading, createUnit, updateUnit, deleteUnit } = useUnits();
  const [searchTerm, setSearchTerm] = useState('');
  const [showDialog, setShowDialog] = useState(false);
  const [editingUnit, setEditingUnit] = useState<Unit | null>(null);
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; unit: Unit | null }>({
    open: false,
    unit: null
  });

  const filteredUnits = units.filter(unit =>
    unit.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    unit.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreateUnit = () => {
    setEditingUnit(null);
    setShowDialog(true);
  };

  const handleEditUnit = (unit: Unit) => {
    setEditingUnit(unit);
    setShowDialog(true);
  };

  const handleDeleteUnit = (unit: Unit) => {
    setDeleteDialog({ open: true, unit });
  };

  const handleSaveUnit = async (unitData: Omit<Unit, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (editingUnit) {
      await updateUnit(editingUnit.id, unitData);
    } else {
      await createUnit(unitData);
    }
  };

  const confirmDelete = async () => {
    if (deleteDialog.unit) {
      await deleteUnit(deleteDialog.unit.id);
      setDeleteDialog({ open: false, unit: null });
    }
  };

  if (isLoading) {
    return (
      <PageLayout title="Unidades de Medida" subtitle="Gerencie as unidades de medida do sistema">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout 
      title="Unidades de Medida" 
      subtitle="Gerencie as unidades de medida do sistema"
    >
      <div className="space-y-6">
        {/* Header with search and add button */}
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Buscar unidades..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button onClick={handleCreateUnit} className="bg-blue-600 hover:bg-blue-700">
            <Plus className="h-4 w-4 mr-2" />
            Nova Unidade
          </Button>
        </div>

        {/* Units table */}
        <div className="bg-white rounded-lg shadow">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Código</TableHead>
                <TableHead>Descrição</TableHead>
                <TableHead>Embalagem</TableHead>
                <TableHead className="w-[100px]">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUnits.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-8 text-gray-500">
                    {searchTerm ? 'Nenhuma unidade encontrada' : 'Nenhuma unidade cadastrada'}
                  </TableCell>
                </TableRow>
              ) : (
                filteredUnits.map((unit) => (
                  <TableRow key={unit.id}>
                    <TableCell className="font-medium">{unit.code}</TableCell>
                    <TableCell>{unit.description}</TableCell>
                    <TableCell>{unit.packaging || '-'}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditUnit(unit)}
                          className="text-blue-600 hover:text-blue-700"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteUnit(unit)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Summary */}
        <div className="text-sm text-gray-600">
          {filteredUnits.length} de {units.length} unidades
        </div>
      </div>

      {/* Dialogs */}
      <UnitDialog
        open={showDialog}
        onOpenChange={setShowDialog}
        unit={editingUnit}
        onSave={handleSaveUnit}
      />

      <AlertDialog open={deleteDialog.open} onOpenChange={(open) => setDeleteDialog({ open, unit: null })}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir Unidade</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir a unidade "{deleteDialog.unit?.description}"? 
              Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-red-600 hover:bg-red-700">
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </PageLayout>
  );
}
