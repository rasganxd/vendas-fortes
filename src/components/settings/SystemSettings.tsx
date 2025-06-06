
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAppSettings } from '@/hooks/useAppSettings';
import { toast } from 'sonner';

export default function SystemSettings() {
  // Using a dummy sales rep ID for now - in a real app, this would come from context
  const defaultSalesRepId = "default-sales-rep";
  const { settings, updateSettings, isLoading } = useAppSettings();
  
  // Definindo uma cor padrão mais clara e neutra
  const defaultColor = '#6B7280'; // Cinza neutro
  const [selectedColor, setSelectedColor] = useState(settings?.theme?.primaryColor || defaultColor);
  
  const handleColorChange = async (color: string) => {
    setSelectedColor(color);
    
    // Create new style element to apply color
    const style = document.createElement('style');
    style.innerHTML = `
      :root {
        --primary: ${getHslFromHex(color)} !important;
        --ring: ${getHslFromHex(color)} !important;
        --sidebar-primary: ${getHslFromHex(color)} !important;
      }
    `;
    
    // Add style to head
    document.head.appendChild(style);
    
    // Save to settings
    try {
      await updateSettings({ 
        theme: { 
          primaryColor: color 
        } 
      });
      toast.success("Cor atualizada com sucesso");
    } catch (error) {
      console.error("Erro ao atualizar cor:", error);
      toast.error("Erro ao atualizar cor");
    }
  };
  
  // Helper function to convert hex to HSL
  const getHslFromHex = (hex: string): string => {
    // For simplicity, we're just returning the hex value with placeholders
    // In a real app, you'd convert hex to HSL values
    return hex.replace('#', 'hsl(var(--primary))');
  };
  
  // Aplicando cor padrão na inicialização se necessário
  React.useEffect(() => {
    if (!settings?.theme?.primaryColor || settings.theme.primaryColor !== defaultColor) {
      handleColorChange(defaultColor);
    }
  }, [settings]);
  
  return (
    <div className="space-y-4 max-h-[calc(100vh-12rem)] overflow-y-auto">
      {/* Cabeçalho principal com descrição - mais compacto */}
      <div className="space-y-1">
        <h2 className="text-2xl font-bold tracking-tight text-gray-900">Configurações do Sistema</h2>
        <p className="text-sm text-muted-foreground">
          Gerencie as configurações técnicas da sua aplicação.
        </p>
      </div>
      
      {/* Card de configurações de tema */}
      <Card className="overflow-hidden border border-gray-100 shadow-sm transition-all duration-200 hover:shadow-md">
        <CardHeader className="border-b pb-4">
          <CardTitle className="text-lg">
            Configurações de Tema
          </CardTitle>
          <CardDescription className="mt-1">
            Personalize a aparência da aplicação.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Cor Principal</label>
              <div className="mt-2 flex items-center space-x-3">
                <input
                  type="color"
                  value={selectedColor}
                  onChange={(e) => handleColorChange(e.target.value)}
                  className="w-12 h-8 rounded border"
                />
                <span className="text-sm text-gray-600">{selectedColor}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
