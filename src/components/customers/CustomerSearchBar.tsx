
import React from 'react';
import { Search, Plus } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SalesRep } from '@/types';

interface CustomerSearchBarProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  sortBy: string;
  setSortBy: (value: string) => void;
  onAddCustomer: () => void;
  salesReps: SalesRep[];
  selectedSalesRep: string;
  onSalesRepChange: (value: string) => void;
}

const CustomerSearchBar: React.FC<CustomerSearchBarProps> = ({
  searchTerm,
  setSearchTerm,
  sortBy,
  setSortBy,
  onAddCustomer,
  salesReps,
  selectedSalesRep,
  onSalesRepChange
}) => {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
      <div className="relative w-full sm:w-64 md:w-80">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
        <Input
          type="text"
          placeholder="Buscar clientes..."
          className="pl-8"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
        <Select onValueChange={onSalesRepChange} value={selectedSalesRep}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Filtrar por vendedor" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os vendedores</SelectItem>
            {salesReps?.map(rep => (
              <SelectItem key={rep.id} value={rep.id}>{rep.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select onValueChange={setSortBy} value={sortBy}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Ordenar por" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="name">Nome (A-Z)</SelectItem>
            <SelectItem value="code">Código</SelectItem>
            <SelectItem value="salesRep">Vendedor</SelectItem>
            <SelectItem value="visitFrequency">Frequência de Visita</SelectItem>
          </SelectContent>
        </Select>
        
        <Button 
          className="bg-blue-600 hover:bg-blue-700 w-full sm:w-auto"
          onClick={onAddCustomer}
        >
          <Plus size={16} className="mr-2" />
          Adicionar Cliente
        </Button>
      </div>
    </div>
  );
};

export default CustomerSearchBar;
