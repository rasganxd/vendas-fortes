
import React from 'react';
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

interface CustomColorPickerProps {
  customColors: {
    primaryColor: string;
    secondaryColor: string;
    accentColor: string;
  };
  onColorChange: (type: 'primaryColor' | 'secondaryColor' | 'accentColor', color: string) => void;
  onApplyColors: () => void;
  isSaving: boolean;
}

export default function CustomColorPicker({
  customColors,
  onColorChange,
  onApplyColors,
  isSaving
}: CustomColorPickerProps) {
  return (
    <div className="space-y-3">
      <h3 className="text-md font-medium mb-4">Cores Personalizadas</h3>
      
      <div className="space-y-4">
        <div className="grid grid-cols-3 gap-4">
          <div>
            <Label htmlFor="primaryColor" className="text-sm text-gray-700">Cor Primária</Label>
            <div className="flex mt-1">
              <input
                type="color"
                id="primaryColor"
                value={customColors.primaryColor}
                onChange={(e) => onColorChange('primaryColor', e.target.value)}
                className="h-10 w-full border border-gray-300 rounded-l-md cursor-pointer"
              />
              <div className="flex items-center justify-center bg-gray-100 rounded-r-md px-3 border-y border-r border-gray-300">
                <span className="text-xs text-gray-600 font-mono">{customColors.primaryColor}</span>
              </div>
            </div>
          </div>
          
          <div>
            <Label htmlFor="secondaryColor" className="text-sm text-gray-700">Cor Secundária</Label>
            <div className="flex mt-1">
              <input
                type="color"
                id="secondaryColor"
                value={customColors.secondaryColor}
                onChange={(e) => onColorChange('secondaryColor', e.target.value)}
                className="h-10 w-full border border-gray-300 rounded-l-md cursor-pointer"
              />
              <div className="flex items-center justify-center bg-gray-100 rounded-r-md px-3 border-y border-r border-gray-300">
                <span className="text-xs text-gray-600 font-mono">{customColors.secondaryColor}</span>
              </div>
            </div>
          </div>
          
          <div>
            <Label htmlFor="accentColor" className="text-sm text-gray-700">Cor de Destaque</Label>
            <div className="flex mt-1">
              <input
                type="color"
                id="accentColor"
                value={customColors.accentColor}
                onChange={(e) => onColorChange('accentColor', e.target.value)}
                className="h-10 w-full border border-gray-300 rounded-l-md cursor-pointer"
              />
              <div className="flex items-center justify-center bg-gray-100 rounded-r-md px-3 border-y border-r border-gray-300">
                <span className="text-xs text-gray-600 font-mono">{customColors.accentColor}</span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="pt-2">
          <Button 
            onClick={onApplyColors} 
            disabled={isSaving}
            className="w-full md:w-auto"
          >
            {isSaving ? 'Aplicando...' : 'Aplicar Cores Personalizadas'}
          </Button>
        </div>
      </div>
    </div>
  );
}
