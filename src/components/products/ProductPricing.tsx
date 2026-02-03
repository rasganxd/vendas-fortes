import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { formatCurrency } from "@/lib/utils";
import { useAppData } from '@/context/providers/AppDataProvider';
import { ArrowLeft, Loader2, Save, Search, Calculator, ChevronLeft, ChevronRight } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import BulkPricingModal from './pricing/BulkPricingModal';
import SaveConfirmationDialog from './pricing/SaveConfirmationDialog';
import SaveProgressDialog from './pricing/SaveProgressDialog';
import ProductRowIndicator from './pricing/ProductRowIndicator';

interface BulkPricingChanges {
  selectedProducts: string[];
  priceChanges?: {
    mode: 'percentage' | 'fixed' | 'absolute';
    value: number;
  };
  maxDiscountChange?: number;
}

interface PriceChange {
  product: any;
  oldPrice: number;
  newPrice: number;
  oldMaxDiscount: number;
  newMaxDiscount: number;
}

type ProductStatus = 'saved' | 'error' | 'saving' | 'none';

const ProductPricing = () => {
  const navigate = useNavigate();
  const {
    products,
    productCategories,
    productGroups,
    updateProduct,
    batchUpdateProducts,
    isLoadingProducts
  } = useAppData();
  
  const [isLoading, setIsLoading] = useState(false);
  const [selectedProducts, setSelectedProducts] = useState<Set<string>>(new Set());
  const [filteredProducts, setFilteredProducts] = useState(products);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedGroup, setSelectedGroup] = useState<string>('all');
  const [productPrices, setProductPrices] = useState<Record<string, number>>({});
  const [productMaxDiscounts, setProductMaxDiscounts] = useState<Record<string, number>>({});
  const [hasChanges, setHasChanges] = useState(false);
  const [showOverrideDialog, setShowOverrideDialog] = useState(false);
  const [pendingSave, setPendingSave] = useState<any>(null);
  const [bulkPricingOpen, setBulkPricingOpen] = useState(false);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(25);

  // New states for enhanced confirmation
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [showProgress, setShowProgress] = useState(false);
  const [saveProgress, setSaveProgress] = useState(0);
  const [saveTotal, setSaveTotal] = useState(0);
  const [currentSaving, setCurrentSaving] = useState<string>('');
  const [saveErrors, setSaveErrors] = useState<string[]>([]);
  const [productStatuses, setProductStatuses] = useState<Record<string, ProductStatus>>({});

  // Calculate pagination values
  const totalItems = filteredProducts.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentProducts = filteredProducts.slice(startIndex, endIndex);

  // Initialize product prices and max discounts from products
  // Only sync from products when there are no local changes
  useEffect(() => {
    if (!hasChanges) {
      const initialPrices: Record<string, number> = {};
      const initialMaxDiscounts: Record<string, number> = {};
      products.forEach(product => {
        initialPrices[product.id] = product.price || 0;
        initialMaxDiscounts[product.id] = product.maxDiscountPercent || 0;
      });
      setProductPrices(initialPrices);
      setProductMaxDiscounts(initialMaxDiscounts);
      console.log('🔄 [ProductPricing] Synced prices from products:', { 
        productsCount: products.length, 
        sampleProduct: products[0] ? { 
          name: products[0].name, 
          price: products[0].price, 
          maxDiscountPercent: products[0].maxDiscountPercent 
        } : null 
      });
    }
  }, [products, hasChanges]);

  // Filter products based on search and filters
  useEffect(() => {
    let filtered = products;
    if (searchTerm) {
      const lowerSearchTerm = searchTerm.toLowerCase();
      filtered = filtered.filter(product => product.name.toLowerCase().includes(lowerSearchTerm) || product.code.toString().includes(lowerSearchTerm));
    }
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(product => product.categoryId === selectedCategory);
    }
    if (selectedGroup !== 'all') {
      filtered = filtered.filter(product => product.groupId === selectedGroup);
    }
    setFilteredProducts(filtered);
    
    // Reset to first page when filters change
    setCurrentPage(1);
  }, [products, searchTerm, selectedCategory, selectedGroup]);

  // Pagination handlers
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleItemsPerPageChange = (value: string) => {
    setItemsPerPage(parseInt(value));
    setCurrentPage(1);
  };

  // Calculate markup and minimum price
  const calculateMarkup = (cost: number, price: number): number => {
    if (cost === 0) return 0;
    return (price - cost) / cost * 100;
  };

  const calculateMinimumPrice = (price: number, maxDiscount: number): number => {
    return price * (1 - maxDiscount / 100);
  };

  // Handle select all and select product (for current page only)
  const handleSelectAll = () => {
    const currentPageProductIds = currentProducts.map(product => product.id);
    const currentPageSelected = currentPageProductIds.filter(id => selectedProducts.has(id));
    
    const newSelected = new Set(selectedProducts);
    
    if (currentPageSelected.length === currentPageProductIds.length) {
      // Unselect all products on current page
      currentPageProductIds.forEach(id => newSelected.delete(id));
    } else {
      // Select all products on current page
      currentPageProductIds.forEach(id => newSelected.add(id));
    }
    
    setSelectedProducts(newSelected);
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

  // Handle price change and max discount change
  const handlePriceChange = (productId: string, newPrice: number) => {
    setProductPrices(prev => ({
      ...prev,
      [productId]: newPrice
    }));
    setHasChanges(true);
  };

  const handleMaxDiscountChange = (productId: string, newMaxDiscount: number) => {
    setProductMaxDiscounts(prev => ({
      ...prev,
      [productId]: newMaxDiscount
    }));
    setHasChanges(true);
  };

  // Handle bulk pricing changes
  const handleBulkPricingChanges = (changes: BulkPricingChanges) => {
    const newPrices = { ...productPrices };
    const newMaxDiscounts = { ...productMaxDiscounts };

    changes.selectedProducts.forEach(productId => {
      const product = products.find(p => p.id === productId);
      if (!product) return;

      if (changes.priceChanges) {
        const { mode, value } = changes.priceChanges;
        if (mode === 'percentage') {
          const markup = product.cost * (value / 100);
          newPrices[productId] = product.cost + markup;
        } else if (mode === 'fixed') {
          newPrices[productId] = product.cost + value;
        } else if (mode === 'absolute') {
          newPrices[productId] = value;
        }
      }

      if (changes.maxDiscountChange !== undefined && changes.maxDiscountChange >= 0) {
        newMaxDiscounts[productId] = changes.maxDiscountChange;
      }
    });

    setProductPrices(newPrices);
    setProductMaxDiscounts(newMaxDiscounts);
    setHasChanges(true);
    toast("Preços atualizados", {
      description: `Preços de ${changes.selectedProducts.length} produtos atualizados em massa.`
    });
  };

  // Get price changes for confirmation
  const getPriceChanges = (): PriceChange[] => {
    const changes: PriceChange[] = [];
    for (const productId of Object.keys(productPrices)) {
      const product = products.find(p => p.id === productId);
      if (!product) continue;

      const oldPrice = product.price || 0;
      const newPrice = productPrices[productId];
      const oldMaxDiscount = product.maxDiscountPercent || 0;
      const newMaxDiscount = productMaxDiscounts[productId] || 0;

      if (oldPrice !== newPrice || oldMaxDiscount !== newMaxDiscount) {
        changes.push({
          product,
          oldPrice,
          newPrice,
          oldMaxDiscount,
          newMaxDiscount
        });
      }
    }
    return changes;
  };

  // Show confirmation dialog before saving
  const initiateRiseSave = () => {
    if (!hasChanges) return;
    
    const changes = getPriceChanges();
    if (changes.length === 0) {
      toast("Nenhuma alteração", {
        description: "Não há alterações para salvar."
      });
      return;
    }

    setShowConfirmation(true);
  };

  // Enhanced save function with batch processing
  const saveAllPrices = async (forceOverride = false) => {
    if (!hasChanges) return;

    const changes = getPriceChanges();
    if (changes.length === 0) return;

    // Validate prices if not forcing override
    if (!forceOverride) {
      const issues = validatePriceChanges();
      if (issues.length > 0) {
        setPendingSave({ issues });
        setShowOverrideDialog(true);
        return;
      }
    }

    setShowConfirmation(false);
    setShowProgress(true);
    setSaveProgress(0);
    setSaveTotal(changes.length);
    setSaveErrors([]);
    setProductStatuses({});

    try {
      console.log(`🔄 [ProductPricing] Starting batch update for ${changes.length} products`);
      console.log(`📋 [ProductPricing] Changes to save:`, changes.map(c => ({
        id: c.product.id,
        name: c.product.name,
        oldPrice: c.oldPrice,
        newPrice: c.newPrice,
        oldMaxDiscount: c.oldMaxDiscount,
        newMaxDiscount: c.newMaxDiscount
      })));
      
      // Prepare batch updates - always include both fields if changed
      const updates = changes.map(change => {
        const updateData: Partial<{ price: number; maxDiscountPercent: number }> = {};
        
        if (change.oldPrice !== change.newPrice) {
          updateData.price = change.newPrice;
        }
        if (change.oldMaxDiscount !== change.newMaxDiscount) {
          updateData.maxDiscountPercent = change.newMaxDiscount;
        }
        
        console.log(`📝 [ProductPricing] Update for ${change.product.name}:`, updateData);
        
        return {
          id: change.product.id,
          data: updateData
        };
      });
      
      console.log(`📦 [ProductPricing] Final updates payload:`, updates);

      // Progress handler
      const handleProgress = (progress: number, currentProduct?: string) => {
        setSaveProgress(Math.ceil((progress / 100) * changes.length));
        if (currentProduct) {
          setCurrentSaving(currentProduct);
        }
      };

      // Set all products to saving status
      const initialStatuses: Record<string, ProductStatus> = {};
      changes.forEach(change => {
        initialStatuses[change.product.id] = 'saving';
      });
      setProductStatuses(initialStatuses);

      // Execute batch update
      const result = await batchUpdateProducts(updates, handleProgress);
      
      console.log(`📊 [ProductPricing] Batch update completed:`, result);

      // Update product statuses based on results
      const finalStatuses: Record<string, ProductStatus> = {};
      changes.forEach(change => {
        finalStatuses[change.product.id] = 'saved';
      });
      
      // Mark failed products as error
      result.failed.forEach(errorMsg => {
        const productName = errorMsg.split(':')[0];
        const failedProduct = changes.find(c => c.product.name === productName);
        if (failedProduct) {
          finalStatuses[failedProduct.product.id] = 'error';
        }
      });
      
      setProductStatuses(finalStatuses);
      setSaveErrors(result.failed);

      // Show completion for a moment
      await new Promise(resolve => setTimeout(resolve, 1500));

      if (result.success > 0) {
        toast("Preços salvos", {
          description: result.failed.length > 0 
            ? `${result.success} produtos salvos com sucesso. ${result.failed.length} com problemas.`
            : `${result.success} produtos salvos com sucesso.`
        });
        setHasChanges(false);
        
        // Clear statuses after delay
        setTimeout(() => {
          setProductStatuses({});
        }, 3000);
      }

    } catch (error) {
      console.error("❌ [ProductPricing] Error in batch save:", error);
      toast("Erro ao salvar", {
        description: "Ocorreu um erro geral ao salvar os preços.",
        style: {
          backgroundColor: 'rgb(239, 68, 68)',
          color: 'white'
        }
      });
    } finally {
      setShowProgress(false);
      setShowOverrideDialog(false);
      setPendingSave(null);
      setCurrentSaving('');
    }
  };

  // Validate price changes
  const validatePriceChanges = () => {
    const issues = [];
    for (const productId of Object.keys(productPrices)) {
      const product = products.find(p => p.id === productId);
      if (!product) continue;
      const currentPrice = productPrices[productId];
      const maxDiscount = productMaxDiscounts[productId] || 0;
      const minimumPrice = calculateMinimumPrice(currentPrice, maxDiscount);

      if (currentPrice < product.cost) {
        issues.push({
          product,
          issue: 'price_below_cost',
          currentPrice,
          cost: product.cost
        });
      }
    }
    return issues;
  };

  // Format price input
  const formatPriceInput = (value: string): number => {
    const numericValue = value.replace(/\D/g, '');
    return parseFloat(numericValue) / 100 || 0;
  };

  // Check if all products on current page are selected
  const currentPageProductIds = currentProducts.map(product => product.id);
  const currentPageSelected = currentPageProductIds.filter(id => selectedProducts.has(id));
  const isCurrentPageFullySelected = currentPageProductIds.length > 0 && currentPageSelected.length === currentPageProductIds.length;

  // Render pagination links
  const renderPaginationLinks = () => {
    const links = [];
    const maxLinksToShow = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxLinksToShow / 2));
    let endPage = Math.min(totalPages, startPage + maxLinksToShow - 1);

    if (endPage - startPage + 1 < maxLinksToShow) {
      startPage = Math.max(1, endPage - maxLinksToShow + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      links.push(
        <PaginationItem key={i}>
          <PaginationLink
            onClick={() => handlePageChange(i)}
            isActive={currentPage === i}
            className="cursor-pointer"
          >
            {i}
          </PaginationLink>
        </PaginationItem>
      );
    }

    return links;
  };

  return <>
      <Card className="w-full">
        <CardHeader>
          <div className="flex justify-between items-center">
            <Button onClick={() => setBulkPricingOpen(true)} className="bg-green-600 hover:bg-green-700">
              <Calculator className="mr-2 h-4 w-4" />
              Precificação em Massa
            </Button>
          </div>
          <CardTitle>Precificação de Produtos</CardTitle>
          <CardDescription>
            Configure os preços de venda e limites de desconto dos seus produtos ({products.length} produtos carregados)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Search and filters */}
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input placeholder="Buscar produtos..." className="pl-8" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
                </div>
              </div>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Categoria" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas Categorias</SelectItem>
                  {productCategories.map(category => <SelectItem key={category.id} value={category.id}>{category.name}</SelectItem>)}
                </SelectContent>
              </Select>
              <Select value={selectedGroup} onValueChange={setSelectedGroup}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Grupo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos Grupos</SelectItem>
                  {productGroups.map(group => <SelectItem key={group.id} value={group.id}>{group.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            {/* Pagination controls - Top */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="text-sm text-muted-foreground">Itens por página:</span>
                <Select value={itemsPerPage.toString()} onValueChange={handleItemsPerPageChange}>
                  <SelectTrigger className="w-20">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="10">10</SelectItem>
                    <SelectItem value="25">25</SelectItem>
                    <SelectItem value="50">50</SelectItem>
                    <SelectItem value="100">100</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="text-sm text-muted-foreground">
                Mostrando {startIndex + 1} a {Math.min(endIndex, totalItems)} de {totalItems} produtos
                {selectedProducts.size > 0 && ` (${selectedProducts.size} selecionados)`}
              </div>
            </div>
            
            {/* Products table with enhanced visual feedback */}
            <div>
              {isLoadingProducts ? <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin" />
                  <span className="ml-2">Carregando produtos...</span>
                </div> : <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12">
                        <Checkbox 
                          checked={isCurrentPageFullySelected} 
                          onCheckedChange={handleSelectAll} 
                          aria-label="Selecionar todos da página" 
                        />
                      </TableHead>
                      <TableHead className="w-20">Código</TableHead>
                      <TableHead>Nome</TableHead>
                      <TableHead className="w-32">Custo</TableHead>
                      <TableHead className="w-32">Preço Venda</TableHead>
                      <TableHead className="w-32">% Máx Desc</TableHead>
                      <TableHead className="w-32">Preço Mín</TableHead>
                      <TableHead className="w-32">Markup %</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {currentProducts.length === 0 ? <TableRow>
                        <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                          {filteredProducts.length === 0 ? 
                            (products.length === 0 ? 'Nenhum produto cadastrado' : 'Nenhum produto encontrado com os filtros aplicados') :
                            'Nenhum produto nesta página'
                          }
                        </TableCell>
                      </TableRow> : currentProducts.map(product => {
                  const currentPrice = productPrices[product.id] || 0;
                  const maxDiscount = productMaxDiscounts[product.id] || 0;
                  const minimumPrice = calculateMinimumPrice(currentPrice, maxDiscount);
                  const markup = calculateMarkup(product.cost, currentPrice);
                  const status = productStatuses[product.id] || 'none';
                  
                  return <TableRow key={product.id} className="relative">
                            <ProductRowIndicator status={status} />
                            <TableCell>
                              <Checkbox checked={selectedProducts.has(product.id)} onCheckedChange={() => handleSelectProduct(product.id)} aria-label={`Selecionar ${product.name}`} />
                            </TableCell>
                            <TableCell>{product.code}</TableCell>
                            <TableCell>{product.name}</TableCell>
                            <TableCell>{formatCurrency(product.cost)}</TableCell>
                            <TableCell>
                              <Input value={formatCurrency(currentPrice)} onChange={e => {
                        const newPrice = formatPriceInput(e.target.value);
                        handlePriceChange(product.id, newPrice);
                      }} className="w-24" />
                            </TableCell>
                            <TableCell>
                              <Input type="number" value={maxDiscount || ''} onChange={e => {
                        const newMaxDiscount = parseFloat(e.target.value) || 0;
                        handleMaxDiscountChange(product.id, newMaxDiscount);
                      }} className="w-20" min="0" max="100" step="0.1" />
                            </TableCell>
                            <TableCell className="text-sm text-gray-600">
                              {formatCurrency(minimumPrice)}
                            </TableCell>
                            <TableCell>
                              <span className={`font-medium ${markup >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                {markup.toFixed(1)}%
                              </span>
                            </TableCell>
                          </TableRow>;
                })}
                  </TableBody>
                </Table>}
            </div>

            {/* Pagination controls - Bottom */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center space-x-2">
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious 
                        onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                        className={currentPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                      />
                    </PaginationItem>
                    {renderPaginationLinks()}
                    <PaginationItem>
                      <PaginationNext 
                        onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                        className={currentPage === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            )}

            {/* Enhanced save button */}
            <div className="flex justify-end mt-4">
              <Button onClick={initiateRiseSave} disabled={isLoading || !hasChanges} className="bg-blue-600 hover:bg-blue-700">
                {isLoading ? <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Salvando...
                  </> : <>
                    <Save className="mr-2 h-4 w-4" />
                    Salvar Preços
                  </>}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Enhanced confirmation dialogs */}
      <SaveConfirmationDialog
        open={showConfirmation}
        onOpenChange={setShowConfirmation}
        priceChanges={getPriceChanges()}
        onConfirm={() => saveAllPrices(false)}
      />

      <SaveProgressDialog
        open={showProgress}
        progress={saveProgress}
        total={saveTotal}
        currentProduct={currentSaving}
        errors={saveErrors}
        isComplete={saveProgress === saveTotal && saveTotal > 0}
      />

      {/* Bulk Pricing Modal */}
      <BulkPricingModal open={bulkPricingOpen} onOpenChange={setBulkPricingOpen} products={products} productCategories={productCategories} productGroups={productGroups} onApplyChanges={handleBulkPricingChanges} />

      {/* Override Dialog */}
      <AlertDialog open={showOverrideDialog} onOpenChange={setShowOverrideDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center">
              Preços com Problemas
            </AlertDialogTitle>
            <AlertDialogDescription>
              {pendingSave?.issues?.length} produto(s) têm problemas de precificação:
              <div className="mt-2 space-y-1">
                {pendingSave?.issues?.slice(0, 5).map((item: any) => <div key={item.product.id} className="text-sm">
                    <strong>{item.product.name}</strong>: {formatCurrency(item.currentPrice)}
                    {item.issue === 'price_below_cost' && ` (custo: ${formatCurrency(item.cost)})`}
                  </div>)}
                {pendingSave?.issues?.length > 5 && <div className="text-sm text-muted-foreground">
                    ...e mais {pendingSave.issues.length - 5} produto(s)
                  </div>}
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
    </>;
};

export default ProductPricing;
