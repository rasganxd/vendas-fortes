
import React, { useState, useEffect } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { supabase } from '@/integrations/supabase/client';
import { ExternalLink } from 'lucide-react';

interface AuthUser {
  id: string;
  email: string;
  created_at: string;
}

interface AuthUserSelectorProps {
  value?: string;
  onValueChange: (value: string | undefined) => void;
  exclude?: string[];
}

const AuthUserSelector: React.FC<AuthUserSelectorProps> = ({
  value,
  onValueChange,
  exclude = []
}) => {
  const [users, setUsers] = useState<AuthUser[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Note: We can't directly query auth.users from the client
    // This would need to be implemented via an edge function or admin panel
    // For now, we'll show instructions to get the user ID manually
  }, []);

  const openSupabaseAuth = () => {
    window.open(`https://supabase.com/dashboard/project/ufvnubabpcyimahbubkd/auth/users`, '_blank');
  };

  return (
    <div className="space-y-2">
      <Label>Usuário do Supabase Auth</Label>
      <div className="flex gap-2">
        <Select value={value || ''} onValueChange={(val) => onValueChange(val || undefined)}>
          <SelectTrigger className="flex-1">
            <SelectValue placeholder="Copie o ID do usuário do Supabase" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">Nenhum usuário vinculado</SelectItem>
            {/* Users would be populated here via edge function */}
          </SelectContent>
        </Select>
        <Button 
          variant="outline" 
          size="icon"
          onClick={openSupabaseAuth}
          type="button"
        >
          <ExternalLink className="h-4 w-4" />
        </Button>
      </div>
      <p className="text-xs text-gray-500">
        Clique no botão ao lado para abrir o painel de usuários do Supabase e copiar o ID do usuário
      </p>
    </div>
  );
};

export default AuthUserSelector;
