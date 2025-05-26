
import React from 'react';
import { Button } from '@/components/ui/button';
import { UserPlus } from 'lucide-react';

interface UserManagementHeaderProps {
  onCreateUser: () => void;
}

export function UserManagementHeader({ onCreateUser }: UserManagementHeaderProps) {
  return (
    <div className="flex justify-between items-center">
      <div>
        <h1 className="text-2xl font-bold">Usuários do Sistema</h1>
        <p className="text-gray-600">Gerencie usuários e suas permissões</p>
      </div>
      
      <Button onClick={onCreateUser}>
        <UserPlus className="mr-2 h-4 w-4" />
        Novo Usuário
      </Button>
    </div>
  );
}
