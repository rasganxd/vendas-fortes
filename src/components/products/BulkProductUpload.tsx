
import React, { useState } from 'react';
import { toast } from 'sonner';
import { 
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useAppData } from '@/context/providers/AppDataProvider';
import { formatCurrency } from '@/lib/utils';
import { Loader2, AlertTriangle } from 'lucide-react';
import { Product } from '@/types';
import { useUnits } from '@/hooks/useUnits';

interface BulkProductUploadProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface ParsedProduct {
  code: number;
  name: string;
  unit: string;
  cost: number;
  hasError: boolean;
  errorMessage?: string;
}

const SAMPLE_DATA = `CODIGO	NOME DO PRODUTO	UN	PRECO_CUSTO
51	51 COM CASCO 965ML	DZ12	111.000000
667	51 ICE BALADA 275ML	CX24	98.000000
669	51 ICE FRUIT MIX 275ML	CX24	95.760000
510	AGUA CRISTAL COM GAS 500ML	DZ12	
48	AGUA FLORESTA SEM GAS 500ML	DZ12	9.000000`;

const BulkProductUpload: React.FC<BulkProductUploadProps> = ({ open, onOpenChange }) => {
  const { addBulkProducts } = useAppData();
  const { units } = useUnits();
  const [csvData, setCsvData] = useState(SAMPLE_DATA);
  const [isProcessing, setIsProcessing] = useState(false);
  const [preview, setPreview] = useState<ParsedProduct[]>([]);
  const [showPreview, setShowPreview] = useState(false);

  // Reset state when dialog opens or closes
  React.useEffect(() => {
    if (!open) {
      setPreview([]);
      setShowPreview(false);
    }
  }, [open]);

  const parseProductData = (line: string, lineNumber: number): ParsedProduct | null => {
    // Split by tab first, if no tabs use multiple spaces
    let parts = line.split('\t');
    if (parts.length === 1) {
      // Try splitting by multiple spaces (2 or more)
      parts = line.split(/\s{2,}/);
    }
    
    // If still only one part, try single spaces but be more careful
    if (parts.length === 1) {
      parts = line.trim().split(/\s+/);
    }
    
    // We need at least 3 parts: code, name, unit, cost (cost can be empty)
    if (parts.length < 3) {
      return {
        code: 0,
        name: `Linha ${lineNumber}: Formato inválido`,
        unit: '',
        cost: 0,
        hasError: true,
        errorMessage: 'Formato inválido - dados insuficientes'
      };
    }

    // Parse code
    const codeStr = parts[0].trim();
    const code = parseInt(codeStr);
    if (isNaN(code)) {
      return {
        code: 0,
        name: `Linha ${lineNumber}: Código inválido`,
        unit: '',
        cost: 0,
        hasError: true,
        errorMessage: 'Código deve ser um número'
      };
    }

    // For products with complex names, join middle parts
    let name = '';
    let unit = '';
    let costStr = '';

    if (parts.length === 3) {
      // Simple case: CODE NAME UNIT (no cost)
      name = parts[1].trim();
      unit = parts[2].trim();
      costStr = '';
    } else if (parts.length === 4) {
      // Standard case: CODE NAME UNIT COST
      name = parts[1].trim();
      unit = parts[2].trim();
      costStr = parts[3].trim();
    } else {
      // Complex case: CODE NAME_WITH_SPACES UNIT COST
      // Take last two parts as unit and cost, join the rest as name
      unit = parts[parts.length - 2].trim();
      costStr = parts[parts.length - 1].trim();
      name = parts.slice(1, parts.length - 2).join(' ').trim();
    }

    // Parse cost
    let cost = 0;
    let hasError = false;
    let errorMessage = '';

    if (costStr && costStr !== '') {
      cost = parseFloat(costStr.replace(',', '.'));
      if (isNaN(cost)) {
        hasError = true;
        errorMessage = 'Preço de custo inválido';
        cost = 0;
      }
    }

    // Check if unit exists
    const unitExists = units.some(u => u.code === unit);
    if (!unitExists && unit) {
      hasError = true;
      errorMessage = errorMessage ? `${errorMessage}; Unidade '${unit}' não encontrada` : `Unidade '${unit}' não encontrada`;
    }

    return {
      code,
      name: name || 'Nome não informado',
      unit: unit || 'UN',
      cost,
      hasError,
      errorMessage
    };
  };

  const processCSV = () => {
    setIsProcessing(true);
    
    try {
      const lines = csvData.trim().split('\n');
      if (lines.length < 2) {
        toast.error("Dados insuficientes. Inclua pelo menos o cabeçalho e uma linha de dados.");
        setIsProcessing(false);
        return;
      }

      // Skip header line
      const dataRows = lines.slice(1);
      const products: ParsedProduct[] = [];
      
      dataRows.forEach((line, index) => {
        if (line.trim()) {
          const product = parseProductData(line, index + 2); // +2 because we skip header and start from line 1
          if (product) {
            products.push(product);
          }
        }
      });
      
      if (products.length === 0) {
        toast.error("Nenhum produto válido encontrado nos dados.");
        setIsProcessing(false);
        return;
      }
      
      setPreview(products);
      setShowPreview(true);
      
      const errorsCount = products.filter(p => p.hasError).length;
      if (errorsCount > 0) {
        toast.warning(`${products.length} produtos processados, ${errorsCount} com problemas. Revise antes de importar.`);
      } else {
        toast.success(`${products.length} produtos processados com sucesso!`);
      }
      
    } catch (error) {
      console.error("Error processing data:", error);
      toast.error("Erro ao processar dados. Verifique o formato.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleUpload = async () => {
    setIsProcessing(true);
    
    try {
      // Filter out products with errors
      const validProducts = preview.filter(p => !p.hasError);
      
      if (validProducts.length === 0) {
        toast.error("Nenhum produto válido para importar.");
        setIsProcessing(false);
        return;
      }

      // Convert to Product format with all required fields
      const productsToImport = validProducts.map(product => ({
        code: product.code,
        name: product.name,
        description: '', // Required field, set to empty string
        cost: product.cost,
        price: product.cost, // Set initial price equal to cost
        unit: product.unit,
        stock: 0,
        minStock: 0,
        hasSubunit: false,
        subunitRatio: 1,
        createdAt: new Date(), // Required field
        updatedAt: new Date()  // Required field
      }));

      console.log("Products being prepared for upload:", productsToImport);
      const ids = await addBulkProducts(productsToImport);
      console.log("Product IDs after upload:", ids);
      
      const errorsCount = preview.filter(p => p.hasError).length;
      const successMessage = errorsCount > 0 
        ? `${validProducts.length} produtos importados com sucesso! ${errorsCount} produtos foram ignorados devido a erros.`
        : `${validProducts.length} produtos importados com sucesso!`;
      
      toast.success(successMessage);
      onOpenChange(false);
    } catch (error) {
      console.error("Error uploading bulk products:", error);
      toast.error("Erro ao importar produtos em massa.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[1000px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Importação em Massa de Produtos</DialogTitle>
          <DialogDescription>
            Cole os dados dos produtos no formato: CÓDIGO, NOME DO PRODUTO, UNIDADE, PREÇO_CUSTO (separados por TAB ou espaços).
          </DialogDescription>
        </DialogHeader>
        
        {!showPreview ? (
          <div className="space-y-4">
            <div className="grid w-full gap-1.5">
              <Label htmlFor="csv-data">Dados dos Produtos</Label>
              <Textarea
                id="csv-data"
                value={csvData}
                onChange={(e) => setCsvData(e.target.value)}
                placeholder="Cole os dados aqui..."
                rows={12}
                className="font-mono text-sm"
              />
              <p className="text-sm text-muted-foreground mt-1">
                Formato: CÓDIGO [TAB/ESPAÇOS] NOME [TAB/ESPAÇOS] UNIDADE [TAB/ESPAÇOS] PREÇO_CUSTO
                <br />
                O preço de custo pode estar vazio. Se a unidade não existir, será reportado como erro.
              </p>
            </div>
            
            <Button onClick={processCSV} disabled={isProcessing} className="w-full">
              {isProcessing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processando...
                </>
              ) : "Processar e Visualizar"}
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="overflow-x-auto max-h-96">
              <table className="w-full border-collapse text-sm">
                <thead className="sticky top-0 bg-background">
                  <tr className="border-b">
                    <th className="py-2 px-2 text-left">Status</th>
                    <th className="py-2 px-2 text-left">Código</th>
                    <th className="py-2 px-2 text-left">Nome</th>
                    <th className="py-2 px-2 text-center">Unidade</th>
                    <th className="py-2 px-2 text-right">Custo</th>
                  </tr>
                </thead>
                <tbody>
                  {preview.map((product, index) => (
                    <tr key={index} className={`border-b ${product.hasError ? 'bg-red-50' : 'bg-green-50'}`}>
                      <td className="py-2 px-2">
                        {product.hasError ? (
                          <div className="flex items-center text-red-600">
                            <AlertTriangle className="h-4 w-4 mr-1" />
                            <span className="text-xs">Erro</span>
                          </div>
                        ) : (
                          <div className="flex items-center text-green-600">
                            <span className="text-xs">✓ OK</span>
                          </div>
                        )}
                      </td>
                      <td className="py-2 px-2">{product.code}</td>
                      <td className="py-2 px-2">
                        {product.name}
                        {product.hasError && (
                          <div className="text-xs text-red-500 mt-1">{product.errorMessage}</div>
                        )}
                      </td>
                      <td className="py-2 px-2 text-center">{product.unit}</td>
                      <td className="py-2 px-2 text-right">
                        {product.cost > 0 ? formatCurrency(product.cost) : '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            <div className="flex justify-between items-center">
              <div className="text-sm text-muted-foreground">
                Total: {preview.length} produtos | 
                Válidos: {preview.filter(p => !p.hasError).length} | 
                Com erro: {preview.filter(p => p.hasError).length}
              </div>
            </div>
            
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setShowPreview(false)} disabled={isProcessing}>
                Voltar
              </Button>
              <Button 
                onClick={handleUpload} 
                disabled={isProcessing || preview.filter(p => !p.hasError).length === 0} 
                className="ml-auto"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Importando...
                  </>
                ) : `Importar ${preview.filter(p => !p.hasError).length} Produtos Válidos`}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default BulkProductUpload;
