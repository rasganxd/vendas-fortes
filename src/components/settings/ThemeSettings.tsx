import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useAppContext } from "@/hooks/useAppContext";
import { Palette, SwatchBook, RefreshCcw } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import { AppSettings } from '@/types';
import { useAppSettings } from '@/hooks/useAppSettings';

const defaultThemes = [
  { name: "Azul (Padrão)", primaryColor: "#1C64F2", secondaryColor: "#047481", accentColor: "#0694A2" },
  { name: "Verde", primaryColor: "#057A55", secondaryColor: "#0E9F6E", accentColor: "#31C48D" },
  { name: "Vermelho", primaryColor: "#E02424", secondaryColor: "#F05252", accentColor: "#F98080" },
  { name: "Roxo", primaryColor: "#5521B5", secondaryColor: "#7E3AF2", accentColor: "#9061F9" },
  { name: "Laranja", primaryColor: "#C27803", secondaryColor: "#E3A008", accentColor: "#F6AD55" },
];

export default function ThemeSettings() {
  // Use the optimized useAppSettings hook
  const { settings, updateSettings, applyThemeColors } = useAppSettings();
  const [selectedTheme, setSelectedTheme] = useState<string | null>(null);
  const [customColors, setCustomColors] = useState({
    primaryColor: settings?.theme?.primaryColor || '#1C64F2',
    secondaryColor: settings?.theme?.secondaryColor || '#047481',
    accentColor: settings?.theme?.accentColor || '#0694A2',
  });
  
  const [isSaving, setIsSaving] = useState(false);
  const colorsInitialized = useRef(false);
  
  // Update local state when settings change, reduced to essential code
  useEffect(() => {
    if (settings?.theme && !colorsInitialized.current) {
      setCustomColors({
        primaryColor: settings.theme.primaryColor || '#1C64F2',
        secondaryColor: settings.theme.secondaryColor || '#047481',
        accentColor: settings.theme.accentColor || '#0694A2',
      });
      
      // Find if current colors match any predefined theme
      const matchingTheme = defaultThemes.find(theme => 
        theme.primaryColor === settings.theme?.primaryColor &&
        theme.secondaryColor === settings.theme?.secondaryColor &&
        theme.accentColor === settings.theme?.accentColor
      );
      
      if (matchingTheme) {
        setSelectedTheme(matchingTheme.name);
      } else {
        setSelectedTheme(null);
      }
      
      colorsInitialized.current = true;
    }
  }, [settings]);
  
  const handleColorChange = (type: 'primaryColor' | 'secondaryColor' | 'accentColor', color: string) => {
    setCustomColors(prev => ({ ...prev, [type]: color }));
    setSelectedTheme(null); // Deselect theme when there's a custom color change
  };
  
  const applyTheme = async (primary: string, secondary: string, accent: string) => {
    setIsSaving(true);
    try {
      // Apply theme using our optimized function
      applyThemeColors({
        primaryColor: primary,
        secondaryColor: secondary,
        accentColor: accent
      });
      
      // Save to database
      await updateSettings({
        theme: {
          primaryColor: primary,
          secondaryColor: secondary,
          accentColor: accent
        }
      });
      
      toast({
        title: "Tema atualizado",
        description: "As cores do sistema foram atualizadas com sucesso."
      });
    } catch (error) {
      console.error('Error updating theme:', error);
      toast({
        title: "Erro ao atualizar tema",
        description: "Não foi possível salvar as configurações de cores.",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };
  
  const handleApplyCustomColors = () => {
    applyTheme(
      customColors.primaryColor,
      customColors.secondaryColor,
      customColors.accentColor
    );
  };
  
  const selectPredefinedTheme = (index: number) => {
    const theme = defaultThemes[index];
    setSelectedTheme(theme.name);
    setCustomColors({
      primaryColor: theme.primaryColor,
      secondaryColor: theme.secondaryColor,
      accentColor: theme.accentColor,
    });
    applyTheme(theme.primaryColor, theme.secondaryColor, theme.accentColor);
  };
  
  const handleForceRefresh = () => {
    if (settings?.theme) {
      // Reapply the current theme
      applyThemeColors(settings.theme);
      
      toast({
        title: "Cores reaplicadas",
        description: "As cores do tema foram reaplicadas com sucesso."
      });
    }
  };
  
  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="text-xl flex items-center gap-2">
            <Palette className="text-blue-500" size={20} />
            Aparência do Sistema
          </CardTitle>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleForceRefresh}
            className="flex items-center gap-1"
          >
            <RefreshCcw size={14} />
            Reaplicar Cores
          </Button>
        </div>
        <CardDescription>
          Personalize as cores do sistema de acordo com a identidade visual da sua empresa.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div>
            <h3 className="text-md font-medium mb-4 flex items-center gap-2">
              <SwatchBook size={18} />
              Temas Pré-definidos
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
              {defaultThemes.map((theme, index) => (
                <button
                  key={index}
                  onClick={() => selectPredefinedTheme(index)}
                  className={`p-3 rounded-md border transition-all flex flex-col items-center ${
                    selectedTheme === theme.name
                      ? 'border-blue-500 shadow-sm bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex space-x-1 mb-2">
                    <div
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: theme.primaryColor }}
                    ></div>
                    <div
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: theme.secondaryColor }}
                    ></div>
                    <div
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: theme.accentColor }}
                    ></div>
                  </div>
                  <span className="text-xs">{theme.name}</span>
                </button>
              ))}
            </div>
          </div>
          
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
                      onChange={(e) => handleColorChange('primaryColor', e.target.value)}
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
                      onChange={(e) => handleColorChange('secondaryColor', e.target.value)}
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
                      onChange={(e) => handleColorChange('accentColor', e.target.value)}
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
                  onClick={handleApplyCustomColors} 
                  disabled={isSaving}
                  className="w-full md:w-auto"
                >
                  {isSaving ? 'Aplicando...' : 'Aplicar Cores Personalizadas'}
                </Button>
              </div>
            </div>
          </div>
          
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
        </div>
      </CardContent>
    </Card>
  );
}
