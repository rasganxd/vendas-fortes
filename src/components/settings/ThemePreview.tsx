
import React from 'react';
import { Button } from "@/components/ui/button";
import { Bell } from "lucide-react";

interface ThemePreviewProps {
  customColors: {
    primaryColor: string;
    secondaryColor: string;
    accentColor: string;
  };
}

export default function ThemePreview({ customColors }: ThemePreviewProps) {
  return (
    <div className="bg-gray-50 p-4 rounded-md border border-gray-200 mt-4">
      <h4 className="text-sm font-medium text-gray-700 mb-2">Visualização</h4>
      <div className="flex flex-wrap gap-3">
        <div className="p-3 rounded-md flex items-center justify-center shadow-sm text-white" 
          style={{ backgroundColor: customColors.primaryColor }}>
          Cor Primária
        </div>
        <div className="p-3 rounded-md flex items-center justify-center shadow-sm text-white" 
          style={{ backgroundColor: customColors.secondaryColor }}>
          Cor Secundária
        </div>
        <div className="p-3 rounded-md flex items-center justify-center shadow-sm text-white" 
          style={{ backgroundColor: customColors.accentColor }}>
          Cor de Destaque
        </div>
      </div>
      
      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Button variant="default" className="mr-2">Botão Primário</Button>
          <Button variant="outline">Botão Secundário</Button>
        </div>
        
        <div className="rounded-md shadow-card border overflow-hidden"
          style={{
            background: `linear-gradient(145deg, ${customColors.primaryColor}20, ${customColors.primaryColor}40)`,
            borderColor: `${customColors.primaryColor}60`
          }}
        >
          <div className="p-4 flex items-center gap-2">
            <div className="rounded-full p-2 flex-shrink-0"
              style={{ backgroundColor: `${customColors.primaryColor}40` }}
            >
              <Bell size={16} style={{ color: customColors.primaryColor }} />
            </div>
            <div>
              <h4 className="font-medium" style={{ color: customColors.primaryColor }}>Card com destaque</h4>
              <p className="text-sm" style={{ color: '#333' }}>Exemplo de card personalizado</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
