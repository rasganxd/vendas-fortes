
import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CustomerFormValues } from '@/types';
import { VisitSequenceManager } from './VisitSequenceManager';
import { SalesRep } from '@/types';

interface CustomerFormFieldsProps {
  form: UseFormReturn<CustomerFormValues>;
  isSubmitting: boolean;
  nextCustomerCode: number;
  salesReps?: SalesRep[];
}

const visitDayOptions = [
  { value: 'monday', label: 'Segunda-feira' },
  { value: 'tuesday', label: 'Terça-feira' },
  { value: 'wednesday', label: 'Quarta-feira' },
  { value: 'thursday', label: 'Quinta-feira' },
  { value: 'friday', label: 'Sexta-feira' },
  { value: 'saturday', label: 'Sábado' },
  { value: 'sunday', label: 'Domingo' }
];

const visitFrequencyOptions = [
  { value: 'weekly', label: 'Semanal' },
  { value: 'biweekly', label: 'Quinzenal' },
  { value: 'monthly', label: 'Mensal' },
  { value: 'quarterly', label: 'Trimestral' }
];

export const CustomerFormFields: React.FC<CustomerFormFieldsProps> = ({
  form,
  isSubmitting,
  nextCustomerCode,
  salesReps = []
}) => {
  const { register, formState: { errors }, watch, setValue } = form;
  
  const watchedVisitDays = watch('visitDays') || [];
  const watchedVisitSequence = watch('visitSequence');
  const watchedVisitSequences = watch('visitSequences');

  const handleVisitDayChange = (day: string, checked: boolean) => {
    const currentDays = watchedVisitDays;
    let newDays: string[];
    
    if (checked) {
      newDays = [...currentDays, day];
    } else {
      newDays = currentDays.filter(d => d !== day);
      
      // Remove the day from visitSequences if it exists
      if (watchedVisitSequences) {
        const newSequences = { ...watchedVisitSequences };
        delete newSequences[day];
        setValue('visitSequences', Object.keys(newSequences).length > 0 ? newSequences : undefined);
      }
    }
    
    setValue('visitDays', newDays);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* Basic Information */}
      <div className="space-y-4">
        <div>
          <Label htmlFor="code">Código</Label>
          <Input
            id="code"
            {...register('code', { 
              required: 'Código é obrigatório',
              valueAsNumber: true,
              min: { value: 1, message: 'Código deve ser maior que 0' }
            })}
            type="number"
            disabled={isSubmitting}
            placeholder={nextCustomerCode.toString()}
          />
          {errors.code && <p className="text-sm text-red-500">{errors.code.message}</p>}
        </div>

        <div>
          <Label htmlFor="name">Nome Fantasia *</Label>
          <Input
            id="name"
            {...register('name', { required: 'Nome fantasia é obrigatório' })}
            disabled={isSubmitting}
          />
          {errors.name && <p className="text-sm text-red-500">{errors.name.message}</p>}
        </div>

        <div>
          <Label htmlFor="companyName">Razão Social</Label>
          <Input
            id="companyName"
            {...register('companyName')}
            disabled={isSubmitting}
          />
        </div>

        <div>
          <Label htmlFor="document">CPF/CNPJ</Label>
          <Input
            id="document"
            {...register('document')}
            disabled={isSubmitting}
          />
        </div>

        <div>
          <Label htmlFor="phone">Telefone</Label>
          <Input
            id="phone"
            {...register('phone')}
            disabled={isSubmitting}
          />
        </div>

        <div>
          <Label htmlFor="salesRepId">Vendedor</Label>
          <Select
            value={watch('salesRepId') || ''}
            onValueChange={(value) => setValue('salesRepId', value)}
            disabled={isSubmitting}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecione o vendedor" />
            </SelectTrigger>
            <SelectContent className="bg-background border shadow-lg z-50">
              {salesReps.filter(rep => rep.active).map(rep => (
                <SelectItem key={rep.id} value={rep.id}>
                  {rep.code} - {rep.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Address Information */}
      <div className="space-y-4">
        <div>
          <Label htmlFor="address">Endereço</Label>
          <Input
            id="address"
            {...register('address')}
            disabled={isSubmitting}
          />
        </div>

        <div>
          <Label htmlFor="neighborhood">Bairro</Label>
          <Input
            id="neighborhood"
            {...register('neighborhood')}
            disabled={isSubmitting}
          />
        </div>

        <div>
          <Label htmlFor="city">Cidade</Label>
          <Input
            id="city"
            {...register('city')}
            disabled={isSubmitting}
          />
        </div>

        <div>
          <Label htmlFor="state">Estado</Label>
          <Input
            id="state"
            {...register('state')}
            disabled={isSubmitting}
          />
        </div>

      </div>

      {/* Visit Configuration */}
      <div className="md:col-span-2 space-y-4">
        <div>
          <Label>Dias de Visita</Label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-2">
            {visitDayOptions.map(option => (
              <div key={option.value} className="flex items-center space-x-2">
                <Checkbox
                  id={`visitDay-${option.value}`}
                  checked={watchedVisitDays.includes(option.value)}
                  onCheckedChange={(checked) => handleVisitDayChange(option.value, !!checked)}
                  disabled={isSubmitting}
                />
                <Label htmlFor={`visitDay-${option.value}`} className="text-sm">
                  {option.label}
                </Label>
              </div>
            ))}
          </div>
        </div>

        <div>
          <Label htmlFor="visitFrequency">Frequência de Visita</Label>
          <Select
            value={watch('visitFrequency')}
            onValueChange={(value) => setValue('visitFrequency', value)}
            disabled={isSubmitting}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecione a frequência" />
            </SelectTrigger>
            <SelectContent>
              {visitFrequencyOptions.map(option => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <VisitSequenceManager
          visitDays={watchedVisitDays}
          visitSequence={watchedVisitSequence || 1}
          visitSequences={watchedVisitSequences}
          onVisitSequenceChange={(value) => setValue('visitSequence', value)}
          onVisitSequencesChange={(value) => setValue('visitSequences', value)}
        />

        <div>
          <Label htmlFor="notes">Observações</Label>
          <Textarea
            id="notes"
            {...register('notes')}
            disabled={isSubmitting}
            rows={3}
          />
        </div>
      </div>
    </div>
  );
};
