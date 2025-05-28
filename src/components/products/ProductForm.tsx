
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { useProducts } from '@/hooks/useProducts';
import { useAppContext } from '@/hooks/useAppContext';
import { Product } from '@/types';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useProductUnits } from './hooks/useProductUnits';

interface ProductFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  editingProduct?: Product | null;
}

export default function ProductForm({ 
  open, 
  onOpenChange, 
  onSuccess, 
  editingProduct 
}: ProductFormProps) {
  const { addProduct, updateProduct } = useProducts();
  const { refreshData } = useAppContext();
  const { units } = useProductUnits();
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    cost: '',
    price: '',
    unit: 'UN',
    subunit: '',
    subunitRatio: '1',
    hasSubunit: false,
    stock: '0',
    minStock: '0'
  });
  
  const [isLoading, setIsLoading] = useState(false);

  // Load data when editing
  useEffect(() => {
    if (editingProduct) {
      setFormData({
        name: editingProduct.name || '',
        description: editingProduct.description || '',
        cost: editingProduct.cost?.toString() || '',
        price: editingProduct.price?.toString() || '',
        unit: editingProduct.unit || 'UN',
        subunit: editingProduct.subunit || '',
        subunitRatio: editingProduct.subunitRatio?.toString() || '1',
        hasSubunit: editingProduct.hasSubunit || false,
        stock: editingProduct.stock?.toString() || '0',
        minStock: editingProduct.minStock?.toString() || '0'
      });
    } else {
      // Reset form for new product
      setFormData({
        name: '',
        description: '',
        cost: '',
        price: '',
        unit: 'UN',
        subunit: '',
        subunitRatio: '1',
        hasSubunit: false,
        stock: '0',
        minStock: '0'
      });
    }
  }, [editingProduct, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const productData = {
        name: formData.name,
        description: formData.description,
        cost: parseFloat(formData.cost) || 0,
        price: parseFloat(formData.price) || 0,
        unit: formData.unit,
        subunit: formData.hasSubunit ? formData.subunit : null,
        subunitRatio: formData.hasSubunit ? parseFloat(formData.subunitRatio) || 1 : null,
        hasSubunit: formData.hasSubunit,
        stock: parseFloat(formData.stock) || 0,
        minStock: parseFloat(formData.minStock) || 0,
        // Add missing required properties for creating new products
        code: editingProduct?.code || Date.now(), // Generate code if creating new product
        createdAt: editingProduct?.createdAt || new Date(),
        updatedAt: new Date()
      };

      if (editingProduct) {
        await updateProduct(editingProduct.id, productData);
        toast.success('Produto atualizado com sucesso!');
      } else {
        await addProduct(productData);
        toast.success('Produto criado com sucesso!');
      }

      refreshData();
      onSuccess();
      onOpenChange(false);
    } catch (error) {
      console.error('Error saving product:', error);
      toast.error('Erro ao salvar produto');
    } finally {
      setIsLoading(false);
    }
  };

  const availableUnits = units.map(unit => ({
    value: unit.value,
    label: unit.label
  }));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {editingProduct ? 'Editar Produto' : 'Novo Produto'}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 gap-4">
            <div>
              <Label htmlFor="name">Nome do Produto</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                required
              />
            </div>
            
            <div>
              <Label htmlFor="description">Descrição</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                rows={3}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="cost">Custo</Label>
                <Input
                  id="cost"
                  type="number"
                  step="0.01"
                  value={formData.cost}
                  onChange={(e) => setFormData(prev => ({ ...prev, cost: e.target.value }))}
                />
              </div>
              
              <div>
                <Label htmlFor="price">Preço de Venda</Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
                  required
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="unit">Unidade Principal</Label>
              <Select value={formData.unit} onValueChange={(value) => setFormData(prev => ({ ...prev, unit: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a unidade" />
                </SelectTrigger>
                <SelectContent>
                  {availableUnits.map(unit => (
                    <SelectItem key={unit.value} value={unit.value}>
                      {unit.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-center space-x-2">
              <Switch
                id="hasSubunit"
                checked={formData.hasSubunit}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, hasSubunit: checked }))}
              />
              <Label htmlFor="hasSubunit">Produto possui subunidade</Label>
            </div>
            
            {formData.hasSubunit && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="subunit">Subunidade</Label>
                  <Select value={formData.subunit} onValueChange={(value) => setFormData(prev => ({ ...prev, subunit: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione a subunidade" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableUnits.map(unit => (
                        <SelectItem key={unit.value} value={unit.value}>
                          {unit.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="subunitRatio">Quantidade por {formData.unit}</Label>
                  <Input
                    id="subunitRatio"
                    type="number"
                    step="0.01"
                    value={formData.subunitRatio}
                    onChange={(e) => setFormData(prev => ({ ...prev, subunitRatio: e.target.value }))}
                  />
                </div>
              </div>
            )}
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="stock">Estoque Atual</Label>
                <Input
                  id="stock"
                  type="number"
                  step="0.01"
                  value={formData.stock}
                  onChange={(e) => setFormData(prev => ({ ...prev, stock: e.target.value }))}
                />
              </div>
              
              <div>
                <Label htmlFor="minStock">Estoque Mínimo</Label>
                <Input
                  id="minStock"
                  type="number"
                  step="0.01"
                  value={formData.minStock}
                  onChange={(e) => setFormData(prev => ({ ...prev, minStock: e.target.value }))}
                />
              </div>
            </div>
          </div>
          
          <div className="flex justify-end space-x-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Salvando...
                </>
              ) : (
                editingProduct ? 'Atualizar' : 'Criar'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
