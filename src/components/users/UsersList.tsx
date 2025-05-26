
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Edit } from 'lucide-react';
import { UserRole } from '@/types/auth';

interface UserProfile {
  id: string;
  user_id: string;
  role: UserRole;
  name: string;
  email: string;
  phone?: string;
  active: boolean;
  created_at: string;
  updated_at: string;
}

interface UsersListProps {
  users: UserProfile[];
  isLoading: boolean;
  onEditUser: (user: UserProfile) => void;
}

export function UsersList({ users, isLoading, onEditUser }: UsersListProps) {
  const getRoleBadge = (role: string) => {
    const variants = {
      admin: 'bg-red-100 text-red-800',
      manager: 'bg-blue-100 text-blue-800',
      vendedor: 'bg-green-100 text-green-800'
    };
    return variants[role as keyof typeof variants] || 'bg-gray-100 text-gray-800';
  };

  const getRoleLabel = (role: string) => {
    const labels = {
      admin: 'Administrador',
      manager: 'Gerente',
      vendedor: 'Vendedor'
    };
    return labels[role as keyof typeof labels] || role;
  };

  if (isLoading) {
    return <p>Carregando usuários...</p>;
  }

  return (
    <div className="grid gap-4">
      {users.map((user) => (
        <Card key={user.id}>
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <h3 className="font-semibold">{user.name}</h3>
                  <Badge className={getRoleBadge(user.role)}>
                    {getRoleLabel(user.role)}
                  </Badge>
                  {!user.active && (
                    <Badge variant="secondary">Inativo</Badge>
                  )}
                </div>
                <p className="text-sm text-gray-600">{user.email}</p>
                {user.phone && (
                  <p className="text-sm text-gray-600">{user.phone}</p>
                )}
                <p className="text-xs text-gray-500">
                  Criado em: {new Date(user.created_at).toLocaleDateString('pt-BR')}
                </p>
              </div>
              
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onEditUser(user)}
                >
                  <Edit className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
