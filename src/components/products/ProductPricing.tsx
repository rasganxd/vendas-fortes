
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
import { ArrowLeft, Loader2, Save, Search, Calculator } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import BulkPricingModal from './pricing/BulkPricingModal';

interface BulkPricingChanges {
  selectedProducts: string[];
  priceChanges?: {
    mode: 'percentage' | 'fixed' | 'absolute';
    value: number;
  };
}

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
  const [productPrices, setProductPrices] = useState<Record<string, number>>({});
  const [hasChanges, setHasChanges] = useState(false);
  const [bulkPricingOpen, setBulkPricingOpen] = useState(false);

  // Initialize product prices from products
  useEffect(() => {
    const initialPrices: Record<string, number> = {};
    
    products.forEach(product => {
      initialPrices[product.id] = product.price || 0;
    });
    
    setProductPrices(initialPrices);
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

  const calculateMarkup = (cost: number, price: number): number => {
    if (cost === 0) return 0;
    return ((price - cost) / cost) * 100;
  };

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

  const handleBulkPricingChanges = (changes: BulkPricingChanges) => {
    const newPrices = { ...productPrices };
    
    changes.selectedProducts.forEach(productId => {
      const product = products.find(p => p.id === productId);
      if (!product) return;
      
      // Apply price changes
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
    });

    setProductPrices(newPrices);
    setHasChanges(true);
    
    toast("Preços atualizados", {
      description: `Preços de ${changes.selectedProducts.length} produtos atualizados em massa.`
    });
  };

  const saveAllPrices = async () => {
    if (!hasChanges) return;
    
    setIsLoading(true);
    
    try {
      const updates = [];
      
      for (const productId of Object.keys(productPrices)) {
        const product = products.find(p => p.id === productId);
        if (!product) continue;
        
        if (product.price !== productPrices[productId]) {
          updates.push({
            id: productId,
            updates: { price: productPrices[productId] }
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
    }
  };

  const formatPriceInput = (value: string): number => {
    const numericValue = value.replace(/\D/g, '');
    return parseFloat(numericValue) / 100 || 0;
  };

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
            <Button 
              onClick={() => setBulkPricingOpen(true)}
              className="bg-green-600 hover:bg-green-700"
            >
              <Calculator className="mr-2 h-4 w-4" />
              Precificação em Massa
            </Button>
          </div>
          <CardTitle>Precificação de Produtos</CardTitle>
          <CardDescription>
            Configure os preços de venda dos seus produtos ({products.length} produtos carregados)
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
                      <TableHead className="w-32">Preço de Venda</TableHead>
                      <TableHead className="w-32">Markup %</TableHead>
                      <TableHead className="w-24">Desc. Máx</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredProducts.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                          {products.length === 0 ? 'Nenhum produto cadastrado' : 'Nenhum produto encontrado com os filtros aplicados'}
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredProducts.map((product) => {
                        const currentPrice = productPrices[product.id] || 0;
                        const markup = calculateMarkup(product.cost, currentPrice);
                        
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
                                value={formatCurrency(currentPrice)}
                                onChange={(e) => {
                                  const newPrice = formatPriceInput(e.target.value);
                                  handlePriceChange(product.id, newPrice);
                                }}
                                className="w-24"
                              />
                            </TableCell>
                            <TableCell>
                              <span className={`font-medium ${markup >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                {markup.toFixed(1)}%
                              </span>
                            </TableCell>
                            <TableCell>
                              <span className="text-sm text-gray-600">
                                {product.maxDiscountPercentage ? `${product.maxDiscountPercentage}%` : '-'}
                              </span>
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
                onClick={saveAllPrices}
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

      {/* Bulk Pricing Modal */}
      <BulkPricingModal
        open={bulkPricingOpen}
        onOpenChange={setBulkPricingOpen}
        products={products}
        productCategories={productCategories}
        productGroups={productGroups}
        onApplyChanges={handleBulkPricingChanges}
      />
    </>
  );
};

export default ProductPricing;
