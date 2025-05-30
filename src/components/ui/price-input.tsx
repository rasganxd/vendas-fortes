
import * as React from "react"
import { cn } from "@/lib/utils"
import { applyPriceMask, parseBrazilianPrice } from "@/utils/priceUtils"

interface PriceInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  value?: number;
  onChange?: (value: number) => void;
  onDisplayChange?: (displayValue: string) => void;
}

const PriceInput = React.forwardRef<HTMLInputElement, PriceInputProps>(
  ({ className, value, onChange, onDisplayChange, ...props }, ref) => {
    const [displayValue, setDisplayValue] = React.useState('');
    const [isFocused, setIsFocused] = React.useState(false);

    // Sincronizar valor numérico com display apenas quando não está focado
    React.useEffect(() => {
      if (!isFocused && value !== undefined && value !== null) {
        const formatted = new Intl.NumberFormat('pt-BR', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2
        }).format(value);
        setDisplayValue(formatted);
      } else if (!isFocused && (value === undefined || value === null)) {
        setDisplayValue('');
      }
    }, [value, isFocused]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const inputValue = e.target.value;
      const masked = applyPriceMask(inputValue);
      const numericValue = parseBrazilianPrice(masked);
      
      setDisplayValue(masked);
      
      if (onChange) {
        onChange(numericValue);
      }
      
      if (onDisplayChange) {
        onDisplayChange(masked);
      }
    };

    const handleFocus = () => {
      setIsFocused(true);
    };

    const handleBlur = () => {
      setIsFocused(false);
      
      // Aplicar formatação completa ao sair do campo
      if (displayValue && !displayValue.includes(',')) {
        const numericValue = parseBrazilianPrice(displayValue);
        if (numericValue > 0) {
          const formatted = new Intl.NumberFormat('pt-BR', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
          }).format(numericValue);
          setDisplayValue(formatted);
          
          if (onDisplayChange) {
            onDisplayChange(formatted);
          }
        }
      }
    };

    return (
      <input
        type="text"
        className={cn(
          "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        ref={ref}
        value={displayValue}
        onChange={handleChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
        placeholder="0,00"
        {...props}
      />
    )
  }
)
PriceInput.displayName = "PriceInput"

export { PriceInput }
