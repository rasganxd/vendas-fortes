
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { formatCurrency } from "@/lib/utils";
import { useAppData } from '@/context/providers/AppDataProvider';
import { ArrowLeft, Loader2, Save, Search, AlertTriangle } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import PriceValidation from './pricing/PriceValidation';

const ProductPricing = () => {
  const navigate = useNavigate();
  const { 
    products, 
    productCategories, 
    productGroups, 
    updateProduct,
    isLoadingProducts 
  } = useAppData();
  
  const [isLoading, setIsLoading] = useState(false);
  const [selectedProducts, setSelectedProducts] = useState<Set<string>>(new Set());
  const [filteredProducts, setFilteredProducts] = useState(products);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedGroup, setSelectedGroup] = useState<string>('all');
  const [markupMode, setMarkupMode] = useState<string>('percentage');
  const [bulkValue, setBulkValue] = useState<number>(0);
  const [bulkMinPrice, setBulkMinPrice] = useState<number>(0);
  const [bulkMaxPrice, setBulkMaxPrice] = useState<number>(0);
  const [productPrices, setProductPrices] = useState<Record<string, number>>({});
  const [productMinPrices, setProductMinPrices] = useState<Record<string, number>>({});
  const [productMaxPrices, setProductMaxPrices] = useState<Record<string, number>>({});
  const [hasChanges, setHasChanges] = useState(false);
  const [showOverrideDialog, setShowOverrideDialog] = useState(false);
  const [pendingSave, setPendingSave] = useState<any>(null);

  // Initialize product prices from products
  useEffect(() => {
    const initialPrices: Record<string, number> = {};
    const initialMinPrices: Record<string, number> = {};
    const initialMaxPrices: Record<string, number> = {};
    
    products.forEach(product => {
      initialPrices[product.id] = product.price || 0;
      initialMinPrices[product.id] = product.minPrice || 0;
      initialMaxPrices[product.id] = product.maxPrice || 0;
    });
    
    setProductPrices(initialPrices);
    setProductMinPrices(initialMinPrices);
    setProductMaxPrices(initialMaxPrices);
  }, [products]);

  // Filter products based on search and filters
  useEffect(() => {
    let filtered = products;

    if (searchTerm) {
      const lowerSearchTerm = searchTerm.toLowerCase();
      filtered = filtered.filter(product => 
        product.name.toLowerCase().includes(lowerSearchTerm) || 
        product.code.toString().includes(lowerSearchTerm)
      );
    }

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(product => product.categoryId === selectedCategory);
    }

    if (selectedGroup !== 'all') {
      filtered = filtered.filter(product => product.groupId === selectedGroup);
    }

    setFilteredProducts(filtered);
  }, [products, searchTerm, selectedCategory, selectedGroup]);

  const handleSelectAll = () => {
    if (selectedProducts.size === filteredProducts.length) {
      setSelectedProducts(new Set());
    } else {
      const allIds = new Set(filteredProducts.map(product => product.id));
      setSelectedProducts(allIds);
    }
  };

  const handleSelectProduct = (id: string) => {
    const newSelected = new Set(selectedProducts);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedProducts(newSelected);
  };

  const handlePriceChange = (productId: string, newPrice: number) => {
    setProductPrices(prev => ({
      ...prev,
      [productId]: newPrice
    }));
    setHasChanges(true);
  };

  const handleMinPriceChange = (productId: string, newMinPrice: number) => {
    setProductMinPrices(prev => ({
      ...prev,
      [productId]: newMinPrice
    }));
    setHasChanges(true);
  };

  const handleMaxPriceChange = (productId: string, newMaxPrice: number) => {
    setProductMaxPrices(prev => ({
      ...prev,
      [productId]: newMaxPrice
    }));
    setHasChanges(true);
  };

  const applyBulkPricing = () => {
    if (bulkValue <= 0) {
      toast("Valor inválido", {
        description: "Por favor, insira um valor válido para aplicar em massa.",
        style: {
          backgroundColor: 'rgb(239, 68, 68)',
          color: 'white'
        }
      });
      return;
    }

    const newPrices = { ...productPrices };
    
    selectedProducts.forEach(productId => {
      const product = products.find(p => p.id === productId);
      if (!product) return;
      
      if (markupMode === 'percentage') {
        const markup = product.cost * (bulkValue / 100);
        newPrices[productId] = product.cost + markup;
      } else if (markupMode === 'fixed') {
        newPrices[productId] = product.cost + bulkValue;
      } else if (markupMode === 'absolute') {
        newPrices[productId] = bulkValue;
      }
    });

    setProductPrices(newPrices);
    setHasChanges(true);
    
    toast("Preços atualizados", {
      description: `Preços de ${selectedProducts.size} produtos atualizados com sucesso.`
    });
  };

  const applyBulkMinMaxPrices = () => {
    if (selectedProducts.size === 0) {
      toast("Nenhum produto selecionado", {
        description: "Selecione produtos para aplicar preços mínimo/máximo.",
        style: {
          backgroundColor: 'rgb(239, 68, 68)',
          color: 'white'
        }
      });
      return;
    }

    const newMinPrices = { ...productMinPrices };
    const newMaxPrices = { ...productMaxPrices };
    
    selectedProducts.forEach(productId => {
      if (bulkMinPrice > 0) {
        newMinPrices[productId] = bulkMinPrice;
      }
      if (bulkMaxPrice > 0) {
        newMaxPrices[productId] = bulkMaxPrice;
      }
    });

    setProductMinPrices(newMinPrices);
    setProductMaxPrices(newMaxPrices);
    setHasChanges(true);
    
    toast("Preços mín/máx atualizados", {
      description: `Preços mínimo/máximo de ${selectedProducts.size} produtos atualizados.`
    });
  };

  const validatePriceChanges = () => {
    const outOfRangeProducts = [];
    
    for (const productId of Object.keys(productPrices)) {
      const product = products.find(p => p.id === productId);
      if (!product) continue;
      
      const currentPrice = productPrices[productId];
      const minPrice = productMinPrices[productId] || product.minPrice;
      const maxPrice = productMaxPrices[productId] || product.maxPrice;
      
      if ((minPrice && currentPrice < minPrice) || (maxPrice && currentPrice > maxPrice)) {
        outOfRangeProducts.push({
          product,
          currentPrice,
          minPrice,
          maxPrice
        });
      }
    }
    
    return outOfRangeProducts;
  };

  const saveAllPrices = async (forceOverride = false) => {
    if (!hasChanges) return;
    
    // Validar preços se não forçar override
    if (!forceOverride) {
      const outOfRangeProducts = validatePriceChanges();
      if (outOfRangeProducts.length > 0) {
        setPendingSave({ outOfRangeProducts });
        setShowOverrideDialog(true);
        return;
      }
    }
    
    setIsLoading(true);
    
    try {
      const updates = [];
      
      for (const productId of Object.keys(productPrices)) {
        const product = products.find(p => p.id === productId);
        if (!product) continue;
        
        const updateData: any = {};
        let hasUpdates = false;
        
        if (product.price !== productPrices[productId]) {
          updateData.price = productPrices[productId];
          hasUpdates = true;
        }
        
        if ((product.minPrice || 0) !== (productMinPrices[productId] || 0)) {
          updateData.minPrice = productMinPrices[productId] || null;
          hasUpdates = true;
        }
        
        if ((product.maxPrice || 0) !== (productMaxPrices[productId] || 0)) {
          updateData.maxPrice = productMaxPrices[productId] || null;
          hasUpdates = true;
        }
        
        if (hasUpdates) {
          updates.push({
            id: productId,
            updates: updateData
          });
        }
      }
      
      if (updates.length > 0) {
        for (const update of updates) {
          await updateProduct(update.id, update.updates);
        }
        
        toast("Preços salvos", {
          description: `Preços de ${updates.length} produtos foram salvos com sucesso.`
        });
        
        setHasChanges(false);
      } else {
        toast("Nenhuma alteração", {
          description: "Não há alterações para salvar."
        });
      }
    } catch (error) {
      console.error("Erro ao salvar preços:", error);
      toast("Erro ao salvar", {
        description: "Ocorreu um erro ao salvar os preços dos produtos.",
        style: {
          backgroundColor: 'rgb(239, 68, 68)',
          color: 'white'
        }
      });
    } finally {
      setIsLoading(false);
      setShowOverrideDialog(false);
      setPendingSave(null);
    }
  };

  const formatPriceInput = (value: string): number => {
    const numericValue = value.replace(/\D/g, '');
    return parseFloat(numericValue) / 100 || 0;
  };

  // Debug logging
  console.log("ProductPricing - products:", products.length);
  console.log("ProductPricing - filteredProducts:", filteredProducts.length);
  console.log("ProductPricing - isLoadingProducts:", isLoadingProducts);

  return (
    <>
      <Card className="w-full">
        <CardHeader>
          <div className="flex justify-between items-center">
            <Button 
              variant="outline" 
              size="sm" 
              className="mb-2"
              onClick={() => navigate('/produtos')}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar para Produtos
            </Button>
          </div>
          <CardTitle>Precificação de Produtos</CardTitle>
          <CardDescription>
            Configure os preços de venda e limites dos seus produtos ({products.length} produtos carregados)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Search and filters */}
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar produtos..."
                    className="pl-8"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
              <Select
                value={selectedCategory}
                onValueChange={setSelectedCategory}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Categoria" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas Categorias</SelectItem>
                  {productCategories.map(category => (
                    <SelectItem key={category.id} value={category.id}>{category.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select
                value={selectedGroup}
                onValueChange={setSelectedGroup}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Grupo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos Grupos</SelectItem>
                  {productGroups.map(group => (
                    <SelectItem key={group.id} value={group.id}>{group.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            {/* Bulk pricing controls */}
            <div className="bg-muted p-4 rounded-md space-y-4">
              <h3 className="text-md font-medium">Precificação em Massa</h3>
              
              {/* Preços de venda em massa */}
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-muted-foreground">Preços de Venda</h4>
                <div className="flex flex-col sm:flex-row gap-4 items-end">
                  <div className="space-y-2 w-full sm:w-48">
                    <Select
                      value={markupMode}
                      onValueChange={setMarkupMode}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Modo de ajuste" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="percentage">Markup % sobre custo</SelectItem>
                        <SelectItem value="fixed">Valor fixo sobre custo</SelectItem>
                        <SelectItem value="absolute">Preço absoluto</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2 w-full sm:w-48">
                    <Input
                      type="number"
                      placeholder={markupMode === 'percentage' ? '% de markup' : 'Valor'}
                      value={bulkValue || ''}
                      onChange={(e) => setBulkValue(parseFloat(e.target.value) || 0)}
                      min="0"
                      step={markupMode === 'percentage' ? '1' : '0.1'}
                    />
                  </div>
                  <Button 
                    onClick={applyBulkPricing}
                    disabled={selectedProducts.size === 0 || bulkValue <= 0}
                  >
                    Aplicar aos selecionados ({selectedProducts.size})
                  </Button>
                </div>
              </div>
              
              {/* Preços mínimo/máximo em massa */}
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-muted-foreground">Preços Mínimo/Máximo</h4>
                <div className="flex flex-col sm:flex-row gap-4 items-end">
                  <div className="space-y-2 w-full sm:w-48">
                    <Input
                      type="number"
                      placeholder="Preço mínimo"
                      value={bulkMinPrice || ''}
                      onChange={(e) => setBulkMinPrice(parseFloat(e.target.value) || 0)}
                      min="0"
                      step="0.01"
                    />
                  </div>
                  <div className="space-y-2 w-full sm:w-48">
                    <Input
                      type="number"
                      placeholder="Preço máximo"
                      value={bulkMaxPrice || ''}
                      onChange={(e) => setBulkMaxPrice(parseFloat(e.target.value) || 0)}
                      min="0"
                      step="0.01"
                    />
                  </div>
                  <Button 
                    onClick={applyBulkMinMaxPrices}
                    disabled={selectedProducts.size === 0 || (bulkMinPrice <= 0 && bulkMaxPrice <= 0)}
                  >
                    Aplicar Limites ({selectedProducts.size})
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => setSelectedProducts(new Set())}
                    disabled={selectedProducts.size === 0}
                  >
                    Limpar seleção
                  </Button>
                </div>
              </div>
            </div>
            
            {/* Products table */}
            <div>
              {isLoadingProducts ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin" />
                  <span className="ml-2">Carregando produtos...</span>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12">
                        <Checkbox 
                          checked={filteredProducts.length > 0 && selectedProducts.size === filteredProducts.length}
                          onCheckedChange={handleSelectAll}
                          aria-label="Selecionar todos"
                        />
                      </TableHead>
                      <TableHead className="w-20">Código</TableHead>
                      <TableHead>Nome</TableHead>
                      <TableHead className="w-32">Custo</TableHead>
                      <TableHead className="w-32">Preço Min</TableHead>
                      <TableHead className="w-32">Preço Venda</TableHead>
                      <TableHead className="w-32">Preço Max</TableHead>
                      <TableHead className="w-32">Markup %</TableHead>
                      <TableHead className="w-40">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredProducts.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                          {products.length === 0 ? 'Nenhum produto cadastrado' : 'Nenhum produto encontrado com os filtros aplicados'}
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredProducts.map((product) => {
                        const currentPrice = productPrices[product.id] || 0;
                        const minPrice = productMinPrices[product.id] || 0;
                        const maxPrice = productMaxPrices[product.id] || 0;
                        const markup = product.cost > 0
                          ? ((currentPrice - product.cost) / product.cost) * 100
                          : 0;
                        
                        const productWithCurrentPrices = {
                          ...product,
                          minPrice: minPrice || undefined,
                          maxPrice: maxPrice || undefined
                        };
                        
                        return (
                          <TableRow key={product.id}>
                            <TableCell>
                              <Checkbox 
                                checked={selectedProducts.has(product.id)}
                                onCheckedChange={() => handleSelectProduct(product.id)}
                                aria-label={`Selecionar ${product.name}`}
                              />
                            </TableCell>
                            <TableCell>{product.code}</TableCell>
                            <TableCell>{product.name}</TableCell>
                            <TableCell>{formatCurrency(product.cost)}</TableCell>
                            <TableCell>
                              <Input
                                type="number"
                                value={minPrice || ''}
                                onChange={(e) => {
                                  const newMinPrice = parseFloat(e.target.value) || 0;
                                  handleMinPriceChange(product.id, newMinPrice);
                                }}
                                placeholder="Min"
                                step="0.01"
                                min="0"
                                className="w-24"
                              />
                            </TableCell>
                            <TableCell>
                              <Input
                                value={formatCurrency(currentPrice)}
                                onChange={(e) => {
                                  const newPrice = formatPriceInput(e.target.value);
                                  handlePriceChange(product.id, newPrice);
                                }}
                              />
                            </TableCell>
                            <TableCell>
                              <Input
                                type="number"
                                value={maxPrice || ''}
                                onChange={(e) => {
                                  const newMaxPrice = parseFloat(e.target.value) || 0;
                                  handleMaxPriceChange(product.id, newMaxPrice);
                                }}
                                placeholder="Max"
                                step="0.01"
                                min="0"
                                className="w-24"
                              />
                            </TableCell>
                            <TableCell className={markup < 0 ? 'text-destructive' : ''}>
                              {markup.toFixed(2)}%
                            </TableCell>
                            <TableCell>
                              <PriceValidation
                                product={productWithCurrentPrices}
                                currentPrice={currentPrice}
                              />
                            </TableCell>
                          </TableRow>
                        );
                      })
                    )}
                  </TableBody>
                </Table>
              )}
            </div>

            {/* Save button */}
            <div className="flex justify-end mt-4">
              <Button
                onClick={() => saveAllPrices(false)}
                disabled={isLoading || !hasChanges}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Salvar Preços
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Override Dialog */}
      <AlertDialog open={showOverrideDialog} onOpenChange={setShowOverrideDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center">
              <AlertTriangle className="h-5 w-5 text-yellow-500 mr-2" />
              Preços Fora da Faixa Permitida
            </AlertDialogTitle>
            <AlertDialogDescription>
              {pendingSave?.outOfRangeProducts?.length} produto(s) têm preços fora da faixa permitida:
              <div className="mt-2 space-y-1">
                {pendingSave?.outOfRangeProducts?.slice(0, 5).map((item: any) => (
                  <div key={item.product.id} className="text-sm">
                    <strong>{item.product.name}</strong>: {formatCurrency(item.currentPrice)}
                    {item.minPrice && ` (min: ${formatCurrency(item.minPrice)})`}
                    {item.maxPrice && ` (max: ${formatCurrency(item.maxPrice)})`}
                  </div>
                ))}
                {pendingSave?.outOfRangeProducts?.length > 5 && (
                  <div className="text-sm text-muted-foreground">
                    ...e mais {pendingSave.outOfRangeProducts.length - 5} produto(s)
                  </div>
                )}
              </div>
              <br />
              Deseja salvar mesmo assim?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={() => saveAllPrices(true)}>
              Salvar Mesmo Assim
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default ProductPricing;
