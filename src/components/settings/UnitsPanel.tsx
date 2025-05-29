
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Trash2, Plus, Edit, Loader2 } from 'lucide-react';
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
import { Unit } from '@/types/unit';
import EditUnitDialog from './EditUnitDialog';
import { DeleteDialog } from '@/components/ui/DeleteDialog';
import { productUnitsService } from '@/services/supabase/productUnitsService';

export default function UnitsPanel() {
  const [units, setUnits] = useState<Unit[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const [editingUnit, setEditingUnit] = useState<Unit | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [unitToDelete, setUnitToDelete] = useState<Unit | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newUnit, setNewUnit] = useState({ 
    value: '', 
    label: '', 
    packageQuantity: 1
  });

  // Carregar unidades do banco de dados
  const loadUnits = async () => {
    try {
      setIsLoading(true);
      const data = await productUnitsService.getAll();
      setUnits(data);
    } catch (error) {
      console.error('Erro ao carregar unidades:', error);
      toast("Erro", {
        description: "Erro ao carregar unidades do banco de dados",
        style: {
          backgroundColor: 'rgb(239, 68, 68)',
          color: 'white'
        }
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadUnits();
  }, []);

  // Disparar evento para atualizar outros componentes
  const notifyUnitsUpdated = (newUnits: Unit[]) => {
    window.dispatchEvent(new CustomEvent('unitsUpdated', { detail: newUnits }));
  };

  const handleAddUnit = async () => {
    if (!newUnit.value || !newUnit.label) {
      toast("Erro", {
        description: "Preencha todos os campos",
        style: {
          backgroundColor: 'rgb(239, 68, 68)',
          color: 'white'
        }
      });
      return;
    }

    // Verificar se a unidade já existe
    if (units.some(unit => unit.value.toLowerCase() === newUnit.value.toLowerCase())) {
      toast("Erro", {
        description: "Esta unidade já existe",
        style: {
          backgroundColor: 'rgb(239, 68, 68)',
          color: 'white'
        }
      });
      return;
    }

    try {
      setIsSubmitting(true);
      await productUnitsService.add(newUnit);
      
      // Recarregar unidades
      await loadUnits();
      notifyUnitsUpdated(units);
      
      setNewUnit({ value: '', label: '', packageQuantity: 1 });
      setIsOpen(false);
      
      toast("Unidade adicionada", {
        description: "A nova unidade foi adicionada com sucesso"
      });
    } catch (error) {
      console.error('Erro ao adicionar unidade:', error);
      toast("Erro", {
        description: "Erro ao adicionar unidade",
        style: {
          backgroundColor: 'rgb(239, 68, 68)',
          color: 'white'
        }
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditUnit = (unit: Unit) => {
    setEditingUnit(unit);
    setIsEditDialogOpen(true);
  };

  const handleSaveEditedUnit = async (updatedUnit: Unit) => {
    if (!editingUnit) return;

    // Verificar se o código da unidade já existe (exceto a própria unidade sendo editada)
    const existingUnit = units.find(u => u.value.toLowerCase() === updatedUnit.value.toLowerCase() && u.value !== editingUnit.value);
    if (existingUnit) {
      toast("Erro", {
        description: "Já existe uma unidade com este código",
        style: {
          backgroundColor: 'rgb(239, 68, 68)',
          color: 'white'
        }
      });
      return;
    }

    try {
      setIsSubmitting(true);
      await productUnitsService.update(editingUnit.value, updatedUnit);
      
      // Recarregar unidades
      await loadUnits();
      notifyUnitsUpdated(units);
      
      setEditingUnit(null);
      
      toast("Unidade atualizada", {
        description: "A unidade foi atualizada com sucesso"
      });
    } catch (error) {
      console.error('Erro ao atualizar unidade:', error);
      toast("Erro", {
        description: "Erro ao atualizar unidade",
        style: {
          backgroundColor: 'rgb(239, 68, 68)',
          color: 'white'
        }
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteClick = (unit: Unit) => {
    setUnitToDelete(unit);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!unitToDelete) return;

    try {
      setIsSubmitting(true);
      await productUnitsService.remove(unitToDelete.value);
      
      // Recarregar unidades
      await loadUnits();
      notifyUnitsUpdated(units);
      
      toast("Unidade removida", {
        description: "A unidade foi removida com sucesso"
      });
    } catch (error) {
      console.error('Erro ao remover unidade:', error);
      toast("Erro", {
        description: "Erro ao remover unidade",
        style: {
          backgroundColor: 'rgb(239, 68, 68)',
          color: 'white'
        }
      });
    } finally {
      setIsSubmitting(false);
      setDeleteDialogOpen(false);
      setUnitToDelete(null);
    }
  };

  const handleResetToDefault = async () => {
    try {
      setIsSubmitting(true);
      await productUnitsService.resetToDefault();
      
      // Recarregar unidades
      await loadUnits();
      notifyUnitsUpdated(units);
      
      toast("Unidades restauradas", {
        description: "As unidades foram restauradas para o padrão"
      });
    } catch (error) {
      console.error('Erro ao restaurar unidades:', error);
      toast("Erro", {
        description: "Erro ao restaurar unidades padrão",
        style: {
          backgroundColor: 'rgb(239, 68, 68)',
          color: 'white'
        }
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span className="ml-2">Carregando unidades...</span>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Gerenciar Unidades de Medida</CardTitle>
        <CardDescription>
          Configure as unidades de medida e quantas unidades básicas cada embalagem contém. Exemplo: CX23 = caixa que contém 23 unidades. As configurações são salvas no banco de dados.
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
            <Button 
              variant="outline" 
              onClick={handleResetToDefault}
              disabled={isSubmitting}
            >
              {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Restaurar Padrão
            </Button>
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
                    Cadastre uma nova unidade de medida com a quantidade de unidades que cada embalagem contém
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="unitValue">Código da Unidade</Label>
                    <Input
                      id="unitValue"
                      placeholder="Ex: CX23, FARDO, DECA, etc."
                      value={newUnit.value}
                      onChange={(e) => setNewUnit(prev => ({ ...prev, value: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="unitLabel">Nome Completo</Label>
                    <Input
                      id="unitLabel"
                      placeholder="Ex: Caixa com 23 unidades"
                      value={newUnit.label}
                      onChange={(e) => setNewUnit(prev => ({ ...prev, label: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="packageQuantity">Quantidade na Embalagem</Label>
                    <Input
                      id="packageQuantity"
                      type="number"
                      placeholder="Ex: 23 (quantas unidades contém nesta embalagem)"
                      value={newUnit.packageQuantity}
                      onChange={(e) => setNewUnit(prev => ({ 
                        ...prev, 
                        packageQuantity: parseFloat(e.target.value) || 1 
                      }))}
                      min="0.001"
                      step="0.001"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsOpen(false)}>
                    Cancelar
                  </Button>
                  <Button onClick={handleAddUnit} disabled={isSubmitting}>
                    {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
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
              <TableHead>Nome Completo</TableHead>
              <TableHead>Quantidade na Embalagem</TableHead>
              <TableHead className="w-[140px]">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {units.map((unit) => (
              <TableRow key={unit.value}>
                <TableCell className="font-medium">{unit.value}</TableCell>
                <TableCell>{unit.label}</TableCell>
                <TableCell>
                  <span className="text-sm">
                    {unit.packageQuantity === 1 ? '1 unidade' : `${unit.packageQuantity} unidades`}
                  </span>
                </TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEditUnit(unit)}
                      className="text-blue-600 hover:text-blue-700"
                      title="Editar unidade"
                      disabled={isSubmitting}
                    >
                      <Edit size={16} />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteClick(unit)}
                      className="text-red-600 hover:text-red-700"
                      title="Excluir unidade"
                      disabled={isSubmitting}
                    >
                      <Trash2 size={16} />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        <EditUnitDialog
          unit={editingUnit}
          isOpen={isEditDialogOpen}
          onClose={() => {
            setIsEditDialogOpen(false);
            setEditingUnit(null);
          }}
          onSave={handleSaveEditedUnit}
          baseUnits={[]}
        />

        <DeleteDialog
          open={deleteDialogOpen}
          onOpenChange={setDeleteDialogOpen}
          onConfirm={handleConfirmDelete}
          title="Excluir Unidade"
          description={`Tem certeza que deseja excluir a unidade "${unitToDelete?.label}"? Esta ação não pode ser desfeita.`}
          actionLabel="Excluir"
          cancelLabel="Cancelar"
        />
      </CardContent>
    </Card>
  );
}
