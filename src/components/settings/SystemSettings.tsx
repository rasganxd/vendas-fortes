
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Smartphone, Palette } from "lucide-react";
import MobileSyncPanel from './MobileSyncPanel';
import { useTheme } from "@/components/theme-provider";
import { useAppSettings } from '@/hooks/useAppSettings';
import { Button } from "@/components/ui/button";
import { toast } from 'sonner';

export default function SystemSettings() {
  // Using a dummy sales rep ID for now - in a real app, this would come from context
  const defaultSalesRepId = "default-sales-rep";
  const { settings, updateSettings, isLoading } = useAppSettings();
  const { theme, setTheme } = useTheme();
  
  const [selectedColor, setSelectedColor] = useState(settings?.primaryColor || '#3B82F6');
  
  const colorOptions = [
    { name: 'Azul', value: '#3B82F6' },
    { name: 'Verde', value: '#10B981' },
    { name: 'Cinza', value: '#6B7280' },
    { name: 'Índigo', value: '#6366F1' },
    { name: 'Roxo', value: '#8B5CF6' },
    { name: 'Vermelho', value: '#EF4444' },
  ];
  
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
  
  return (
    <div className="space-y-8">
      {/* Cabeçalho principal com descrição */}
      <div className="space-y-2">
        <h2 className="text-3xl font-bold tracking-tight text-gray-900">Configurações do Sistema</h2>
        <p className="text-muted-foreground">
          Gerencie as configurações técnicas, aparência e sincronização da sua aplicação.
        </p>
      </div>
      
      {/* Card de tema de cor */}
      <Card className="overflow-hidden border border-gray-100 shadow-sm transition-all duration-200 hover:shadow-md">
        <CardHeader className="border-b pb-6">
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-primary/10 p-2.5">
              <Palette className="text-primary h-6 w-6" />
            </div>
            <div>
              <CardTitle className="text-xl">
                Aparência
              </CardTitle>
              <CardDescription className="mt-1.5">
                Personalize o tema e cores do sistema
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          {/* Tema claro/escuro */}
          <div className="space-y-3">
            <h3 className="text-base font-medium">Tema do sistema</h3>
            <div className="flex flex-wrap gap-3">
              <Button
                variant={theme === 'light' ? 'default' : 'outline'}
                onClick={() => setTheme('light')}
                className="w-24"
              >
                Claro
              </Button>
              <Button
                variant={theme === 'dark' ? 'default' : 'outline'}
                onClick={() => setTheme('dark')}
                className="w-24"
              >
                Escuro
              </Button>
              <Button
                variant={theme === 'system' ? 'default' : 'outline'}
                onClick={() => setTheme('system')}
                className="w-24"
              >
                Sistema
              </Button>
            </div>
          </div>
          
          {/* Seleção de cor primária */}
          <div className="space-y-3">
            <h3 className="text-base font-medium">Cor primária</h3>
            <div className="flex flex-wrap gap-3">
              {colorOptions.map(color => (
                <div
                  key={color.value}
                  onClick={() => handleColorChange(color.value)}
                  className={`
                    w-10 h-10 rounded-full cursor-pointer transition-all
                    ${selectedColor === color.value ? 'ring-2 ring-offset-2 ring-gray-400' : ''}
                  `}
                  style={{ backgroundColor: color.value }}
                  title={color.name}
                />
              ))}
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              A cor primária é usada em botões, links e elementos de destaque.
            </p>
          </div>
        </CardContent>
      </Card>
      
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
