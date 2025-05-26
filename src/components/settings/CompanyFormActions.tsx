
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { InlineSavingIndicator } from '@/components/ui/saving-indicator';
import { Check } from 'lucide-react';

interface CompanyFormActionsProps {
  isSaving: boolean;
  onSaveSuccess?: () => void;
}

export const CompanyFormActions: React.FC<CompanyFormActionsProps> = ({
  isSaving,
  onSaveSuccess
}) => {
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    if (onSaveSuccess) {
      setShowSuccess(true);
      console.log('Success message displayed');
      
      const timeoutId = setTimeout(() => {
        setShowSuccess(false);
        onSaveSuccess();
        console.log('Success message hidden');
      }, 3000);

      return () => clearTimeout(timeoutId);
    }
  }, [onSaveSuccess]);

  return (
    <div className="flex justify-between items-center">
      <div className="flex items-center space-x-4">
        <InlineSavingIndicator isVisible={isSaving} message="Salvando dados..." />
        
        {showSuccess && (
          <div className="flex items-center space-x-2 text-green-600 animate-fade-in">
            <Check className="h-4 w-4" />
            <span className="text-sm font-medium">Dados salvos na database!</span>
          </div>
        )}
      </div>
      
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
