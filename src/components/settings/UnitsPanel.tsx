
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Trash2, Plus, Edit } from 'lucide-react';
import { toast } from "sonner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Unit } from '@/services/supabase/unitService';
import { DeleteDialog } from '@/components/ui/DeleteDialog';
import { useUnits } from '@/hooks/useUnits';

export default function UnitsPanel() {
  const { units, isLoading, addUnit, updateUnit, deleteUnit } = useUnits();
  
  const [isOpen, setIsOpen] = useState(false);
  const [editingUnit, setEditingUnit] = useState<Unit | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [unitToDelete, setUnitToDelete] = useState<Unit | null>(null);
  const [newUnit, setNewUnit] = useState({ 
    code: '', 
    description: '',
    packaging: ''
  });

  const handleAddUnit = async () => {
    if (!newUnit.code || !newUnit.description) {
      toast.error("Preencha todos os campos obrigatórios");
      return;
    }

    // Verificar se a unidade já existe
    if (units.some(unit => unit.code.toLowerCase() === newUnit.code.toLowerCase())) {
      toast.error("Esta unidade já existe");
      return;
    }

    try {
      await addUnit({
        code: newUnit.code.toUpperCase(),
        description: newUnit.description,
        packaging: newUnit.packaging || undefined
      });
      
      setNewUnit({ code: '', description: '', packaging: '' });
      setIsOpen(false);
      toast.success("Unidade adicionada com sucesso");
    } catch (error) {
      toast.error("Erro ao adicionar unidade");
    }
  };

  const handleEditUnit = (unit: Unit) => {
    setEditingUnit(unit);
    setIsEditDialogOpen(true);
  };

  const handleSaveEditedUnit = async () => {
    if (!editingUnit) return;

    // Verificar se o código da unidade já existe (exceto a própria unidade sendo editada)
    const existingUnit = units.find(u => 
      u.code.toLowerCase() === editingUnit.code.toLowerCase() && u.id !== editingUnit.id
    );
    if (existingUnit) {
      toast.error("Já existe uma unidade com este código");
      return;
    }

    try {
      await updateUnit(editingUnit.id, {
        code: editingUnit.code.toUpperCase(),
        description: editingUnit.description,
        packaging: editingUnit.packaging || undefined
      });
      
      setIsEditDialogOpen(false);
      setEditingUnit(null);
      toast.success("Unidade atualizada com sucesso");
    } catch (error) {
      toast.error("Erro ao atualizar unidade");
    }
  };

  const handleDeleteClick = (unit: Unit) => {
    setUnitToDelete(unit);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!unitToDelete) return;

    try {
      await deleteUnit(unitToDelete.id);
      toast.success("Unidade removida com sucesso");
    } catch (error) {
      toast.error("Erro ao remover unidade");
    }

    setDeleteDialogOpen(false);
    setUnitToDelete(null);
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Gerenciar Unidades de Medida</CardTitle>
          <CardDescription>Carregando unidades...</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Gerenciar Unidades de Medida</CardTitle>
        <CardDescription>
          Configure as unidades de medida do sistema. Essas unidades são carregadas diretamente do banco de dados.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex justify-between items-center">
          <div>
            <p className="text-sm text-gray-600">
              {units.length} unidades cadastradas
            </p>
          </div>
          <div className="flex gap-2">
            <Dialog open={isOpen} onOpenChange={setIsOpen}>
              <DialogTrigger asChild>
                <Button className="bg-blue-600 hover:bg-blue-700">
                  <Plus size={16} className="mr-2" />
                  Nova Unidade
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Adicionar Nova Unidade</DialogTitle>
                  <DialogDescription>
                    Cadastre uma nova unidade de medida
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="unitCode">Código da Unidade*</Label>
                    <Input
                      id="unitCode"
                      placeholder="Ex: UN, KG, L, CX, etc."
                      value={newUnit.code}
                      onChange={(e) => setNewUnit(prev => ({ ...prev, code: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="unitDescription">Descrição*</Label>
                    <Input
                      id="unitDescription"
                      placeholder="Ex: Unidade, Quilograma, Litro, Caixa"
                      value={newUnit.description}
                      onChange={(e) => setNewUnit(prev => ({ ...prev, description: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="unitPackaging">Embalagem</Label>
                    <Input
                      id="unitPackaging"
                      placeholder="Ex: Plástico, Papel, Metal (opcional)"
                      value={newUnit.packaging}
                      onChange={(e) => setNewUnit(prev => ({ ...prev, packaging: e.target.value }))}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsOpen(false)}>
                    Cancelar
                  </Button>
                  <Button onClick={handleAddUnit}>
                    Adicionar
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Código</TableHead>
              <TableHead>Descrição</TableHead>
              <TableHead>Embalagem</TableHead>
              <TableHead className="w-[140px]">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {units.map((unit) => (
              <TableRow key={unit.id}>
                <TableCell className="font-medium">{unit.code}</TableCell>
                <TableCell>{unit.description}</TableCell>
                <TableCell>{unit.packaging || '-'}</TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEditUnit(unit)}
                      className="text-blue-600 hover:text-blue-700"
                      title="Editar unidade"
                    >
                      <Edit size={16} />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteClick(unit)}
                      className="text-red-600 hover:text-red-700"
                      title="Excluir unidade"
                    >
                      <Trash2 size={16} />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {/* Edit Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Editar Unidade</DialogTitle>
              <DialogDescription>
                Edite os dados da unidade de medida
              </DialogDescription>
            </DialogHeader>
            {editingUnit && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="editUnitCode">Código da Unidade*</Label>
                  <Input
                    id="editUnitCode"
                    value={editingUnit.code}
                    onChange={(e) => setEditingUnit(prev => prev ? { ...prev, code: e.target.value } : null)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="editUnitDescription">Descrição*</Label>
                  <Input
                    id="editUnitDescription"
                    value={editingUnit.description}
                    onChange={(e) => setEditingUnit(prev => prev ? { ...prev, description: e.target.value } : null)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="editUnitPackaging">Embalagem</Label>
                  <Input
                    id="editUnitPackaging"
                    value={editingUnit.packaging || ''}
                    onChange={(e) => setEditingUnit(prev => prev ? { ...prev, packaging: e.target.value } : null)}
                  />
                </div>
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleSaveEditedUnit}>
                Salvar
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <DeleteDialog
          open={deleteDialogOpen}
          onOpenChange={setDeleteDialogOpen}
          onConfirm={handleConfirmDelete}
          title="Excluir Unidade"
          description={`Tem certeza que deseja excluir a unidade "${unitToDelete?.description}"? Esta ação não pode ser desfeita.`}
          actionLabel="Excluir"
          cancelLabel="Cancelar"
        />
      </CardContent>
    </Card>
  );
}
