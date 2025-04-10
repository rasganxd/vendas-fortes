
import * as React from "react"
import { cn } from "@/lib/utils"

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  mask?: 'cpf' | 'cnpj' | 'cpfCnpj' | 'price';
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, mask, onChange, value, ...props }, ref) => {
    // Handle input masking for CPF/CNPJ
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (mask) {
        if (mask === 'price') {
          // Price mask formatting
          let inputValue = e.target.value.replace(/\D/g, '');
          
          // Convert to number and divide by 100 to get decimal value
          const numValue = parseInt(inputValue || '0') / 100;
          
          // Format as Brazilian currency
          inputValue = numValue.toLocaleString('pt-BR', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          });
          
          const newEvent = {
            ...e,
            target: {
              ...e.target,
              value: inputValue
            }
          };
          
          onChange && onChange(newEvent as React.ChangeEvent<HTMLInputElement>);
          return;
        }
        
        let inputValue = e.target.value.replace(/\D/g, '');
        
        if (mask === 'cpf' || (mask === 'cpfCnpj' && inputValue.length <= 11)) {
          // CPF mask: XXX.XXX.XXX-XX
          if (inputValue.length > 11) inputValue = inputValue.substring(0, 11);
          
          if (inputValue.length > 9) {
            inputValue = `${inputValue.substring(0, 3)}.${inputValue.substring(3, 6)}.${inputValue.substring(6, 9)}-${inputValue.substring(9)}`;
          } else if (inputValue.length > 6) {
            inputValue = `${inputValue.substring(0, 3)}.${inputValue.substring(3, 6)}.${inputValue.substring(6)}`;
          } else if (inputValue.length > 3) {
            inputValue = `${inputValue.substring(0, 3)}.${inputValue.substring(3)}`;
          }
        } else if (mask === 'cnpj' || (mask === 'cpfCnpj' && inputValue.length > 11)) {
          // CNPJ mask: XX.XXX.XXX/XXXX-XX
          if (inputValue.length > 14) inputValue = inputValue.substring(0, 14);
          
          if (inputValue.length > 12) {
            inputValue = `${inputValue.substring(0, 2)}.${inputValue.substring(2, 5)}.${inputValue.substring(5, 8)}/${inputValue.substring(8, 12)}-${inputValue.substring(12)}`;
          } else if (inputValue.length > 8) {
            inputValue = `${inputValue.substring(0, 2)}.${inputValue.substring(2, 5)}.${inputValue.substring(5, 8)}/${inputValue.substring(8)}`;
          } else if (inputValue.length > 5) {
            inputValue = `${inputValue.substring(0, 2)}.${inputValue.substring(2, 5)}.${inputValue.substring(5)}`;
          } else if (inputValue.length > 2) {
            inputValue = `${inputValue.substring(0, 2)}.${inputValue.substring(2)}`;
          }
        }
        
        const newEvent = {
          ...e,
          target: {
            ...e.target,
            value: inputValue
          }
        };
        
        onChange && onChange(newEvent as React.ChangeEvent<HTMLInputElement>);
        return;
      }
      
      onChange && onChange(e);
    };
    
    return (
      <input
        type={type}
        className={cn(
          "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
          className
        )}
        ref={ref}
        onChange={handleChange}
        value={value}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }
