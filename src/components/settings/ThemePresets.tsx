
import React from 'react';
import { SwatchBook } from "lucide-react";
import { Theme } from '@/types';

interface ThemePresetsProps {
  defaultThemes: { name: string; primaryColor: string; secondaryColor: string; accentColor: string; }[];
  selectedTheme: string | null;
  onSelectTheme: (index: number) => void;
}

export default function ThemePresets({
  defaultThemes,
  selectedTheme,
  onSelectTheme
}: ThemePresetsProps) {
  return (
    <div>
      <h3 className="text-md font-medium mb-4 flex items-center gap-2">
        <SwatchBook size={18} />
        Temas Pré-definidos
      </h3>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
        {defaultThemes.map((theme, index) => (
          <button
            key={index}
            onClick={() => onSelectTheme(index)}
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
  );
}
