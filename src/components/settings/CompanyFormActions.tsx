
import React from 'react';
import { Button } from "@/components/ui/button";
import { InlineSavingIndicator } from '@/components/ui/saving-indicator';

interface CompanyFormActionsProps {
  isSaving: boolean;
}

export const CompanyFormActions: React.FC<CompanyFormActionsProps> = ({
  isSaving
}) => {
  return (
    <div className="flex justify-between items-center">
      <InlineSavingIndicator isVisible={isSaving} message="Salvando dados..." />
      <Button 
        type="submit" 
        className="bg-sales-800 hover:bg-sales-700"
        disabled={isSaving}
      >
        {isSaving ? "Salvando..." : "Salvar dados da empresa"}
      </Button>
    </div>
  );
};
