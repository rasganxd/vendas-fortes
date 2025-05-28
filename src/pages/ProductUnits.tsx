
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Plus, Trash2, Edit } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import PageLayout from '@/components/layout/PageLayout';
import { useProductUnits } from '@/components/products/hooks/useProductUnits';
import { Unit } from '@/types/unit';
import { toast } from 'sonner';

export default function ProductUnits() {
  console.log("=== ProductUnits component rendering ===");
  
  const navigate = useNavigate();
  const { units, isLoading, addUnit, updateUnit, deleteUnit, resetToDefault } = useProductUnits();
  
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingUnit, setEditingUnit] = useState<Unit | null>(null);
  const [formData, setFormData] = useState({ value: '', label: '', conversionRate: 1 });

  console.log("ProductUnits - dados das unidades:", {
    unitsCount: units?.length || 0,
    isLoading,
    units
  });

  const handleOpenDialog = (unit?: Unit) => {
    console.log("Abrindo dialog para unidade:", unit);
    if (unit) {
      setEditingUnit(unit);
      setFormData({
        value: unit.value,
        label: unit.label || unit.value,
        conversionRate: unit.conversionRate || 1
      });
    } else {
      setEditingUnit(null);
      setFormData({ value: '', label: '', conversionRate: 1 });
    }
    setDialogOpen(true);
  };

  const handleSave = async () => {
    try {
      console.log("Salvando unidade:", formData);
      
      if (!formData.value.trim()) {
        toast("Erro", {
          description: "O valor da unidade é obrigatório"
        });
        return;
      }

      const unitData = {
        value: formData.value.toUpperCase().trim(),
        label: formData.label.trim() || formData.value.toUpperCase().trim(),
        conversionRate: Number(formData.conversionRate) || 1
      };

      if (editingUnit) {
        await updateUnit(editingUnit.value, unitData);
        toast("Unidade atualizada com sucesso");
      } else {
        await addUnit(unitData);
        toast("Unidade adicionada com sucesso");
      }
      
      setDialogOpen(false);
      setEditingUnit(null);
      setFormData({ value: '', label: '', conversionRate: 1 });
    } catch (error) {
      console.error("Erro ao salvar unidade:", error);
      toast("Erro ao salvar unidade", {
        description: "Houve um problema ao salvar a unidade."
      });
    }
  };

  const handleDelete = async (unit: Unit) => {
    try {
      console.log("Deletando unidade:", unit);
      await deleteUnit(unit.value);
      toast("Unidade excluída com sucesso");
    } catch (error) {
      console.error("Erro ao deletar unidade:", error);
      toast("Erro ao excluir unidade", {
        description: "Houve um problema ao excluir a unidade."
      });
    }
  };

  const handleResetToDefault = async () => {
    try {
      console.log("Resetando unidades para padrão");
      await resetToDefault();
      toast("Unidades resetadas para o padrão");
    } catch (error) {
      console.error("Erro ao resetar unidades:", error);
      toast("Erro ao resetar unidades", {
        description: "Houve um problema ao resetar as unidades."
      });
    }
  };

  console.log("ProductUnits - renderizando interface...");

  return (
    <PageLayout title="Unidades de Produtos">
      <div className="mb-4 flex justify-between">
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => navigate('/produtos')}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Voltar para Produtos
        </Button>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Unidades de Medida</CardTitle>
          <CardDescription>
            Gerencie as unidades de medida disponíveis para os produtos
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex justify-between items-center mb-4">
            <div className="flex gap-2">
              <Button onClick={() => handleOpenDialog()}>
                <Plus className="mr-2 h-4 w-4" />
                Nova Unidade
              </Button>
              <Button variant="outline" onClick={handleResetToDefault}>
                Resetar para Padrão
              </Button>
            </div>
            <p className="text-sm text-gray-600">
              {units?.length || 0} unidades cadastradas
            </p>
          </div>

          {isLoading ? (
            <p>Carregando unidades...</p>
          ) : (
            <div>
              <p className="text-sm text-gray-600 mb-2">
                DEBUG: {units?.length || 0} unidades carregadas
              </p>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Valor</TableHead>
                    <TableHead>Nome/Descrição</TableHead>
                    <TableHead>Taxa de Conversão</TableHead>
                    <TableHead className="w-24">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {units && units.length > 0 ? (
                    units.map((unit) => (
                      <TableRow key={unit.value}>
                        <TableCell className="font-medium">{unit.value}</TableCell>
                        <TableCell>{unit.label || unit.value}</TableCell>
                        <TableCell>{unit.conversionRate || 1}</TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleOpenDialog(unit)}
                            >
                              <Edit className="h-3 w-3" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDelete(unit)}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center">
                        Nenhuma unidade encontrada
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialog para adicionar/editar unidade */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingUnit ? 'Editar Unidade' : 'Nova Unidade'}
            </DialogTitle>
            <DialogDescription>
              {editingUnit 
                ? 'Edite as informações da unidade de medida' 
                : 'Adicione uma nova unidade de medida para os produtos'
              }
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="value">Valor da Unidade</Label>
              <Input
                id="value"
                value={formData.value}
                onChange={(e) => setFormData(prev => ({ ...prev, value: e.target.value }))}
                placeholder="Ex: KG, LT, UN, CX"
                disabled={!!editingUnit}
              />
            </div>
            
            <div>
              <Label htmlFor="label">Nome/Descrição</Label>
              <Input
                id="label"
                value={formData.label}
                onChange={(e) => setFormData(prev => ({ ...prev, label: e.target.value }))}
                placeholder="Ex: Quilograma, Litro, Unidade, Caixa"
              />
            </div>
            
            <div>
              <Label htmlFor="conversionRate">Taxa de Conversão</Label>
              <Input
                id="conversionRate"
                type="number"
                step="0.001"
                value={formData.conversionRate}
                onChange={(e) => setFormData(prev => ({ ...prev, conversionRate: Number(e.target.value) }))}
                placeholder="1"
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSave}>
              {editingUnit ? 'Atualizar' : 'Adicionar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageLayout>
  );
}
