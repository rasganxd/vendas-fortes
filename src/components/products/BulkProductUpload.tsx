
import React, { useState } from 'react';
import { toast } from 'sonner';
import { 
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useAppContext } from '@/hooks/useAppContext';
import { formatCurrency } from '@/lib/utils';
import { prepareForSupabase } from '@/utils/dataTransformers';
import { Loader2 } from 'lucide-react';
import { Product } from '@/types';

interface BulkProductUploadProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const SAMPLE_DATA = `Código;Nome;Custo;Preço;Unidade
1;Refrigerante Cola 2L;4.50;8.99;UN
2;Biscoito Cream Cracker 400g;2.30;4.50;PCT
3;Detergente Líquido 500ml;1.75;3.99;UN`;

const BulkProductUpload: React.FC<BulkProductUploadProps> = ({ open, onOpenChange }) => {
  const { addBulkProducts } = useAppContext();
  const [csvData, setCsvData] = useState(SAMPLE_DATA);
  const [isProcessing, setIsProcessing] = useState(false);
  const [preview, setPreview] = useState<any[]>([]);
  const [showPreview, setShowPreview] = useState(false);

  // Reset state when dialog opens or closes
  React.useEffect(() => {
    if (!open) {
      setPreview([]);
      setShowPreview(false);
    }
  }, [open]);

  const processCSV = () => {
    setIsProcessing(true);
    
    try {
      // Split by lines
      const lines = csvData.trim().split('\n');
      if (lines.length < 2) {
        toast.error("Dados insuficientes. Verifique o formato CSV.");
        setIsProcessing(false);
        return;
      }

      // Parse header
      const headers = lines[0].split(';');
      
      // Process data rows
      const products: any[] = [];
      const dataRows = lines.slice(1);
      
      for (const row of dataRows) {
        const values = row.split(';');
        
        // Create product object
        const product: Partial<Product> = {
          code: parseInt(values[0]) || 0,
          name: values[1] || '',
          cost: parseFloat(values[2].replace(',', '.')) || 0,
          price: parseFloat(values[3].replace(',', '.')) || 0,
          unit: values[4] || 'UN',
          stock: 0,
          minStock: 0,
        };
        
        // Validate required fields
        if (!product.code || !product.name) {
          continue;
        }
        
        products.push(product);
      }
      
      // Show preview
      setPreview(products);
      setShowPreview(true);
      
    } catch (error) {
      console.error("Error processing CSV data:", error);
      toast.error("Erro ao processar dados CSV. Verifique o formato.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleUpload = async () => {
    setIsProcessing(true);
    
    try {
      console.log("Products being prepared for upload:", preview);
      const ids = await addBulkProducts(preview);
      console.log("Product IDs after upload:", ids);
      
      toast.success(`${ids.length} produtos importados com sucesso!`);
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
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Importação em Massa de Produtos</DialogTitle>
          <DialogDescription>
            Cole os dados dos produtos no formato CSV (separado por ponto-e-vírgula).
          </DialogDescription>
        </DialogHeader>
        
        {!showPreview ? (
          <div className="space-y-4">
            <div className="grid w-full gap-1.5">
              <Label htmlFor="csv-data">Dados CSV (separado por ponto-e-vírgula)</Label>
              <Textarea
                id="csv-data"
                value={csvData}
                onChange={(e) => setCsvData(e.target.value)}
                placeholder="Cole os dados aqui..."
                rows={10}
                className="font-mono"
              />
              <p className="text-sm text-muted-foreground mt-1">
                Formato: Código;Nome;Custo;Preço;Unidade
              </p>
            </div>
            
            <Button onClick={processCSV} disabled={isProcessing} className="w-full">
              {isProcessing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processando...
                </>
              ) : "Previsualizar Dados"}
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b">
                    <th className="py-2 px-1 text-left">Código</th>
                    <th className="py-2 px-1 text-left">Nome</th>
                    <th className="py-2 px-1 text-right">Custo</th>
                    <th className="py-2 px-1 text-right">Preço</th>
                    <th className="py-2 px-1 text-center">Unidade</th>
                  </tr>
                </thead>
                <tbody>
                  {preview.map((product, index) => (
                    <tr key={index} className="border-b">
                      <td className="py-2 px-1">{product.code}</td>
                      <td className="py-2 px-1">{product.name}</td>
                      <td className="py-2 px-1 text-right">{formatCurrency(product.cost)}</td>
                      <td className="py-2 px-1 text-right">{formatCurrency(product.price)}</td>
                      <td className="py-2 px-1 text-center">{product.unit}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            <p className="text-sm text-muted-foreground">
              {preview.length} produtos encontrados
            </p>
            
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setShowPreview(false)} disabled={isProcessing}>
                Voltar
              </Button>
              <Button onClick={handleUpload} disabled={isProcessing || preview.length === 0} className="ml-auto">
                {isProcessing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Importando...
                  </>
                ) : `Importar ${preview.length} Produtos`}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default BulkProductUpload;
