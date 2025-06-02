
import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { SalesRep } from '@/types';
import { DialogFooter } from '../ui/dialog';
import { Switch } from '../ui/switch';
import { Eye, EyeOff } from 'lucide-react';

interface EditSalesRepDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  salesRep: Partial<SalesRep> | null;
  onSave?: (salesRep: Omit<SalesRep, 'id'>) => Promise<string>;
  onRefresh?: () => void;
}

export const EditSalesRepDialog: React.FC<EditSalesRepDialogProps> = ({
  open,
  onOpenChange,
  salesRep,
  onSave,
  onRefresh
}) => {
  const [formData, setFormData] = React.useState<Partial<SalesRep & { confirmPassword?: string }>>({
    code: 0,
    name: '',
    phone: '',
    email: '',
    password: '',
    confirmPassword: '',
    active: true
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordError, setPasswordError] = useState('');

  React.useEffect(() => {
    if (salesRep) {
      setFormData({
        ...salesRep,
        password: '',
        confirmPassword: ''
      });
    }
    setPasswordError('');
  }, [salesRep]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Limpar erro de senha ao digitar
    if (name === 'password' || name === 'confirmPassword') {
      setPasswordError('');
    }
  };

  const handleSwitchChange = (checked: boolean) => {
    setFormData(prev => ({ ...prev, active: checked }));
  };

  const validatePassword = () => {
    // Se é um vendedor novo, senha é obrigatória
    if (!salesRep?.id && (!formData.password || formData.password.length < 6)) {
      setPasswordError('Senha deve ter pelo menos 6 caracteres');
      return false;
    }

    // Se está alterando senha, deve ter pelo menos 6 caracteres
    if (formData.password && formData.password.length < 6) {
      setPasswordError('Senha deve ter pelo menos 6 caracteres');
      return false;
    }

    // Se digitou senha, confirmação deve ser igual
    if (formData.password && formData.password !== formData.confirmPassword) {
      setPasswordError('Senhas não coincidem');
      return false;
    }

    return true;
  };

  const handleSave = async () => {
    if (!formData.name || !formData.email) return;
    
    if (!validatePassword()) return;
    
    try {
      if (onSave) {
        const dataToSave = {
          code: formData.code || 0,
          name: formData.name,
          phone: formData.phone || '',
          email: formData.email,
          active: formData.active ?? true,
          createdAt: new Date(),
          updatedAt: new Date(),
          // Incluir senha apenas se foi fornecida
          ...(formData.password && { password: formData.password })
        };
        
        await onSave(dataToSave);
      }
      
      if (onRefresh) {
        onRefresh();
      }
      
      onOpenChange(false);
    } catch (error) {
      console.error('Error saving sales rep:', error);
    }
  };

  const isNewSalesRep = !salesRep?.id;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {salesRep?.id ? 'Editar Vendedor' : 'Novo Vendedor'}
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 gap-4 py-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="code">Código</Label>
            <Input
              id="code"
              name="code"
              value={formData.code || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, code: parseInt(e.target.value) || 0 }))}
              type="number"
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="name">Nome *</Label>
            <Input
              id="name"
              name="name"
              value={formData.name || ''}
              onChange={handleChange}
              placeholder="Nome completo do vendedor"
              required
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="email">Email *</Label>
            <Input
              id="email"
              name="email"
              type="email"
              value={formData.email || ''}
              onChange={handleChange}
              placeholder="vendedor@empresa.com"
              required
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="phone">Telefone</Label>
            <Input
              id="phone"
              name="phone"
              value={formData.phone || ''}
              onChange={handleChange}
              placeholder="(11) 99999-9999"
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="password">
              Senha {isNewSalesRep ? '*' : '(deixe vazio para manter atual)'}
            </Label>
            <div className="relative">
              <Input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                value={formData.password || ''}
                onChange={handleChange}
                placeholder={isNewSalesRep ? "Digite a senha" : "Nova senha (opcional)"}
                required={isNewSalesRep}
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>

          {formData.password && (
            <div className="flex flex-col gap-2">
              <Label htmlFor="confirmPassword">Confirmar Senha *</Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  value={formData.confirmPassword || ''}
                  onChange={handleChange}
                  placeholder="Confirme a senha"
                  required
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
          )}

          {passwordError && (
            <div className="text-sm text-red-600">
              {passwordError}
            </div>
          )}

          <div className="flex items-center space-x-2">
            <Switch 
              checked={formData.active ?? true} 
              onCheckedChange={handleSwitchChange} 
              id="active"
            />
            <Label htmlFor="active">Ativo</Label>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button 
            onClick={handleSave} 
            disabled={!formData.name || !formData.email || (isNewSalesRep && !formData.password)}
          >
            Salvar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EditSalesRepDialog;
