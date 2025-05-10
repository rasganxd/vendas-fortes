
import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { 
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { VISIT_DAYS_OPTIONS } from './constants';
import { CustomerFormValues } from '@/types/customer';

interface CustomerFormFieldsProps {
  form: UseFormReturn<CustomerFormValues>;
}

const CustomerFormFields: React.FC<CustomerFormFieldsProps> = ({ form }) => {
  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="code"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Código</FormLabel>
              <FormControl>
                <Input 
                  {...field} 
                  type="number" 
                  onChange={(e) => {
                    // Ensure code is always a number
                    const value = parseInt(e.target.value, 10);
                    if (!isNaN(value)) {
                      field.onChange(value);
                    } else {
                      field.onChange('');
                    }
                  }}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="visitSequence"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Sequência de Visita (1-1000)</FormLabel>
              <FormControl>
                <Input 
                  {...field} 
                  type="number"
                  min={1}
                  max={1000}
                  onChange={(e) => {
                    const value = parseInt(e.target.value, 10);
                    if (value >= 1 && value <= 1000) {
                      field.onChange(value);
                    } else if (value < 1) {
                      field.onChange(1);
                    } else if (value > 1000) {
                      field.onChange(1000);
                    } else {
                      field.onChange('');
                    }
                  }}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
      
      <FormField
        control={form.control}
        name="name"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Nome</FormLabel>
            <FormControl>
              <Input {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="document"
          render={({ field }) => (
            <FormItem>
              <FormLabel>CPF/CNPJ</FormLabel>
              <FormControl>
                <Input 
                  {...field} 
                  // Remove mask attribute to prevent formatting issues
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="phone"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Telefone</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <FormField
        control={form.control}
        name="address"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Endereço</FormLabel>
            <FormControl>
              <Input {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <FormField
          control={form.control}
          name="city"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Cidade</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="state"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Estado</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="zip"
          render={({ field }) => (
            <FormItem className="sm:col-span-1 col-span-2">
              <FormLabel>CEP</FormLabel>
              <FormControl>
                <Input 
                  {...field} 
                  // Set both zipCode and zip at the same time
                  onChange={(e) => {
                    field.onChange(e.target.value);
                    // Also update zipCode field for backward compatibility
                    if (form.getValues) {
                      form.setValue('zipCode', e.target.value);
                    }
                  }}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="visitFrequency"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Frequência de Visitas</FormLabel>
              <Select 
                onValueChange={field.onChange} 
                defaultValue={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a frequência" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="weekly">Semanal</SelectItem>
                  <SelectItem value="biweekly">Quinzenal</SelectItem>
                  <SelectItem value="monthly">Mensal</SelectItem>
                  <SelectItem value="quarterly">Trimestral</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <FormField
        control={form.control}
        name="visitDays"
        render={() => (
          <FormItem>
            <div className="mb-2">
              <FormLabel>Dias de Visita</FormLabel>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {VISIT_DAYS_OPTIONS.map((day) => (
                <FormField
                  key={day.id}
                  control={form.control}
                  name="visitDays"
                  render={({ field }) => {
                    // Ensure field.value is always an array
                    const value = Array.isArray(field.value) ? field.value : [];
                    
                    return (
                      <FormItem
                        key={day.id}
                        className="flex flex-row items-start space-x-3 space-y-0"
                      >
                        <FormControl>
                          <Checkbox
                            checked={value.includes(day.id)}
                            onCheckedChange={(checked) => {
                              return checked
                                ? field.onChange([...value, day.id])
                                : field.onChange(
                                    value.filter((val) => val !== day.id)
                                  )
                            }}
                          />
                        </FormControl>
                        <FormLabel className="font-normal cursor-pointer">
                          {day.label}
                        </FormLabel>
                      </FormItem>
                    )
                  }}
                />
              ))}
            </div>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="notes"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Observações</FormLabel>
            <FormControl>
              <Textarea {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </>
  );
};

export default CustomerFormFields;
