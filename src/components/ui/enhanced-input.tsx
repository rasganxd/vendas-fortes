
import * as React from "react"
import { cn } from "@/lib/utils"
import { Eye, EyeOff } from "lucide-react"

interface EnhancedInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  mask?: 'cpf' | 'cnpj' | 'cpfCnpj' | 'price';
  label?: string;
  error?: string;
  helperText?: string;
  variant?: 'default' | 'floating' | 'outlined';
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
}

const EnhancedInput = React.forwardRef<HTMLInputElement, EnhancedInputProps>(
  ({ 
    className, 
    type, 
    mask, 
    label, 
    error, 
    helperText,
    variant = 'default',
    icon,
    iconPosition = 'left',
    onChange, 
    value, 
    placeholder,
    id,
    ...props 
  }, ref) => {
    const [showPassword, setShowPassword] = React.useState(false);
    const [isFocused, setIsFocused] = React.useState(false);
    const inputId = id || React.useId();

    const isPasswordType = type === 'password';
    const actualType = isPasswordType && showPassword ? 'text' : type;
    const hasValue = value && value.toString().length > 0;

    // Handle input masking
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (mask) {
        if (mask === 'price') {
          let inputValue = e.target.value;
          inputValue = inputValue.replace(/[^\d,]/g, '');
          inputValue = inputValue.replace(/\./g, ',');
          const parts = inputValue.split(',');
          if (parts.length > 2) {
            inputValue = parts[0] + ',' + parts.slice(1).join('');
          }
          if (parts.length === 2 && parts[1].length > 2) {
            inputValue = parts[0] + ',' + parts[1].substring(0, 2);
          }
          
          const newEvent = {
            ...e,
            target: { ...e.target, value: inputValue }
          };
          onChange && onChange(newEvent as React.ChangeEvent<HTMLInputElement>);
          return;
        }
        
        let inputValue = e.target.value.replace(/\D/g, '');
        
        if (mask === 'cpf' || (mask === 'cpfCnpj' && inputValue.length <= 11)) {
          if (inputValue.length > 11) inputValue = inputValue.substring(0, 11);
          
          if (inputValue.length > 9) {
            inputValue = `${inputValue.substring(0, 3)}.${inputValue.substring(3, 6)}.${inputValue.substring(6, 9)}-${inputValue.substring(9)}`;
          } else if (inputValue.length > 6) {
            inputValue = `${inputValue.substring(0, 3)}.${inputValue.substring(3, 6)}.${inputValue.substring(6)}`;
          } else if (inputValue.length > 3) {
            inputValue = `${inputValue.substring(0, 3)}.${inputValue.substring(3)}`;
          }
        } else if (mask === 'cnpj' || (mask === 'cpfCnpj' && inputValue.length > 11)) {
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
          target: { ...e.target, value: inputValue }
        };
        onChange && onChange(newEvent as React.ChangeEvent<HTMLInputElement>);
        return;
      }
      
      onChange && onChange(e);
    };

    const inputClasses = cn(
      "flex h-11 w-full rounded-lg border bg-background px-3 py-2 text-sm transition-all duration-200",
      "ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium",
      "placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2",
      "focus-visible:ring-blue-500 focus-visible:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-50",
      {
        // Default variant states
        "border-gray-200 hover:border-gray-300": variant === 'default' && !error && !isFocused,
        "border-blue-500 bg-blue-50/30": (variant === 'default' || variant === 'floating') && isFocused && !error,
        
        // Floating label variant
        "border-gray-200 pt-6 pb-2": variant === 'floating',
        
        // Outlined variant states
        "border-2 border-gray-200": variant === 'outlined' && !error && !isFocused,
        "border-2 border-blue-500": variant === 'outlined' && isFocused && !error,
        
        // Error states
        "border-red-500 bg-red-50/30 focus-visible:ring-red-500": error,
        
        // Icon padding
        "pl-10": icon && iconPosition === 'left',
        "pr-10": (icon && iconPosition === 'right') || isPasswordType,
        "pr-16": icon && iconPosition === 'right' && isPasswordType,
      },
      className
    );

    const containerClasses = cn(
      "relative",
      variant === 'floating' && "relative"
    );

    const labelClasses = cn(
      "text-sm font-medium transition-all duration-200",
      {
        // Default variant
        "text-gray-700 mb-2 block": variant === 'default',
        
        // Floating variant
        "absolute left-3 transition-all duration-200 pointer-events-none": variant === 'floating',
        "top-2 text-xs text-blue-600": variant === 'floating' && (isFocused || hasValue),
        "top-3 text-gray-500": variant === 'floating' && !isFocused && !hasValue,
        
        // Outlined variant
        "text-gray-700 mb-2 block": variant === 'outlined',
        
        // Error state
        "text-red-600": error,
      }
    );

    return (
      <div className="space-y-1">
        {label && variant !== 'floating' && (
          <label htmlFor={inputId} className={labelClasses}>
            {label}
          </label>
        )}
        
        <div className={containerClasses}>
          {/* Floating label */}
          {label && variant === 'floating' && (
            <label htmlFor={inputId} className={labelClasses}>
              {label}
            </label>
          )}
          
          {/* Left icon */}
          {icon && iconPosition === 'left' && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              {icon}
            </div>
          )}
          
          <input
            id={inputId}
            type={actualType}
            className={inputClasses}
            ref={ref}
            onChange={handleChange}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            value={value}
            placeholder={variant === 'floating' ? '' : placeholder}
            {...props}
          />
          
          {/* Right icon */}
          {icon && iconPosition === 'right' && !isPasswordType && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
              {icon}
            </div>
          )}
          
          {/* Password visibility toggle */}
          {isPasswordType && (
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className={cn(
                "absolute top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors",
                icon && iconPosition === 'right' ? "right-10" : "right-3"
              )}
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          )}
        </div>
        
        {/* Helper text or error message */}
        {(helperText || error) && (
          <p className={cn(
            "text-xs transition-colors duration-200",
            error ? "text-red-600" : "text-gray-500"
          )}>
            {error || helperText}
          </p>
        )}
      </div>
    );
  }
)
EnhancedInput.displayName = "EnhancedInput"

export { EnhancedInput }
