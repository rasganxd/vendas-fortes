
import React, { useState, KeyboardEvent, useEffect } from 'react';
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
import { getSalesRepByCode } from '@/services/supabase/salesRepService';

interface SalesRepSearchInputProps {
  salesReps: SalesRep[];
  selectedSalesRep: SalesRep | null;
  setSelectedSalesRep: (salesRep: SalesRep | null) => void;
  inputRef?: React.RefObject<HTMLInputElement>;
  onEnterPress?: () => void;
  compact?: boolean;
  initialInputValue?: string;
}

// Cache for filtered sales reps results
const filteredSalesRepsCache = new Map<string, SalesRep[]>();

export default function SalesRepSearchInput({
  salesReps,
  selectedSalesRep,
  setSelectedSalesRep,
  inputRef,
  onEnterPress,
  compact = false,
  initialInputValue = ''
}: SalesRepSearchInputProps) {
  const [salesRepInput, setSalesRepInput] = useState(initialInputValue);
  const [isSalesRepSearchOpen, setIsSalesRepSearchOpen] = useState(false);
  const [salesRepSearch, setSalesRepSearch] = useState('');

  // Set initial value if selected sales rep changes or initialInputValue is provided
  useEffect(() => {
    if (selectedSalesRep) {
      setSalesRepInput(`${selectedSalesRep.code} - ${selectedSalesRep.name}`);
    } else if (initialInputValue) {
      setSalesRepInput(initialInputValue);
    }
  }, [selectedSalesRep, initialInputValue]);

  // Optimized sales rep filtering with caching
  const getFilteredSalesReps = () => {
    if (!salesRepSearch) return salesReps;
    
    // Check cache first
    const cacheKey = salesRepSearch.toLowerCase();
    if (filteredSalesRepsCache.has(cacheKey)) {
      return filteredSalesRepsCache.get(cacheKey) || [];
    }
    
    // Filter sales reps by name or code
    const filtered = salesReps.filter(rep => 
      rep.name.toLowerCase().includes(salesRepSearch.toLowerCase()) ||
      (rep.code !== undefined && rep.code.toString().includes(salesRepSearch))
    );
    
    // Store in cache (limit cache size)
    if (filteredSalesRepsCache.size > 50) {
      const firstKey = filteredSalesRepsCache.keys().next().value;
      filteredSalesRepsCache.delete(firstKey);
    }
    filteredSalesRepsCache.set(cacheKey, filtered);
    
    return filtered;
  };

  const filteredSalesReps = getFilteredSalesReps();

  // Find a sales rep by exact code match with optimized logic
  const findSalesRepByCode = async (codeStr: string) => {
    // Convert input to number for comparison
    const codeNum = parseInt(codeStr, 10);
    
    // Check for NaN after parseInt
    if (isNaN(codeNum)) return false;
    
    // First check local list
    const foundSalesRep = salesReps.find(r => r.code === codeNum);
    
    if (foundSalesRep) {
      setSelectedSalesRep(foundSalesRep);
      setSalesRepInput(`${foundSalesRep.code} - ${foundSalesRep.name}`);
      return true;
    } else {
      // If not found locally, try fetching from API
      try {
        const apiSalesRep = await getSalesRepByCode(codeNum);
        if (apiSalesRep) {
          setSelectedSalesRep(apiSalesRep);
          setSalesRepInput(`${apiSalesRep.code} - ${apiSalesRep.name}`);
          return true;
        }
      } catch (error) {
        // Handle silently, will return false below
      }
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

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && onEnterPress) {
      e.preventDefault();
      
      // If we have a valid number but haven't selected a sales rep yet, try to find one
      const codeMatch = salesRepInput.match(/^(\d+)$/);
      if (codeMatch && !selectedSalesRep) {
        findSalesRepByCode(codeMatch[1]).then(found => {
          if (found && onEnterPress) {
            // Move to next field if found
            onEnterPress();
          } else if (!found) {
            setIsSalesRepSearchOpen(true);
          }
        });
        return;
      }
      
      if (selectedSalesRep) {
        onEnterPress();
      } else {
        setIsSalesRepSearchOpen(true);
      }
    }
  };

  return (
    <>
      <div className="space-y-2">
        <Label htmlFor="salesRep">
          Vendedor
        </Label>
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Input
              type="text"
              id="salesRep"
              placeholder="Digite o código do vendedor"
              value={salesRepInput}
              onChange={handleSalesRepInputChange}
              onKeyDown={handleKeyDown}
              ref={inputRef}
              className="w-full pr-10"
            />
            {selectedSalesRep && (
              <Button 
                type="button" 
                variant="ghost" 
                size="icon" 
                onClick={() => {
                  setSelectedSalesRep(null);
                  setSalesRepInput('');
                }}
                className="absolute right-0 top-0 h-10 w-10"
              >
                <X size={16} />
              </Button>
            )}
          </div>
          <Button 
            type="button" 
            variant="outline" 
            size="icon" 
            onClick={() => setIsSalesRepSearchOpen(true)}
          >
            <Search size={18} />
          </Button>
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
                      // Navigate to next field on selection
                      if (onEnterPress) {
                        onEnterPress();
                      }
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
