
import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Palette, RefreshCcw } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import { Theme } from '@/types';
import { useAppSettings } from '@/hooks/useAppSettings';
import ThemePresets from './ThemePresets';
import CustomColorPicker from './CustomColorPicker';
import ThemePreview from './ThemePreview';
import { defaultThemes } from './theme-data';
import { cacheTheme } from '@/services/settings/settingsService';

export default function ThemeSettings() {
  // Use the optimized useAppSettings hook
  const { settings, updateSettings, applyThemeColors } = useAppSettings();
  const [selectedTheme, setSelectedTheme] = useState<string | null>(null);
  const [customColors, setCustomColors] = useState({
    primaryColor: settings?.theme?.primaryColor || settings?.theme?.primary || '#1C64F2',
    secondaryColor: settings?.theme?.secondaryColor || settings?.theme?.secondary || '#047481',
    accentColor: settings?.theme?.accentColor || settings?.theme?.accent || '#0694A2',
  });
  
  const [isSaving, setIsSaving] = useState(false);
  const colorsInitialized = useRef(false);
  
  // Update local state when settings change, reduced to essential code
  useEffect(() => {
    if (settings?.theme && !colorsInitialized.current) {
      setCustomColors({
        primaryColor: settings.theme.primaryColor || settings.theme.primary || '#1C64F2',
        secondaryColor: settings.theme.secondaryColor || settings.theme.secondary || '#047481',
        accentColor: settings.theme.accentColor || settings.theme.accent || '#0694A2',
      });
      
      // Find if current colors match any predefined theme
      const matchingTheme = defaultThemes.find(theme => 
        theme.primaryColor === (settings.theme?.primaryColor || settings.theme?.primary) &&
        theme.secondaryColor === (settings.theme?.secondaryColor || settings.theme?.secondary) &&
        theme.accentColor === (settings.theme?.accentColor || settings.theme?.accent)
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
      // Create theme object with both naming conventions
      const themeData = {
        primaryColor: primary,
        secondaryColor: secondary,
        accentColor: accent,
        primary: primary,
        secondary: secondary,
        accent: accent
      };
      
      // Apply theme using our optimized function
      applyThemeColors(themeData);
      
      // Make sure theme is cached for offline use
      cacheTheme(themeData);
      
      // Save to database
      await updateSettings({
        theme: themeData as Theme
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
      
      // Ensure theme is cached
      cacheTheme(settings.theme);
      
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
          <ThemePresets 
            defaultThemes={defaultThemes} 
            selectedTheme={selectedTheme}
            onSelectTheme={selectPredefinedTheme} 
          />
          
          <CustomColorPicker 
            customColors={customColors}
            onColorChange={handleColorChange}
            onApplyColors={handleApplyCustomColors}
            isSaving={isSaving}
          />
          
          <ThemePreview 
            customColors={customColors} 
          />
        </div>
      </CardContent>
    </Card>
  );
}
