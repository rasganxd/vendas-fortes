
import React from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { X } from 'lucide-react';
import { ProductCategory, ProductGroup, ProductBrand } from '@/types';

interface ProductFiltersProps {
  categories: ProductCategory[];
  groups: ProductGroup[];
  brands: ProductBrand[];
  selectedCategory?: string;
  selectedGroup?: string;
  selectedBrand?: string;
  onCategoryChange: (categoryId?: string) => void;
  onGroupChange: (groupId?: string) => void;
  onBrandChange: (brandId?: string) => void;
  onClearFilters: () => void;
}

const ProductFilters: React.FC<ProductFiltersProps> = ({
  categories,
  groups,
  brands,
  selectedCategory,
  selectedGroup,
  selectedBrand,
  onCategoryChange,
  onGroupChange,
  onBrandChange,
  onClearFilters
}) => {
  const hasActiveFilters = selectedCategory || selectedGroup || selectedBrand;

  return (
    <div className="flex flex-wrap items-center gap-4 p-4 bg-gray-50 rounded-lg border">
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium text-gray-700">Filtrar por:</span>
      </div>
      
      <Select value={selectedCategory || ""} onValueChange={(value) => onCategoryChange(value || undefined)}>
        <SelectTrigger className="w-40">
          <SelectValue placeholder="Categoria" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="">Todas as categorias</SelectItem>
          {categories.map((category) => (
            <SelectItem key={category.id} value={category.id}>
              {category.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={selectedGroup || ""} onValueChange={(value) => onGroupChange(value || undefined)}>
        <SelectTrigger className="w-40">
          <SelectValue placeholder="Grupo" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="">Todos os grupos</SelectItem>
          {groups.map((group) => (
            <SelectItem key={group.id} value={group.id}>
              {group.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={selectedBrand || ""} onValueChange={(value) => onBrandChange(value || undefined)}>
        <SelectTrigger className="w-40">
          <SelectValue placeholder="Marca" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="">Todas as marcas</SelectItem>
          {brands.map((brand) => (
            <SelectItem key={brand.id} value={brand.id}>
              {brand.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {hasActiveFilters && (
        <Button variant="outline" size="sm" onClick={onClearFilters}>
          <X className="h-4 w-4 mr-1" />
          Limpar filtros
        </Button>
      )}

      {/* Active filters display */}
      <div className="flex flex-wrap gap-2 ml-auto">
        {selectedCategory && (
          <Badge variant="secondary" className="bg-blue-100 text-blue-800">
            {categories.find(c => c.id === selectedCategory)?.name}
            <X 
              className="h-3 w-3 ml-1 cursor-pointer" 
              onClick={() => onCategoryChange(undefined)} 
            />
          </Badge>
        )}
        {selectedGroup && (
          <Badge variant="secondary" className="bg-green-100 text-green-800">
            {groups.find(g => g.id === selectedGroup)?.name}
            <X 
              className="h-3 w-3 ml-1 cursor-pointer" 
              onClick={() => onGroupChange(undefined)} 
            />
          </Badge>
        )}
        {selectedBrand && (
          <Badge variant="secondary" className="bg-purple-100 text-purple-800">
            {brands.find(b => b.id === selectedBrand)?.name}
            <X 
              className="h-3 w-3 ml-1 cursor-pointer" 
              onClick={() => onBrandChange(undefined)} 
            />
          </Badge>
        )}
      </div>
    </div>
  );
};

export default ProductFilters;
