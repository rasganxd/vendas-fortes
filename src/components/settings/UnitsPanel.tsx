import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Trash2, Plus, Link } from 'lucide-react';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Unit } from '@/types/unit';

const DEFAULT_UNITS: Unit[] = [
  { value: 'UN', label: 'Unidade (UN)', isBaseUnit: true },
  { value: 'KG', label: 'Quilograma (KG)', isBaseUnit: true },
  { value: 'L', label: 'Litro (L)', isBaseUnit: true },
  { value: 'ML', label: 'Mililitro (ML)', baseUnit: 'L', conversionRate: 0.001 },
  { value: 'CX', label: 'Caixa (CX)', baseUnit: 'UN', conversionRate: 24 },
  { value: 'PCT', label: 'Pacote (PCT)', baseUnit: 'UN', conversionRate: 12 },
  { value: 'PAR', label: 'Par (PAR)', baseUnit: 'UN', conversionRate: 2 },
  { value: 'DUZIA', label: 'Dúzia (DZ)', baseUnit: 'UN', conversionRate: 12 },
  { value: 'ROLO', label: 'Rolo (RL)', isBaseUnit: true },
  { value: 'METRO', label: 'Metro (M)', isBaseUnit: true }
];

const STORAGE_KEY = 'product_units';

export default function UnitsPanel() {
  const [units, setUnits] = useState<Unit[]>(DEFAULT_UNITS);
  const [isOpen, setIsOpen] = useState(false);
  const [newUnit, setNewUnit] = useState({ 
    value: '', 
    label: '', 
    conversionRate: 1, 
    baseUnit: '',
    isBaseUnit: false 
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

    if (!newUnit.isBaseUnit && !newUnit.baseUnit) {
      toast("Erro", {
        description: "Selecione uma unidade base ou marque como unidade base",
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
      isBaseUnit: newUnit.isBaseUnit,
      ...(newUnit.isBaseUnit ? {} : {
        baseUnit: newUnit.baseUnit,
        conversionRate: newUnit.conversionRate
      })
    };
    
    const updatedUnits = [...units, unitToAdd];
    saveUnits(updatedUnits);
    setNewUnit({ value: '', label: '', conversionRate: 1, baseUnit: '', isBaseUnit: false });
    setIsOpen(false);
    
    toast("Unidade adicionada", {
      description: "A nova unidade foi adicionada com sucesso"
    });
  };

  const handleDeleteUnit = (valueToDelete: string) => {
    // Não permitir deletar unidades padrão
    const isDefaultUnit = DEFAULT_UNITS.some(unit => unit.value === valueToDelete);
    if (isDefaultUnit) {
      toast("Erro", {
        description: "Não é possível excluir unidades padrão do sistema",
        style: {
          backgroundColor: 'rgb(239, 68, 68)',
          color: 'white'
        }
      });
      return;
    }

    // Verificar se alguma unidade depende desta como base
    const dependentUnits = units.filter(unit => unit.baseUnit === valueToDelete);
    if (dependentUnits.length > 0) {
      toast("Erro", {
        description: `Não é possível excluir esta unidade pois ${dependentUnits.length} unidade(s) dependem dela`,
        style: {
          backgroundColor: 'rgb(239, 68, 68)',
          color: 'white'
        }
      });
      return;
    }

    const updatedUnits = units.filter(unit => unit.value !== valueToDelete);
    saveUnits(updatedUnits);
    
    toast("Unidade removida", {
      description: "A unidade foi removida com sucesso"
    });
  };

  const handleResetToDefault = () => {
    saveUnits(DEFAULT_UNITS);
    toast("Unidades restauradas", {
      description: "As unidades foram restauradas para o padrão"
    });
  };

  const baseUnits = units.filter(unit => unit.isBaseUnit || !unit.baseUnit);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Gerenciar Unidades de Medida</CardTitle>
        <CardDescription>
          Configure as unidades de medida e suas conversões. Defina unidades base e suas subdivisões/múltiplos.
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
                    Cadastre uma nova unidade de medida com suas conversões
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
                  
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="isBaseUnit"
                      checked={newUnit.isBaseUnit}
                      onChange={(e) => setNewUnit(prev => ({ 
                        ...prev, 
                        isBaseUnit: e.target.checked,
                        baseUnit: e.target.checked ? '' : prev.baseUnit
                      }))}
                    />
                    <Label htmlFor="isBaseUnit">Esta é uma unidade base</Label>
                  </div>
                  
                  {!newUnit.isBaseUnit && (
                    <>
                      <div className="space-y-2">
                        <Label>Unidade Base</Label>
                        <Select 
                          value={newUnit.baseUnit} 
                          onValueChange={(value) => setNewUnit(prev => ({ ...prev, baseUnit: value }))}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione a unidade base" />
                          </SelectTrigger>
                          <SelectContent>
                            {baseUnits.map(unit => (
                              <SelectItem key={unit.value} value={unit.value}>{unit.label}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="conversionRate">Taxa de Conversão</Label>
                        <Input
                          id="conversionRate"
                          type="number"
                          placeholder="Ex: 24 (1 desta unidade = 24 da base)"
                          value={newUnit.conversionRate}
                          onChange={(e) => setNewUnit(prev => ({ 
                            ...prev, 
                            conversionRate: parseFloat(e.target.value) || 1 
                          }))}
                          min="0.001"
                          step="0.001"
                        />
                      </div>
                    </>
                  )}
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
              <TableHead>Tipo</TableHead>
              <TableHead>Conversão</TableHead>
              <TableHead className="w-[100px]">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {units.map((unit) => {
              const isDefault = DEFAULT_UNITS.some(defaultUnit => defaultUnit.value === unit.value);
              const dependentCount = units.filter(u => u.baseUnit === unit.value).length;
              
              return (
                <TableRow key={unit.value}>
                  <TableCell className="font-medium">{unit.value}</TableCell>
                  <TableCell>{unit.label}</TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      unit.isBaseUnit || !unit.baseUnit
                        ? 'bg-blue-100 text-blue-700' 
                        : 'bg-gray-100 text-gray-700'
                    }`}>
                      {unit.isBaseUnit || !unit.baseUnit ? 'Base' : 'Conversão'}
                    </span>
                  </TableCell>
                  <TableCell>
                    {unit.baseUnit && unit.conversionRate ? (
                      <span className="flex items-center text-sm">
                        <Link size={12} className="mr-1" />
                        1 = {unit.conversionRate} {unit.baseUnit}
                      </span>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {!isDefault && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteUnit(unit.value)}
                        className="text-red-600 hover:text-red-700"
                        disabled={dependentCount > 0}
                        title={dependentCount > 0 ? `${dependentCount} unidade(s) dependem desta` : ''}
                      >
                        <Trash2 size={16} />
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
