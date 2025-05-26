
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { UserPlus } from 'lucide-react';
import { createInitialUsers } from '@/utils/createInitialUsers';
import { toast } from 'sonner';

export const CreateTestUsersButton = () => {
  const [isCreating, setIsCreating] = useState(false);

  const handleCreateUsers = async () => {
    setIsCreating(true);
    try {
      const results = await createInitialUsers();
      
      const successful = results.filter(r => r.success);
      const failed = results.filter(r => !r.success);
      
      if (successful.length > 0) {
        toast.success(`${successful.length} usuário(s) criado(s) com sucesso!`);
      }
      
      if (failed.length > 0) {
        failed.forEach(result => {
          toast.error(`Erro ao criar ${result.email}: ${result.error}`);
        });
      }
    } catch (error) {
      console.error('Error creating users:', error);
      toast.error('Erro ao criar usuários de teste');
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <Button 
      onClick={handleCreateUsers} 
      disabled={isCreating}
      variant="outline"
      className="w-full mt-4"
    >
      <UserPlus className="mr-2 h-4 w-4" />
      {isCreating ? 'Criando usuários...' : 'Criar Usuários de Teste'}
    </Button>
  );
};
