
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Trash2, Plus } from 'lucide-react';
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

interface Unit {
  value: string;
  label: string;
}

const DEFAULT_UNITS: Unit[] = [
  { value: 'UN', label: 'Unidade (UN)' },
  { value: 'KG', label: 'Quilograma (KG)' },
  { value: 'L', label: 'Litro (L)' },
  { value: 'ML', label: 'Mililitro (ML)' },
  { value: 'CX', label: 'Caixa (CX)' },
  { value: 'PCT', label: 'Pacote (PCT)' },
  { value: 'PAR', label: 'Par (PAR)' },
  { value: 'DUZIA', label: 'Dúzia (DZ)' },
  { value: 'ROLO', label: 'Rolo (RL)' },
  { value: 'METRO', label: 'Metro (M)' }
];

const STORAGE_KEY = 'product_units';

export default function UnitsPanel() {
  const [units, setUnits] = useState<Unit[]>(DEFAULT_UNITS);
  const [isOpen, setIsOpen] = useState(false);
  const [newUnit, setNewUnit] = useState({ value: '', label: '' });

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

    const updatedUnits = [...units, { 
      value: newUnit.value.toUpperCase(), 
      label: newUnit.label 
    }];
    
    saveUnits(updatedUnits);
    setNewUnit({ value: '', label: '' });
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

  return (
    <Card>
      <CardHeader>
        <CardTitle>Gerenciar Unidades de Medida</CardTitle>
        <CardDescription>
          Configure as unidades de medida disponíveis para seus produtos. 
          Você pode adicionar unidades personalizadas além das unidades padrão do sistema.
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
                    Cadastre uma nova unidade de medida personalizada
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
              <TableHead className="w-[100px]">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {units.map((unit) => {
              const isDefault = DEFAULT_UNITS.some(defaultUnit => defaultUnit.value === unit.value);
              return (
                <TableRow key={unit.value}>
                  <TableCell className="font-medium">{unit.value}</TableCell>
                  <TableCell>{unit.label}</TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      isDefault 
                        ? 'bg-gray-100 text-gray-700' 
                        : 'bg-blue-100 text-blue-700'
                    }`}>
                      {isDefault ? 'Padrão' : 'Personalizada'}
                    </span>
                  </TableCell>
                  <TableCell>
                    {!isDefault && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteUnit(unit.value)}
                        className="text-red-600 hover:text-red-700"
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
