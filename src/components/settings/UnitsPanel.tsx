import React, { useState, useEffect } from 'react';
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
import { Unit } from '@/types/unit';
import EditUnitDialog from './EditUnitDialog';
import { DeleteDialog } from '@/components/ui/DeleteDialog';

const DEFAULT_UNITS: Unit[] = [
  { value: 'UN', label: 'Unidade (UN)', conversionRate: 1 },
  { value: 'KG', label: 'Quilograma (KG)', conversionRate: 1 },
  { value: 'L', label: 'Litro (L)', conversionRate: 1 },
  { value: 'ML', label: 'Mililitro (ML)', conversionRate: 0.001 },
  { value: 'CX', label: 'Caixa (CX)', conversionRate: 24 },
  { value: 'PCT', label: 'Pacote (PCT)', conversionRate: 12 },
  { value: 'PAR', label: 'Par (PAR)', conversionRate: 2 },
  { value: 'DUZIA', label: 'Dúzia (DZ)', conversionRate: 12 },
  { value: 'ROLO', label: 'Rolo (RL)', conversionRate: 1 },
  { value: 'METRO', label: 'Metro (M)', conversionRate: 1 }
];

const STORAGE_KEY = 'product_units';

export default function UnitsPanel() {
  const [units, setUnits] = useState<Unit[]>(DEFAULT_UNITS);
  const [isOpen, setIsOpen] = useState(false);
  const [editingUnit, setEditingUnit] = useState<Unit | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [unitToDelete, setUnitToDelete] = useState<Unit | null>(null);
  const [newUnit, setNewUnit] = useState({ 
    value: '', 
    label: '', 
    conversionRate: 1
  });

  // Carregar unidades do localStorage
  useEffect(() => {
    const savedUnits = localStorage.getItem(STORAGE_KEY);
    if (savedUnits) {
      try {
        const parsedUnits = JSON.parse(savedUnits);
        setUnits(parsedUnits);
      } catch (error) {
        console.error('Erro ao carregar unidades:', error);
      }
    }
  }, []);

  // Salvar unidades no localStorage
  const saveUnits = (newUnits: Unit[]) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newUnits));
    setUnits(newUnits);
    
    // Disparar evento para atualizar outros componentes
    window.dispatchEvent(new CustomEvent('unitsUpdated', { detail: newUnits }));
  };

  const handleAddUnit = () => {
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

    const unitToAdd: Unit = {
      value: newUnit.value.toUpperCase(),
      label: newUnit.label,
      conversionRate: newUnit.conversionRate
    };
    
    const updatedUnits = [...units, unitToAdd];
    saveUnits(updatedUnits);
    setNewUnit({ value: '', label: '', conversionRate: 1 });
    setIsOpen(false);
    
    toast("Unidade adicionada", {
      description: "A nova unidade foi adicionada com sucesso"
    });
  };

  const handleEditUnit = (unit: Unit) => {
    setEditingUnit(unit);
    setIsEditDialogOpen(true);
  };

  const handleSaveEditedUnit = (updatedUnit: Unit) => {
    // Verificar se o código da unidade já existe (exceto a própria unidade sendo editada)
    const existingUnit = units.find(u => u.value.toLowerCase() === updatedUnit.value.toLowerCase() && u.value !== editingUnit?.value);
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

    const updatedUnits = units.map(unit => 
      unit.value === editingUnit?.value ? updatedUnit : unit
    );
    saveUnits(updatedUnits);
    setEditingUnit(null);
  };

  const handleDeleteClick = (unit: Unit) => {
    setUnitToDelete(unit);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    if (!unitToDelete) return;

    // Remover a proteção contra exclusão de unidades padrão - agora permite excluir qualquer uma
    const updatedUnits = units.filter(unit => unit.value !== unitToDelete.value);
    saveUnits(updatedUnits);
    
    toast("Unidade removida", {
      description: "A unidade foi removida com sucesso"
    });

    setDeleteDialogOpen(false);
    setUnitToDelete(null);
  };

  const handleResetToDefault = () => {
    saveUnits(DEFAULT_UNITS);
    toast("Unidades restauradas", {
      description: "As unidades foram restauradas para o padrão"
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Gerenciar Unidades de Medida</CardTitle>
        <CardDescription>
          Configure as unidades de medida e suas taxas de conversão. A taxa de conversão indica quantas unidades básicas correspondem a 1 desta unidade. Agora você pode excluir qualquer unidade.
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
            <Button variant="outline" onClick={handleResetToDefault}>
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
                    Cadastre uma nova unidade de medida com sua taxa de conversão
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="unitValue">Código da Unidade</Label>
                    <Input
                      id="unitValue"
                      placeholder="Ex: FARDO, DECA, etc."
                      value={newUnit.value}
                      onChange={(e) => setNewUnit(prev => ({ ...prev, value: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="unitLabel">Nome Completo</Label>
                    <Input
                      id="unitLabel"
                      placeholder="Ex: Fardo (FARDO), Dezena (DECA)"
                      value={newUnit.label}
                      onChange={(e) => setNewUnit(prev => ({ ...prev, label: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="conversionRate">Taxa de Conversão</Label>
                    <Input
                      id="conversionRate"
                      type="number"
                      placeholder="Ex: 24 (1 desta unidade = 24 unidades básicas)"
                      value={newUnit.conversionRate}
                      onChange={(e) => setNewUnit(prev => ({ 
                        ...prev, 
                        conversionRate: parseFloat(e.target.value) || 1 
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
              <TableHead>Nome Completo</TableHead>
              <TableHead>Taxa de Conversão</TableHead>
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
                    1 = {unit.conversionRate} {unit.conversionRate === 1 ? 'unidade básica' : 'unidades básicas'}
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
