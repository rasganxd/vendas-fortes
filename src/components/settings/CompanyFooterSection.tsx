
import React from 'react';
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface CompanyFooterSectionProps {
  footer: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
}

export const CompanyFooterSection: React.FC<CompanyFooterSectionProps> = ({
  footer,
  onChange
}) => {
  return (
    <div className="space-y-2">
      <Label htmlFor="footer">Texto de Rodapé para Impressão</Label>
      <Textarea
        id="footer"
        name="footer"
        value={footer}
        onChange={onChange}
        placeholder="Texto que aparecerá no rodapé de documentos impressos"
        className="h-20"
      />
    </div>
  );
};
