
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import PageLayout from '@/components/layout/PageLayout';
import { UserRole } from '@/types/auth';
import { UserManagementHeader } from '@/components/users/UserManagementHeader';
import { UsersList } from '@/components/users/UsersList';
import { CreateUserDialog } from '@/components/users/CreateUserDialog';
import { EditUserDialog } from '@/components/users/EditUserDialog';

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

interface FormData {
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  active: boolean;
}

export default function UserManagement() {
  const { userProfile } = useAuth();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserProfile | null>(null);
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    phone: '',
    role: 'vendedor' as UserRole,
    active: true
  });

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setUsers(data || []);
    } catch (error) {
      console.error('Error loading users:', error);
      toast.error('Erro ao carregar usuários');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateUser = async () => {
    try {
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: formData.email,
        password: 'temp123456',
        email_confirm: true,
        user_metadata: {
          name: formData.name
        }
      });

      if (authError) throw authError;

      toast.success('Usuário criado com sucesso');
      setIsCreateOpen(false);
      resetForm();
      loadUsers();
    } catch (error: any) {
      console.error('Error creating user:', error);
      toast.error('Erro ao criar usuário: ' + error.message);
    }
  };

  const handleUpdateUser = async () => {
    if (!editingUser) return;

    try {
      const { error } = await supabase
        .from('user_profiles')
        .update({
          name: formData.name,
          phone: formData.phone,
          role: formData.role,
          active: formData.active
        })
        .eq('id', editingUser.id);

      if (error) throw error;

      toast.success('Usuário atualizado com sucesso');
      setEditingUser(null);
      resetForm();
      loadUsers();
    } catch (error: any) {
      console.error('Error updating user:', error);
      toast.error('Erro ao atualizar usuário: ' + error.message);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      role: 'vendedor',
      active: true
    });
  };

  const openEditDialog = (user: UserProfile) => {
    setEditingUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      phone: user.phone || '',
      role: user.role,
      active: user.active
    });
  };

  if (!userProfile || !['admin', 'manager'].includes(userProfile.role)) {
    return (
      <PageLayout title="Acesso Negado">
        <div className="text-center">
          <p>Você não tem permissão para acessar esta página.</p>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout title="Gerenciamento de Usuários">
      <div className="space-y-6">
        <UserManagementHeader onCreateUser={() => setIsCreateOpen(true)} />
        
        <UsersList 
          users={users}
          isLoading={isLoading}
          onEditUser={openEditDialog}
        />

        <CreateUserDialog
          isOpen={isCreateOpen}
          onOpenChange={setIsCreateOpen}
          formData={formData}
          setFormData={setFormData}
          onCreateUser={handleCreateUser}
        />

        <EditUserDialog
          isOpen={!!editingUser}
          onOpenChange={() => setEditingUser(null)}
          formData={formData}
          setFormData={setFormData}
          onUpdateUser={handleUpdateUser}
        />
      </div>
    </PageLayout>
  );
}
