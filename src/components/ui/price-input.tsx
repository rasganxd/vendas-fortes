
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

    // Sincronizar valor numérico com display
    React.useEffect(() => {
      if (value !== undefined && value !== null) {
        const formatted = new Intl.NumberFormat('pt-BR', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2
        }).format(value);
        setDisplayValue(formatted);
      } else {
        setDisplayValue('');
      }
    }, [value]);

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
        placeholder="0,00"
        {...props}
      />
    )
  }
)
PriceInput.displayName = "PriceInput"

export { PriceInput }
