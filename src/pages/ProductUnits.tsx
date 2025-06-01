import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Plus, Trash2, Edit } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import PageLayout from '@/components/layout/PageLayout';
import { useProductUnits } from '@/components/products/hooks/useProductUnits';
import { Unit } from '@/types/unit';
import { toast } from 'sonner';

export default function ProductUnits() {
  console.log("=== ProductUnits component rendering ===");
  const navigate = useNavigate();
  const {
    units,
    isLoading,
    addUnit,
    updateUnit,
    deleteUnit,
    resetToDefault
  } = useProductUnits();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingUnit, setEditingUnit] = useState<Unit | null>(null);
  const [formData, setFormData] = useState({
    value: '',
    label: '',
    packageQuantity: 1
  });

  console.log("ProductUnits - dados das unidades:", {
    unitsCount: units?.length || 0,
    isLoading,
    units
  });

  // Calculate dynamic height based on number of units
  const getTableContainerHeight = () => {
    const unitCount = units?.length || 0;
    if (unitCount === 0) return 'min-h-[200px] max-h-[300px]';
    if (unitCount <= 3) return 'min-h-[250px] max-h-[350px]';
    if (unitCount <= 8) return 'min-h-[400px] max-h-[500px]';
    return 'min-h-[500px] max-h-[60vh]';
  };

  const handleOpenDialog = (unit?: Unit) => {
    console.log("Abrindo dialog para unidade:", unit);
    if (unit) {
      setEditingUnit(unit);
      setFormData({
        value: unit.value,
        label: unit.label || unit.value,
        packageQuantity: unit.packageQuantity || 1
      });
    } else {
      setEditingUnit(null);
      setFormData({
        value: '',
        label: '',
        packageQuantity: 1
      });
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
        packageQuantity: Number(formData.packageQuantity) || 1
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
      setFormData({
        value: '',
        label: '',
        packageQuantity: 1
      });
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
        <Button variant="outline" size="sm" onClick={() => navigate('/produtos')}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Voltar para Produtos
        </Button>
      </div>
      
      <Card className="h-full">
        <CardHeader>
          <CardTitle>Unidades de Medida</CardTitle>
        </CardHeader>
        <CardContent className="h-full">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-2">
            <div className="flex flex-col sm:flex-row gap-2">
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
            <div className="flex items-center justify-center py-8">
              <p>Carregando unidades...</p>
            </div>
          ) : (
            <div className={`border rounded-lg ${getTableContainerHeight()}`}>
              <ScrollArea className="h-full">
                <div className="min-w-[600px]">
                  <Table>
                    <TableHeader className="sticky top-0 bg-white z-10">
                      <TableRow>
                        <TableHead className="w-[120px] min-w-[120px]">Valor</TableHead>
                        <TableHead className="w-[200px] min-w-[200px]">Nome/Descrição</TableHead>
                        <TableHead className="w-[180px] min-w-[180px]">Quantidade na Embalagem</TableHead>
                        <TableHead className="w-[100px] min-w-[100px] text-center">Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {units && units.length > 0 ? (
                        units.map(unit => (
                          <TableRow key={unit.value}>
                            <TableCell className="font-medium">
                              <div className="break-words">{unit.value}</div>
                            </TableCell>
                            <TableCell>
                              <div className="break-words">{unit.label || unit.value}</div>
                            </TableCell>
                            <TableCell>
                              <div className="text-sm">
                                {unit.packageQuantity === 1 ? '1 unidade' : `${unit.packageQuantity} unidades`}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex justify-center gap-1">
                                <Button 
                                  variant="outline" 
                                  size="sm" 
                                  onClick={() => handleOpenDialog(unit)} 
                                  className="h-8 w-8 p-0"
                                >
                                  <Edit className="h-3 w-3" />
                                </Button>
                                <Button 
                                  variant="outline" 
                                  size="sm" 
                                  onClick={() => handleDelete(unit)} 
                                  className="h-8 w-8 p-0"
                                >
                                  <Trash2 className="h-3 w-3" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={4} className="text-center py-8">
                            Nenhuma unidade encontrada
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </ScrollArea>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialog para adicionar/editar unidade */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>
              {editingUnit ? 'Editar Unidade' : 'Nova Unidade'}
            </DialogTitle>
            <DialogDescription>
              {editingUnit ? 'Edite as informações da unidade de medida' : 'Adicione uma nova unidade de medida para os produtos'}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="value">Valor da Unidade</Label>
              <Input 
                id="value" 
                value={formData.value} 
                onChange={e => setFormData(prev => ({
                  ...prev,
                  value: e.target.value
                }))} 
                placeholder="Ex: CX23, FARDO, UN, KG" 
                disabled={!!editingUnit} 
              />
            </div>
            
            <div>
              <Label htmlFor="label">Nome/Descrição</Label>
              <Input 
                id="label" 
                value={formData.label} 
                onChange={e => setFormData(prev => ({
                  ...prev,
                  label: e.target.value
                }))} 
                placeholder="Ex: Caixa com 23 unidades, Fardo, Unidade" 
              />
            </div>
            
            <div>
              <Label htmlFor="packageQuantity">Quantidade na Embalagem</Label>
              <Input 
                id="packageQuantity" 
                type="number" 
                step="0.001" 
                value={formData.packageQuantity} 
                onChange={e => setFormData(prev => ({
                  ...prev,
                  packageQuantity: Number(e.target.value)
                }))} 
                placeholder="Quantas unidades contém nesta embalagem" 
              />
              <p className="text-xs text-gray-500 mt-1">
                Exemplo: Para CX23, coloque 23 (cada caixa contém 23 unidades)
              </p>
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
