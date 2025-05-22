
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Smartphone } from "lucide-react";
import MobileSyncPanel from './MobileSyncPanel';
import { useAppSettings } from '@/hooks/useAppSettings';
import { toast } from 'sonner';

export default function SystemSettings() {
  // Using a dummy sales rep ID for now - in a real app, this would come from context
  const defaultSalesRepId = "default-sales-rep";
  const { settings, updateSettings, isLoading } = useAppSettings();
  
  // Definindo uma cor padrão mais clara e neutra
  const defaultColor = '#6B7280'; // Cinza neutro
  const [selectedColor, setSelectedColor] = useState(settings?.primaryColor || defaultColor);
  
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
      await updateSettings({ primaryColor: color });
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
    if (!settings?.primaryColor || settings.primaryColor !== defaultColor) {
      handleColorChange(defaultColor);
    }
  }, [settings]);
  
  return (
    <div className="space-y-8">
      {/* Cabeçalho principal com descrição */}
      <div className="space-y-2">
        <h2 className="text-3xl font-bold tracking-tight text-gray-900">Configurações do Sistema</h2>
        <p className="text-muted-foreground">
          Gerencie as configurações técnicas e sincronização da sua aplicação.
        </p>
      </div>
      
      {/* Card de sincronização móvel */}
      <Card className="overflow-hidden border border-gray-100 shadow-sm transition-all duration-200 hover:shadow-md">
        <CardHeader className="border-b pb-6">
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-primary/10 p-2.5">
              <Smartphone className="text-primary h-6 w-6" />
            </div>
            <div>
              <CardTitle className="text-xl">
                Sincronização Móvel
              </CardTitle>
              <CardDescription className="mt-1.5">
                Gerencie a conexão e sincronização com dispositivos móveis.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <MobileSyncPanel salesRepId={defaultSalesRepId} />
        </CardContent>
      </Card>
    </div>
  );
}
