
import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import { useAppContext } from '@/hooks/useAppContext';

export type ListingType = 'customers' | 'products' | 'orders' | 'sales_reps';

interface ListingFiltersProps {
  selectedType: ListingType;
  onTypeChange: (type: ListingType) => void;
  filters: Record<string, any>;
  onFiltersChange: (filters: Record<string, any>) => void;
  orderBy: string;
  onOrderByChange: (field: string) => void;
  orderDirection: 'asc' | 'desc';
  onOrderDirectionChange: (direction: 'asc' | 'desc') => void;
}

export default function ListingFilters({
  selectedType,
  onTypeChange,
  filters,
  onFiltersChange,
  orderBy,
  onOrderByChange,
  orderDirection,
  onOrderDirectionChange
}: ListingFiltersProps) {
  const { salesReps, productGroups, productCategories, productBrands } = useAppContext();

  const updateFilter = (key: string, value: any) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const clearFilters = () => {
    onFiltersChange({});
  };

  const renderCustomerFilters = () => (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div>
        <Label>Vendedor</Label>
        <Select value={filters.salesRepId || ''} onValueChange={(value) => updateFilter('salesRepId', value === 'all' ? '' : value)}>
          <SelectTrigger>
            <SelectValue placeholder="Todos os vendedores" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os vendedores</SelectItem>
            {salesReps.map(rep => (
              <SelectItem key={rep.id} value={rep.id}>{rep.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label>Dia da Semana</Label>
        <Select value={filters.visitDay || ''} onValueChange={(value) => updateFilter('visitDay', value === 'all' ? '' : value)}>
          <SelectTrigger>
            <SelectValue placeholder="Todos os dias" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os dias</SelectItem>
            <SelectItem value="monday">Segunda-feira</SelectItem>
            <SelectItem value="tuesday">Terça-feira</SelectItem>
            <SelectItem value="wednesday">Quarta-feira</SelectItem>
            <SelectItem value="thursday">Quinta-feira</SelectItem>
            <SelectItem value="friday">Sexta-feira</SelectItem>
            <SelectItem value="saturday">Sábado</SelectItem>
            <SelectItem value="sunday">Domingo</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label>Cidade</Label>
        <Input
          placeholder="Filtrar por cidade"
          value={filters.city || ''}
          onChange={(e) => updateFilter('city', e.target.value)}
        />
      </div>

      <div className="flex items-center space-x-2">
        <Checkbox
          id="activeOnly"
          checked={filters.activeOnly || false}
          onCheckedChange={(checked) => updateFilter('activeOnly', checked)}
        />
        <Label htmlFor="activeOnly">Apenas clientes ativos</Label>
      </div>
    </div>
  );

  const renderProductFilters = () => (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div>
        <Label>Categoria</Label>
        <Select value={filters.categoryId || ''} onValueChange={(value) => updateFilter('categoryId', value === 'all' ? '' : value)}>
          <SelectTrigger>
            <SelectValue placeholder="Todas as categorias" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas as categorias</SelectItem>
            {productCategories.map(cat => (
              <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label>Grupo</Label>
        <Select value={filters.groupId || ''} onValueChange={(value) => updateFilter('groupId', value === 'all' ? '' : value)}>
          <SelectTrigger>
            <SelectValue placeholder="Todos os grupos" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os grupos</SelectItem>
            {productGroups.map(group => (
              <SelectItem key={group.id} value={group.id}>{group.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label>Marca</Label>
        <Select value={filters.brandId || ''} onValueChange={(value) => updateFilter('brandId', value === 'all' ? '' : value)}>
          <SelectTrigger>
            <SelectValue placeholder="Todas as marcas" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas as marcas</SelectItem>
            {productBrands.map(brand => (
              <SelectItem key={brand.id} value={brand.id}>{brand.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center space-x-2">
        <Checkbox
          id="activeProducts"
          checked={filters.activeOnly || false}
          onCheckedChange={(checked) => updateFilter('activeOnly', checked)}
        />
        <Label htmlFor="activeProducts">Apenas produtos ativos</Label>
      </div>

      <div className="flex items-center space-x-2">
        <Checkbox
          id="withStock"
          checked={filters.withStock || false}
          onCheckedChange={(checked) => updateFilter('withStock', checked)}
        />
        <Label htmlFor="withStock">Apenas com estoque</Label>
      </div>
    </div>
  );

  const renderOrderFilters = () => (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div>
        <Label>Status</Label>
        <Select value={filters.status || ''} onValueChange={(value) => updateFilter('status', value === 'all' ? '' : value)}>
          <SelectTrigger>
            <SelectValue placeholder="Todos os status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os status</SelectItem>
            <SelectItem value="pending">Pendente</SelectItem>
            <SelectItem value="confirmed">Confirmado</SelectItem>
            <SelectItem value="processing">Em Processamento</SelectItem>
            <SelectItem value="completed">Concluído</SelectItem>
            <SelectItem value="canceled">Cancelado</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label>Vendedor</Label>
        <Select value={filters.salesRepId || ''} onValueChange={(value) => updateFilter('salesRepId', value === 'all' ? '' : value)}>
          <SelectTrigger>
            <SelectValue placeholder="Todos os vendedores" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os vendedores</SelectItem>
            {salesReps.map(rep => (
              <SelectItem key={rep.id} value={rep.id}>{rep.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label>Data Inicial</Label>
        <Input
          type="date"
          value={filters.startDate || ''}
          onChange={(e) => updateFilter('startDate', e.target.value)}
        />
      </div>

      <div>
        <Label>Data Final</Label>
        <Input
          type="date"
          value={filters.endDate || ''}
          onChange={(e) => updateFilter('endDate', e.target.value)}
        />
      </div>
    </div>
  );

  const getOrderByOptions = () => {
    switch (selectedType) {
      case 'customers':
        return [
          { value: 'name', label: 'Nome' },
          { value: 'code', label: 'Código' },
          { value: 'city', label: 'Cidade' },
          { value: 'visitSequence', label: 'Sequência de Visita' },
          { value: 'createdAt', label: 'Data de Cadastro' }
        ];
      case 'products':
        return [
          { value: 'name', label: 'Nome' },
          { value: 'code', label: 'Código' },
          { value: 'sale_price', label: 'Preço' },
          { value: 'stock', label: 'Estoque' },
          { value: 'createdAt', label: 'Data de Cadastro' }
        ];
      case 'orders':
        return [
          { value: 'code', label: 'Código' },
          { value: 'date', label: 'Data' },
          { value: 'customerName', label: 'Cliente' },
          { value: 'total', label: 'Valor Total' },
          { value: 'status', label: 'Status' }
        ];
      case 'sales_reps':
        return [
          { value: 'name', label: 'Nome' },
          { value: 'code', label: 'Código' },
          { value: 'createdAt', label: 'Data de Cadastro' }
        ];
      default:
        return [];
    }
  };

  return (
    <div className="space-y-6">
      {/* Seleção do Tipo */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label>Tipo de Listagem</Label>
          <Select value={selectedType} onValueChange={onTypeChange}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="customers">Clientes</SelectItem>
              <SelectItem value="products">Produtos</SelectItem>
              <SelectItem value="orders">Pedidos</SelectItem>
              <SelectItem value="sales_reps">Vendedores</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-end">
          <Button 
            variant="outline" 
            onClick={clearFilters}
            className="flex items-center gap-2"
          >
            <X className="h-4 w-4" />
            Limpar Filtros
          </Button>
        </div>
      </div>

      {/* Filtros Específicos */}
      <div>
        <Label className="text-base font-semibold">Filtros</Label>
        <div className="mt-2">
          {selectedType === 'customers' && renderCustomerFilters()}
          {selectedType === 'products' && renderProductFilters()}
          {selectedType === 'orders' && renderOrderFilters()}
          {selectedType === 'sales_reps' && (
            <div className="text-gray-500">Nenhum filtro específico disponível para vendedores.</div>
          )}
        </div>
      </div>

      {/* Ordenação */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label>Ordenar por</Label>
          <Select value={orderBy} onValueChange={onOrderByChange}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione o campo" />
            </SelectTrigger>
            <SelectContent>
              {getOrderByOptions().map(option => (
                <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label>Direção</Label>
          <Select value={orderDirection} onValueChange={onOrderDirectionChange}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="asc">Crescente</SelectItem>
              <SelectItem value="desc">Decrescente</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}
