
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Unit } from '@/types/unit';

interface UnitDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  unit?: Unit | null;
  onSave: (unit: Omit<Unit, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
}

export default function UnitDialog({ open, onOpenChange, unit, onSave }: UnitDialogProps) {
  const [formData, setFormData] = useState({
    code: '',
    description: '',
    packaging: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (unit) {
      setFormData({
        code: unit.code,
        description: unit.description,
        packaging: unit.packaging || ''
      });
    } else {
      setFormData({
        code: '',
        description: '',
        packaging: ''
      });
    }
  }, [unit, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.code.trim() || !formData.description.trim()) {
      return;
    }

    try {
      setIsSubmitting(true);
      await onSave({
        code: formData.code.trim(),
        description: formData.description.trim(),
        packaging: formData.packaging.trim() || undefined
      });
      onOpenChange(false);
    } catch (error) {
      // Error handling is done in the hook
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {unit ? 'Editar Unidade' : 'Nova Unidade'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="code">Código*</Label>
            <Input
              id="code"
              value={formData.code}
              onChange={(e) => setFormData(prev => ({ ...prev, code: e.target.value }))}
              placeholder="Ex: UN, CX, KG"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descrição*</Label>
            <Input
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Ex: Unidade, Caixa, Quilograma"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="packaging">Embalagem</Label>
            <Input
              id="packaging"
              value={formData.packaging}
              onChange={(e) => setFormData(prev => ({ ...prev, packaging: e.target.value }))}
              placeholder="Ex: Unitário, Caixa, Saco"
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Salvando...' : 'Salvar'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
