import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { EnhancedTable, EnhancedTableHeader, EnhancedTableBody, EnhancedTableRow, EnhancedTableHead, EnhancedTableCell } from '@/components/ui/enhanced-table';
import { formatCurrency } from '@/lib/utils';
import { Product } from '@/types';
import { useProducts } from '@/hooks/useProducts';
import { productDiscountService } from '@/services/supabase/productDiscountService';
import { toast } from 'sonner';
import { Edit, Save, X, Search, AlertTriangle } from 'lucide-react';
import { parseBrazilianPrice, formatPriceForInput, isValidPrice } from '@/utils/priceUtils';

interface ProductPricingRow extends Product {
  maxDiscountPercentage: number;
}

export default function ProductPricing() {
  const { products, updateProduct } = useProducts();
  const [pricingData, setPricingData] = useState<ProductPricingRow[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editPrice, setEditPrice] = useState<string>('');
  const [editDiscount, setEditDiscount] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState<string | null>(null);
  const [validationError, setValidationError] = useState<string>('');

  // Load pricing data with discount settings
  useEffect(() => {
    const loadPricingData = async () => {
      setIsLoading(true);
      try {
        // Get all discount settings
        const discounts = await productDiscountService.getAllDiscounts();
        
        // Combine products with their discount settings
        const combined = products.map(product => ({
          ...product,
          maxDiscountPercentage: discounts[product.id] || 0
        }));
        
        setPricingData(combined);
      } catch (error) {
        console.error('Erro ao carregar dados de precificação:', error);
        // If there's an error, just use products without discount data
        setPricingData(products.map(product => ({
          ...product,
          maxDiscountPercentage: 0
        })));
      } finally {
        setIsLoading(false);
      }
    };

    loadPricingData();
  }, [products]);

  const filteredData = pricingData.filter(product => 
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    product.code.toString().includes(searchTerm)
  );

  const validateDiscount = (discountPercentage: number): string => {
    if (discountPercentage < 0) {
      return 'O desconto não pode ser negativo';
    }
    if (discountPercentage > 100) {
      return 'O desconto não pode ser maior que 100%';
    }
    return '';
  };

  const validateProductId = (productId: string): boolean => {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(productId);
  };

  const handleEditStart = (product: ProductPricingRow) => {
    if (!validateProductId(product.id)) {
      setValidationError('ID do produto inválido');
      return;
    }
    
    setEditingId(product.id);
    setEditPrice(formatPriceForInput(product.price || 0));
    setEditDiscount(product.maxDiscountPercentage.toString());
    setValidationError('');
  };

  const handleEditCancel = () => {
    setEditingId(null);
    setEditPrice('');
    setEditDiscount('');
    setValidationError('');
  };

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditPrice(e.target.value);
    setValidationError('');
  };

  const handleDiscountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setEditDiscount(value);
    
    // Real-time validation
    const discountValue = parseFloat(value);
    if (!isNaN(discountValue)) {
      const error = validateDiscount(discountValue);
      setValidationError(error);
    }
  };

  const handleSave = async (productId: string) => {
    try {
      setIsSaving(productId);
      setValidationError('');

      // Validate product ID
      if (!validateProductId(productId)) {
        setValidationError('ID do produto inválido');
        return;
      }

      if (!isValidPrice(editPrice)) {
        setValidationError("Digite um preço válido no formato brasileiro (ex: 1.234,56)");
        return;
      }

      const price = parseBrazilianPrice(editPrice);
      const discountPercentage = parseFloat(editDiscount) || 0;
      
      if (isNaN(price) || price < 0) {
        setValidationError("O preço deve ser um número válido maior ou igual a zero");
        return;
      }

      // Validate discount percentage
      const discountError = validateDiscount(discountPercentage);
      if (discountError) {
        setValidationError(discountError);
        return;
      }

      console.log('💾 Salvando alterações:', { productId, price, discountPercentage });

      // Update product price
      await updateProduct(productId, { price });
      console.log('✅ Preço do produto atualizado');
      
      // Handle discount settings with better error handling
      try {
        if (discountPercentage > 0) {
          // First, try to delete existing setting to avoid duplicates
          try {
            await productDiscountService.delete(productId);
          } catch (deleteError) {
            // Ignore delete errors - setting might not exist
            console.log('ℹ️ Nenhuma configuração anterior para remover');
          }
          
          // Then create new setting
          await productDiscountService.upsert(productId, discountPercentage);
          console.log('✅ Configuração de desconto salva:', discountPercentage + '%');
        } else {
          // If discount is 0, remove the setting
          try {
            await productDiscountService.delete(productId);
            console.log('✅ Configuração de desconto removida');
          } catch (error) {
            // Ignore error if no discount setting exists
            console.log('ℹ️ Nenhuma configuração de desconto para remover');
          }
        }
      } catch (discountError) {
        console.error('❌ Erro ao salvar configuração de desconto:', discountError);
        // Don't fail the entire operation for discount errors
        toast.error("Preço salvo, mas houve erro ao configurar desconto");
      }
      
      // Update local state immediately
      setPricingData(prev => prev.map(item => 
        item.id === productId 
          ? { ...item, price, maxDiscountPercentage: discountPercentage }
          : item
      ));
      
      toast.success("Configurações salvas com sucesso!", {
        description: `Preço: R$ ${formatPriceForInput(price)} | Desconto máximo: ${discountPercentage}%`
      });
      
      setEditingId(null);
      setEditPrice('');
      setEditDiscount('');
      
    } catch (error) {
      console.error('❌ Erro ao salvar configurações:', error);
      setValidationError("Erro ao salvar as configurações. Verifique os dados e tente novamente.");
      toast.error("Erro ao salvar configurações");
    } finally {
      setIsSaving(null);
    }
  };

  const calculateMargin = (product: ProductPricingRow): number => {
    if (!product.cost || product.cost === 0) return 0;
    const price = product.price || 0;
    return ((price - product.cost) / product.cost) * 100;
  };

  const calculateMinPrice = (product: ProductPricingRow): number => {
    if (!product.price || product.maxDiscountPercentage === 0) return product.price || 0;
    return product.price * (1 - product.maxDiscountPercentage / 100);
  };

  const getMarginColor = (margin: number): string => {
    if (margin >= 30) return 'text-green-600';
    if (margin >= 15) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <CardTitle>Precificação de Produtos</CardTitle>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Buscar produto..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-80"
              />
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Pricing Table */}
      <Card>
        <CardContent className="p-0">
          <EnhancedTable isLoading={isLoading}>
            <EnhancedTableHeader>
              <EnhancedTableRow>
                <EnhancedTableHead>Código</EnhancedTableHead>
                <EnhancedTableHead>Produto</EnhancedTableHead>
                <EnhancedTableHead>Custo</EnhancedTableHead>
                <EnhancedTableHead>Preço de Venda</EnhancedTableHead>
                <EnhancedTableHead>Margem</EnhancedTableHead>
                <EnhancedTableHead>Desc. Máx (%)</EnhancedTableHead>
                <EnhancedTableHead>Preço Mín.</EnhancedTableHead>
                <EnhancedTableHead>Ações</EnhancedTableHead>
              </EnhancedTableRow>
            </EnhancedTableHeader>
            <EnhancedTableBody>
              {filteredData.map((product) => (
                <EnhancedTableRow key={product.id}>
                  <EnhancedTableCell className="font-medium">
                    {product.code}
                  </EnhancedTableCell>
                  <EnhancedTableCell>{product.name}</EnhancedTableCell>
                  <EnhancedTableCell>
                    {formatCurrency(product.cost || 0)}
                  </EnhancedTableCell>
                  <EnhancedTableCell>
                    {editingId === product.id ? (
                      <div className="space-y-1">
                        <Input
                          mask="price"
                          value={editPrice}
                          onChange={handlePriceChange}
                          className={`w-32 ${validationError && validationError.includes('preço') ? 'border-red-500' : ''}`}
                          placeholder="0,00"
                          autoFocus
                        />
                      </div>
                    ) : (
                      formatCurrency(product.price || 0)
                    )}
                  </EnhancedTableCell>
                  <EnhancedTableCell>
                    <span className={getMarginColor(calculateMargin(product))}>
                      {calculateMargin(product).toFixed(1)}%
                    </span>
                  </EnhancedTableCell>
                  <EnhancedTableCell>
                    {editingId === product.id ? (
                      <div className="space-y-1">
                        <Input
                          type="number"
                          step="0.1"
                          min="0"
                          max="100"
                          value={editDiscount}
                          onChange={handleDiscountChange}
                          className={`w-20 ${validationError && validationError.includes('desconto') ? 'border-red-500' : ''}`}
                          placeholder="0"
                        />
                      </div>
                    ) : (
                      product.maxDiscountPercentage.toFixed(1) + '%'
                    )}
                  </EnhancedTableCell>
                  <EnhancedTableCell>
                    {formatCurrency(calculateMinPrice(product))}
                  </EnhancedTableCell>
                  <EnhancedTableCell>
                    <div className="flex items-center gap-2">
                      {editingId === product.id ? (
                        <>
                          <Button
                            size="sm"
                            onClick={() => handleSave(product.id)}
                            className="h-7 w-7 p-0"
                            disabled={!!validationError || isSaving === product.id}
                          >
                            {isSaving === product.id ? (
                              <div className="h-3 w-3 animate-spin rounded-full border-2 border-white border-t-transparent" />
                            ) : (
                              <Save className="h-3 w-3" />
                            )}
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={handleEditCancel}
                            className="h-7 w-7 p-0"
                            disabled={isSaving === product.id}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </>
                      ) : (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEditStart(product)}
                          className="h-7 w-7 p-0"
                          disabled={!!isSaving}
                        >
                          <Edit className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                  </EnhancedTableCell>
                </EnhancedTableRow>
              ))}
            </EnhancedTableBody>
          </EnhancedTable>
          
          {/* Error message for editing row */}
          {editingId && validationError && (
            <div className="p-4 border-t bg-red-50">
              <div className="flex items-center text-sm text-red-600">
                <AlertTriangle className="h-4 w-4 mr-2" />
                <span>{validationError}</span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {filteredData.length === 0 && !isLoading && (
        <Card>
          <CardContent className="py-8">
            <div className="text-center text-gray-500">
              <p>Nenhum produto encontrado.</p>
              {searchTerm && (
                <p className="text-sm mt-2">
                  Tente ajustar os termos de busca.
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
