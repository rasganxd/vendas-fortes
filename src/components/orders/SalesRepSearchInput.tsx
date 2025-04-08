
import React, { useState } from 'react';
import { SalesRep } from '@/types';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, X } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { 
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList
} from "@/components/ui/command";

interface SalesRepSearchInputProps {
  salesReps: SalesRep[];
  selectedSalesRep: SalesRep | null;
  setSelectedSalesRep: (salesRep: SalesRep | null) => void;
}

export default function SalesRepSearchInput({
  salesReps,
  selectedSalesRep,
  setSelectedSalesRep
}: SalesRepSearchInputProps) {
  const [salesRepInput, setSalesRepInput] = useState('');
  const [isSalesRepSearchOpen, setIsSalesRepSearchOpen] = useState(false);
  const [salesRepSearch, setSalesRepSearch] = useState('');

  const filteredSalesReps = salesReps.filter(rep => 
    rep.name.toLowerCase().includes(salesRepSearch.toLowerCase()) ||
    rep.code?.toString().includes(salesRepSearch)
  );

  const findSalesRepByCode = (code: string) => {
    const foundSalesRep = salesReps.find(r => r.code && r.code.toString() === code);
    if (foundSalesRep) {
      setSelectedSalesRep(foundSalesRep);
      setSalesRepInput(`${foundSalesRep.code} - ${foundSalesRep.name}`);
      return true;
    }
    return false;
  };

  const handleSalesRepInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSalesRepInput(value);
    
    // Check if input is just a code number
    const codeMatch = value.match(/^(\d+)$/);
    if (codeMatch) {
      findSalesRepByCode(codeMatch[1]);
    } else if (!value) {
      setSelectedSalesRep(null);
    }
  };

  return (
    <>
      <div className="space-y-2">
        <Label htmlFor="salesRep">Vendedor</Label>
        <div className="flex items-center gap-2">
          <Input
            type="text"
            id="salesRep"
            placeholder="Digite o código do vendedor"
            value={salesRepInput}
            onChange={handleSalesRepInputChange}
            className="w-full"
          />
          <Button 
            type="button" 
            variant="outline" 
            size="icon" 
            onClick={() => setIsSalesRepSearchOpen(true)}
            className="shrink-0"
          >
            <Search size={18} />
          </Button>
          {selectedSalesRep && (
            <Button 
              type="button" 
              variant="ghost" 
              size="icon" 
              onClick={() => {
                setSelectedSalesRep(null);
                setSalesRepInput('');
              }}
              className="shrink-0"
            >
              <X size={18} />
            </Button>
          )}
        </div>
      </div>

      {/* SalesRep Search Dialog */}
      <Dialog open={isSalesRepSearchOpen} onOpenChange={setIsSalesRepSearchOpen}>
        <DialogContent className="sm:max-w-md">
          <Command className="rounded-lg border shadow-md">
            <CommandInput 
              placeholder="Buscar vendedor por código ou nome..." 
              value={salesRepSearch}
              onValueChange={setSalesRepSearch}
              className="h-9"
            />
            <CommandList>
              <CommandEmpty>Nenhum vendedor encontrado.</CommandEmpty>
              <CommandGroup heading="Vendedores">
                {filteredSalesReps.map((salesRep) => (
                  <CommandItem
                    key={salesRep.id}
                    value={salesRep.id}
                    onSelect={() => {
                      setSelectedSalesRep(salesRep);
                      setSalesRepInput(`${salesRep.code} - ${salesRep.name}`);
                      setIsSalesRepSearchOpen(false);
                      setSalesRepSearch('');
                    }}
                    className="cursor-pointer"
                  >
                    <span className="font-medium mr-2">{salesRep.code}</span>
                    <span>{salesRep.name}</span>
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </DialogContent>
      </Dialog>
    </>
  );
}
