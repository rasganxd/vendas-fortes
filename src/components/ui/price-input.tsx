
import * as React from "react"
import { cn } from "@/lib/utils"
import { useEffect, useRef } from "react"

// Declaração global para jQuery
declare global {
  interface Window {
    $: any;
    jQuery: any;
  }
}

interface PriceInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  value?: number;
  onChange?: (value: number) => void;
  onDisplayChange?: (displayValue: string) => void;
}

const PriceInput = React.forwardRef<HTMLInputElement, PriceInputProps>(
  ({ className, value, onChange, onDisplayChange, ...props }, ref) => {
    const inputRef = useRef<HTMLInputElement>(null);
    const maskMoneyInstanceRef = useRef<any>(null);

    // Importar jQuery dinamicamente e inicializar MaskMoney
    useEffect(() => {
      const initializeMaskMoney = async () => {
        try {
          // Importar jQuery dinamicamente
          const $ = (await import('jquery')).default;
          
          // Importar jQuery Mask Plugin
          await import('jquery-mask-plugin');
          
          // Garantir que o jQuery está disponível globalmente
          window.$ = window.jQuery = $;
          
          if (inputRef.current) {
            const $input = $(inputRef.current);
            
            // Inicializar MaskMoney com configurações brasileiras
            $input.maskMoney({
              prefix: 'R$ ',
              thousands: '.',
              decimal: ',',
              precision: 2,
              allowZero: true,
              allowNegative: false,
              affixesStay: true
            });
            
            // Armazenar a instância para limpeza posterior
            maskMoneyInstanceRef.current = $input;
            
            // Configurar valor inicial se fornecido
            if (value !== undefined && value !== null) {
              $input.maskMoney('mask', value);
            }
            
            // Configurar evento de mudança
            $input.on('keyup blur', () => {
              const maskedValue = $input.val();
              const numericValue = $input.maskMoney('unmasked')[0] || 0;
              
              if (onChange) {
                onChange(numericValue);
              }
              
              if (onDisplayChange) {
                onDisplayChange(maskedValue);
              }
            });
          }
        } catch (error) {
          console.error('Erro ao inicializar MaskMoney:', error);
        }
      };

      initializeMaskMoney();

      // Cleanup
      return () => {
        if (maskMoneyInstanceRef.current) {
          try {
            maskMoneyInstanceRef.current.off('keyup blur');
            maskMoneyInstanceRef.current.maskMoney('destroy');
          } catch (error) {
            console.log('Erro na limpeza do MaskMoney:', error);
          }
        }
      };
    }, []);

    // Atualizar valor quando prop value mudar
    useEffect(() => {
      if (maskMoneyInstanceRef.current && value !== undefined && value !== null) {
        try {
          maskMoneyInstanceRef.current.maskMoney('mask', value);
        } catch (error) {
          console.log('Erro ao atualizar valor:', error);
        }
      }
    }, [value]);

    // Combinar refs
    const combinedRef = (element: HTMLInputElement) => {
      inputRef.current = element;
      if (typeof ref === 'function') {
        ref(element);
      } else if (ref) {
        ref.current = element;
      }
    };

    return (
      <input
        type="text"
        className={cn(
          "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        ref={combinedRef}
        placeholder="R$ 0,00"
        {...props}
      />
    )
  }
)
PriceInput.displayName = "PriceInput"

export { PriceInput }
